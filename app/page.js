"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  // THREE-LINE MENU
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuSection, setMenuSection] = useState(null);

  // LANGUAGE
  const [language, setLanguage] = useState("English");

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
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user || null;

        setUser(currentUser);

        if (currentUser) {
          const { data: profileData } =
            await supabase
              .from("profiles")
              .select("*")
              .eq("id", currentUser.id)
              .maybeSingle();

          setProfile(profileData);
        } else {
          setProfile(null);
        }
      }
    );

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
    const savedCart =
      localStorage.getItem("trinity-cart");

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
    localStorage.setItem(
      "trinity-cart",
      JSON.stringify(cart)
    );
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
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
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

  // Open menu section
  function openMenuSection(section) {
    setMenuSection(section);
  }

  // Close menu
  function closeMenu() {
    setMenuOpen(false);
    setMenuSection(null);
  }

  return (
    <main>

      {/* HEADER */}
      <header className="site-header">

        <div className="brand">

          <div className="logo-placeholder">
            TF
          </div>

          <div>
            <h1>Trinity Family</h1>
            <p>Your trusted family shop</p>
          </div>

        </div>

        {/* DESKTOP NAVIGATION */}
        <nav>

          <a href="/">Home</a>

          <a href="#shop">Shop</a>

          <a href="#about">About</a>

          <a href="#contact">Contact</a>

          <a
            href="/cart"
            className="cart-button"
          >
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
              <a
                href="/login"
                className="login-button"
              >
                Login
              </a>

              <a
                href="/register"
                className="register-button"
              >
                Register
              </a>
            </>
          )}

        </nav>

        {/* THREE-LINE MENU BUTTON */}
        <button
          type="button"
          className="menu-button"
          onClick={() => {
            setMenuOpen(!menuOpen);
            setMenuSection(null);
          }}
          aria-label="Open menu"
        >
          ☰
        </button>

      </header>


      {/* THREE-LINE MENU PANEL */}

      {menuOpen && (
        <div className="menu-overlay">

          <div className="menu-panel">

            {/* MENU HEADER */}

            <div className="menu-header">

              <div>
                <h2>Trinity Family</h2>

                <p>
                  {user
                    ? `Welcome, ${
                        profile?.full_name ||
                        profile?.name ||
                        user.user_metadata?.full_name ||
                        "Customer"
                      }`
                    : "Welcome to our shop"}
                </p>
              </div>

              <button
                type="button"
                className="menu-close"
                onClick={closeMenu}
              >
                ✕
              </button>

            </div>


            {/* MAIN MENU */}

            {!menuSection && (
              <div className="menu-options">

                <button
                  type="button"
                  onClick={() =>
                    openMenuSection("profile")
                  }
                >
                  <span>👤</span>

                  <div>
                    <strong>Profile</strong>
                    <small>
                      View your registered details
                    </small>
                  </div>

                  <span>›</span>
                </button>


                <button
                  type="button"
                  onClick={() =>
                    openMenuSection("settings")
                  }
                >
                  <span>⚙️</span>

                  <div>
                    <strong>Settings</strong>
                    <small>
                      Account and site settings
                    </small>
                  </div>

                  <span>›</span>
                </button>


                <button
                  type="button"
                  onClick={() =>
                    openMenuSection("contact")
                  }
                >
                  <span>📞</span>

                  <div>
                    <strong>Contact Us</strong>
                    <small>
                      Get in touch with Trinity Family
                    </small>
                  </div>

                  <span>›</span>
                </button>


                <button
                  type="button"
                  onClick={() =>
                    openMenuSection("language")
                  }
                >
                  <span>🌐</span>

                  <div>
                    <strong>Language</strong>
                    <small>
                      {language}
                    </small>
                  </div>

                  <span>›</span>
                </button>


                {/* CART */}

                <a
                  href="/cart"
                  className="menu-cart-link"
                >
                  <span>🛒</span>

                  <div>
                    <strong>My Cart</strong>

                    <small>
                      {cartCount} item
                      {cartCount !== 1
                        ? "s"
                        : ""}
                    </small>
                  </div>

                  <span>›</span>
                </a>


                {/* LOGIN / REGISTER / LOGOUT */}

                {user ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="menu-logout"
                  >
                    <span>🚪</span>

                    <div>
                      <strong>Logout</strong>
                      <small>
                        Sign out of your account
                      </small>
                    </div>

                    <span>›</span>
                  </button>
                ) : (
                  <>
                    <a
                      href="/login"
                      className="menu-login"
                    >
                      <span>🔐</span>

                      <div>
                        <strong>Login</strong>
                        <small>
                          Sign in to your account
                        </small>
                      </div>

                      <span>›</span>
                    </a>

                    <a
                      href="/register"
                      className="menu-register"
                    >
                      <span>📝</span>

                      <div>
                        <strong>Create Account</strong>
                        <small>
                          Register with Trinity Family
                        </small>
                      </div>

                      <span>›</span>
                    </a>
                  </>
                )}

              </div>
            )}


            {/* PROFILE */}

            {menuSection === "profile" && (
              <div className="menu-content">

                <button
                  type="button"
                  className="back-menu"
                  onClick={() =>
                    setMenuSection(null)
                  }
                >
                  ← Back
                </button>

                <h2>👤 My Profile</h2>

                {user ? (
                  <div className="profile-details">

                    <div>
                      <strong>Full Name</strong>
                      <p>
                        {profile?.full_name ||
                          profile?.name ||
                          user.user_metadata
                            ?.full_name ||
                          "Not available"}
                      </p>
                    </div>

                    <div>
                      <strong>Phone</strong>
                      <p>
                        {profile?.phone ||
                          profile?.phone_number ||
                          user.user_metadata?.phone ||
                          "Not available"}
                      </p>
                    </div>

                    <div>
                      <strong>Email</strong>
                      <p>
                        {user.email ||
                          "Not available"}
                      </p>
                    </div>

                    <div>
                      <strong>
                        Delivery Location
                      </strong>

                      <p>
                        {profile?.location_name ||
                          profile?.location ||
                          profile?.delivery_location ||
                          "Not available"}
                      </p>

                      {profile?.location_url && (
                        <a
                          href={
                            profile.location_url
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="profile-map-link"
                        >
                          🗺️ Open delivery location
                        </a>
                      )}

                      {profile?.latitude &&
                        profile?.longitude && (
                          <a
                            href={`https://www.google.com/maps?q=${profile.latitude},${profile.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="profile-map-link"
                          >
                            📍 View on Google Maps
                          </a>
                        )}
                    </div>

                  </div>
                ) : (
                  <div className="not-logged-in">

                    <p>
                      You are not currently
                      logged in.
                    </p>

                    <a
                      href="/login"
                      className="menu-action-button"
                    >
                      Login
                    </a>

                    <a
                      href="/register"
                      className="menu-action-button"
                    >
                      Create Account
                    </a>

                  </div>
                )}

              </div>
            )}


            {/* SETTINGS */}

            {menuSection === "settings" && (
              <div className="menu-content">

                <button
                  type="button"
                  className="back-menu"
                  onClick={() =>
                    setMenuSection(null)
                  }
                >
                  ← Back
                </button>

                <h2>⚙️ Settings</h2>

                <div className="settings-list">

                  <div className="setting-item">
                    <div>
                      <strong>
                        Account
                      </strong>

                      <small>
                        Manage your Trinity Family
                        account
                      </small>
                    </div>

                    {user ? (
                      <span>✓</span>
                    ) : (
                      <span>—</span>
                    )}
                  </div>


                  <div className="setting-item">
                    <div>
                      <strong>
                        Delivery Details
                      </strong>

                      <small>
                        Your saved delivery
                        location
                      </small>
                    </div>

                    <span>📍</span>
                  </div>


                  <div className="setting-item">
                    <div>
                      <strong>
                        Language
                      </strong>

                      <small>
                        {language}
                      </small>
                    </div>

                    <span>🌐</span>
                  </div>

                </div>

                <p className="settings-note">
                  More account settings can be
                  added here as the Trinity Family
                  site grows.
                </p>

              </div>
            )}


            {/* CONTACT */}

            {menuSection === "contact" && (
              <div className="menu-content">

                <button
                  type="button"
                  className="back-menu"
                  onClick={() =>
                    setMenuSection(null)
                  }
                >
                  ← Back
                </button>

                <h2>📞 Contact Us</h2>

                <div className="contact-details">

                  <p>
                    <strong>
                      Trinity Family
                    </strong>
                  </p>

                  <p>
                    We are here to help with
                    your orders and questions.
                  </p>

                  <a href="mailto:trinityfamily@example.com">
                    📧 trinityfamily@example.com
                  </a>

                  <a href="tel:+254727757996">
                    📱 +254 727 757 996
                  </a>

                </div>

              </div>
            )}


            {/* LANGUAGE */}

            {menuSection === "language" && (
              <div className="menu-content">

                <button
                  type="button"
                  className="back-menu"
                  onClick={() =>
                    setMenuSection(null)
                  }
                >
                  ← Back
                </button>

                <h2>🌐 Language</h2>

                <div className="language-options">

                  <button
                    type="button"
                    className={
                      language === "English"
                        ? "language-selected"
                        : ""
                    }
                    onClick={() => {
                      setLanguage("English");
                      setMenuSection(null);
                    }}
                  >
                    🇬🇧 English

                    {language === "English" && (
                      <span>✓</span>
                    )}
                  </button>


                  <button
                    type="button"
                    className={
                      language === "Kiswahili"
                        ? "language-selected"
                        : ""
                    }
                    onClick={() => {
                      setLanguage("Kiswahili");
                      setMenuSection(null);
                    }}
                  >
                    🇰🇪 Kiswahili

                    {language === "Kiswahili" && (
                      <span>✓</span>
                    )}
                  </button>

                </div>

                <p className="language-note">
                  Language translation will be
                  expanded across the entire
                  website in the next step.
                </p>

              </div>
            )}

          </div>

        </div>
      )}


      {/* HERO */}

      <section className="hero">

        <div>

          <h2>
            Welcome to Trinity Family
          </h2>

          <p>
            Quality products, fair prices and
            convenient shopping — all in one
            place.
          </p>

          <a
            href="#shop"
            className="shop-button"
          >
            Shop Now
          </a>

        </div>

      </section>


      {/* SHOP */}

      <section
        id="shop"
        className="shop-section"
      >

        <h2>Our Products</h2>

        <p className="section-intro">
          Browse our products and choose what
          you need.
        </p>

        {error && (
          <p>
            Unable to load products:{" "}
            {error.message}
          </p>
        )}

        {!error &&
          products.length === 0 && (
            <p>
              No products available yet.
            </p>
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
                  cursor:
                    product.image_url
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
                {Number(
                  product.Price || 0
                ).toFixed(2)}
              </p>

              <button
                onClick={() =>
                  addToCart(product)
                }
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

        <h2>
          About Trinity Family
        </h2>

        <p>
          Trinity Family is an online shop
          created to make shopping simple,
          convenient and accessible to our
          customers.
        </p>

      </section>


      {/* FOOTER */}

      <footer id="contact">

        <h2>
          Contact Trinity Family
        </h2>

        <p>
          Email:
          trinityfamily@example.com
        </p>

        <p>
          Phone:
          +254 727 757 996
        </p>

        <p>
          © 2026 Trinity Family.
          All rights reserved.
        </p>

      </footer>

    </main>
  );
}
