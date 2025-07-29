// HomePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios, { all } from "axios";
import "../css/homepage.css";
import icon from "../images/Icon.png";


const HomePage = () => {
  const navigate = useNavigate();

  const scrollingImages = [
    "/images/cloths1.jpg",
    "/images/cloths2.jpg",
    "/images/device1.jpg",
  ];
  // Basic state
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [popularLimit, setPopularLimit] = useState(5);
  const [newestLimit, setNewestLimit] = useState(5);
  const [recommendedLimit, setRecommendedLimit] = useState(5);
  const [reviewLimit, setReviewLimit] = useState(3);

  
  // New states for specific product sections antor change
  const [popularProducts, setPopularProducts] = useState([]);
  const [newestArrivals, setNewestArrivals] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  // User state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState("antor-ray"); // Placeholder
  const [currentDateTime, setCurrentDateTime] = useState("2025-07-15 19:06:14"); // Placeholder

  // UI state
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false); // Changed to true to show sidebar on load
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Filter states
  //const [priceRange, setPriceRange] = useState({ min: "", max: "" });  antor change
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [stockStatus, setStockStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  //const [discountRange, setDiscountRange] = useState({ min: 0, max: 0 });

  // 1. Update the state initialization (around line 28) antor change
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [discountRange, setDiscountRange] = useState({ min: 0, max: 100 });

  // Top sellers state
  const [topSellers, setTopSellers] = useState([]);
  const [isLoadingTopSellers, setIsLoadingTopSellers] = useState(false);
  const [errorTopSellers, setErrorTopSellers] = useState(null);
  const [selectedTopSellers, setSelectedTopSellers] = useState([]); // NEW: State for selected top sellers

  // Notification state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const user_email = localStorage.getItem('email') || 'Guest'; // Get email from localStorage or default to 'Guest'

  // Section expansion state
  const [expandedSections, setExpandedSections] = useState({
    priceRange: false,
    categories: false,
    stockStatus: false,
    discountRange: false,
    ratings: false,
    topSellers: false, // Changed to true to expand Top Sellers on load
  });

  const [activeFilters, setActiveFilters] = useState({
    priceRange: { min: "", max: "" },
    categories: [],
    stockStatus: "all",
    ratings: [],
    search: "",
    topSellers: [],
  });

  // Function to fetch top sellers
  useEffect(() => {
    const fetchTopSellersData = async () => {
      setIsLoadingTopSellers(true);
      setErrorTopSellers(null);
      try {
        const response = await fetch("http://localhost:4000/api/top-sellers");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTopSellers(data.topSellers);
        console.log("Fetched top sellers:", data.topSellers);
      } catch (error) {
        console.error("Error fetching top sellers:", error);
        setErrorTopSellers("Failed to load top sellers. Please try again.");
      } finally {
        setIsLoadingTopSellers(false);
      }
    };
    fetchTopSellersData();
  }, []);

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/v1/products");
        setAllProducts(res.data.products);
        setFilteredProducts(res.data.products);
      } catch (err) {
        console.error("Product fetch failed", err);
      }
    };
    fetchProducts();
  }, []);

    // NEW: Fetch Popular Products antor change
  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/v1/popular", {
          withCredentials: true, // Send cookies for authentication check on backend
        });
        setPopularProducts(response.data.products);
      } catch (error) {
        console.error("Error fetching popular products:", error);
        // Handle error (e.g., show a message to the user)
      }
    };
    fetchPopularProducts();
  }, []); // Empty dependency array means this runs once on mount


  // NEW: Fetch Newest Arrivals
  useEffect(() => {
    const fetchNewestArrivals = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/v1/newest", {
          withCredentials: true, // Send cookies if needed by backend for isAuthenticated
        });
        setNewestArrivals(response.data.products);
      } catch (error) {
        console.error("Error fetching newest arrivals:", error);
        // Handle error
      }
    };
    fetchNewestArrivals();
  }, []); // Empty dependency array means this runs once on mount


