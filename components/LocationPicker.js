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
// MOVE MAP TO NEW POSITION
// --------------------------------------------------

function ChangeMapCenter({ position }) {
  const map = useMap();

  useEffect(() => {
    if (!position) return;

    map.setView(position, 16, {
      animate: true,
      duration: 1,
    });
  }, [position, map]);

  return null;
}

// --------------------------------------------------
// MAP CLICK
// --------------------------------------------------

function LocationMarker({
  position,
  setPosition,
  setLocationName,
  updateParentLocation,
}) {
  useMapEvents({
    async click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      const newPosition = [lat, lng];

      setPosition(newPosition);
      setLocationName("Getting address...");

      // Immediately update parent coordinates
      updateParentLocation(
        lat,
        lng,
        "Getting address..."
      );

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );

        const result = await response.json();

        const name =
          result.display_name ||
          `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

        setLocationName(name);

        updateParentLocation(
          lat,
          lng,
          name
        );
      } catch (error) {
        console.error(
          "Reverse location error:",
          error
        );

        const fallback =
          `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

        setLocationName(fallback);

        updateParentLocation(
          lat,
          lng,
          fallback
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
// MAIN LOCATION PICKER
// --------------------------------------------------

export default function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
}) {
  const [position, setPosition] = useState(
    latitude !== null &&
      longitude !== null
      ? [latitude, longitude]
      : null
  );

  const [search, setSearch] = useState("");

  const [searching, setSearching] =
    useState(false);

  const [locationName, setLocationName] =
    useState("");

  // --------------------------------------------------
  // UPDATE REGISTER PAGE
  // --------------------------------------------------

  function updateParentLocation(
    lat,
    lng,
    name
  ) {
    onLocationChange({
      latitude: lat,
      longitude: lng,

      locationName: name || "",

      locationUrl:
        `https://www.google.com/maps?q=${lat},${lng}`,
    });
  }

  // --------------------------------------------------
  // SEARCH LOCATION
  // --------------------------------------------------

  async function searchLocation(e) {
    e.preventDefault();

    const searchText = search.trim();

    if (!searchText) {
      return;
    }

    setSearching(true);

    try {
      let query = searchText;

      if (
        !searchText
          .toLowerCase()
          .includes("kenya")
      ) {
        query =
          `${searchText}, Kenya`;
      }

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=1&q=${encodeURIComponent(
          query
        )}`,
        {
          headers: {
            Accept:
              "application/json",
          },
        }
      );

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
          "Location not found. Try a town, estate, street, landmark or nearby place."
        );

        return;
      }

      const result = results[0];

      const lat =
        Number(result.lat);

      const lng =
        Number(result.lon);

      const name =
        result.display_name ||
        searchText;

      // IMPORTANT:
      // Update the React state.
      setPosition([lat, lng]);

      setLocationName(name);

      // Show selected result in search box
      setSearch(name);

      // IMPORTANT:
      // Send the NEW location to Register page.
      updateParentLocation(
        lat,
        lng,
        name
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
  // CURRENT GPS LOCATION
  // --------------------------------------------------

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      alert(
        "Your browser does not support location services."
      );

      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (location) => {
        const lat =
          location.coords.latitude;

        const lng =
          location.coords.longitude;

        const newPosition = [
          lat,
          lng,
        ];

        setPosition(newPosition);

        setLocationName(
          "Getting your address..."
        );

        updateParentLocation(
          lat,
          lng,
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

          const result =
            await response.json();

          const name =
            result.display_name ||
            `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

          setLocationName(name);

          updateParentLocation(
            lat,
            lng,
            name
          );

        } catch (error) {
          console.error(
            "Reverse geocoding error:",
            error
          );

          const fallback =
            `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

          setLocationName(
            fallback
          );

          updateParentLocation(
            lat,
            lng,
            fallback
          );
        }
      },

      (error) => {
        console.error(error);

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
  // INITIAL MAP CENTER
  // --------------------------------------------------

  const initialCenter =
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
      >
        📍 Use My Current Location
      </button>

      {/* MAP */}

      <div className="location-map">
        <MapContainer
          center={initialCenter}
          zoom={position ? 16 : 6}
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

          {/* THIS MOVES THE ACTUAL LEAFLET MAP */}

          <ChangeMapCenter
            position={position}
          />

          {/* PIN */}

          <LocationMarker
            position={position}
            setPosition={
              setPosition
            }
            setLocationName={
              setLocationName
            }
            updateParentLocation={
              updateParentLocation
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
