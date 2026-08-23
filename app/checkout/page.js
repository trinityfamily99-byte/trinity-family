"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Checkout() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    location: "",
    additionalInfo: "",
  });

  const [loading, setLoading] = useState(true);

  // Load registered customer details
  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setForm({
          name:
            profile.full_name ||
            profile.name ||
            user.user_metadata?.full_name ||
            "",

          phone:
            profile.phone ||
            user.user_metadata?.phone ||
            "",

          email: user.email || "",

          // THIS IS THE IMPORTANT PART
          location:
            profile.location ||
            profile.delivery_location ||
            "",

          additionalInfo: "",
        });
      } else {
        setForm((current) => ({
          ...current,
          email: user.email || "",
        }));
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    alert(
      "Order received! We will contact you to confirm your order."
    );

    console.log("Customer Order:", form);
  };

  if (loading) {
    return (
      <main className="checkout-page">
        <section className="checkout-container">
          <h2>Loading your details...</h2>
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

          <label>
            Full Name
          </label>

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label>
            Phone Number
          </label>

          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <label>
            Email Address
          </label>

          <input
            type="email"
            name="email"
            value={form.email}
            readOnly
          />

          <label>
            Delivery Location
          </label>

          <input
            type="text"
            name="location"
            placeholder="Your saved delivery location"
            value={form.location}
            onChange={handleChange}
            required
          />

          <label>
            Additional Information
          </label>

          <textarea
            name="additionalInfo"
            placeholder="Anything else you would like us to know? (Optional)"
            value={form.additionalInfo}
            onChange={handleChange}
            rows="4"
          />

          <button
            type="submit"
            className="place-order-button"
          >
            Place Order
          </button>

        </form>

        <a href="/cart" className="back-cart">
          ← Back to Cart
        </a>

      </section>

    </main>
  );
}
