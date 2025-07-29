// WishlistPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/WishList.css";
import axios, { all } from "axios";
import icon from "../images/Icon.png";
//import profileIcon from "../images/profile-icon.png"; // Add a profile icon image

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/v1/wishlist", {
          credentials: "include",
        });
        const data = await res.json();
        setWishlistItems(data.items || []);
      } catch (err) {
        console.error("Failed to load wishlist", err);
      }
    };

    fetchWishlist();
  }, []);

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

  const handleRemove = async (productId) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/v1/wishlist/remove/${productId}`,
        {
          method: "DELETE",
          credentials: "include", // Required to send cookies (auth)
        }
      );

      const data = await res.json();

      if (data.success) {
        // Remove item from local state
        setWishlistItems((prev) =>
          prev.filter((item) => item.product_id !== productId)
        );
      } else {
        alert(data.message || "Failed to remove item from wishlist.");
      }
    } catch (err) {
      console.error("Failed to remove item", err);
      alert("Something went wrong while removing the item.");
    }
  };

  return (
    <div className="container">
      <div className="websiteHeader full-width">
        <img className="iconImage" src={icon} alt="Site Icon" />
        <span id="websiteName">DIGITAL BAZAAR</span>
      </div>

      {/* Optional nav bar */}
      {/* <nav className="wishli" style={{ color: 'white' }}> 
      <span onClick={() => navigate("/")}>🏠 Home</span>
      <span onClick={() => navigate("/CartItems")}>🧺 Cart</span>
      <span onClick={() => navigate("/customerProfile")}>🙍 Profile</span>
    </nav> */}

      {!isLoggedIn ? (
        <div className="not-logged-in-message">
          <p className="login-warning">
            🔒 You must be logged in to view your purchase history.
          </p>
          <button className="login-button" onClick={() => navigate("/Login")}>
            Login
          </button>
        </div>
      ) : (
        <>
          <h1 className="wishlist-title">My Wishlist</h1>

          <div className="wishlist-list">
            {wishlistItems.length === 0 ? (
              <p className="empty-message">No items in your wishlist.</p>
            ) : (
              wishlistItems.map((item) => (
                <div key={item.product_id} className="wishlist-card small-card">
                  <img
                    src={
                      item.image_url && item.image_url.length > 0
                        ? `http://localhost:4000/images/${item.image_url}`
                        : "https://via.placeholder.com/100"
                    }
                    alt={item.product_name}
                    className="wishlist-img"
                  />

                  <div className="wishlist-info">
                    <div className="wishlist-header">
                      <h3>{item.product_name}</h3>
                      <p
                        className="product-description"
                        style={{ fontSize:".8rem", fontWeight:"800"}}
                      >
                        Seller: {item.business_name} &nbsp;&nbsp;&nbsp;
                        Category: {item.category}
                      </p>
                    </div>
                    <div className="wishlist-actions">
                      <button
                        onClick={() => navigate(`/product/${item.product_id}`)}
                        className="details-button"
                      >
                        Details
                      </button>
                      <button
                        className="remove-button"
                        onClick={() => handleRemove(item.product_id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="spacer"></div>

          <div className="back-button-wrapper">
            <button className="back-button" onClick={() => navigate(-1)}>
              ← Back
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default WishlistPage;
