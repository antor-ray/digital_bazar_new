import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/DeliveryManPage.css";
import { useNavigate } from "react-router-dom";

const DeliveryManPage = () => {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);

  const email = localStorage.getItem('email');

  useEffect(() => {
    fetchProposals();
    const interval = setInterval(() => {
      fetchProposals();
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchProposals();
    const interval = setInterval(fetchProposals, 500);

    const handlePopState = async () => {
      try {
        await axios.post("http://localhost:4000/deliveryman/logout", {}, {
          withCredentials: true,
        });
        console.log("Logged out due to back button.");
      } catch (err) {
        console.error("Auto logout on back failed:", err);
      }
    };

    // Logout when user presses browser back
    window.addEventListener("popstate", handlePopState);

    return () => {
      clearInterval(interval);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);


  const fetchProposals = async () => {
    try {
      const res = await axios.get("http://localhost:4000/proposal", {
        withCredentials: true,
      });
      setProposals(res.data);
    } catch (err) {
      console.error("Failed to fetch proposals:", err);
    }
  };

  const respondToProposal = async (orderId, response) => {
    try {
      await axios.post(
        "http://localhost:4000/respond",
        { orderId, response },
        { withCredentials: true }
      );
      fetchProposals();
    } catch (err) {
      console.error("Response failed:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:4000/deliveryman/logout", {}, {
        withCredentials: true,
      });
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const [dropdownVisible, setDropdownVisible] = useState(false);

  return (
    <div className="delivery-container">
      <div className="header">
        <h1>Deliveryman Dashboard</h1>
        <div className="header-buttons profile-dropdown-container">
          <button
            className="profile-button"
            onClick={() => setDropdownVisible(!dropdownVisible)}
          >
            👤 {email}
          </button>
          {dropdownVisible && (
            <ul className="profile-dropdown">
              <li onClick={() => navigate("/DeliveryManHistory")}>History</li>
              <li onClick={() => navigate("/deliveryman/profile")}>Profile</li>


              <li onClick={handleLogout}>Logout</li>
            </ul>
          )}
        </div>
      </div>

      <div className="table-container">
        <table className="proposal-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Address</th>
              <th>Total Cost</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {proposals.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-row">
                  No delivery proposals at the moment.
                </td>
              </tr>
            ) : (
              proposals.map((p) => (
                <tr key={p.order_id}>
                  <td>{p.order_id}</td>
                  <td>{p.address}</td>
                  <td>৳{p.total_cost}</td>
                  <td>{p.status}</td>
                  <td>
                    {p.status === "PENDING" ? (
                      <div className="action-buttons">
                        <button
                          className="accept-btn"
                          onClick={() => respondToProposal(p.order_id, "ACCEPTED")}
                        >
                          Accept
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => respondToProposal(p.order_id, "REJECTED")}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span className="no-action">No actions</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeliveryManPage;

