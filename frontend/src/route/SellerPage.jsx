import React, { useState, useRef, useEffect, use } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import icon from "../images/Icon.png";

import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Upload,
  X,
  Package,
  DollarSign,
  Star,
  TrendingUp,
} from "lucide-react";
import "../css/SellerPage.css";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [sellerName, setSellerName] = useState("");
  const [sellerId, setSellerId] = useState(null);
  const fileInputRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [ordersThisMonth, setOrdersThisMonth] = useState(0);
  // for search bar
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9; // or whatever number fits your layout

    const [showSidebar, setShowSidebar] = useState(false);
    
    // State to manage expanded sections
      const [priceRange, setPriceRange] = useState({ min: "", max: "" });
      const [selectedCategories, setSelectedCategories] = useState([]);
      const [selectedRatings, setSelectedRatings] = useState([]);
      const [stockStatus, setStockStatus] = useState("all");
      const [search, setSearch] = useState("");
      const [discountRange, setDiscountRange] = useState({ min: 0, max: 0 });
      const [filteredProducts, setFilteredProducts] = useState([]);

  // const filteredProducts = products.filter((product) =>
  //   product.name.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  // Sample products data


    const [expandedSections, setExpandedSections] = useState({
      priceRange: false,
      categories: false,
      stockStatus: false,
      discountRange: false,
      ratings: false,
      //topSellers: false, // Changed to true to expand Top Sellers on load
    });

  // Form state for adding new product
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    discount: "",
    stock: "",
    details: "",
    short_des: "",

    tags: "",
    images: [],
  });

  const categories = [
  "Electronics",
  "Clothing", 
  "Books",
  "Home & Kitchen", // Make sure this matches your database
  "Beauty",
  "Furniture",
  "Toys",
  "Sports",
  "Grocery",
  // Add other categories that exist in your database
];
    const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // 1. Fix the fetchSellerProducts function:
const fetchSellerProducts = async () => {
  try {
    const response = await axios.get(
      "http://localhost:4000/SellerPage/products",
      {
        withCredentials: true,
      }
    );
    if (response.data.status === "success") {
      const fetchedProducts = response.data.products.map((p) => ({
        ...p,
        images: p.images || [],
        status: p.stock > 0 ? "Active" : "Out of Stock",
      }));
      setProducts(fetchedProducts);
      setFilteredProducts(fetchedProducts); // Set to seller's products, not all products
      console.log("Fetched seller products:", fetchedProducts);
    } else {
      console.error(
        "Failed to fetch seller products:",
        response.data.message
      );
    }
  } catch (error) {
    console.error("Error fetching seller products:", error);
  }
};

// useEffect(() => {
//   if (sellerId) {
//     applyFiltersToBackend();
//   }
// }, [sellerId]);

// Add this useEffect to apply filters automatically when filter values change
// useEffect(() => {
//   if (sellerId) {
//     const timeoutId = setTimeout(() => {
//       applyFiltersToBackend();
//     }, 500); // Debounce for 500ms
    
//     return () => clearTimeout(timeoutId);
//   }
// }, [priceRange, selectedCategories, stockStatus, selectedRatings, search, discountRange, sellerId]);


 // Add these state variables at the top of your component (where other useState declarations are)
// const [sortBy, setSortBy] = useState('');
// const [sortDirection, setSortDirection] = useState('desc');
// Fixed applyFiltersToBackend function
const applyFiltersToBackend = async () => {
  try {
    const queryParams = new URLSearchParams();

    // IMPORTANT: Always add seller ID first
    if (sellerId) {
      queryParams.append("sellerId", sellerId);
      console.log("Adding seller ID to filters:", sellerId);
    } else {
      console.error("Seller ID is required");
      return;
    }

    // FIX: Only add filters if they have meaningful values
    if (priceRange.max && priceRange.max > 0) {
      queryParams.append("maxPrice", priceRange.max);
    }
    
    if (selectedCategories.length > 0) {
      queryParams.append("categories", selectedCategories.join(","));
    }
    
    if (stockStatus && stockStatus !== "all") {
      queryParams.append("stockStatus", stockStatus);
    }
    
    if (selectedRatings.length > 0) {
      queryParams.append("ratings", selectedRatings.join(","));
    }
    
    // FIX: Use the correct search state
    if (search && search.trim()) {
      queryParams.append("search", search.trim());
    }
    
    if (discountRange.max && discountRange.max > 0) {
      queryParams.append("maxDiscount", discountRange.max);
    }

    const filterUrl = `http://localhost:4000/api/v1/sellerProductFilter?${queryParams.toString()}`;
    console.log("Filter URL:", filterUrl);
    
    const response = await axios.get(filterUrl);

    console.log("Filter response:", response.data);
    
    if (response.data.status === "success") {
      setFilteredProducts(response.data.products);
      console.log("Filtered products set:", response.data.products);
    } else {
      console.error("Filter failed:", response.data.message);
    }
    
  } catch (error) {
    console.error("Error applying filters:", error);
    if (error.response?.data?.message) {
      console.error("Server error:", error.response.data.message);
    }
  }
};

   // 2. Update the clearFilters function:
