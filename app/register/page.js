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

  // GET CUSTOMER'S GPS LOCATION
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
          "✓ Delivery location captured successfully."
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

    // PASSWORD MATCH
    if (password !== confirmPassword) {
      setMessage(
        "Passwords do not match. Please check your passwords."
      );
      return;
    }

    // PASSWORD LENGTH
    if (password.length < 6) {
      setMessage(
        "Password must be at least 6 characters."
      );
      return;
    }

    // LOCATION REQUIRED
    if (latitude === null || longitude === null) {
      setMessage(
        "Please capture your delivery location before creating your account."
      );
      return;
    }

    setLoading(true);

    try {
      // CREATE ACCOUNT
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
              location_url: `https://www.google.com/maps?q=${latitude},${longitude}`,
            },
          },
        });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      // SAVE LOCATION TO PROFILE
      if (data.user) {
        const { error: profileError } =
          await supabase
            .from("profiles")
            .update({
              name: fullName.trim(),
              phone: phone.trim(),
              latitude: latitude,
              longitude: longitude,
              location_url: `https://www.google.com/maps?q=${latitude},${longitude}`,
            })
            .eq("id", data.user.id);

        if (profileError) {
          console.log(
            "Profile update error:",
            profileError
          );
        }
      }

      // SUCCESS MESSAGE
      setMessage(
        "✓ Registration successful! Please check your email and confirm your account before logging in."
      );

      // CLEAR FORM
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
      <div className="auth-container">

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
                <a
                  href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View selected location on Google Maps
                </a>
              )}
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
          <a href="/login">Login</a>
        </p>

      </div>
    </main>
  );
}
