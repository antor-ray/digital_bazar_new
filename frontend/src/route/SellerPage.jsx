import React, { useState, useRef } from 'react';
import { Plus, Edit, Trash2, Eye, Upload, X, Package, DollarSign, Star, TrendingUp } from 'lucide-react';
import "../css/SellerPage.css";
const SellerDashboard = () => {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const fileInputRef = useRef(null);
  
  // Sample products data
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Premium Wireless Headphones",
      category: "Electronics",
      price: 199.99,
      stock: 25,
      status: "Active",
      images: ["https://via.placeholder.com/300x200?text=Headphones"],
      description: "High-quality wireless headphones with noise cancellation",
      sku: "WH-001",
      brand: "TechSound",
      weight: "0.5 kg",
      dimensions: "20x15x8 cm"
    },
    {
      id: 2,
      name: "Organic Cotton T-Shirt",
      category: "Clothing",
      price: 29.99,
      stock: 150,
      status: "Active",
      images: ["https://via.placeholder.com/300x200?text=T-Shirt"],
      description: "Comfortable organic cotton t-shirt in multiple colors",
      sku: "TS-002",
      brand: "EcoWear",
      weight: "0.2 kg",
      dimensions: "Standard sizing"
    },
    {
      id: 3,
      name: "Smart Home Security Camera",
      category: "Electronics",
      price: 149.99,
      stock: 0,
      status: "Out of Stock",
      images: ["https://via.placeholder.com/300x200?text=Camera"],
      description: "WiFi enabled security camera with night vision",
      sku: "SC-003",
      brand: "SecureHome",
      weight: "0.8 kg",
      dimensions: "12x10x10 cm"
    }
  ]);

  // Form state for adding new product
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    sku: '',
    brand: '',
    weight: '',
    dimensions: '',
    tags: '',
    images: []
  });

  const categories = [
    'Electronics', 'Clothing', 'Home & Garden', 'Sports & Outdoors', 
    'Books', 'Beauty & Health', 'Toys & Games', 'Automotive'
  ];

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setNewProduct(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  };

  const removeImage = (index) => {
    setNewProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    if (!newProduct.name || !newProduct.category || !newProduct.price || !newProduct.stock || !newProduct.description) {
      alert('Please fill in all required fields');
      return;
    }
    
    const product = {
      ...newProduct,
      id: products.length + 1,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock),
      status: parseInt(newProduct.stock) > 0 ? 'Active' : 'Out of Stock'
    };
    setProducts([...products, product]);
    setNewProduct({
      name: '', category: '', price: '', stock: '', description: '',
      sku: '', brand: '', weight: '', dimensions: '', tags: '', images: []
    });
    setShowAddProduct(false);
  };

  const deleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const ProductCard = ({ product }) => (
    <div className="product-card fade-in">
      <div className="product-image-container">
        <img 
          src={product.images[0]} 
          alt={product.name}
          className="product-image"
        />
        <span className={`product-status ${product.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
          {product.status}
        </span>
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-category">{product.category}</p>
        <div className="product-details">
          <span className="product-price">${product.price}</span>
          <span className="product-stock">Stock: {product.stock}</span>
        </div>
        <div className="product-actions">
          <button className="btn btn-view">
            <Eye className="btn-icon" />
            View
          </button>
          <button className="btn btn-edit">
            <Edit className="btn-icon" />
            Edit
          </button>
          <button 
            onClick={() => deleteProduct(product.id)}
            className="btn btn-danger"
          >
            <Trash2 className="btn-icon" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="max-width-container">
          <div className="header-content">
            <div>
              <h1 className="header-title">Seller Dashboard</h1>
              <p className="header-subtitle">Welcome back, John Doe</p>
            </div>
            <button
              onClick={() => setShowAddProduct(true)}
              className="btn btn-primary"
            >
              <Plus className="btn-icon" />
              Add Product
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-width-container">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <Package className="stat-icon blue" />
              <div>
                <p className="stat-label">Total Products</p>
                <p className="stat-value">{products.length}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <DollarSign className="stat-icon green" />
              <div>
                <p className="stat-label">Total Revenue</p>
                <p className="stat-value">$12,543</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <Star className="stat-icon yellow" />
              <div>
                <p className="stat-label">Average Rating</p>
                <p className="stat-value">4.8</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <TrendingUp className="stat-icon purple" />
              <div>
                <p className="stat-label">Orders This Month</p>
                <p className="stat-value">156</p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="products-section">
          <div className="section-header">
            <h2 className="section-title">Your Products</h2>
          </div>
          <div className="section-content">
            <div className="products-grid">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="modal-overlay">
          <div className="modal-content fade-in">
            <div className="modal-header">
              <h3 className="modal-title">Add New Product</h3>
              <button
                onClick={() => setShowAddProduct(false)}
                className="modal-close"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              {/* Basic Information */}
              <div className="form-section">
                <h4 className="form-section-title">Basic Information</h4>
                <div className="form-grid form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      className="form-input"
                      placeholder="Enter product name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      required
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      className="form-select"
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                      className="form-input"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Quantity *</label>
                    <input
                      type="number"
                      required
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                      className="form-input"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="form-section">
                <h4 className="form-section-title">Product Details</h4>
                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    required
                    rows="3"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    className="form-textarea"
                    placeholder="Describe your product..."
                  />
                </div>
                <div className="form-grid form-grid-3">
                  <div className="form-group">
                    <label className="form-label">SKU</label>
                    <input
                      type="text"
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                      className="form-input"
                      placeholder="Product SKU"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Brand</label>
                    <input
                      type="text"
                      value={newProduct.brand}
                      onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
                      className="form-input"
                      placeholder="Brand name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Weight</label>
                    <input
                      type="text"
                      value={newProduct.weight}
                      onChange={(e) => setNewProduct({...newProduct, weight: e.target.value})}
                      className="form-input"
                      placeholder="e.g., 1.5 kg"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Dimensions</label>
                  <input
                    type="text"
                    value={newProduct.dimensions}
                    onChange={(e) => setNewProduct({...newProduct, dimensions: e.target.value})}
                    className="form-input"
                    placeholder="e.g., 20x15x8 cm"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tags</label>
                  <input
                    type="text"
                    value={newProduct.tags}
                    onChange={(e) => setNewProduct({...newProduct, tags: e.target.value})}
                    className="form-input"
                    placeholder="Separate tags with commas"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="form-section">
                <h4 className="form-section-title">Product Images</h4>
                <div className="form-group">
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
                    className="image-upload-area"
                  >
                    <Upload className="upload-icon" />
                    <p className="upload-text">Click to upload images or drag and drop</p>
                    <p className="upload-subtext">PNG, JPG, GIF up to 10MB each</p>
                  </div>
                </div>
                
                {newProduct.images.length > 0 && (
                  <div className="image-preview-grid">
                    {newProduct.images.map((image, index) => (
                      <div key={index} className="image-preview">
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="preview-image"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="remove-image"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="btn btn-primary"
                >
                  Add Product
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