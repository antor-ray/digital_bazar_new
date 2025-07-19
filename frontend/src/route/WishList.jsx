// WishlistPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../css/WishList.css";
import icon from "../images/Icon.png";
//import profileIcon from "../images/profile-icon.png"; // Add a profile icon image

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
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

  const handleRemove = async (productId) => {
    try {
      const res = await fetch(`http://localhost:4000/api/v1/wishlist/remove/${productId}`, {
        method: "DELETE",
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
      }
    } catch (err) {
      console.error("Failed to remove item", err);
    }
  };

  return (
    <div className="container">
      <div className="websiteHeader full-width">
        <img className="iconImage" src={icon} alt="Site Icon" />
        <span id="websiteName">DIGITAL BAZAAR</span>
      </div>

      
      <nav className="navbar">
        <button onClick={() => navigate("/")}>🏠 Home</button>
        
        <button onClick={() => navigate("/CartItems")}>🛒 Cart</button>
        <button onClick={() => navigate("/customerProfile")}>👤 Profile</button>
      </nav>

      <h1 className="wishlist-title">My Wishlist</h1>

      <div className="wishlist-list">
        {wishlistItems.length === 0 ? (
          <p className="empty-message">No items in your wishlist.</p>
        ) : (
          wishlistItems.map(item => (
            <div key={item.product_id} className="wishlist-card small-card">
              <img src={`http://localhost:4000/images/${item.image_url}` || 'https://via.placeholder.com/100'} alt={item.product_name} className="wishlist-img" />
              <div className="wishlist-info">
                <div className="wishlist-header">
                  <h3>{item.product_name}</h3>
                  <p className="product-description">{item.short_des}</p>
                  <div className="wishlist-actions">
                    <button onClick={() => navigate(`/product/${item.product_id}`)} className="details-button">Details</button>
                    <button className="remove-button" onClick={() => handleRemove(item.product_id)}>Remove</button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="spacer"></div>

      <div className="back-button-wrapper">
        <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
      </div>
    </div>
  );
};

export default WishlistPage;