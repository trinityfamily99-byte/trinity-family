"use client";

import { useState } from "react";

export default function Checkout() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    location: "",
    notes: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    alert("Order received! We will contact you to confirm your order.");

    console.log("Customer Order:", form);
  };

  return (
    <main className="checkout-page">

      <header className="checkout-header">
        <h1>Trinity Family</h1>
        <p>Checkout</p>
      </header>

      <section className="checkout-container">

        <h2>Complete Your Order</h2>

        <p className="checkout-intro">
          Please provide your details so we can process your order.
        </p>

        <form onSubmit={handleSubmit}>

          <label>
            Full Name
          </label>

          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
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
            placeholder="e.g. 0712 345 678"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <label>
            Delivery Location
          </label>

          <input
            type="text"
            name="location"
            placeholder="Enter your delivery location"
            value={form.location}
            onChange={handleChange}
            required
          />

          <label>
            Order Notes
          </label>

          <textarea
            name="notes"
            placeholder="Any additional instructions? (Optional)"
            value={form.notes}
            onChange={handleChange}
            rows="4"
          />

          <button type="submit" className="place-order-button">
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
