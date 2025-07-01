import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/CategoryPage.css";
import icon from "../images/Icon.png";

const CategoryPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState(null); // Mock auth check
  const productsPerPage = 6;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/categoryProducts/${categoryName}`
        );
        setProducts(res.data.products);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    fetchProducts();

    // Mock authentication check (replace with real auth logic)
    const username = localStorage.getItem("username");
    if (username) setUser(username);
  }, [categoryName]);

  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
  };

  const filteredSortedProducts = () => {
    let result = [...products];

    if (searchQuery) {
      result = result.filter((product) =>
        product.product_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortBy === "priceLow") {
      result.sort((a, b) => a.selling_price - b.selling_price);
    } else if (sortBy === "priceHigh") {
      result.sort((a, b) => b.selling_price - a.selling_price);
    } else if (sortBy === "newest") {
      result.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    }

    return result;
  };

  const getFilteredSortedPaginatedProducts = () => {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return filteredSortedProducts().slice(startIndex, endIndex);
  };

  return (
    <div className="category-page">
      <div className="websiteHeader">
        <img className="iconImage" src={icon} alt="Site Icon" />
        <span id="websiteName">DIGITAL BAZAAR</span>
        </div>
        <br />
        <div className="header-actions">
          <input
            type="text"
            className="search-bar"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            className="sort-dropdown"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Filter Products</option>
            <option value="priceLow">Price: Low to High</option>
            <option value="priceHigh">Price: High to Low</option>
          </select>

          <button onClick={() => navigate("/wishlist")} className="header-btn">
            ❤️ Wishlist
          </button>
          <button onClick={() => navigate("/cartItems")} className="header-btn">
            🛒 Cart
          </button>
          {user ? (
            <span className="username">👤 {user}</span>
          ) : (
            <button onClick={() => navigate("/signin")} className="header-btn">
              Sign In
            </button>
          )}
        </div>
      

      <h1 className="category-title">{categoryName}</h1>

      <section className="products-section">
        <h2 className="section-title">Popular Products</h2>
        <div className="products-row">
          {getFilteredSortedPaginatedProducts().length > 0 ? (
            getFilteredSortedPaginatedProducts().map((product, index) => (
              <div
                key={`${product.product_id}-${index}`}
                className="product-card"
                onClick={() => handleProductClick(product.product_id)}
              >
                <img
                  src={
                    product.image_url
                      ? `/${product.image_url}`
                      : "https://via.placeholder.com/250?text=No+Image"
                  }
                  alt={product.product_name}
                  className="product-img"
                />
                <p className="product-name">{product.product_name}</p>
                <p className="product-price">
                  Price: <s>৳{product.actual_price}</s>
                </p>
                <p className="product-discount">Discount: ৳{product.discount}</p>
                <p className="product-actual-price">
                  Selling Price: ৳{product.selling_price}
                </p>
              </div>
            ))
          ) : (
            <p>No matching products found.</p>
          )}
        </div>
      </section>

      <div className="pagination-buttons">
        <button
          onClick={() => {
            if (currentPage === 1) {
              navigate("/");
            } else {
              setCurrentPage((p) => p - 1);
            }
          }}
        >
          ⬅ Back
        </button>
        <button
          onClick={() => setCurrentPage((p) => p + 1)}
          disabled={
            currentPage >=
            Math.ceil(filteredSortedProducts().length / productsPerPage)
          }
        >
          Next ➡
        </button>
      </div>
    </div>
  );
};

export default CategoryPage;
