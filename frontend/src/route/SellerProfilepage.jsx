import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import icon from "../images/Icon.png";

import {
  Mail,
  Phone,
  MapPin,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Camera,
  User,
  Lock,
  Info,
  Shield,
  Star,
} from "lucide-react";
import "../css/SellerProfilePage.css";

const SellerProfilePage = () => {
  // Initial seller data

  // const [seller, setSeller] = useState({
  //   email: "seller1@example.com",
  //   businessName: "Gadget World",
  //   about: "Best gadgets and electronics store in town with premium quality products and excellent customer service.",
  //   phone: "03211234567",
  //   address: "Shop #12, Tech Mall, Lahore",
  //   profileImage: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop",
  //   memberSince: "2020",
  //   isVerified: true,
  //   rating: 4.8
  // });

  // Edit modes
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  //const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Initially null
  // Will be set after fetch

  const [seller, setSeller] = useState({
    email: "",
    business_name: "",
    about: "",
    phone_number: "",
    address: "",
    // profileImage: "",
    // memberSince: "",
    // isVerified: false,
    // rating: 0
  });


    
  // Initially null
  const [profileForm, setProfileForm] = useState(null); // Will be set after fetch

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const res = await fetch("http://localhost:4000/SellerProfile", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        if (res.ok && data.seller) {
          const transformedSeller = {
            ...data.seller,
            phone_number: data.seller.phone_number,
          };
          setSeller(transformedSeller);
          setProfileForm(transformedSeller);
        } else {
          alert("Failed to fetch seller data");
        }
      } catch (err) {
        console.error("Error fetching seller:", err);
        alert("Something went wrong while loading profile.");
      }
    };

    fetchSeller();
  }, []);

  // Handle profile form changes
  const handleProfileChange = (field, value) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  // save profile
  const handleSaveProfile = async () => {
    try {
      const response = await fetch("http://localhost:4000/SellerEditProfile", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: profileForm.email,
          business_name: profileForm.business_name,
          about: profileForm.about,
          phone_number: profileForm.phone_number, // ✅ backend expects this
          address: profileForm.address,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert("Profile updated successfully");
        setSeller(profileForm);
        setIsEditingProfile(false);
      } else {
        alert(result.message || "Update failed");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Something went wrong");
    }
  };

  // Handle password form changes
  const handlePasswordChange = (field, value) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Cancel profile edit
  const handleCancelProfile = () => {
    setProfileForm(seller);
    setIsEditingProfile(false);
  };

  // Save password changes
  const handleSavePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/SellerEditPassword", {
        method: "PUT",
        credentials: "include", // ✅ Important fix
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Password updated successfully!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setIsEditingPassword(false);
      } else {
        alert(data.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Password update failed:", error);
      alert("Something went wrong. Try again.");
    }
  };

  // Cancel password edit
  const handleCancelPassword = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsEditingPassword(false);
  };

  return (
    <div className="container">
      <div className="websiteHeader">
        <img className="iconImage" src={icon} alt="Site Icon" />
        <span id="websiteName">DIGITAL BAZAAR</span>
      </div>

      <div className="profile-wrapper">
        {/* Header */}
        <div className="profile-header">
          <h1 className="main-title">Seller Dashboard</h1>
          <p className="subtitle">
            Manage your business profile and account settings
          </p>
        </div>

        <div className="profile-content">
          {/* Profile Sidebar */}

          {/* Main Content */}
          <div className="profile-main">
            {/* Profile Information Card */}
            <div className="info-card">
              <h3 className="card-title">
                <User className="title-icon" />
                Profile Information
              </h3>
              <div className="card-header">
                <div className="business-info">
                  <h2 className="business-name">{seller.business_name}</h2>
                </div>

                {!isEditingProfile ? (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="btn btn-primary"
                  >
                    <Edit3 className="btn-icon" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="btn-group">
                    <button
                      onClick={handleSaveProfile}
                      className="btn btn-success"
                    >
                      <Save className="btn-icon" />
                      Save
                    </button>
                    <button
                      onClick={handleCancelProfile}
                      className="btn btn-secondary"
                    >
                      <X className="btn-icon" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Business Name</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={profileForm.business_name}
                      onChange={(e) =>
                        handleProfileChange("business_name", e.target.value)
                      }
                      className="form-input"
                    />
                  ) : (
                    <div className="form-display">
                      <span className="display-text">
                        {seller.business_name}
                      </span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  {isEditingProfile ? (
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) =>
                        handleProfileChange("email", e.target.value)
                      }
                      className="form-input"
                    />
                  ) : (
                    <div className="form-display">
                      <Mail className="display-icon" />
                      <span className="display-text">{seller.email}</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  {isEditingProfile ? (
                    <input
                      type="tel"
                      value={profileForm.phone_number}
                      onChange={(e) =>
                        handleProfileChange("phone_number", e.target.value)
                      }
                      className="form-input"
                    />
                  ) : (
                    <div className="form-display">
                      <Phone className="display-icon" />
                      <span className="display-text">
                        {seller.phone_number}
                      </span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Business Address</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) =>
                        handleProfileChange("address", e.target.value)
                      }
                      className="form-input"
                    />
                  ) : (
                    <div className="form-display">
                      <MapPin className="display-icon" />
                      <span className="display-text">{seller.address}</span>
                    </div>
                  )}
                </div>

                <div className="form-group form-group-full">
                  <label className="form-label">About Business</label>
                  {isEditingProfile ? (
                    <textarea
                      value={profileForm.about}
                      onChange={(e) =>
                        handleProfileChange("about", e.target.value)
                      }
                      rows={4}
                      className="form-textarea"
                    />
                  ) : (
                    <div className="form-display">
                      <Info className="display-icon" />
                      <span className="display-text">{seller.about}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Password Change Card */}
          </div>
          <div className="info-card">
            <div className="card-header">
              <h3 className="card-title">
                <Lock className="title-icon title-icon-danger" />
                Password & Security
              </h3>
              {!isEditingPassword ? (
                <button
                  onClick={() => setIsEditingPassword(true)}
                  className="btn btn-danger"
                >
                  <Lock className="btn-icon" />
                  Change Password
                </button>
              ) : (
                <div className="btn-group">
                  <button
                    onClick={handleSavePassword}
                    className="btn btn-success"
                  >
                    <Save className="btn-icon" />
                    Update
                  </button>
                  <button
                    onClick={handleCancelPassword}
                    className="btn btn-secondary"
                  >
                    <X className="btn-icon" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {isEditingPassword ? (
              <div className="password-form">
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <div className="password-input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      // value={passwordForm.currentPassword}
                      onChange={(e) =>
                        handlePasswordChange("currentPassword", e.target.value)
                      }
                      className="form-input"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle"
                    >
                      {showPassword ? (
                        <EyeOff className="eye-icon" />
                      ) : (
                        <Eye className="eye-icon" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div className="password-input-group">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      handlePasswordChange("newPassword", e.target.value)
                    }
                    className="form-input"
                    placeholder="Enter new password"
                  />
                   <button
                      type="button"
                      onClick={() =>
                        setShowNewPassword(!showNewPassword)
                      }
                      className="password-toggle"
                    >
                      {showNewPassword ? (
                        <EyeOff className="eye-icon" />
                      ) : (
                        <Eye className="eye-icon" />
                      )}
                    </button>
                    </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <div className="password-input-group">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        handlePasswordChange("confirmPassword", e.target.value)
                      }
                      className="form-input"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="password-toggle"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="eye-icon" />
                      ) : (
                        <Eye className="eye-icon" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="password-requirements">
                  <h4 className="requirements-title">Password Requirements:</h4>
                  <ul className="requirements-list">
                    <li>At least 6 characters long</li>
                    <li>Mix of uppercase and lowercase letters</li>
                    <li>Include at least one number</li>
                    <li>Include at least one special character</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="password-placeholder">
                <div className="security-icon">
                  <Lock className="lock-icon" />
                </div>
                <p className="security-text">
                  Your password is secure and encrypted
                </p>
                <p className="security-subtext">
                  Click "Change Password" to update your credentials
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProfilePage;