// NEW: Fetch Recommended Products
 useEffect(() => {
   const fetchRecommendedProducts = async () => {
 try {
 // The backend '/api/v1/products/recommended' endpoint will intelligently
 // return personalized recommendations if the user is authenticated,
 // otherwise it will return popular products. We just need to ensure
        // credentials are sent.
        const response = await axios.get("http://localhost:4000/api/v1/recommended", {
          withCredentials: true, // Crucial for backend isAuthenticated middleware
        });
        setRecommendedProducts(response.data.products);
      } catch (error) {
        console.error("Error fetching recommended products:", error);
        // Handle error
      }
    };
    // This useEffect will re-run if isLoggedIn state changes, allowing
    // the recommendation logic to adapt when a user logs in/out.
    fetchRecommendedProducts();
  }, [isLoggedIn]);

  // Add this function to handle sending filters to backend

  // 3. Update the applyFiltersToBackend function (around line 138) antor change
  const applyFiltersToBackend = async () => {
    try {
      const queryParams = new URLSearchParams();

      // Add price range if set
      if (priceRange.min > 0 || priceRange.max < 100000) {
        queryParams.append("minPrice", priceRange.min);
        queryParams.append("maxPrice", priceRange.max);
      }

      // Add categories if selected
      if (selectedCategories.length > 0) {
        queryParams.append("categories", selectedCategories.join(","));
      }

      // Add stock status if not "all"
      if (stockStatus !== "all") {
        queryParams.append("stockStatus", stockStatus);
      }

      // Add ratings if selected
      if (selectedRatings.length > 0) {
        queryParams.append("ratings", selectedRatings.join(","));
      }

      // Add search term if present
      if (search.trim()) {
        queryParams.append("search", search.trim());
      }

      // Add discount range if set
      if (discountRange.min > 0 || discountRange.max < 100) {
        queryParams.append("minDiscount", discountRange.min);
        queryParams.append("maxDiscount", discountRange.max);
      }

      // Add selected top sellers if any
      if (selectedTopSellers.length > 0) {
        queryParams.append("sellerIds", selectedTopSellers.join(","));
      }

      // Make the API call with all filters
      const response = await axios.get(
        `http://localhost:4000/api/v1/productFilter?${queryParams.toString()}`
      );

      // Update the filtered products
      setFilteredProducts(response.data.products);

      console.log(
        "Applied filters:",
        Object.fromEntries(queryParams.entries())
      );
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  };

  const getFilteredSortedPaginatedProducts = () => {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  };

  // Update current date/time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const formatted = now.toISOString().slice(0, 19).replace("T", " ");
      setCurrentDateTime(formatted);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Auth check
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

  // Hero image rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % scrollingImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 2. Update the clearFilters function (around line 200)    antor change
  const clearFilters = () => {
    setPriceRange({ min: 0, max: 100000 });
    setSelectedCategories([]);
    setSelectedRatings([]);
    setStockStatus("all");
    setSearch("");
    setFilteredProducts(allProducts);
    setDiscountRange({ min: 0, max: 100 });
    setTopSellers([]);
    setSelectedTopSellers([]);
    setExpandedSections({
      discountRange: false,
      topSellers: false,
      priceRange: false,
      categories: false,
      stockStatus: false,
      ratings: false,
    });
  };

  // Toggle functions
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Notification functions
  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/notifications", {
        withCredentials: true,
      });
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  // Auth functions
  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:4000/logout",
        {},
        { withCredentials: true }
      );
      setIsLoggedIn(false);
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  // Filter products for display (this seems to be a client-side filter,
  // ensure it's consistent with applyFiltersToBackend if you want server-side filtering)
  const filterProducts = () => {
    // This function is currently only filtering by category and search.
    // If you want to apply all sidebar filters here for sections like "Popular Products",
    // you'd need to expand this logic. For now, it's used for "All Products" when sidebar is open.
    return filteredProducts.filter(
      (product) =>
        (!categoryFilter || product.category === categoryFilter) &&
        (!search ||
          product.product_name.toLowerCase().includes(search.toLowerCase()))
    );
  };

  const ProductSection = ({ title, products, limit, setLimit }) => {
    const showLess = () => setLimit(5);
    const showMore = () => setLimit(products.length);
    const expanded = limit >= products.length;

    const paginatedProducts =
      title === "All Products"
        ? getFilteredSortedPaginatedProducts()
        : products.slice(0, limit);

    return (
      <section className="products-section">
        <h2 className="section-title">{title}</h2>
        <div className="products-grid">
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((product, index) => (
              <div
                key={`${product.product_id}-${index}`}
                className="product-card"
                onClick={() => navigate(`/product/${product.product_id}`)}
              >
                <img
                  src={
                    product.image_url
                      ? `http://localhost:4000/images/${product.image_url}`
                      : "https://via.placeholder.com/250?text=No+Image"
                  }
                  alt={product.product_name}
                  className="product-img"
                />
                <p className="product-name">{product.product_name}</p>
                <p className="product-price">
                  Price: <s>৳{product.actual_price}</s>
                </p>
                <p className="product-discount">
                  Discount: {product.discount}%
                </p>
                <p className="product-actual-price">
                  Selling Price: ৳{product.selling_price}
                </p>
              </div>
            ))
          ) : (
            <p>No matching products found.</p>
          )}
        </div>

        {/* Conditionally render pagination or See All button */}
        {title === "All Products" ? (
          <div className="pagination-buttons">
            <button
              onClick={() => {
                setCurrentPage((p) => p - 1);
              }}
              disabled={currentPage === 1}
            >
              ⬅ Back
            </button>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={
                currentPage >=
                Math.ceil(filteredProducts.length / productsPerPage)
              }
            >
              Next ➡
            </button>
          </div>
        ) : (
          <div
            className="see-more-button"
            style={{ textAlign: "center", marginTop: "1rem" }}
          >
            <button
              onClick={expanded ? showLess : showMore}
              className="btn btnPrimary"
            >
              {expanded ? "See Less" : "See All"}
            </button>
          </div>
        )}
      </section>
    );
  };

  // Updated return statement for HomePage component
  return (
    <div className={`container ${showSidebar ? "with-sidebar" : ""}`}>
      <div className="websiteHeader">
        <img className="iconImage" src={icon} alt="Site Icon" />
        <span id="websiteName">DIGITAL BAZAAR</span>
      </div>

      <nav className="navbar">
        <ul className="nav-list">
         
           {/* antor change */}
          <li className="nav-item category-item"> 
            ☰ Menu
            <ul className="category-dropdown">
              <li
                className="category-option"
                onClick={() => navigate("/CustomerHistory")}
              >
                History
              </li>
              <li
                className="category-option"
                onClick={() => navigate("/settingspage")}
              >
                Settings
              </li>

              {/* <li
                className="category-option"
                onClick={() => navigate("/CategoryPage/Books")}
              >
                Books
              </li> */}
            </ul>

          </li>
           <li
            className="nav-item menu-item"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <span className="icon-menu">⇅ Filter products</span>
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

          <span
            className="nav-action-item"
            onClick={() => navigate("/CartItems")}
          >
            🧺 Cart
          </span>
          <span
            className="nav-action-item"
            onClick={() => navigate("/WishList")}
          >
            ❤️ Wishlist
          </span>

          <span
            className="nav-action-item"
            onClick={() => {
              fetchNotifications();
              setShowNotifications(!showNotifications);
            }}
          >
            🔔 Notifications
          </span>
          {!isLoggedIn ? (
            <span
              className="nav-item login-item"
              onClick={() => navigate("/Login")}
            >
              Login
            </span>
          ) : (
            <li className="nav-item login-item">
              <span className="icon-profile"></span>🙍 {user_email}
              <ul className="login-dropdown">
                <li className="login-option" onClick={handleLogout}>
                  Logout
                </li>
                <li
                  className="login-option"
                  onClick={() => navigate("/CustomerProfile")}
                >
                  Profile
                </li>
              </ul>
            </li>
          )}
        </div>
      </nav>

      {/* Notifications Panel */}
      {isLoggedIn && showNotifications && (
        <div className="notification-panel">
          <h3>Notifications</h3>
          {notifications.length === 0 ? (
            <p className="no-notification">You're all caught up! 🎉</p>
          ) : (
            <ul>
              {notifications.map((note) => (
                <li key={note.notification_id} className="notification-item">
                  <div className="notification-message">{note.message}</div>
                  <div className="notification-time">
                    {new Date(note.created_at).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Hero Section - only show when sidebar is NOT active */}
      {!showSidebar && (
        <section className="hero-section">
          <div className="scrolling-container">
            {scrollingImages.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Slide ${index + 1}`}
                className={`scrolling-image ${index === heroImageIndex ? "active" : ""
                  }`}
              />
            ))}
          </div>
          <div className="floating-text">
            <h1 className="hero-title">Welcome to Digital Bazaar</h1>
            <p className="hero-subtitle">
              Your One-Stop Destination for Quality Products
            </p>
            <p className="hero-description">
              Discover amazing deals, authentic products, and exceptional
              service.
            </p>
          </div>
        </section>
      )}

      {/* Main Layout Container */}
      <div className="main-layout">
        {/* Sidebar - only show when showSidebar is true */}
        {showSidebar && (
          <div className="permanent-sidebar">
            <div className="filter-section">
              <h4>Filter Products</h4>
              {/* antor change */}
              <div className="filter-group">
                <div
                  className="filter-header"
                  onClick={() => toggleSection("discountRange")}
                >
                  <h5>Discount Percentage</h5>
                  <span
                    className={`arrow ${expandedSections.discountRange ? "expanded" : ""
                      }`}
                  >
                    ▼
                  </span>
                </div>
                {expandedSections.discountRange && (
                  <div className="discount-filter-content">
                    <div className="discount-input-row">
                      <div className="discount-field">
                        <input
                          type="number"
                          placeholder="Min Discount (%)"
                          value={
                            discountRange.min === 0 ? "" : discountRange.min
                          }
                          onChange={(e) =>
                            setDiscountRange((prev) => ({
                              ...prev,
                              min: e.target.value ? Number(e.target.value) : 0,
                            }))
                          }
                          min="0"
                          max="100"
                        />
                      </div>
                      <div className="discount-field">
                        <input
                          type="number"
                          placeholder="Max Discount (%)"
                          value={
                            discountRange.max === 100 ? "" : discountRange.max
                          }
                          onChange={(e) =>
                            setDiscountRange((prev) => ({
                              ...prev,
                              max: e.target.value
                                ? Number(e.target.value)
                                : 100,
                            }))
                          }
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>
                    <div className="dual-range-slider">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={discountRange.min}
                        onChange={(e) =>
                          setDiscountRange((prev) => ({
                            ...prev,
                            min: Math.min(Number(e.target.value), prev.max),
                          }))
                        }
                        className="range-slider range-min"
                      />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={discountRange.max}
                        onChange={(e) =>
                          setDiscountRange((prev) => ({
                            ...prev,
                            max: Math.max(Number(e.target.value), prev.min),
                          }))
                        }
                        className="range-slider range-max"
                      />
                    </div>
                    <div className="discount-range-text">
                      {discountRange.min}% - {discountRange.max}%
                    </div>
                  </div>
                )}


              </div>

              <div className="filter-group">
                <div
                  className="filter-header"
                  onClick={() => toggleSection("priceRange")}
                >
                  <h5>Price Range</h5>
                  <span
                    className={`arrow ${expandedSections.priceRange ? "expanded" : ""
                      }`}
                  >
                    ▼
                  </span>
                </div>
                {expandedSections.priceRange && (
                  <div className="price-filter-content">
                    <div className="price-input-row">
                      <div className="price-field">
                        <input
                          type="number"
                          placeholder="Min Price"
                          value={priceRange.min === 0 ? "" : priceRange.min}
                          onChange={(e) =>
                            setPriceRange((prev) => ({
                              ...prev,
                              min: e.target.value ? Number(e.target.value) : 0,
                            }))
                          }
                          min="0"
                        />
                      </div>
                      <div className="price-field">
                        <input
                          type="number"
                          placeholder="Max Price"
                          value={
                            priceRange.max === 100000 ? "" : priceRange.max
                          }
                          onChange={(e) =>
                            setPriceRange((prev) => ({
                              ...prev,
                              max: e.target.value
                                ? Number(e.target.value)
                                : 100000,
                            }))
                          }
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="dual-range-slider">
                      <input
                        type="range"
                        min="0"
                        max="100000"
                        value={priceRange.min}
                        onChange={(e) =>
                          setPriceRange((prev) => ({
                            ...prev,
                            min: Math.min(Number(e.target.value), prev.max),
                          }))
                        }
                        className="range-slider range-min"
                      />
                      <input
                        type="range"
                        min="0"
                        max="100000"
                        value={priceRange.max}
                        onChange={(e) =>
                          setPriceRange((prev) => ({
                            ...prev,
                            max: Math.max(Number(e.target.value), prev.min),
                          }))
                        }
                        className="range-slider range-max"
                      />
                    </div>
                    <div className="price-range-text">
                      ৳{priceRange.min} - ৳{priceRange.max}
                    </div>
                  </div>
                )}

              </div>

              {/* Top Sellers Option (NEW) */}
              <div className="filter-group">
                <div
                  className="filter-header"
                  onClick={() => {
                    toggleSection("topSellers");
                  }}
                >
                  <h5>Top Sellers</h5>
                  <span
                    className={`arrow ${expandedSections.topSellers ? "expanded" : ""
                      }`}
                  >
                    ▼
                  </span>
                </div>
                {expandedSections.topSellers && (
                  <div className="top-sellers-list checkbox-group">
                    {" "}
                    {/* Added checkbox-group class */}
                    {isLoadingTopSellers && <p>Loading top sellers...</p>}
                    {errorTopSellers && (
                      <p className="error-message">{errorTopSellers}</p>
                    )}
                    {!isLoadingTopSellers &&
                    !errorTopSellers &&
                    topSellers.length > 0 ? (
                      // Changed from ul to div with labels for checkboxes
                      <div>
                        {topSellers.map((seller) => (
                          <label key={seller.id} className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={selectedTopSellers.includes(seller.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedTopSellers((prev) => [
                                    ...prev,
                                    seller.id,
                                  ]);
                                } else {
                                  setSelectedTopSellers((prev) =>
                                    prev.filter((id) => id !== seller.id)
                                  );
                                }
                              }}
                            />
                            {seller.name}
                          </label>
                        ))}
                      </div>
                    ) : (
                      !isLoadingTopSellers &&
                      !errorTopSellers &&
                      topSellers.length === 0 && (
                        <p>No top sellers available at the moment.</p>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Category Filter */}
              <div className="filter-group">
                <div
                  className="filter-header"
                  onClick={() => toggleSection("categories")}
                >
                  <h5>Categories</h5>
                  <span
                    className={`arrow ${expandedSections.categories ? "expanded" : ""
                      }`}
                  >
                    ▼
                  </span>
                </div>
                {expandedSections.categories && (
                  <div className="checkbox-group">
                    {[
                      "Electronics",
                      "Clothing",
                      "Books",
                      "Home & Kitchen",
                      "Beauty",
                      "Furniture",
                      "Toys",
                      "Sports",
                      "Grocery",
                    ].map((category) => (
                      <label key={category} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories((prev) => [
                                ...prev,
                                category,
                              ]);
                            } else {
                              setSelectedCategories((prev) =>
                                prev.filter((cat) => cat !== category)
                              );
                            }
                          }}
                        />
                        {category}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Stock Status Filter */}
              <div className="filter-group">
                <div
                  className="filter-header"
                  onClick={() => toggleSection("stockStatus")}
                >
                  <h5>Stock Status</h5>
                  <span
                    className={`arrow ${expandedSections.stockStatus ? "expanded" : ""
                      }`}
                  >
                    ▼
                  </span>
                </div>
                {expandedSections.stockStatus && (
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="stockStatus"
                        value="all"
                        checked={stockStatus === "all"}
                        onChange={(e) => setStockStatus(e.target.value)}
                      />
                      All Items
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="stockStatus"
                        value="inStock"
                        checked={stockStatus === "inStock"}
                        onChange={(e) => setStockStatus(e.target.value)}
                      />
                      In Stock
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="stockStatus"
                        value="outOfStock"
                        checked={stockStatus === "outOfStock"}
                        onChange={(e) => setStockStatus(e.target.value)}
                      />
                      Out of Stock
                    </label>
                  </div>
                )}
              </div>
              {/* Ratings Filter */}
              <div className="filter-group">
                <div
                  className="filter-header"
                  onClick={() => toggleSection("ratings")}
                >
                  <h5>Ratings</h5>
                  <span
                    className={`arrow ${expandedSections.ratings ? "expanded" : ""
                      }`}
                  >
                    ▼
                  </span>
                </div>
                {expandedSections.ratings && (
                  <div className="checkbox-group">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <label key={rating} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedRatings.includes(rating)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRatings((prev) => [...prev, rating]);
                            } else {
                              setSelectedRatings((prev) =>
                                prev.filter((r) => r !== rating)
                              );
                            }
                          }}
                        />
                        {rating} Stars & Up
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {/* Apply and Clear Filters Buttons */}
              <button
                className="apply-filters-btn"
                onClick={applyFiltersToBackend}
              >
                Apply Filters
              </button>
              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear All Filters
              </button>
            </div>
            {/* <h3 className="sidebar-title">Menu</h3>  antor change
            <ul className="sidebar-list">
              <li
                className="sidebar-item"
                onClick={() => navigate("/customerProfile")}
              >
                Edit Profile
              </li>
              <li
                className="sidebar-item"
                onClick={() => navigate("/settings")}
              >
                Settings
              </li>
              <li className="sidebar-item logout" onClick={handleLogout}>
                Logout
              </li>
            </ul> */}
          </div>
        )}

        {/* Main Content Area */}
        <div className="main-content">
          {showSidebar ? (
            // Show only one product section when sidebar is open
            <ProductSection
              title="All Products"
              products={filterProducts()}
              limit={popularLimit}
              setLimit={setPopularLimit}
            />
          ) : (
            // Show all sections when sidebar is closed
            <>
              <ProductSection
                title="Popular Products"
                products={popularProducts}
                limit={popularLimit}
                setLimit={setPopularLimit}
              />

              <ProductSection
                title="Newest Arrivals"
                products={newestArrivals}
                limit={newestLimit}
                setLimit={setNewestLimit}
              />

              <ProductSection
                title="Recommended For You"
                products={recommendedProducts}
                limit={recommendedLimit}
                setLimit={setRecommendedLimit}
              />

              {/* <section className="review-section">        antor change
                <h2 className="section-title">Customer Reviews</h2>
                <div className="reviews-container">
                  {[1, 2, 3, 4, 5, 6].slice(0, reviewLimit).map((_, index) => (
                    <div key={index} className="review-card">
                      <p className="review-text">
                        "Review sample {index + 1}. Very satisfied!"
                      </p>
                      <p className="review-author">— User {index + 1}</p>
                    </div>
                  ))}
                </div>
                {reviewLimit < 6 ? (
                  <button
                    className="show-more-btn"
                    onClick={() => setReviewLimit(6)}
                  >
                    See More
                  </button>
                ) : (
                  <button
                    className="show-more-btn"
                    onClick={() => setReviewLimit(3)}
                  >
                    See Less
                  </button>
                )}
              </section> */}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-links">
          <span className="footer-link">Privacy Policy</span>
          <span className="footer-link">Terms of Service</span>
          <span className="footer-link">Contact Us</span>
          <span className="footer-link">support@digitalbazaar.com</span>
          <span className="footer-link">FAQs</span>
        </div>
        <p className="footer-copy">
          &copy; 2025 Digital Bazaar. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
