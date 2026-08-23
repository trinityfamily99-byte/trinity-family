"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [locationStatus, setLocationStatus] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function getLocation() {
    setLocationStatus("Getting your location...");
    setMessage("");

    if (!navigator.geolocation) {
      setLocationStatus(
        "Your browser does not support location services."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLatitude(lat);
        setLongitude(lng);

        setLocationStatus(
          "✓ Your delivery location has been captured successfully."
        );
      },
      (error) => {
        console.log(error);

        setLocationStatus(
          "Unable to get your location. Please allow location access and try again."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }

  async function handleRegister(e) {
    e.preventDefault();

    setMessage("");

    if (password !== confirmPassword) {
      setMessage(
        "Passwords do not match. Please check your passwords."
      );
      return;
    }

    if (password.length < 6) {
      setMessage(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (latitude === null || longitude === null) {
      setMessage(
        "Please capture your delivery location before creating your account."
      );
      return;
    }

    setLoading(true);

    try {
      const locationUrl =
        `https://www.google.com/maps?q=${latitude},${longitude}`;

      // Create account
      const { data, error } =
        await supabase.auth.signUp({
          email: email.trim(),
          password: password,

          options: {
            data: {
              full_name: fullName.trim(),
              phone: phone.trim(),
              latitude: latitude,
              longitude: longitude,
              location: `${latitude}, ${longitude}`,
              location_url: locationUrl,
            },
          },
        });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      // Save customer details to profile
      if (data.user) {
        const { error: profileError } =
          await supabase
            .from("profiles")
            .upsert(
              {
                id: data.user.id,
                name: fullName.trim(),
                phone: phone.trim(),
                latitude: latitude,
                longitude: longitude,
                location: `${latitude}, ${longitude}`,
                location_url: locationUrl,
              },
              {
                onConflict: "id",
              }
            );

        if (profileError) {
          console.log(
            "Profile save error:",
            profileError
          );
        }
      }

      setMessage(
        "✓ Registration successful! Please check your email and confirm your account before logging in."
      );

      setFullName("");
      setPhone("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setLatitude(null);
      setLongitude(null);
      setLocationStatus("");
    } catch (error) {
      console.log(error);

      setMessage(
        "Something went wrong. Please try again."
      );
    }

    setLoading(false);
  }

  return (
    <main className="auth-page">
      <section className="auth-card">

        <h1>Trinity Family</h1>

        <h2>Create Account</h2>

        <p className="auth-intro">
          Register to shop with us and save your
          delivery details.
        </p>

        <form
          onSubmit={handleRegister}
          className="auth-form"
        >

          {/* FULL NAME */}
          <div className="form-group">
            <label htmlFor="fullName">
              Full Name
            </label>

            <input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) =>
                setFullName(e.target.value)
              }
              required
            />
          </div>

          {/* PHONE */}
          <div className="form-group">
            <label htmlFor="phone">
              Phone Number
            </label>

            <input
              id="phone"
              type="tel"
              placeholder="e.g. 0727 757 996"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              required
            />
          </div>

          {/* EMAIL */}
          <div className="form-group">
            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          {/* DELIVERY LOCATION */}
          <div className="form-group">

            <label>
              Delivery Location
            </label>

            <button
              type="button"
              onClick={getLocation}
              className="location-button"
            >
              📍 Use My Current Location
            </button>

            {locationStatus && (
              <p className="location-status">
                {locationStatus}
              </p>
            )}

            {latitude !== null &&
              longitude !== null && (
                <div className="selected-location">

                  <p>
                    📍 Location captured
                  </p>

                  <a
                    href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-link"
                  >
                    View Location on Google Maps
                  </a>

                </div>
              )}
          </div>

          {/* PASSWORD */}
          <div className="form-group">
            <label htmlFor="password">
              Create Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Create your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="form-group">
            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              required
            />
          </div>

          {/* MESSAGE */}
          {message && (
            <p className="auth-message">
              {message}
            </p>
          )}

          {/* CREATE ACCOUNT */}
          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        <p className="auth-link">
          Already have an account?{" "}
          <a href="/login">
            Login
          </a>
        </p>

        <a href="/" className="back-shop-link">
          ← Back to Shop
        </a>

      </section>
    </main>
  );
}
