"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();

    setMessage("");

    // Check password match
    if (password !== confirmPassword) {
      setMessage("Passwords do not match. Please try again.");
      return;
    }

    // Basic password length check
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      // Create Supabase account
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            location: location.trim(),
          },
        },
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      // Account created successfully
      if (data.user) {
        setMessage(
          "Account created successfully! You can now log in."
        );
      }

      // Clear form
      setFullName("");
      setPhone("");
      setLocation("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    }

    setLoading(false);
  }

  return (
    <main className="auth-page">
      <div className="auth-container">

        <h1>Trinity Family</h1>

        <h2>Create Account</h2>

        <p className="auth-intro">
          Register to shop with us and save your delivery details.
        </p>

        <form onSubmit={handleRegister} className="auth-form">

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
              onChange={(e) => setFullName(e.target.value)}
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
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          {/* LOCATION */}
          <div className="form-group">
            <label htmlFor="location">
              Delivery Location
            </label>

            <input
              id="location"
              type="text"
              placeholder="Enter your delivery location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
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
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? "Creating Account..." : "Create Account"}
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
