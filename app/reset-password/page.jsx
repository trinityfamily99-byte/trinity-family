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
    let mounted = true;

    const prepareReset = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        // If Supabase sent a recovery code, exchange it for a session
        if (code) {
          const { error } =
            await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            if (mounted) {
              setMessage(
                "This password reset link is invalid or has expired. Please request a new one."
              );
            }
            return;
          }
        }

        // Give Supabase a moment to process recovery links
        await new Promise((resolve) => setTimeout(resolve, 500));

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (mounted) {
          if (session) {
            setReady(true);
            setMessage("");
          } else {
            setMessage(
              "This password reset link is invalid or has expired. Please request a new one."
            );
          }
        }
      } catch (error) {
        if (mounted) {
          setMessage(
            "Unable to verify the password reset link. Please request a new one."
          );
        }
      }
    };

    prepareReset();

    // Listen for Supabase authentication changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        if (
          event === "PASSWORD_RECOVERY" ||
          session
        ) {
          setReady(true);
          setMessage("");
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setMessage(
        "Password must be at least 6 characters long."
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage(
      "Password changed successfully! Redirecting to login..."
    );

    setTimeout(() => {
      window.location.href = "/login";
    }, 1500);
  };

  return (
    <main className="auth-page">
      <section className="auth-card">

        <h1>Trinity Family</h1>

        <h2>Reset Password</h2>

        {!ready && !message && (
          <p>Checking your reset link...</p>
        )}

        {ready && (
          <>
            <p>
              Enter your new password below.
            </p>

            <form onSubmit={handleUpdatePassword}>

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
                minLength={6}
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
                minLength={6}
              />

              <button
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Updating..."
                  : "Set New Password"}
              </button>

            </form>
          </>
        )}

        {message && (
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