const clearFilters = () => {
  setPriceRange({ min: "", max: "" });
  setSelectedCategories([]);
  setSelectedRatings([]);
  setStockStatus("all");
  setSearch(""); // Clear search
  setDiscountRange({ min: 0, max: 0 });
  setExpandedSections({
    discountRange: false,
    priceRange: false,
    categories: false,
    stockStatus: false,
    ratings: false,
  });
  // Reset to original products
  setFilteredProducts(products);
};



  useEffect(() => {
    const checkAuthSeller = async () => {
      try {
        const res = await fetch("http://localhost:4000/isAuthenticatedSeller", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (res.ok) {
          setIsLoggedIn(true);
          fetchSellerProducts();
          setSellerName(data.sellerName);
          setSellerId(data.seller_id);
          
        }
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuthSeller();
    console.log(isLoggedIn);
  }, []);

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

  useEffect(() => {
    const fetchOrdersThisMonth = async () => {
    if (!sellerId) {
      console.log("Seller ID not available, skipping orders this month fetch.");
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:4000/api/v1/sellerStats/ordersThisMonth?sellerId=${sellerId}`,
        {
          withCredentials: true,
        }
      );
      if (response.data.status === "success") {
        setOrdersThisMonth(response.data.ordersThisMonth);
        console.log("Fetched orders this month:", response.data.ordersThisMonth);
      } else {
        console.error("Failed to fetch orders this month:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching orders this month:", error);
      if (error.response?.data?.message) {
        console.error("Server error message:", error.response.data.message);
      }
    }
  };

  fetchOrdersThisMonth();
  }, [sellerId]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // --- HIGHLIGHT START ---
    // Limit to 4 images
    if (newProduct.images.length + files.length > 4) {
      alert("You can upload a maximum of 4 images.");
      return;
    }
    // --- HIGHLIGHT END ---
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setNewProduct((prev) => ({
      ...prev,
      images: [...prev.images, ...imageUrls],
    }));
  };

  const removeImage = (index) => {
    const imageUrl = newProduct.images[index];

    let relativePath = imageUrl.startsWith("http")
      ? new URL(imageUrl).pathname
      : imageUrl;

    // Normalize to filename only (strip /images/)
    const filename = relativePath.split("/").pop();

    setNewProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      // oldImages: prev.oldImages.filter((img) => {
      //   // Normalize old img too before comparing
      //   const oldFilename = img.split("/").pop();
      //   return oldFilename !== filename;
      // }),
    }));
  };

  const editProduct = (product) => {

    setNewProduct({
      name: product.name,
      category: product.category,
      price: product.price,
      discount: product.discount,
      stock: product.stock,
      details: product.details,
      short_des: product.short_des,
      tags: product.tags,
      images: [], // For preview
    });

    setEditingProductId(product.id);
    setIsEditing(true);
    setShowAddProduct(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleSubmit = async () => {
    if (
      !newProduct.name ||
      !newProduct.category ||
      !newProduct.price ||
      !newProduct.stock ||
      !newProduct.details ||
      !newProduct.tags ||
      !newProduct.discount ||
      !newProduct.short_des ||
      !newProduct.images
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const formData = new FormData();
    for (const key in newProduct) {
      if (key !== "images" && key !== "oldImages")
        formData.append(key, newProduct[key]);
    }

    const input = fileInputRef.current;
    const newFiles = input?.files ? Array.from(input.files) : [];

    if (newFiles.length > 4 || newFiles.length <= 0) {
      alert("You can upload a maximum of 4 images and minimum 1 images.");
      return;
    }


    // ✅ Append new image files only
    newFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const url = isEditing
        ? `http://localhost:4000/SellerPage/updateProduct/${editingProductId}`
        : "http://localhost:4000/SellerPage/addProduct";

      const method = isEditing ? "put" : "post";

      const response = await axios({
        method,
        url,
        data: formData,
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        alert(
          isEditing
            ? "Product updated successfully!"
            : "Product added successfully!"
        );
        window.location.reload();
      } else {
        alert("Failed to save product.");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("An error occurred. Try again.");
    }
  };

  const deleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(
        `http://localhost:4000/SellerPage/deleteProduct/${id}`,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        alert("Product deleted successfully!");

        // Option 1: Refresh product list from server
        fetchSellerProducts();

        // Option 2 (optional): Or update state without reload
        // setProducts((prev) => prev.filter((product) => product.id !== id));
      } else {
        alert("Failed to delete product.");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("An error occurred. Try again.");
    }
  };

  const ProductCard = ({ product }) => (
    <div className="productCard fadeIn">
      {" "}
      {/* Changed class name */}
      <div className="productImageContainer">
        {" "}
        {/* Changed class name */}
        <img
          src={
            product.images && product.images.length > 0
              ? product.images[0].startsWith("http")
                ? product.images[0]
                : `http://localhost:4000/images/${product.images[0]}`
              : "https://placehold.co/300x200?text=No+Image"
          }
          alt={product.name}
          className="productImage"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/300x200?text=Image+Error";
          }}
        />
        <span
          className={`productStatus ${
            product.status === "Active" ? "statusActive" : "statusInactive"
          }`}
        >
          {" "}
          {/* Changed class name */}
          {product.status}
        </span>
      </div>
      <div className="productInfo">
        {" "}
        {/* Changed class name */}
        <h3 className="productName">{product.name}</h3>{" "}
        {/* Changed class name */}
        <p className="productCategory">{product.category}</p>{" "}
        {/* Changed class name */}
        <div className="productDetails">
          {" "}
          {/* Changed class name */}
          <span className="productPrice">৳{product.price}</span>{" "}
          {/* Changed class name */}
          <span className="productStock">Stock: {product.stock}</span>{" "}
          {/* Changed class name */}
        </div>
        {product.discount > 0 && (
          <div className="productDiscount">
            <span className="discountBadge">{product.discount}% OFF</span>
          </div>
        )}
        <div className="productActions">
          {" "}
          {/* Changed class name */}
          <button
            className="btn btnView"
            onClick={() => navigate(`/product/${product.id}`)}
          >
            {/* Changed class name */}
            <Eye className="btnIcon" />
            
          </button>
          <button className="btn btnEdit" onClick={() => editProduct(product)}>
            {" "}
            {/* Changed class name */}
            <Edit className="btnIcon" />
            
          </button>
          <button
            onClick={() => deleteProduct(product.id)}
            className="btn btnDanger"
          >
            <Trash2 className="btnIcon" />
            
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboardContainer">
      <div className="websiteHeader">
        <img className="iconImage" src={icon} alt="Site Icon" />
        <span id="websiteName">DIGITAL BAZAAR</span>
      </div>
      {/* Header */}
      <header className="dashboardHeader">
        <div className="navbar">
          <div className="nav-item menu-item"
            onClick={() => setShowSidebar(!showSidebar)} >  
            <span className="icon_filter">☰</span>
          </div>
          
          <div>
            <h1 className="headerTitle">{sellerName.toUpperCase()}</h1>
            
          </div>

          <div className="headerActions">
            <button
              onClick={() => navigate("/SellerProfilePage")}
              className="btn btnSecondary"
            >
              <Edit className="btnIcon" />
              Edit Profile
            </button>

            <button onClick={handleLogout} className="btn btnDanger">
              <X className="btnIcon" />
              Logout
            </button>

            <button
              onClick={() => setShowAddProduct(true)}
              className="btn btnPrimary"
            >
              <Plus className="btnIcon" />
              Add Product
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mainContainer">
        {/* Stats Cards */}
        {!showSidebar && (
        <div className="statsGrid">
          <div className="statCard">
            <div className="statContent">
              <Package className="statIcon blue" />
              <div>
                <p className="statLabel">Total Products</p>
                <p className="statValue">{products.length}</p>
              </div>
            </div>
          </div>
          <div className="statCard">
            <div className="statContent" style={{cursor:"pointer"}} onClick={() => navigate("/SellerPage/SellerSellingHistoryPage")}>
              
              <div>
                <p className="statValue" >History</p>
                
              </div>
            </div>
          </div>
          <div className="statCard">
            <div className="statContent">
              <Star className="statIcon yellow" />
              <div>
                <p className="statLabel">Average Rating</p>
                <p className="statValue">4.8</p>
              </div>
            </div>
          </div>
          <div className="statCard">
            <div className="statContent">
              <TrendingUp className="statIcon purple" />
              <div>
                <p className="statLabel">Orders This Month</p>
                <p className="statValue">{ordersThisMonth}</p>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Products Section */}

        <div className="homePageLayout">
        {/* Sidebar - only show when showSidebar is true */}
        {showSidebar && (
          <div className="permanent-sidebar">
            <div className="filter-section">
              <h4>Filter Products</h4>
              {/* Discount Percentage Filter */}
              <div className="filter-group">
                <div
                  className="filter-header"
                  onClick={() => toggleSection("discountRange")}
                >
                  <h5>Discount Percentage</h5>
                  <span
                    className={`arrow ${
                      expandedSections.discountRange ? "expanded" : ""
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
                          placeholder="Maximum Discount (%)"
                          value={discountRange.max === 0 ? "" : discountRange.max}
                          onChange={(e) =>
                            setDiscountRange((prev) => ({
                              ...prev,
                              max: e.target.value ? Number(e.target.value) : 0,
                            }))
                          }
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>
                    <div className="discount-slider">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={discountRange.max || 0}
                        onChange={(e) =>
                          setDiscountRange((prev) => ({
                            ...prev,
                            max: Number(e.target.value),
                          }))
                        }
                        className="single-slider"
                      />
                    </div>
                    {discountRange.max > 0 && (
                      <div className="discount-range-text">
                        0% - {discountRange.max}%
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Price Range Filter */}
              <div className="filter-group">
                <div
                  className="filter-header"
                  onClick={() => toggleSection("priceRange")}
                >
                  <h5>Price Range</h5>
                  <span
                    className={`arrow ${
                      expandedSections.priceRange ? "expanded" : ""
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
                          placeholder="Maximum Price"
                          value={priceRange.max === 0 ? "" : priceRange.max}
                          onChange={(e) =>
                            setPriceRange((prev) => ({
                              ...prev,
                              max: e.target.value ? Number(e.target.value) : 0,
                            }))
                          }
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="price-slider">
                      <input
                        type="range"
                        min="0"
                        max="100000"
                        value={priceRange.max || 0}
                        onChange={(e) =>
                          setPriceRange((prev) => ({
                            ...prev,
                            max: Number(e.target.value),
                          }))
                        }
                        className="single-slider"
                      />
                    </div>
                    {priceRange.max > 0 && (
                      <div className="price-range-text">৳0 - ৳{priceRange.max}</div>
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
                    className={`arrow ${
                      expandedSections.categories ? "expanded" : ""
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
                    className={`arrow ${
                      expandedSections.stockStatus ? "expanded" : ""
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
                    className={`arrow ${
                      expandedSections.ratings ? "expanded" : ""
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
            
          </div>
        )}


        <div className="productsWrapper">
          <div className="sectionHeader searchHeader">
            <h2 className="sectionTitle">Your Products</h2>

            <input
  type="text"
  placeholder="Search products..."
  value={search}  // Changed from searchQuery to search
  onChange={(e) => setSearch(e.target.value)}  // Changed to setSearch
  className="productSearchInput"
/>
          </div>

          <div className="sectionContent">
            {" "}
            {/* Changed class name */}
            <div className="productsGrid">
              {" "}
              {/* Changed class name */}
             {filteredProducts
  .filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) // Use search instead of searchQuery
  )
  .slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  )
  .map((product) => (
    <ProductCard key={product.id} product={product} />
  ))}

            </div>
          </div>
          <div
            className="pagination-buttons"
            style={{ textAlign: "center", marginTop: "1.5rem" }}
          >
            <button
              onClick={() => {
                if (currentPage > 1) setCurrentPage((p) => p - 1);
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
        </div>
      </div>
        </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="modalOverlay">
          <div className="modalContent fadeIn">
            <div className="modalHeader">
              <h3 className="modalTitle">
                {isEditing ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                onClick={() => setShowAddProduct(false)}
                className="modalClose"
              >
                <X
                  size={24}
                  onClick={() => {
                    setShowAddProduct(false);
                    setIsEditing(false);
                    setEditingProductId(null);
                    setNewProduct({
                      name: "",
                      category: "",
                      price: "",
                      discount: "",
                      stock: "",
                      details: "",
                      short_des: "",
                      tags: "",
                      images: [],
                    });
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                />
              </button>
            </div>

            <div className="modalBody">
              {/* Basic Information */}
              <div className="formSection">
                <h4 className="formSectionTitle">Basic Information</h4>
                <div className="formGrid formGrid2">
                  <div className="formGroup">
                    <label className="formLabel">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, name: e.target.value })
                      }
                      className="formInput"
                      placeholder="Enter product name"
                    />
                  </div>
                  <div className="formGroup">
                    <label className="formLabel">Category *</label>
                    <select
                      required
                      value={newProduct.category}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          category: e.target.value,
                        })
                      }
                      className="formSelect"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="formGroup">
                    <label className="formLabel">Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, price: e.target.value })
                      }
                      className="formInput"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="formGroup">
                    <label className="formLabel">Discount (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={newProduct.discount}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          discount: e.target.value,
                        })
                      }
                      className="formInput"
                      placeholder="0"
                    />
                  </div>
                  <div className="formGroup">
                    <label className="formLabel">Stock Quantity *</label>
                    <input
                      type="number"
                      required
                      value={newProduct.stock}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, stock: e.target.value })
                      }
                      className="formInput"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="formSection">
                <h4 className="formSectionTitle">Product Details</h4>
                <div className="formGroup">
                  <label className="formLabel">Details *</label>
                  <textarea
                    required
                    rows="3"
                    value={newProduct.details}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        details: e.target.value,
                      })
                    }
                    className="formTextarea"
                    placeholder="Describe your product..."
                  />
                </div>
                <div className="formGrid formGrid3">
                  <div className="formGroup">
                    <label className="formLabel">Short description</label>
                    <input
                      type="text"
                      value={newProduct.short_des}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          short_des: e.target.value,
                        })
                      }
                      className="formInput"
                      placeholder="Product Short description"
                    />
                  </div>
                </div>
                <div className="formGroup">
                  <label className="formLabel">Tags</label>
                  <input
                    type="text"
                    value={newProduct.tags}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, tags: e.target.value })
                    }
                    className="formInput"
                    placeholder="Separate tags with commas"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="formSection">
                <h4 className="formSectionTitle">Product Images</h4>
                <div className="formGroup">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="imageUploadArea"
                  >
                    <Upload className="uploadIcon" />
                    <p className="uploadText">
                      Click to upload images or drag and drop
                    </p>
                    <p className="uploadSubtext">
                      PNG, JPG, GIF up to 10MB each
                    </p>
                  </div>
                </div>

                {newProduct.images.length > 0 && (
                  <div className="imagePreviewGrid">
                    {newProduct.images.map((image, index) => (
                      <div key={index} className="imagePreview">
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="previewImage"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="removeImage"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="formActions">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddProduct(false);
                    setIsEditing(false);
                    setEditingProductId(null);
                    setNewProduct({
                      name: "",
                      category: "",
                      price: "",
                      discount: "",
                      stock: "",
                      details: "",
                      short_des: "",
                      tags: "",
                      images: [],
                    });
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="btn btnSecondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="btn btnPrimary"
                >
                  {isEditing ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
