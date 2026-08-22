"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Login successful! Welcome back.");

    setTimeout(() => {
      window.location.href = "/";
    }, 800);
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setMessage("Please enter your email address first.");
      return;
    }

    setResetLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo:
          "https://trinity-family.vercel.app/reset-password",
      }
    );

    if (error) {
      setMessage(error.message);
      setResetLoading(false);
      return;
    }

    setMessage(
      "Password reset email sent! Please check your email and follow the link to create a new password."
    );

    setResetLoading(false);
  };

  return (
    <main className="auth-page">
      <section className="auth-card">

        <h1>Trinity Family</h1>

        <h2>Login</h2>

        <p>Login to continue shopping.</p>

        <form onSubmit={handleLogin}>

          <label htmlFor="email">
            Email
          </label>

          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        <button
          type="button"
          onClick={handleForgotPassword}
          disabled={resetLoading}
          className="forgot-password-button"
        >
          {resetLoading
            ? "Sending..."
            : "Forgot Password?"}
        </button>

        {message && (
          <p className="auth-message">
            {message}
          </p>
        )}

        <p className="auth-link">
          Don't have an account?{" "}
          <a href="/register">
            Create Account
          </a>
        </p>

        <a href="/">
          ← Back to Shop
        </a>

      </section>
    </main>
  );
}
