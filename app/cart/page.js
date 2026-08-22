"use client";

import { useEffect, useState } from "react";

export default function CartPage() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("trinity-cart");

    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        setCart([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "trinity-cart",
      JSON.stringify(cart)
    );
  }, [cart]);

  function increaseQuantity(name) {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.Name === name
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  }

  function decreaseQuantity(name) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.Name === name
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(name) {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.Name !== name
      )
    );
  }

  const cartTotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.Price || 0) * item.quantity,
    0
  );

  const cartCount = cart.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  return (
    <main className="cart-page">

      <header className="cart-page-header">
        <a href="/" className="back-home">
          ← Continue Shopping
        </a>

        <h1>🛒 Your Shopping Cart</h1>

        <p>
          {cartCount} item
          {cartCount !== 1 ? "s" : ""} in your cart
        </p>
      </header>

      {cart.length === 0 ? (
        <section className="empty-cart-page">
          <h2>Your cart is empty</h2>

          <p>
            Browse our products and choose
            what you need.
          </p>

          <a
            href="/#shop"
            className="continue-shopping"
          >
            Browse Products
          </a>
        </section>
      ) : (
        <section className="cart-content">

          <div className="cart-items-page">

            {cart.map((item) => (
              <div
                className="cart-product"
                key={item.Name}
              >

                <div className="cart-product-image">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.Name}
                    />
                  ) : (
                    <span>No Image</span>
                  )}
                </div>

                <div className="cart-product-info">

                  <h2>{item.Name}</h2>

                  <p className="cart-price">
                    KES{" "}
                    {Number(
                      item.Price || 0
                    ).toFixed(2)}
                  </p>

                  <div className="cart-quantity">

                    <button
                      onClick={() =>
                        decreaseQuantity(
                          item.Name
                        )
                      }
                    >
                      −
                    </button>

                    <span>
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        increaseQuantity(
                          item.Name
                        )
                      }
                    >
                      +
                    </button>

                  </div>

                  <button
                    className="remove-cart-item"
                    onClick={() =>
                      removeFromCart(
                        item.Name
                      )
                    }
                  >
                    Remove
                  </button>

                </div>

                <div className="cart-item-total">

                  KES{" "}
                  {(
                    Number(item.Price || 0) *
                    item.quantity
                  ).toFixed(2)}

                </div>

              </div>
            ))}

          </div>

          <aside className="cart-summary">

            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Items</span>
              <span>{cartCount}</span>
            </div>

            <div className="summary-row total-row">
              <strong>Total</strong>

              <strong>
                KES{" "}
                {cartTotal.toFixed(2)}
              </strong>
            </div>

            <a href="/checkout" className="checkout-button">
  Proceed to Checkout
</a>

          </aside>

        </section>
      )}

    </main>
  );
}
