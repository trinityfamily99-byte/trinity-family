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
// LEAFLET MARKER
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
// FORCE MAP TO MOVE
// --------------------------------------------------

function MapController({ position }) {
  const map = useMap();

  useEffect(() => {
    if (!position) return;

    console.log("MOVING MAP TO:", position);

    map.invalidateSize();

    map.setView(
      position,
      16,
      {
        animate: true,
      }
    );
  }, [position, map]);

  return null;
}

// --------------------------------------------------
// MAP CLICK
// --------------------------------------------------

function MapClickHandler({
  setPosition,
  setLocationName,
}) {
  useMapEvents({
    click: async (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      console.log(
        "MAP CLICK:",
        lat,
        lng
      );

      setPosition([
        lat,
        lng,
      ]);

      setLocationName(
        "Getting address..."
      );

      try {
        const response =
          await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
          );

        const result =
          await response.json();

        setLocationName(
          result.display_name ||
            `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        );
      } catch {
        setLocationName(
          `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        );
      }
    },
  });

  return null;
}

// --------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------

export default function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
}) {

  // Existing saved location
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
  // SEND LOCATION TO REGISTER PAGE
  // --------------------------------------------------

  useEffect(() => {
    if (!position) return;

    const [lat, lng] =
      position;

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
  // SEARCH
  // --------------------------------------------------

  async function searchLocation(e) {
    e.preventDefault();

    const query =
      search.trim();

    if (!query) return;

    setSearching(true);

    try {

      console.log(
        "SEARCHING FOR:",
        query
      );

      const response =
        await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(
            query
          )}`
        );

      if (!response.ok) {
        throw new Error(
          "Search request failed"
        );
      }

      const results =
        await response.json();

      console.log(
        "SEARCH RESULTS:",
        results
      );

      if (
        !results ||
        results.length === 0
      ) {
        alert(
          "Location not found. Try a town, estate, street or landmark."
        );

        setSearching(false);
        return;
      }

      const result =
        results[0];

      const lat =
        parseFloat(result.lat);

      const lng =
        parseFloat(result.lon);

      const name =
        result.display_name ||
        query;

      console.log(
        "NEW LOCATION:",
        lat,
        lng,
        name
      );

      // ------------------------------------------
      // THIS IS THE IMPORTANT PART
      // ------------------------------------------

      setLocationName(name);

      setPosition([
        lat,
        lng,
      ]);

      // Update search box
      setSearch(query);

    } catch (error) {

      console.error(
        "SEARCH ERROR:",
        error
      );

      alert(
        "Unable to search for this location."
      );

    } finally {

      setSearching(false);

    }
  }

  // --------------------------------------------------
  // CURRENT LOCATION
  // --------------------------------------------------

  function useCurrentLocation() {

    if (!navigator.geolocation) {
      alert(
        "Location services are not supported by your browser."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (location) => {

        const lat =
          location.coords.latitude;

        const lng =
          location.coords.longitude;

        setPosition([
          lat,
          lng,
        ]);

        setLocationName(
          "Getting address..."
        );

        try {

          const response =
            await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
            );

          const result =
            await response.json();

          setLocationName(
            result.display_name ||
              `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          );

        } catch {

          setLocationName(
            `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          );
        }
      },

      (error) => {

        console.error(error);

        alert(
          "Unable to get your current location. Please allow location access."
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
  // INITIAL MAP POSITION
  // --------------------------------------------------

  const initialPosition =
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
        onSubmit={
          searchLocation
        }
        className="location-search"
      >

        <input
          type="text"
          placeholder="Search town, estate, street or landmark..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
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
          center={
            initialPosition
          }
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

          {/* FORCE MAP MOVEMENT */}

          <MapController
            position={
              position
            }
          />

          {/* MAP CLICK */}

          <MapClickHandler
            setPosition={
              setPosition
            }
            setLocationName={
              setLocationName
            }
          />

          {/* PIN */}

          {position && (
            <Marker
              position={
                position
              }
              icon={
                markerIcon
              }
            />
          )}

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
            href={
              `https://www.google.com/maps?q=${position[0]},${position[1]}`
            }
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
