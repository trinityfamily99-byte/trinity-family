export default function Home() {
  return (
    <main>
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
          <button className="login-button">Login</button>
        </nav>
      </header>

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

      <section id="shop" className="shop-section">
        <h2>Our Products</h2>
        <p className="section-intro">
          Browse our products and choose what you need.
        </p>

        <div className="products">
          <div className="product-card">
            <div className="product-image">Product Image</div>
            <h3>Product Name</h3>
            <p className="price">KSh 0.00</p>
            <button>Add to Cart</button>
          </div>

          <div className="product-card">
            <div className="product-image">Product Image</div>
            <h3>Product Name</h3>
            <p className="price">KSh 0.00</p>
            <button>Add to Cart</button>
          </div>

          <div className="product-card">
            <div className="product-image">Product Image</div>
            <h3>Product Name</h3>
            <p className="price">KSh 0.00</p>
            <button>Add to Cart</button>
          </div>
        </div>
      </section>

      <section id="about" className="about-section">
        <h2>About Trinity Family</h2>
        <p>
          Trinity Family is an online shop created to make shopping simple,
          convenient and accessible to our customers.
        </p>
      </section>

      <footer id="contact">
        <h2>Contact Trinity Family</h2>
        <p>Email: trinityfamily@example.com</p>
        <p>Phone: +254 XXX XXX XXX</p>
        <p>© 2026 Trinity Family. All rights reserved.</p>
      </footer>
    </main>
  );
}
