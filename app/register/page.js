"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    location: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: data.user.id,
            name: form.name,
            phone: form.phone,
            location: form.location,
          },
        ]);

      if (profileError) {
        setMessage(profileError.message);
        setLoading(false);
        return;
      }
    }

    setMessage(
      "Registration successful! Please check your email to confirm your account."
    );

    setLoading(false);
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Trinity Family</h1>

        <h2>Create Account</h2>

        <p>
          Register to shop with us and save your delivery details.
        </p>

        <form onSubmit={handleRegister}>

          <label>Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label>Phone Number</label>
          <input
            type="tel"
            name="phone"
            placeholder="e.g. 0712 345 678"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <label>Delivery Location</label>
          <input
            type="text"
            name="location"
            placeholder="Enter your location"
            value={form.location}
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange}
            required
            minLength="6"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        {message && (
          <p className="auth-message">
            {message}
          </p>
        )}

        <p className="auth-link">
          Already have an account?{" "}
          <a href="/login">Login</a>
        </p>

        <a href="/">← Back to Shop</a>
      </section>
    </main>
  );
}
