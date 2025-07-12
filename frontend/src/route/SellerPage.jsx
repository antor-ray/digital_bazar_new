import React, { useState, useRef, useEffect } from "react";
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
  const [sellerName, setSellerName] = useState('');
  const fileInputRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  // for search bar
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6; // or whatever number fits your layout

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sample products data

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
    "Home & Garden",
    "Sports & Outdoors",
    "Books",
    "Beauty & Health",
    "Toys & Games",
    "Automotive",
  ];

  const fetchSellerProducts = async () => {
    try {
      // Make a GET request to the new endpoint you created on the server
      const response = await axios.get(
        "http://localhost:4000/SellerPage/products",
        {
          withCredentials: true,
        }
      );
      if (response.data.status === "success") {
        // Map over the fetched products to ensure consistency for ProductCard
        const fetchedProducts = response.data.products.map((p) => ({
          ...p,
          // Ensure 'images' is an array, even if it's null from DB (e.g., no images for a product)
          // The backend now returns 'images' as an array, but this is a good safeguard.
          images: p.images || [],
          // Derive 'status' from 'stock' as per your ProductCard logic
          status: p.stock > 0 ? "Active" : "Out of Stock",
        }));
        setProducts(fetchedProducts);
        console.log("Fetched seller products:", fetchedProducts);
      } else {
        console.error(
          "Failed to fetch seller products:",
          response.data.message
        );
      }
    } catch (error) {
      console.error("Error fetching seller products:", error);
      // Handle error, e.g., show a message to the user
    }
  };

  useEffect(() => {
    const checkAuthSeller = async () => {
      try {
        const res = await fetch("http://localhost:4000/isAuthenticatedSeller", {
          method: "GET",
          credentials: "include",
        });
        
        
       const data = await res.json();

        if(res.ok){
          setIsLoggedIn(true);
        fetchSellerProducts();
        setSellerName(data.sellerName);
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
        await axios.post("http://localhost:4000/logout", {}, { withCredentials: true });
        setIsLoggedIn(false);
        navigate("/");
      } catch (err) {
        console.error("Logout failed", err);
      }
    };

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
    // const processedImages = (product.images || []).map((img) =>
    //   img.startsWith("http") ? img : `http://localhost:4000/images/${img}`
    // );

    // const relativeImagePaths = (product.images || []).map((img) =>
    //   img.startsWith("/images/")
    //     ? img
    //     : img.startsWith("http")
    //     ? new URL(img).pathname
    //     : `${img}`
    // );

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
      !newProduct.short_des
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

    if (newFiles.length > 4) {
      alert("You can upload a maximum of 4 images.");
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
            View
          </button>
          <button className="btn btnEdit" onClick={() => editProduct(product)}>
            {" "}
            {/* Changed class name */}
            <Edit className="btnIcon" />
            Edit
          </button>
          <button
            onClick={() => deleteProduct(product.id)}
            className="btn btnDanger"
          >
            <Trash2 className="btnIcon" />
            Delete
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
        <div className="maxWidthContainer">
          <div className="headerContent">
            <div>
              <h1 className="headerTitle">{sellerName.toUpperCase()}</h1>
              <p className="headerSubtitle">Welcome back, {sellerName.toUpperCase()} </p>
            </div>

            <div className="headerActions">
              <button
                onClick={() => navigate("/SellerProfilePage")}
                className="btn btnSecondary"
              >
                <Edit className="btnIcon" />
                Edit Profile
              </button>

              <button
                onClick={handleLogout}
                className="btn btnDanger"
              >
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
        </div>
      </header>

      {/* Main Content */}
      <div className="maxWidthContainer">
        {/* Stats Cards */}
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
            <div className="statContent">
              <DollarSign className="statIcon green" />
              <div>
                <p className="statLabel">Total Revenue</p>
                <p className="statValue">$12,543</p>
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
                <p className="statValue">156</p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="productsWrapper">

          <div className="sectionHeader searchHeader">
            <h2 className="sectionTitle">Your Products</h2>

            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="productSearchInput"
            />
          </div>

          <div className="sectionContent">
            {" "}
            {/* Changed class name */}
            <div className="productsGrid">
              {" "}
              {/* Changed class name */}
              {products
                .filter((p) =>
                  p.name.toLowerCase().includes(searchQuery.toLowerCase())
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
              style={{
                padding: "0.5rem 1rem",
                marginRight: "1rem",
                backgroundColor: currentPage === 1 ? "#ccc" : "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
              }}
            >
              ⬅ Back
            </button>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={
                currentPage >=
                Math.ceil(
                  products.filter((p) =>
                    p.name.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length / productsPerPage
                )
              }
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Next ➡
            </button>
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
                <X size={24} />
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
