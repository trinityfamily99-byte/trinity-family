"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        setReady(true);
      } else {
        setMessage(
          "This password reset link is invalid or has expired."
        );
      }
    }

    checkSession();
  }, []);

  async function handleReset(e) {
    e.preventDefault();

    setMessage("");

    if (password.length < 6) {
      setMessage(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage(
        "Passwords do not match."
      );
      return;
    }

    setLoading(true);

    const { error } =
      await supabase.auth.updateUser({
        password: password,
      });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage(
      "Password changed successfully! You can now log in."
    );

    setPassword("");
    setConfirmPassword("");

    setTimeout(() => {
      window.location.href = "/login";
    }, 1500);
  }

  return (
    <main className="auth-page">
      <section className="auth-card">

        <h1>Trinity Family</h1>

        <h2>Reset Password</h2>

        {ready ? (
          <>
            <p>
              Enter your new password below.
            </p>

            <form onSubmit={handleReset}>

              <label htmlFor="password">
                New Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

              <label htmlFor="confirmPassword">
                Confirm New Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                required
              />

              <button
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Updating Password..."
                  : "Set New Password"}
              </button>

            </form>
          </>
        ) : (
          <p>{message}</p>
        )}

        {message && ready && (
          <p className="auth-message">
            {message}
          </p>
        )}

        <p className="auth-link">
          <a href="/login">
            ← Back to Login
          </a>
        </p>

      </section>
    </main>
  );
}
