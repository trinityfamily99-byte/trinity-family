"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Checkout() {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    location: "",
    additionalInfo: "",
  });

  useEffect(() => {
    async function loadCustomerDetails() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Profile loading error:", error);
      }

      setForm({
        name:
          profile?.full_name ||
          profile?.name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          "",

        phone:
          profile?.phone ||
          profile?.phone_number ||
          user.user_metadata?.phone ||
          "",

        email: user.email || "",

        location:
          profile?.delivery_location ||
          profile?.location ||
          user.user_metadata?.delivery_location ||
          user.user_metadata?.location ||
          "",

        additionalInfo: "",
      });

      setLoading(false);
    }

    loadCustomerDetails();
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
          <h2>Loading Your Details...</h2>
          <p>Please wait while we load your registered information.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">

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
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />

          <label htmlFor="phone">
            Phone Number
          </label>

          <input
            id="phone"
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="e.g. 0727 757 996"
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
            className="readonly-input"
          />

          <label htmlFor="location">
            Delivery Location
          </label>

          <input
            id="location"
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Your saved delivery location"
            required
          />

          <label htmlFor="additionalInfo">
            Additional Information
          </label>

          <textarea
            id="additionalInfo"
            name="additionalInfo"
            placeholder="Anything else you would like us to know? (Optional)"
            value={form.additionalInfo}
            onChange={handleChange}
            rows="5"
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
