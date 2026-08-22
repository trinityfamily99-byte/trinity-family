"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  // Check logged-in customer
  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        setProfile(profileData);
      }
    }

    loadUser();

    // Listen for login/logout changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;

      setUser(currentUser);

      if (currentUser) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .maybeSingle();

        setProfile(profileData);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load products from Supabase
  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("Name", { ascending: true });

      if (error) {
        setError(error);
      } else {
        setProducts(data || []);
      }
    }

    loadProducts();
  }, []);

  // Load saved cart
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

  // Save cart whenever it changes
  useEffect(() => {
    localStorage.setItem("trinity-cart", JSON.stringify(cart));
  }, [cart]);

  // Add product to cart
  function addToCart(product) {
    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.Name === product.Name
      );

      if (existing) {
        return currentCart.map((item) =>
          item.Name === product.Name
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  }

  // Logout
  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  // Number of products in cart
  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <main>
      {/* HEADER */}
      <header className="site-header">
        <div className="brand">
          <div className="logo-placeholder">TF</div>

          <div>
            <h1>Trinity Family</h1>
            <p>Your trusted family shop</p>
          </div>
        </div>

        <nav>
          <a href="/">Home</a>
          <a href="#shop">Shop</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>

          <a href="/cart" className="cart-button">
            🛒 Cart
            {cartCount > 0 && (
              <span className="cart-count">
                {cartCount}
              </span>
            )}
          </a>

          {user ? (
            <>
              <span className="welcome-user">
                👋 Welcome,{" "}
                {profile?.full_name ||
                  profile?.name ||
                  user.user_metadata?.full_name ||
                  "Customer"}
              </span>

              <button
                onClick={handleLogout}
                className="logout-button"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="login-button">
                Login
              </a>

              <a href="/register" className="register-button">
                Register
              </a>
            </>
          )}
        </nav>
      </header>

      {/* HERO */}
      <section className="hero">
        <div>
          <h2>Welcome to Trinity Family</h2>

          <p>
            Quality products, fair prices and convenient shopping —
            all in one place.
          </p>

          <a href="#shop" className="shop-button">
            Shop Now
          </a>
        </div>
      </section>

      {/* SHOP */}
      <section id="shop" className="shop-section">
        <h2>Our Products</h2>

        <p className="section-intro">
          Browse our products and choose what you need.
        </p>

        {error && (
          <p>
            Unable to load products: {error.message}
          </p>
        )}

        {!error && products.length === 0 && (
          <p>No products available yet.</p>
        )}

        <div className="products">
          {products.map((product) => (
            <div
              className="product-card"
              key={product.Name}
            >
              {/* PRODUCT IMAGE */}
              <div
                className="product-image"
                onClick={() => {
                  if (product.image_url) {
                    window.open(
                      product.image_url,
                      "_blank"
                    );
                  }
                }}
                style={{
                  cursor: product.image_url
                    ? "pointer"
                    : "default",
                }}
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.Name}
                  />
                ) : (
                  "Product Image"
                )}
              </div>

              {/* PRODUCT DETAILS */}
              <h3>{product.Name}</h3>

              <p>
                {product.Description}
              </p>

              <p className="price">
                KES{" "}
                {Number(product.Price || 0).toFixed(2)}
              </p>

              <button
                onClick={() => addToCart(product)}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section
        id="about"
        className="about-section"
      >
        <h2>About Trinity Family</h2>

        <p>
          Trinity Family is an online shop created to
          make shopping simple, convenient and
          accessible to our customers.
        </p>
      </section>

      {/* FOOTER */}
      <footer id="contact">
        <h2>Contact Trinity Family</h2>

        <p>
          Email: trinityfamily@example.com
        </p>

        <p>
          Phone: +254 727 757 996
        </p>

        <p>
          © 2026 Trinity Family. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
