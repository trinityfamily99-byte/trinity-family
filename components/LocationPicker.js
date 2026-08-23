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

// Fix Leaflet marker icons
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

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([
        e.latlng.lat,
        e.latlng.lng,
      ]);
    },
  });

  return position ? (
    <Marker
      position={position}
      icon={markerIcon}
    />
  ) : null;
}

function ChangeMapCenter({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, 16);
    }
  }, [position, map]);

  return null;
}

export default function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
}) {
  const [position, setPosition] = useState(
    latitude !== null &&
      longitude !== null
      ? [latitude, longitude]
      : [-1.286389, 36.817223]
  );

  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [locationName, setLocationName] =
    useState("");

  // Send selected location to parent
  useEffect(() => {
    if (!position) return;

    const [lat, lng] = position;

    onLocationChange({
      latitude: lat,
      longitude: lng,
      locationName: locationName,
      locationUrl:
        `https://www.google.com/maps?q=${lat},${lng}`,
    });
  }, [
    position,
    locationName,
    onLocationChange,
  ]);

  // Search for a location
  async function searchLocation(e) {
    e.preventDefault();

    if (!search.trim()) return;

    setSearching(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
          search
        )}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      const results = await response.json();

      if (results.length === 0) {
        alert(
          "Location not found. Try entering a nearby town, estate, street or landmark."
        );

        setSearching(false);
        return;
      }

      const result = results[0];

      const lat = Number(result.lat);
      const lng = Number(result.lon);

      setPosition([lat, lng]);
      setLocationName(result.display_name);

    } catch (error) {
      console.error(
        "Location search error:",
        error
      );

      alert(
        "Unable to search for this location. Please try again."
      );
    }

    setSearching(false);
  }

  // Use current GPS location
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

        setPosition([lat, lng]);

        // Try to get readable address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            {
              headers: {
                Accept:
                  "application/json",
              },
            }
          );

          const result =
            await response.json();

          setLocationName(
            result.display_name ||
              `${lat}, ${lng}`
          );
        } catch {
          setLocationName(
            `${lat}, ${lng}`
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
        onClick={useCurrentLocation}
        className="current-location-button"
      >
        📍 Use My Current Location
      </button>

      {/* MAP */}

      <div className="location-map">

        <MapContainer
          center={position}
          zoom={position ? 16 : 6}
          scrollWheelZoom={true}
          style={{
            width: "100%",
            height: "350px",
          }}
        >

          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ChangeMapCenter
            position={position}
          />

          <LocationMarker
            position={position}
            setPosition={(newPosition) => {
              setPosition(
                newPosition
              );
              setLocationName(
                ""
              );
            }}
          />

        </MapContainer>

      </div>

      {/* SELECTED LOCATION */}

      {position && (
        <div className="selected-location">

          <p>
            📍 <strong>Selected Delivery Location</strong>
          </p>

          {locationName && (
            <p className="location-name">
              {locationName}
            </p>
          )}

          <p className="coordinates">
            {position[0].toFixed(6)},{" "}
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
