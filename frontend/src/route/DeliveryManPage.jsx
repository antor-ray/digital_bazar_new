import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/DeliveryManPage.css"; // Add this CSS file

const DeliveryManPage = () => {
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    fetchProposals();
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

  return (
    <div className="delivery-container">
      <div className="header">
        <h1>Deliveryman Dashboard</h1>
        <div className="header-buttons">
          <button className="header-btn">👤 Profile</button>
          <button className="header-btn">🔔 Notifications</button>
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
                <td colSpan="5" className="empty-row">No delivery proposals at the moment.</td>
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
