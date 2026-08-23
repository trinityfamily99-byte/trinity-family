"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import LocationPicker from "../../components/LocationPicker";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [locationUrl, setLocationUrl] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleLocationChange(location) {
    setLatitude(location.latitude);
    setLongitude(location.longitude);
    setLocationName(location.locationName || "");
    setLocationUrl(location.locationUrl || "");
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

    if (
      latitude === null ||
      longitude === null
    ) {
      setMessage(
        "Please select your delivery location on the map before creating your account."
      );
      return;
    }

    setLoading(true);

    try {
      const finalLocationUrl =
        locationUrl ||
        `https://www.google.com/maps?q=${latitude},${longitude}`;

      const finalLocation =
        locationName ||
        `${latitude}, ${longitude}`;

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

              location: finalLocation,
              location_name: finalLocation,
              location_url: finalLocationUrl,
            },
          },
        });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      // SAVE CUSTOMER PROFILE
      if (data.user) {
        const { error: profileError } =
          await supabase
            .from("profiles")
            .upsert(
              {
                id: data.user.id,

                name: fullName.trim(),
                full_name: fullName.trim(),

                phone: phone.trim(),

                latitude: latitude,
                longitude: longitude,

                location: finalLocation,
                location_name: finalLocation,
                location_url: finalLocationUrl,
              },
              {
                onConflict: "id",
              }
            );

        if (profileError) {
          console.error(
            "Profile save error:",
            profileError
          );
        }
      }

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
      setLocationName("");
      setLocationUrl("");

    } catch (error) {
      console.error(error);

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

            <p className="location-help">
              Search for the place where you want
              your orders delivered, then select
              the exact location on the map.
            </p>

            <LocationPicker
              latitude={latitude}
              longitude={longitude}
              onLocationChange={
                handleLocationChange
              }
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
          <a href="/login">
            Login
          </a>
        </p>

        <a
          href="/"
          className="back-shop-link"
        >
          ← Back to Shop
        </a>

      </section>

    </main>
  );
}
