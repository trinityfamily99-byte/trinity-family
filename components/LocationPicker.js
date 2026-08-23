"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --------------------------------------------------
// LEAFLET MARKER ICON
// --------------------------------------------------

const markerIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// --------------------------------------------------
// MAP CLICK
// --------------------------------------------------

function LocationMarker({
  position,
  setPosition,
  setLocationName,
}) {
  useMapEvents({
    async click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      // Replace previous location
      setPosition([lat, lng]);

      // Show temporary message
      setLocationName("Getting address...");

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Reverse geocoding failed");
        }

        const result = await response.json();

        setLocationName(
          result.display_name ||
            `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        );
      } catch (error) {
        console.error(
          "Reverse location error:",
          error
        );

        setLocationName(
          `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        );
      }
    },
  });

  if (!position) {
    return null;
  }

  return (
    <Marker
      position={position}
      icon={markerIcon}
    />
  );
}

// --------------------------------------------------
// MOVE MAP WHEN POSITION CHANGES
// --------------------------------------------------

function ChangeMapCenter({ position }) {
  const map = useMap();

  useEffect(() => {
    if (!position) {
      return;
    }

    map.flyTo(position, 16, {
      duration: 1.2,
    });
  }, [position, map]);

  return null;
}

// --------------------------------------------------
// MAIN LOCATION PICKER
// --------------------------------------------------

export default function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
}) {
  // Initial position
  const [position, setPosition] =
    useState(
      latitude !== null &&
        longitude !== null
        ? [latitude, longitude]
        : null
    );

  const [search, setSearch] =
    useState("");

  const [searching, setSearching] =
    useState(false);

  const [locationName, setLocationName] =
    useState("");

  // --------------------------------------------------
  // KEEP PARENT PAGE UPDATED
  // --------------------------------------------------

  useEffect(() => {
    if (!position) {
      return;
    }

    const [lat, lng] = position;

    onLocationChange({
      latitude: lat,
      longitude: lng,

      locationName:
        locationName || "",

      locationUrl:
        `https://www.google.com/maps?q=${lat},${lng}`,
    });
  }, [
    position,
    locationName,
    onLocationChange,
  ]);

  // --------------------------------------------------
  // SEARCH LOCATION
  // --------------------------------------------------

  async function searchLocation(e) {
    e.preventDefault();

    const searchText =
      search.trim();

    if (!searchText) {
      return;
    }

    setSearching(true);

    try {
      // Always search specifically within Kenya
      const query =
        searchText
          .toLowerCase()
          .includes("kenya")
          ? searchText
          : `${searchText}, Kenya`;

      const url =
        `https://nominatim.openstreetmap.org/search` +
        `?format=json` +
        `&limit=5` +
        `&addressdetails=1` +
        `&countrycodes=ke` +
        `&q=${encodeURIComponent(query)}`;

      const response = await fetch(url, {
        headers: {
          Accept:
            "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          "Location search failed"
        );
      }

      const results =
        await response.json();

      if (
        !results ||
        results.length === 0
      ) {
        alert(
          "Location not found. Try a town, estate, street or landmark."
        );

        return;
      }

      // Choose the first valid Kenyan result
      const result = results.find(
        (item) =>
          item.lat &&
          item.lon
      );

      if (!result) {
        alert(
          "Unable to determine that location. Please try another search."
        );

        return;
      }

      const lat =
        Number(result.lat);

      const lng =
        Number(result.lon);

      // --------------------------------------------
      // IMPORTANT:
      // Completely replace previous location
      // --------------------------------------------

      setPosition([lat, lng]);

      setLocationName(
        result.display_name ||
          searchText
      );

      // Show the actual selected result
      setSearch(
        result.display_name ||
          searchText
      );

    } catch (error) {
      console.error(
        "Location search error:",
        error
      );

      alert(
        "Unable to search for this location. Please try again."
      );
    } finally {
      setSearching(false);
    }
  }

  // --------------------------------------------------
  // USE CURRENT GPS LOCATION
  // --------------------------------------------------

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      alert(
        "Your browser does not support location services."
      );

      return;
    }

    setSearching(true);

    navigator.geolocation.getCurrentPosition(
      async (location) => {
        const lat =
          location.coords.latitude;

        const lng =
          location.coords.longitude;

        // Replace previous location
        setPosition([lat, lng]);

        setLocationName(
          "Getting your address..."
        );

        try {
          const response =
            await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
              {
                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          if (!response.ok) {
            throw new Error(
              "Reverse geocoding failed"
            );
          }

          const result =
            await response.json();

          setLocationName(
            result.display_name ||
              `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          );

          setSearch(
            result.display_name || ""
          );
        } catch (error) {
          console.error(
            "Reverse geocoding error:",
            error
          );

          setLocationName(
            `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          );

          setSearch("");
        } finally {
          setSearching(false);
        }
      },

      (error) => {
        console.error(error);

        setSearching(false);

        alert(
          "Unable to get your current location. Please allow location access and try again."
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }

  // --------------------------------------------------
  // DEFAULT MAP CENTER
  // --------------------------------------------------

  const mapCenter =
    position || [
      -1.286389,
      36.817223,
    ];

  // --------------------------------------------------
  // DISPLAY
  // --------------------------------------------------

  return (
    <div className="location-picker">

      {/* SEARCH */}

      <form
        onSubmit={searchLocation}
        className="location-search"
      >
        <input
          type="text"
          placeholder="Search town, estate, street or landmark..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <button
          type="submit"
          disabled={searching}
        >
          {searching
            ? "Searching..."
            : "🔍 Search"}
        </button>
      </form>

      {/* CURRENT LOCATION */}

      <button
        type="button"
        onClick={
          useCurrentLocation
        }
        className="current-location-button"
        disabled={searching}
      >
        📍 Use My Current Location
      </button>

      {/* MAP */}

      <div className="location-map">

        <MapContainer
          center={mapCenter}
          zoom={
            position
              ? 16
              : 6
          }
          scrollWheelZoom={true}
          style={{
            width: "100%",
            height: "350px",
          }}
        >

          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ChangeMapCenter
            position={position}
          />

          <LocationMarker
            position={position}
            setPosition={
              setPosition
            }
            setLocationName={
              setLocationName
            }
          />

        </MapContainer>

      </div>

      {/* SELECTED LOCATION */}

      {position && (
        <div className="selected-location">

          <p>
            📍{" "}
            <strong>
              Selected Delivery Location
            </strong>
          </p>

          {locationName && (
            <p className="location-name">
              {locationName}
            </p>
          )}

          <p className="coordinates">
            {position[0].toFixed(6)}
            {", "}
            {position[1].toFixed(6)}
          </p>

          <a
            href={`https://www.google.com/maps?q=${position[0]},${position[1]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="google-maps-link"
          >
            🗺️ Open in Google Maps
          </a>

        </div>
      )}

    </div>
  );
}
