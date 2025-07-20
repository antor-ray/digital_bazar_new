import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom"; // Import useParams to get sellerId from URL
import { ArrowUpWideNarrow, ArrowDownWideNarrow, Package } from "lucide-react"; // Icons
import icon from "../images/Icon.png";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Upload,
  X,
  DollarSign,
  Star,
  TrendingUp,
} from "lucide-react";

// Assuming you have a CSS file for general styles or can reuse existing ones
import "../css/SellerPage.css"; // Or a new CSS file like SellerSellingHistory.css

const SellerSellingHistoryPage = () => {
  //const { sellerId } = useParams(); // Get sellerId from the URL parameter
  const navigate = useNavigate();

  const [sellingHistory, setSellingHistory] = useState([]);
  const [sellingHistorySortType, setSellingHistorySortType] =
    useState("highest_quantity"); // Default sort
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sellerName, setSellerName] = useState("");
  const [sellerId, setSellerId] = useState("");
  // const [selectedMonth, setSelectedMonth] = useState(""); // Format: 'YYYY-MM'
  const [totalOrders, setTotalOrders] = useState(0);
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  // Function to fetch selling history
  const fetchSellingHistory = async () => {
    if (!sellerId) {
      console.error(
        "Seller ID not found in URL, cannot fetch selling history."
      );
      // Optionally navigate back or show an error message
      // navigate('/seller-dashboard');
      return;
    }
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("month", selectedMonth);
      queryParams.append("sellerId", sellerId); // Use sellerId from useParams
      queryParams.append("sortBy", sellingHistorySortType); // Pass sort type for selling history

      console.log(
        "Fetching Selling History with URL:",
        `http://localhost:4000/api/v1/sellerSellingHistory?${queryParams.toString()}`
      );

      const response = await axios.get(
        `http://localhost:4000/api/v1/sellerSellingHistory?${queryParams.toString()}`,
        {
          withCredentials: true,
        }
      );

      if (response.data.status === "success") {
        setSellingHistory(response.data.sellingHistory);
        setTotalOrders(response.data.totalOrders || 0);
        console.log("Fetched selling history:", response.data.sellingHistory);
      } else {
        console.error(
          "Failed to fetch selling history:",
          response.data.message
        );
        // Optionally show a user-friendly error message
      }
    } catch (error) {
      console.error("Error fetching selling history:", error);
      if (error.response?.data?.message) {
        console.error("Server error message:", error.response.data.message);
      }
      // Optionally show a user-friendly error message
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

        if (res.ok) {
          setIsLoggedIn(true);
          fetchSellingHistory();
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
        fetchSellingHistory(); // Re-fetch selling history to update UI

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

  // useEffect to trigger fetch when sellerId or sort type changes
  useEffect(() => {
    fetchSellingHistory();
  }, [sellerId, sellingHistorySortType]); // Re-fetch when sellerId or sort type changes

  return (
    <div className="dashboardContainer">
      {" "}
      {/* Reusing dashboardContainer for consistent layout */}
      <div className="websiteHeader">
        <img className="iconImage" src={icon} alt="Site Icon" />
        <span id="websiteName">DIGITAL BAZAAR</span>
      </div>
      {/* Header */}
      <header className="dashboardHeader">
        <div className="navbar">
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
          </div>
        </div>
      </header>
      <div className="maxWidthContainer">
        <div className="headerBox" style={headerBox}>
          <div>
            <h1 className="headerTitle" style={textStyle}>
              Selling History
            </h1>
            <p className="headerSubtitle" style={subtextStyle}>
              Overview of your sold products
            </p>
          </div>
          <div className="headerActions">
            <button
              onClick={() => navigate(-1)} // Navigate back to dashboard
              className="btn btnSecondary"
              style={buttonStyle}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
      <div className="mainContainer">
        <div className="productsWrapper">
          {" "}
          {/* Reusing productsWrapper for consistent styling */}
          <div className="sectionHeader">
            <h2 className="sectionTitle">Product Sales Overview</h2>
            <div className="filterActions">
              {" "}
              {/* Re-using filterActions for consistent button styling */}
              <button
                className={`btn ${
                  sellingHistorySortType === "highest_quantity"
                    ? "btnPrimary"
                    : "btnSecondary"
                }`}
                onClick={() => setSellingHistorySortType("highest_quantity")}
              >
                <ArrowUpWideNarrow className="btnIcon" />
                Highest Quantity
              </button>
              <button
                className={`btn ${
                  sellingHistorySortType === "lowest_quantity"
                    ? "btnPrimary"
                    : "btnSecondary"
                }`}
                onClick={() => setSellingHistorySortType("lowest_quantity")}
              >
                <ArrowDownWideNarrow className="btnIcon" />
                Lowest Quantity
              </button>
            </div>
          </div>
          <div className="sectionContent">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "16px",
                gap: "12px",
              }}
            >
              <label htmlFor="monthPicker">Filter by Month:</label>
              <input
                type="month"
                id="monthPicker"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{
                  padding: "6px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
              <button
                onClick={fetchSellingHistory}
                className="btn btnPrimary"
                style={{ padding: "6px 12px" }}
              >
                Apply
              </button>
            </div>

            <p
              style={{
                fontWeight: "bold",
                fontSize: "16px",
                marginBottom: "8px",
              }}
            >
              Total Orders: {totalOrders}
            </p>

            {sellingHistory.length > 0 ? (
              <div className="overflow-x-auto">
                {" "}
                {/* Added for horizontal scrolling on small screens */}
                <div style={tableStyles.container}>
                  <table style={tableStyles.table}>
                    <thead style={tableStyles.thead}>
                      <tr>
                        <th style={tableStyles.th}>Product Name</th>
                        <th style={tableStyles.th}>Category</th>
                        <th style={tableStyles.th}>Total Sold</th>
                        <th style={tableStyles.th}>Sell Date</th>
                        <th style={tableStyles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sellingHistory.slice(0, 20).map((item, index) => (
                        <tr
                          key={item.product_id}
                          style={index % 2 === 0 ? tableStyles.evenRow : {}}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              tableStyles.hoverRow.backgroundColor)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              index % 2 === 0
                                ? tableStyles.evenRow.backgroundColor
                                : "transparent")
                          }
                        >
                          <td style={tableStyles.td}>
                            {item.product_name || "N/A"}
                          </td>
                          <td style={tableStyles.td}>
                            {item.category_name || "N/A"}
                          </td>
                          <td style={tableStyles.td}>
                            {item.total_quantity_sold}
                          </td>
                          <td style={tableStyles.td}>
                            {new Date(item.sell_date).toLocaleDateString()}
                          </td>
                          <td style={tableStyles.td}>
                            <button
                              style={{
                                ...tableStyles.button,
                                ...tableStyles.detailsBtn,
                              }}
                              onClick={() =>
                                navigate(`/product/${item.product_id}`)
                              } // Navigate to product details
                            >
                              Details
                            </button>

                            <button
                              style={{
                                ...tableStyles.button,
                                ...tableStyles.deleteBtn,
                              }}
                              onClick={() => deleteProduct(item.product_id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No selling history available for this seller.
              </p>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

const headerBox = {
  padding: "0px",
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  paddingTop: "20px",
};

const textStyle = {
  color: "#0f0f0fff",
  fontSize: "24px",
  fontWeight: "bold",
  marginBottom: "10px",
};

const subtextStyle = {
  color: "#292828ff",
  fontSize: "15px",

  marginBottom: "10px",
};
const buttonStyle = {
  fontSize: "16px",
  cursor: "pointer",
  backgroundColor: "#007bff",

  borderRadius: "4px",
};

const tableStyles = {
  container: {
    overflowX: "auto",
    marginTop: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: "'Segoe UI', sans-serif",
  },
  thead: {
    backgroundColor: "#f2f2f2",
  },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    fontWeight: "bold",
    color: "#333",
    borderBottom: "1px solid #ddd",
  },
  td: {
    padding: "12px 16px",
    textAlign: "left",
    borderBottom: "1px solid #ddd",
  },
  evenRow: {
    backgroundColor: "#fafafa",
  },
  hoverRow: {
    backgroundColor: "#f1f1f1",
  },
  button: {
    marginRight: "10px",
    padding: "6px 12px",
    fontSize: "14px",
    cursor: "pointer",
    borderRadius: "4px",
    border: "none",
  },
  detailsBtn: {
    backgroundColor: "#007bff",
    color: "#fff",
  },
  deleteBtn: {
    backgroundColor: "#dc3545",
    color: "#fff",
  },
};

export default SellerSellingHistoryPage;
