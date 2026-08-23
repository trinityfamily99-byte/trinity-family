"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Checkout() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    location: "",
    additional_information: "",
  });

  const [loading, setLoading] = useState(true);

  // Load registered customer details
  useEffect(() => {
    async function loadCustomerDetails() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      // Get profile details from Supabase
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
          "",
        phone:
          profile?.phone ||
          user.user_metadata?.phone ||
          "",
        email: user.email || "",
        location:
          profile?.location ||
          "",
        additional_information: "",
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

          {/* FULL NAME */}
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

          {/* PHONE */}
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

          {/* EMAIL */}
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

          {/* DELIVERY LOCATION */}
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

          {/* ADDITIONAL INFORMATION */}
          <label htmlFor="additional_information">
            Additional Information
          </label>

          <textarea
            id="additional_information"
            name="additional_information"
            placeholder="Anything else you would like us to know? (Optional)"
            value={form.additional_information}
            onChange={handleChange}
            rows="4"
          />

          {/* PLACE ORDER */}
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
