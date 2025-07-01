// HomePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/homepage.css";
import icon from "../images/Icon.png";

const HomePage = () => {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [popularLimit, setPopularLimit] = useState(5);
  const [newestLimit, setNewestLimit] = useState(4);
  const [recommendedLimit, setRecommendedLimit] = useState(4);
  const [reviewLimit, setReviewLimit] = useState(3);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const scrollingImages = [
    "/images/cloths1.jpg",
    "/images/cloths2.jpg",
    "/images/device1.jpg",
  ];

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get("http://localhost:4000/isAuthenticate", {
          withCredentials: true,
        });
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/v1/products");
        setAllProducts(res.data.products);
      } catch (err) {
        console.error("Product fetch failed", err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % scrollingImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [scrollingImages.length]);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:4000/logout", {}, { withCredentials: true });
      setIsLoggedIn(false);
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const filterProducts = () => {
    return allProducts.filter(product =>
      (!categoryFilter || product.category === categoryFilter) &&
      (!search || product.product_name.toLowerCase().includes(search.toLowerCase()))
    );
  };

  const ProductSection = ({ title, products, limit, setLimit }) => {
    const showLess = () => setLimit(5);
    const showMore = () => setLimit(products.length);
    const expanded = limit >= products.length;

    return (
      <section className="products-section">
        <h2 className="section-title">{title}</h2>
        <div className="products-grid">
          {products.slice(0, limit).map((product, index) => (
            <div
              key={`${product.product_id}-${index}`}
              className="product-card"
              onClick={() => navigate(`/product/${product.product_id}`)}
            >
              <img
                src={product.image_url || "https://via.placeholder.com/250?text=No+Image"}
                alt={product.product_name}
                className="product-img"
              />
              <p className="product-name">{product.product_name}</p>
              <p className="product-price">
                Price: <s>৳{product.actual_price}</s>
              </p>
              <p className="product-discount">Discount: ৳{product.discount}</p>
              <p className="product-actual-price">Selling Price: ৳{product.selling_price}</p>
            </div>
          ))}
        </div>
        {products.length > 4 && (
          <button className="show-more-btn" onClick={expanded ? showLess : showMore}>
            {expanded ? "See Less" : "See More"}
          </button>
        )}
      </section>
    );
  };

  return (
    <div className="container">
      <div className="websiteHeader">
        <img className="iconImage" src={icon} alt="Site Icon" />
        <span id="websiteName">DIGITAL BAZAAR</span>
      </div>

      <nav className="navbar">
        <ul className="nav-list">
          <li className="nav-item menu-item">
            Menu
            <ul className="menu-dropdown">
              <li className="menu-option" onClick={() => navigate("/profile")}>Edit Profile</li>
              <li className="menu-option" onClick={() => navigate("/settings")}>Settings</li>
              <li className="menu-option">Offers</li>
              <li className="menu-option">Help</li>
              <li className="menu-option">About Us</li>
            </ul>
          </li>
          <li className="nav-item category-item">
            Categories
            <ul className="category-dropdown">
              <li className="category-option" onClick={() => navigate("/CategoryPage/Electronics")}>Electronics</li>
              <li className="category-option" onClick={() => navigate("/CategoryPage/Fashion")}>Fashion</li>
              <li className="category-option" onClick={() => navigate("/CategoryPage/Books")}>Books</li>
            </ul>
          </li>
        </ul>
        <div className="nav-actions">
          <input
            type="text"
            className="search-input"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {!isLoggedIn ? (
            <li className="nav-item login-item">
              Login
              <ul className="login-dropdown">
                <li className="login-option" onClick={() => navigate("/CustomerLogin")}>Customer</li>
                <li className="login-option" onClick={() => navigate("/SellerLogin")}>Seller</li>
                <li className="login-option" onClick={() => navigate("/DeliveryManLogin")}>Delivery Man</li>
              </ul>
            </li>
          ) : (
            <li className="nav-item login-item">
              Account
              <ul className="login-dropdown">
                <li className="login-option" onClick={handleLogout}>Logout</li>
              </ul>
            </li>
          )}

          <span className="nav-action-item" onClick={() => navigate("/CartItems")}>Cart</span>
          <span className="nav-action-item" onClick={()=> navigate("/WishList")}>Wishlist</span>
        </div>
      </nav>

      <section className="hero-section">
        <div className="scrolling-container">
          {scrollingImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Slide ${index + 1}`}
              className={`scrolling-image ${index === heroImageIndex ? "active" : ""}`}
            />
          ))}
        </div>
        <div className="floating-text">
          <h1 className="hero-title">Welcome to Digital Bazaar</h1>
          <p className="hero-subtitle">Your One-Stop Destination for Quality Products</p>
          <p className="hero-description">Discover amazing deals, authentic products, and exceptional service.</p>
        </div>
      </section>

      <ProductSection
        title="Popular Products"
        products={filterProducts().slice(0, 20)}
        limit={popularLimit}
        setLimit={setPopularLimit}
      />

      <ProductSection
        title="Newest Arrivals"
        products={filterProducts().slice().reverse()}
        limit={newestLimit}
        setLimit={setNewestLimit}
      />

      <ProductSection
        title="Recommended For You"
        products={filterProducts()}
        limit={recommendedLimit}
        setLimit={setRecommendedLimit}
      />

      <section className="review-section">
        <h2 className="section-title">Customer Reviews</h2>
        <div className="reviews-container">
          {[1, 2, 3, 4, 5, 6].slice(0, reviewLimit).map((_, index) => (
            <div key={index} className="review-card">
              <p className="review-text">"Review sample {index + 1}. Very satisfied!"</p>
              <p className="review-author">— User {index + 1}</p>
            </div>
          ))}
        </div>
        {reviewLimit < 6 ? (
          <button className="show-more-btn" onClick={() => setReviewLimit(6)}>See More</button>
        ) : (
          <button className="show-more-btn" onClick={() => setReviewLimit(3)}>See Less</button>
        )}
      </section>

      <footer className="site-footer">
        <div className="footer-links">
          <span className="footer-link">Privacy Policy</span>
          <span className="footer-link">Terms of Service</span>
          <span className="footer-link">Contact Us</span>
          <span className="footer-link">support@digitalbazaar.com</span>
          <span className="footer-link">FAQs</span>
        </div>
        <p className="footer-copy">&copy; 2025 Digital Bazaar. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
