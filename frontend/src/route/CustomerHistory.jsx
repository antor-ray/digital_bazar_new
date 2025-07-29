import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import icon from "../images/Icon.png";
import { ArrowUpWideNarrow, ArrowDownWideNarrow, Phone } from "lucide-react";

const CustomerHistoryPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState([]); // For 'newest_date', 'oldest_date', etc.
  const [mostBoughtProducts, setMostBoughtProducts] = useState([]); // For 'most_bought_products'
  const [topSellers, setTopSellers] = useState([]); // For 'top_sellers'
  const [customerName, setCustomerName] = useState("");
  const [totalOrders, setTotalOrders] = useState(0); // This will represent total distinct orders, products or sellers based on sortType
  const [sortType, setSortType] = useState("newest_date"); // Default sort
  const navigate = useNavigate();

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("http://localhost:4000/isAuthenticate", {
          withCredentials: true,
        });
        setIsLoggedIn(true);
        setCustomerName(res.data.customerName || "Customer");
      } catch (err) {
        console.error("Authentication check failed:", err);
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  const fetchPurchaseHistory = async () => {
    if (!isLoggedIn) {
      return;
    }
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("month", selectedMonth);
      queryParams.append("sortBy", sortType);

      const res = await axios.get(
        `http://localhost:4000/customerHistory?${queryParams.toString()}`,
        {
          withCredentials: true,
        }
      );

      if (res.data.status === "success") {
        // Clear all previous data and set only the relevant one
        setPurchaseHistory([]);
        setMostBoughtProducts([]);
        setTopSellers([]);

        if (sortType === "most_bought_products") {
          setMostBoughtProducts(res.data.mostBoughtProducts || []);
        } else if (sortType === "top_sellers") {
          setTopSellers(res.data.topSellers || []);
        } else {
          setPurchaseHistory(res.data.purchaseHistory || []);
        }
        setTotalOrders(res.data.totalOrders || 0);
      } else {
        console.error("Failed to fetch purchase history:", res.data.message);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
      if (
        axios.isAxiosError(err) &&
        err.response &&
        err.response.status === 401
      ) {
        setIsLoggedIn(false);
        navigate("/Login"); // Redirect to login on 401
      }
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      // Call fetchPurchaseHistory on initial load and when sortType changes
      // Do NOT include selectedMonth here, as it will be manually triggered by the button
      fetchPurchaseHistory();
    }
  }, [isLoggedIn, sortType]); // Removed selectedMonth from dependencies

  // Render function for "Most Bought Products"
  const renderMostBoughtProducts = () => (
    <div>
      {/* Added Array.isArray check here */}
      {Array.isArray(mostBoughtProducts) && mostBoughtProducts.length > 0 ? (
        mostBoughtProducts.map((product, index) => (
          <div key={index} style={styles.card}>
            <div style={styles.productCardHeader}>
                <img
                    src={`http://localhost:4000/images/${product.image_url}` || 'https://placehold.co/80x80/aabbcc/ffffff?text=No+Image'}
                    alt={product.product_name}
                    style={styles.productImage}
                />
                <div style={styles.productInfoSummary}>
                    <h3 style={styles.productNameTitle}>{product.product_name}</h3>
                    <p style={styles.productShortDes}>{product.short_des}</p>
                    <p style={styles.productStats}>
                        🛒 Bought <strong style={{color: '#007bff'}}>{product.total_bought_count}</strong> time(s)
                    </p>
                    {product.seller_name && (
                        <p style={styles.productSellerInfo}>
                            Sold by: {product.seller_name} {product.seller_phone && <span style={styles.phoneLink}><Phone size={12} style={{verticalAlign: "middle"}} /> {product.seller_phone}</span>}
                        </p>
                    )}
                </div>
            </div>
            <button
                style={{...styles.detailsBtn, marginTop: '1rem'}}
                onClick={() => navigate(`/product/${product.product_id}`)}
            >
                View Product Details
            </button>
          </div>
        ))
      ) : (
        <p style={styles.noHistoryText}>
          No products found for the selected period or filter.
        </p>
      )}
    </div>
  );

  // Render function for "Top Sellers"
  const renderTopSellers = () => (
    <div>
      {/* Added Array.isArray check here */}
      {Array.isArray(topSellers) && topSellers.length > 0 ? (
        topSellers.map((seller, index) => (
          <div key={index} style={styles.card}>
            <h3 style={styles.sellerNameTitle}>
              🛍️ Seller: {seller.seller_name}
            </h3>
            <p style={styles.sellerPhoneInfo}>
              <Phone size={16} style={{verticalAlign: "middle"}} /> {seller.seller_phone || "N/A"}
            </p>
            <p style={styles.sellerStats}>
              This customer bought products associated with this seller:{" "}
              <strong style={{color: '#28a745'}}>{seller.total_items_from_seller}</strong> total item(s) (
              <strong style={{color: '#ffc107'}}>{seller.distinct_products_bought}</strong> distinct product(s))
            </p>
            {/* You could optionally fetch and display top products from this seller here */}
          </div>
        ))
      ) : (
        <p style={styles.noHistoryText}>
          No sellers found for the selected period or filter.
        </p>
      )}
    </div>
  );


  return (
    <div className="container">
      <div className="websiteHeader full-width">
        <img className="iconImage" src={icon} alt="Site Icon" />
        <span id="websiteName">DIGITAL BAZAAR</span>
      </div>

      {isLoggedIn ? (
        <div style={styles.page}>
          <h2 style={styles.title}>🧾 Purchase History for {customerName}</h2>

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
              <button onClick={fetchPurchaseHistory} style={styles.applyButton}>
                Apply Filter
              </button>
            </div>

            <div style={styles.sortGroup}>
              <button
                style={{
                  ...styles.sortButton,
                  ...(sortType === "newest_date" ? styles.sortButtonActive : {}),
                }}
                onClick={() => setSortType("newest_date")}
              >
                <ArrowDownWideNarrow style={styles.icon} /> Newest First
              </button>
              <button
                style={{
                  ...styles.sortButton,
                  ...(sortType === "oldest_date" ? styles.sortButtonActive : {}),
                }}
                onClick={() => setSortType("oldest_date")}
              >
                <ArrowUpWideNarrow style={styles.icon} /> Oldest First
              </button>
              <button
                style={{
                  ...styles.sortButton,
                  ...(sortType === "highest_total" ? styles.sortButtonActive : {}),
                }}
                onClick={() => setSortType("highest_total")}
              >
                <ArrowUpWideNarrow style={styles.icon} /> Highest Total
              </button>
              <button
                style={{
                  ...styles.sortButton,
                  ...(sortType === "lowest_total" ? styles.sortButtonActive : {}),
                }}
                onClick={() => setSortType("lowest_total")}
              >
                <ArrowDownWideNarrow style={styles.icon} /> Lowest Total
              </button>
              <button
                style={{
                  ...styles.sortButton,
                  ...(sortType === "most_bought_products" ? styles.sortButtonActive : {}),
                }}
                onClick={() => setSortType("most_bought_products")}
              >
                Most Bought Products
              </button>
              <button
                style={{
                  ...styles.sortButton,
                  ...(sortType === "top_sellers" ? styles.sortButtonActive : {}),
                }}
                onClick={() => setSortType("top_sellers")}
              >
                Top Sellers
              </button>
            </div>
          </div>

          <p style={styles.totalSummaryText}>
            {sortType === "newest_date" || sortType === "oldest_date" || sortType === "highest_total" || sortType === "lowest_total"
              ? `Total Orders: ${totalOrders}`
              : sortType === "most_bought_products"
              ? `Total Distinct Products Bought: ${totalOrders}`
              : sortType === "top_sellers"
              ? `Total Sellers with Purchases: ${totalOrders}`
              : ""
            }
          </p>

          {sortType === 'most_bought_products' ? renderMostBoughtProducts() :
           sortType === 'top_sellers' ? renderTopSellers() : (
            // Original purchase history rendering logic
            // Added Array.isArray check here too
            Array.isArray(purchaseHistory) && purchaseHistory.length > 0 ? (
                purchaseHistory.map((order) => (
                    <div key={order.order_id} style={styles.card}>
                    <div style={styles.header}>
                        <span style={styles.date}>
                        🗓️ Order ID: {order.order_id} | Date:{" "}
                        {new Date(order.date).toLocaleDateString()}
                        </span>
                        <span style={styles.total}>💳 Total: ৳{order.total}</span>
                    </div>

                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                        <thead>
                            <tr>
                            <th style={styles.tableHeader}>Product Info</th>
                            <th style={styles.tableHeader}>Seller Info</th>
                            <th style={styles.tableHeader}>Delivery Info</th>
                            <th style={styles.tableHeader}>Price</th>
                            <th style={styles.tableHeader}>Quantity</th>
                            <th style={styles.tableHeader}>Subtotal</th>
                            <th style={styles.tableHeader}>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, i) => (
                            <tr key={i} style={styles.tableRow}>
                                <td style={styles.tableCell}>
                                <strong>{item.productName}</strong> <br />
                                <span style={styles.categoryText}>
                                    Category: {item.categoryName || "N/A"}
                                </span>
                                </td>
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
                                <td style={styles.tableCell}>
                                Delivery By: {order.deliverymanname || "N/A"}
                                <br />
                                {order.deliverymanphone && (
                                    <span style={styles.phoneLink}>
                                    <Phone
                                        size={12}
                                        style={{ verticalAlign: "middle" }}
                                    />{" "}
                                    {order.deliverymanphone}
                                    </span>
                                )}
                                </td>
                                <td style={styles.tableCell}>৳{item.price}</td>
                                <td style={styles.tableCell}>{item.quantity}</td>
                                <td style={styles.tableCell}>
                                ৳{(item.price * item.quantity).toFixed(2)}
                                </td>
                                <td style={styles.tableCell}>
                                <button style={styles.detailsBtn}
                                    onClick={() =>
                                    navigate(`/product/${item.productId}`)
                                    }
                                >
                                    Details
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
                    No purchase history available for the selected period.
                </p>
            )
          )}
        </div>
      ) : (
        <div style={styles.loginContainer}>
          <h3>🔒 You must be logged in to view your purchase history.</h3>
          <button style={styles.loginButton} onClick={() => navigate("/Login")}>
            Login
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
    page: {
        padding: "1rem",
        maxWidth: "1200px",
        margin: "auto",
        fontFamily: "Inter, Arial, sans-serif",
        lineHeight: "1.6",
      },
      title: {
        textAlign: "center",
        marginBottom: "1.5rem",
        color: "#333",
        fontSize: "2rem",
        fontWeight: "600",
      },
      controlsContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        marginBottom: "1.5rem",
        padding: "1rem",
        border: "1px solid #e0e0e0",
        borderRadius: "10px",
        backgroundColor: "#fefefe",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      },
      filterGroup: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        flexWrap: "wrap",
      },
      label: {
        fontWeight: "bold",
        color: "#555",
        fontSize: "0.95rem",
      },
      monthInput: {
        padding: "0.6rem 0.8rem",
        borderRadius: "5px",
        border: "1px solid #ccc",
        flexGrow: 1,
        minWidth: "150px",
        fontSize: "0.9rem",
      },
      applyButton: {
        padding: "0.6rem 1.2rem",
        backgroundColor: "#28a745",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "0.95rem",
        transition: "background-color 0.2s ease, transform 0.1s ease",
      },
      "applyButton:hover": {
        backgroundColor: "#218838",
        transform: "translateY(-1px)",
      },
      sortGroup: {
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem",
        justifyContent: "center",
      },
      sortButton: {
        padding: "0.6rem 1rem",
        backgroundColor: "#f0f0f0",
        color: "#333",
        border: "1px solid #d0d0d0",
        borderRadius: "5px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "0.3rem",
        fontSize: "0.95rem",
        transition: "background-color 0.2s ease, border-color 0.2s ease",
      },
      sortButtonActive: {
        backgroundColor: "#007bff",
        color: "white",
        borderColor: "#007bff",
        boxShadow: "0 2px 5px rgba(0,123,255,0.2)",
      },
      "sortButton:hover": {
        backgroundColor: "#e2e6ea",
      },
      "sortButtonActive:hover": {
        backgroundColor: "#0056b3",
      },
      icon: {
        width: "18px",
        height: "18px",
      },
      totalSummaryText: { // Updated from totalOrdersText
        fontWeight: "bold",
        fontSize: "1.2rem",
        marginBottom: "1.2rem",
        textAlign: "center",
        color: "#333",
        backgroundColor: "#e6f7ff",
        padding: "0.8rem",
        borderRadius: "8px",
        border: "1px solid #b3e0ff",
      },
      card: {
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        padding: "1.5rem",
        marginBottom: "1.5rem",
        backgroundColor: "#ffffff",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
      },
      header: {
        display: "flex",
        justifyContent: "space-between",
        flexWrap: "wrap",
        marginBottom: "1rem",
        fontWeight: "bold",
        borderBottom: "2px solid #f0f0f0",
        paddingBottom: "0.8rem",
        fontSize: "1rem",
        gap: "0.5rem",
      },
      date: {
        color: "#666",
        fontSize: "0.95rem",
        display: "flex",
        alignItems: "center",
        gap: "0.25rem",
      },
      total: {
        color: "#28a745",
        fontSize: "1.3rem",
        fontWeight: "700",
      },
      tableContainer: {
        overflowX: "auto",
        marginTop: "1rem",
      },
      table: {
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "0.8rem",
        fontSize: "0.9rem",
      },
      tableHeader: {
        backgroundColor: "#f8f9fa",
        borderBottom: "1px solid #e0e0e0",
        padding: "0.8rem",
        textAlign: "left",
        fontWeight: "bold",
        color: "#555",
      },
      tableRow: {
        "&:nth-child(even)": {
          backgroundColor: "#fcfcfc",
        },
        "&:hover": {
          backgroundColor: "#f5f5f5",
        },
      },
      tableCell: {
        borderBottom: "1px solid #eee",
        padding: "0.8rem",
        verticalAlign: "top",
        color: "#333",
      },
      detailsText: {
        fontSize: "0.85rem",
        color: "#777",
        display: "block",
        marginTop: "0.25rem",
      },
      categoryText: {
        fontSize: "0.85rem",
        color: "#5a5a5a",
        display: "block",
        marginTop: "0.25rem",
        fontWeight: "bold",
      },
      phoneLink: {
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        color: "#0056b3",
        textDecoration: "none",
        fontWeight: "normal",
        fontSize: "0.85rem",
      },
      noHistoryText: {
        textAlign: "center",
        color: "#777",
        padding: "2rem",
        fontSize: "1.1rem",
        backgroundColor: "#fdfdfd",
        borderRadius: "8px",
        border: "1px dashed #ccc",
        marginTop: "2rem",
      },
      loginContainer: {
        textAlign: "center",
        marginTop: "4rem",
        padding: "2rem",
        border: "1px solid #d0d0d0",
        borderRadius: "12px",
        maxWidth: "450px",
        margin: "4rem auto",
        boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
        backgroundColor: "#fff",
      },
      loginButton: {
        marginTop: "1.5rem",
        padding: "0.9rem 2.5rem",
        fontSize: "1.2rem",
        backgroundColor: "#1976d2",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "background-color 0.3s ease, transform 0.1s ease",
        fontWeight: "bold",
      },
      "loginButton:hover": {
        backgroundColor: "#115293",
        transform: "translateY(-2px)",
      },
      detailsBtn: {
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        padding: "0.5rem 1rem",
        cursor: "pointer",
        transition: "background-color 0.2s",
        "&:hover": {
          backgroundColor: "#0056b3",
        },
      },
      productCardHeader: {
        display: "flex",
        alignItems: "center",
        gap: "1.5rem",
        marginBottom: "1rem",
        borderBottom: "1px solid #f0f0f0",
        paddingBottom: "1rem",
      },
      productImage: {
        width: "80px",
        height: "80px",
        objectFit: "cover",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      },
      productInfoSummary: {
        flexGrow: 1,
      },
      productNameTitle: {
        fontSize: "1.4rem",
        color: "#333",
        marginBottom: "0.3rem",
      },
      productShortDes: {
        fontSize: "0.9rem",
        color: "#666",
        marginBottom: "0.5rem",
      },
      productStats: {
        fontSize: "1rem",
        fontWeight: "bold",
        color: "#555",
      },
      productSellerInfo: {
        fontSize: "0.9rem",
        color: "#777",
        marginTop: "0.5rem",
      },
      sellerNameTitle: {
        fontSize: "1.8rem",
        color: "#007bff",
        marginBottom: "0.5rem",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
      },
      sellerPhoneInfo: {
        fontSize: "1rem",
        color: "#555",
        marginBottom: "1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
      },
      sellerStats: {
        fontSize: "1.1rem",
        color: "#333",
        lineHeight: "1.5",
        backgroundColor: "#e0f7fa",
        padding: "1rem",
        borderRadius: "8px",
        border: "1px solid #b2ebf2",
      },
};
export default CustomerHistoryPage;
