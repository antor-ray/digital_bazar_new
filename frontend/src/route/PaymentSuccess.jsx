import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/PaymentSuccess.css"; // Link to CSS file

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(window.location.search);
  const status = queryParams.get("status");
  const isSuccess = status === "success";

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className={`payment-page ${isSuccess ? "success" : "fail"}`}>
      <div className="payment-card">
        <div className={`icon ${isSuccess ? "icon-success" : "icon-fail"}`}>
          {isSuccess ? "✔️" : "❌"}
        </div>
        <h1 className="title">
          {isSuccess ? "Payment Successful!" : "Payment Failed"}
        </h1>
        <p className="message">
          {isSuccess
            ? "Thank you for your purchase. Your payment has been processed successfully."
            : "Sorry! Your payment could not be completed. Please try again."}
        </p>
        <button className="home-button" onClick={handleGoHome}>
          Go to Home Page
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
