import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import icon from "../images/Icon.png"; // Adjust path if your image is elsewhere
import { ArrowUpWideNarrow, ArrowDownWideNarrow, Phone, MapPin } from "lucide-react"; // Importing icons

const DeliveryManHistoryPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [deliveryHistory, setDeliveryHistory] = useState([]);
  const [deliveryManName, setDeliveryManName] = useState("");
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [sortType, setSortType] = useState("newest_date"); // Default sort for delivery man: newest date
  const navigate = useNavigate();

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  // Effect to check delivery man authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // This endpoint verifies if the delivery man is authenticated
        const res = await axios.get("http://localhost:4000/isAuthenticate", {
          withCredentials: true, // Important for sending cookies
        });
        setIsLoggedIn(true);
        setDeliveryManName(res.data.deliveryManName || "Delivery Man");
      } catch (err) {
        console.error("Delivery man authentication check failed:", err);
        setIsLoggedIn(false);
        // Optionally redirect to a delivery man login page if not authenticated
        if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
            navigate('/deliveryman-login'); // Adjust this route to your actual delivery man login page
        }
      }
    };
    checkAuth();
  }, []); // Empty dependency array means this runs once on mount

  // Function to fetch delivery history based on filters and sort
  const fetchDeliveryHistory = async () => {
    if (!isLoggedIn) {
      return; // Do not fetch if not logged in
    }
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("month", selectedMonth);
      queryParams.append("sortBy", sortType);

      // This endpoint fetches the delivery history from the backend
      const res = await axios.get(
        `http://localhost:4000/deliveryManHistory?${queryParams.toString()}`,
        {
          withCredentials: true, // Important for sending cookies
        }
      );

      if (res.data.status === "success") {
        setDeliveryHistory(res.data.deliveryHistory || []);
        setTotalDeliveries(res.data.totalDeliveries || 0);
      } else {
        console.error("Failed to fetch delivery history:", res.data.message);
      }
    } catch (err) {
      console.error("Failed to fetch delivery history:", err);
      if (
        axios.isAxiosError(err) &&
        err.response &&
        err.response.status === 401
      ) {
        setIsLoggedIn(false);
        navigate("/deliveryman-login"); // Redirect to delivery man login on 401
      }
    }
  };

  // Effect to re-fetch history whenever login status, sort type, or selected month changes
  useEffect(() => {
    if (isLoggedIn) {
      fetchDeliveryHistory();
    }
  }, [isLoggedIn, sortType, selectedMonth]); // Dependencies for re-fetching

  return (
    <div className="container">
      {/* Website Header */}
      <div className="websiteHeader full-width">
        <img className="iconImage" src={icon} alt="Site Icon" />
        <span id="websiteName">DIGITAL BAZAAR</span>
      </div>

      {isLoggedIn ? (
        <div style={styles.page}>
          <h2 style={styles.title}>🚚 Delivery History for {deliveryManName}</h2>

          {/* Filter and Sort Controls */}
          <div style={styles.controlsContainer}>
            <div style={styles.filterGroup}>
              <label htmlFor="monthPicker" style={styles.label}>
                Filter by Month:
              </label>
              <input
                type="month"
                id="monthPicker"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={styles.monthInput}
              />
              <button onClick={fetchDeliveryHistory} style={styles.applyButton}>
                Apply Filter
              </button>
            </div>

            <div style={styles.sortGroup}>
              {/* Sort Buttons */}
              <button
                style={{
                  ...styles.sortButton,
                  ...(sortType === "newest_date"
                    ? styles.sortButtonActive
                    : {}),
                }}
                onClick={() => setSortType("newest_date")}
              >
                <ArrowDownWideNarrow style={styles.icon} /> Newest First
              </button>
              <button
                style={{
                  ...styles.sortButton,
                  ...(sortType === "oldest_date"
                    ? styles.sortButtonActive
                    : {}),
                }}
                onClick={() => setSortType("oldest_date")}
              >
                <ArrowUpWideNarrow style={styles.icon} /> Oldest First
              </button>
              <button
                style={{
                  ...styles.sortButton,
                  ...(sortType === "highest_total"
                    ? styles.sortButtonActive
                    : {}),
                }}
                onClick={() => setSortType("highest_total")}
              >
                <ArrowUpWideNarrow style={styles.icon} /> Highest Total
              </button>
              <button
                style={{
                  ...styles.sortButton,
                  ...(sortType === "lowest_total"
                    ? styles.sortButtonActive
                    : {}),
                }}
                onClick={() => setSortType("lowest_total")}
              >
                <ArrowDownWideNarrow style={styles.icon} /> Lowest Total
              </button>
            </div>
          </div>

          <p style={styles.totalOrdersText}>Total Deliveries: {totalDeliveries}</p>

          {deliveryHistory.length > 0 ? (
            deliveryHistory.map((order) => (
              <div key={order.order_id} style={styles.card}>
                <div style={styles.header}>
                  <span style={styles.date}>
                    📦 Order ID: {order.order_id} | Order Date:{" "}
                    {new Date(order.orderdate).toLocaleDateString()}
                  </span>
                  <span style={styles.total}>
                    ৳{order.totalordercost || '0.00'} | Status:{" "}
                    <span style={{ color: order.status === 'delivered' ? 'green' : (order.status === 'pending' ? 'orange' : 'grey') }}>
                        {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
                    </span>
                  </span>
                </div>

                {/* Customer Info (per order) */}
                <div style={styles.customerInfo}>
                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Customer: {order.customername || 'N/A'}</p>
                    {order.customerphone && (
                        <p style={styles.phoneLink}>
                            <Phone size={14} style={{verticalAlign: 'middle'}} /> {order.customerphone}
                        </p>
                    )}
                    {order.customeraddress && (
                        <p style={styles.addressText}>
                            <MapPin size={14} style={{verticalAlign: 'middle'}} /> {order.customeraddress}
                        </p>
                    )}
                </div>

                {/* Products Table for this order */}
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.tableHeader}>Product Info</th>
                        <th style={styles.tableHeader}>Seller Info</th>
                        <th style={styles.tableHeader}>Price</th>
                        <th style={styles.tableHeader}>Quantity</th>
                        <th style={styles.tableHeader}>Subtotal</th>
                        <th style={styles.tableHeader}>Product Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, i) => (
                        <tr key={i} style={styles.tableRow}>
                          {/* Product Info Cell */}
                          <td style={styles.tableCell}>
                            <strong>{item.productName || 'N/A'}</strong> <br />
                            <span style={styles.categoryText}>
                              Category: {item.categoryName || "N/A"}
                            </span>
                          </td>

                          {/* Seller Info Cell */}
                          <td style={styles.tableCell}>
                            Seller: {item.sellerName || "N/A"}
                            <br />
                            {item.sellerPhone && (
                              <span style={styles.phoneLink}>
                                <Phone
                                  size={12}
                                  style={{ verticalAlign: "middle" }}
                                />{" "}
                                {item.sellerPhone}
                              </span>
                            )}
                          </td>

                          {/* Price, Quantity, Subtotal */}
                          <td style={styles.tableCell}>৳{(item.price || 0).toFixed(2)}</td>
                          <td style={styles.tableCell}>{item.quantity || '0'}</td>
                          <td style={styles.tableCell}>
                            ৳{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                          </td>
                          <td style={styles.tableCell}>
                            <button
                              style={styles.detailsBtn}
                              onClick={() =>
                                // Assuming item.productId is available from the backend for navigation
                                navigate(`/product/${item.productId}`) 
                              }
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          ) : (
            <p style={styles.noHistoryText}>
              No delivery history available for the selected period.
            </p>
          )}
        </div>
      ) : (
        <div style={styles.loginContainer}>
          <h3>🔒 You must be logged in as a Delivery Man to view your delivery history.</h3>
          <button style={styles.loginButton} onClick={() => navigate("/deliveryman-login")}>
            Delivery Man Login
          </button>
        </div>
      )}
    </div>
  );
};

// 🔷 Inline Style Object (Adjusted for DeliveryManHistoryPage)
const styles = {
    page: {
        padding: '1rem',
        maxWidth: '1200px',
        margin: 'auto',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.6',
    },
    title: {
        textAlign: 'center',
        marginBottom: '1.5rem',
        color: '#333',
        fontSize: '2rem',
        fontWeight: '600',
    },
    controlsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: '1.5rem',
        padding: '1rem',
        border: '1px solid #e0e0e0',
        borderRadius: '10px',
        backgroundColor: '#fefefe',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
    filterGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap',
    },
    label: {
        fontWeight: 'bold',
        color: '#555',
        fontSize: '0.95rem',
    },
    monthInput: {
        padding: '0.6rem 0.8rem',
        borderRadius: '5px',
        border: '1px solid #ccc',
        flexGrow: 1,
        minWidth: '150px',
        fontSize: '0.9rem',
    },
    applyButton: {
        padding: '0.6rem 1.2rem',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        transition: 'background-color 0.2s ease, transform 0.1s ease',
    },
    'applyButton:hover': {
        backgroundColor: '#218838',
        transform: 'translateY(-1px)',
    },
    sortGroup: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        justifyContent: 'center',
    },
    sortButton: {
        padding: '0.6rem 1rem',
        backgroundColor: '#f0f0f0',
        color: '#333',
        border: '1px solid #d0d0d0',
        borderRadius: '5px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem',
        fontSize: '0.95rem',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
    },
    sortButtonActive: {
        backgroundColor: '#007bff',
        color: 'white',
        borderColor: '#007bff',
        boxShadow: '0 2px 5px rgba(0,123,255,0.2)',
    },
    'sortButton:hover': {
        backgroundColor: '#e2e6ea',
    },
    'sortButtonActive:hover': {
        backgroundColor: '#0056b3',
    },
    icon: {
        width: '18px',
        height: '18px',
    },
    totalOrdersText: {
        fontWeight: 'bold',
        fontSize: '1.2rem',
        marginBottom: '1.2rem',
        textAlign: 'center',
        color: '#333',
        backgroundColor: '#e6f7ff',
        padding: '0.8rem',
        borderRadius: '8px',
        border: '1px solid #b3e0ff',
    },
    card: {
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        marginBottom: '1rem',
        fontWeight: 'bold',
        borderBottom: '2px solid #f0f0f0',
        paddingBottom: '0.8rem',
        fontSize: '1rem',
        gap: '0.5rem',
    },
    date: {
        color: '#666',
        fontSize: '0.95rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
    },
    total: {
        color: '#28a745',
        fontSize: '1.3rem',
        fontWeight: '700',
    },
    customerInfo: { // Style for customer info block
        fontSize: '0.95rem',
        color: '#444',
        marginBottom: '1rem',
        backgroundColor: '#f8f9fa',
        padding: '0.8rem',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
    },
    addressText: { // Style for address
        fontSize: '0.85rem',
        color: '#666',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        marginTop: '5px',
    },
    tableContainer: {
        overflowX: 'auto',
        marginTop: '1rem',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '0.8rem',
        fontSize: '0.9rem',
    },
    tableHeader: {
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #e0e0e0',
        padding: '0.8rem',
        textAlign: 'left',
        fontWeight: 'bold',
        color: '#555',
    },
    tableRow: {
        '&:nth-child(even)': {
            backgroundColor: '#fcfcfc',
        },
        '&:hover': {
            backgroundColor: '#f5f5f5',
        },
    },
    tableCell: {
        borderBottom: '1px solid #eee',
        padding: '0.8rem',
        verticalAlign: 'top',
        color: '#333',
    },
    detailsText: {
        fontSize: '0.85rem',
        color: '#777',
        display: 'block',
        marginTop: '0.25rem',
    },
    categoryText: {
        fontSize: '0.85rem',
        color: '#5a5a5a',
        display: 'block',
        marginTop: '0.25rem',
        fontWeight: 'bold',
    },
    phoneLink: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        color: '#0056b3',
        textDecoration: 'none',
        fontWeight: 'normal',
        fontSize: '0.85rem',
    },
    noHistoryText: {
        textAlign: 'center',
        color: '#777',
        padding: '2rem',
        fontSize: '1.1rem',
        backgroundColor: '#fdfdfd',
        borderRadius: '8px',
        border: '1px dashed #ccc',
        marginTop: '2rem',
    },
    loginContainer: {
        textAlign: 'center',
        marginTop: '4rem',
        padding: '2rem',
        border: '1px solid #d0d0d0',
        borderRadius: '12px',
        maxWidth: '450px',
        margin: '4rem auto',
        boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
        backgroundColor: '#fff',
    },
    loginButton: {
        marginTop: '1.5rem',
        padding: '0.9rem 2.5rem',
        fontSize: '1.2rem',
        backgroundColor: '#1976d2',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease, transform 0.1s ease',
        fontWeight: 'bold',
    },
    'loginButton:hover': {
        backgroundColor: '#115293',
        transform: 'translateY(-2px)',
    },
    detailsBtn: {
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        padding: "0.5rem 1rem",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "0.85rem",
        transition: "background-color 0.2s ease",
    },
    'detailsBtn:hover': {
        backgroundColor: "#0056b3",
    }
};

export default DeliveryManHistoryPage;