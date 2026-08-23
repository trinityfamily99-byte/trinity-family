"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Checkout() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    location: "",
    notes: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // Load logged-in user and profile
  useEffect(() => {
    async function loadCustomer() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setUser(user);

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Profile error:", error);
        setMessage(
          "We could not load your profile details. Please try again."
        );
        setLoading(false);
        return;
      }

      setProfile(profileData);

      setForm({
        name:
          profileData?.full_name ||
          profileData?.name ||
          user.user_metadata?.full_name ||
          "",
        phone:
          profileData?.phone ||
          user.user_metadata?.phone ||
          "",
        email: user.email || "",
        location:
          profileData?.location_url ||
          profileData?.location_address ||
          "",
        notes: "",
      });

      setLoading(false);
    }

    loadCustomer();
  }, []);

  function handleChange(e) {
    setForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSubmitting(true);
    setMessage("");

    try {
      // Save any edited customer details back to the profile
      if (user) {
        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: form.name.trim(),
            phone: form.phone.trim(),
          })
          .eq("id", user.id);

        if (error) {
          console.error("Profile update error:", error);
        }
      }

      alert(
        "Order received! We will contact you to confirm your order."
      );

      console.log("Customer Order:", {
        customer_id: user?.id,
        name: form.name,
        phone: form.phone,
        email: form.email,
        location: form.location,
        notes: form.notes,
      });

      setMessage(
        "Order received successfully! We will contact you to confirm your order."
      );
    } catch (error) {
      console.error(error);
      setMessage(
        "Something went wrong. Please try again."
      );
    }

    setSubmitting(false);
  }

  if (loading) {
    return (
      <main className="checkout-page">
        <section className="checkout-container">
          <h2>Loading your details...</h2>
          <p>Please wait.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">

      <header className="checkout-header">
        <h1>Trinity Family</h1>
        <p>Checkout</p>
      </header>

      <section className="checkout-container">

        <h2>Complete Your Order</h2>

        <p className="checkout-intro">
          Your registered details have been loaded automatically.
          Please confirm them before placing your order.
        </p>

        <form onSubmit={handleSubmit}>

          <label htmlFor="name">
            Full Name
          </label>

          <input
            id="name"
            type="text"
            name="name"
            placeholder="Your full name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="phone">
            Phone Number
          </label>

          <input
            id="phone"
            type="tel"
            name="phone"
            placeholder="Your phone number"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">
            Email Address
          </label>

          <input
            id="email"
            type="email"
            name="email"
            value={form.email}
            readOnly
          />

          <label htmlFor="location">
            Delivery Location
          </label>

          <input
            id="location"
            type="text"
            name="location"
            placeholder="Your saved delivery location"
            value={form.location}
            onChange={handleChange}
            required
          />

          <label htmlFor="notes">
            Order Notes
          </label>

          <textarea
            id="notes"
            name="notes"
            placeholder="Any additional instructions? (Optional)"
            value={form.notes}
            onChange={handleChange}
            rows="4"
          />

          {message && (
            <p className="auth-message">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="place-order-button"
            disabled={submitting}
          >
            {submitting
              ? "Processing..."
              : "Place Order"}
          </button>

        </form>

        <a href="/cart" className="back-cart">
          ← Back to Cart
        </a>

      </section>

    </main>
  );
}
