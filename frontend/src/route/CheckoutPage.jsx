import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../css/checkout.css";

const CheckoutPage = () => {
    const { storedTotal } = useParams();
    console.log(storedTotal);
    const [grandTotal, setGrandTotal] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [address, setAddress] = useState({
        city: "",
        region: "",
        roadSector: "",
    });

    const navigate = useNavigate();

    // Get grandTotal from localStorage
    useEffect(() => {
        if (storedTotal) {
            setGrandTotal(parseFloat(storedTotal));
        }
    }, []);

    const handlePlaceOrder = async () => {
        if (!address.city || !address.region || !address.roadSector) {
            alert("Please fill in all address fields.");
            return;
        }

        try {
            const orderResponse = await axios.post(
                "http://localhost:4000/api/orders",
                {
                    address,
                    grandTotal,
                    paymentMethod,
                },
                { withCredentials: true }
            );

            const orderId = orderResponse.data.orderId;

           // console.log(orderId);
          const propres=  await axios.post("http://localhost:4000/deliveryman/sendproposal", {
                orderId,
                address
            }, { withCredentials: true });

            //  transfer items from cart to order_items
            const transferItems = await axios.post(
                "http://localhost:4000/transfer/item",
                {
                    orderId
                },
                { withCredentials: true }
            );

            if (paymentMethod === "cash") {
                console.log("pyamebt ");
                alert("Order placed with Cash on Delivery!");
                localStorage.removeItem("grandTotal");
                navigate("/");
            } else {
                const paymentRes = await axios.post(
                    "http://localhost:4000/ssl-request",
                    {
                        amount: grandTotal,
                        address,
                        orderId,
                    },
                    { withCredentials: true }
                );

                window.location.href = paymentRes.data.GatewayPageURL;
            }
        } catch (err) {
            console.error("Order placement failed:", err);
            alert("Order placement or payment initiation failed.");
        }
    };


    return (
        <div className="checkout-container">
            <h2 className="checkout-title">Checkout</h2>

            <div className="checkout-content">
                <div className="grand-total-box">
                    <h3>Grand Total: ৳{grandTotal}</h3>
                </div>

                <div className="payment-section">
                    <h3>Shipping Address</h3>
                    <input
                        type="text"
                        placeholder="City"
                        value={address.city}
                        onChange={e => setAddress({ ...address, city: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Region"
                        value={address.region}
                        onChange={e => setAddress({ ...address, region: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Road/Sector"
                        value={address.roadSector}
                        onChange={e =>
                            setAddress({ ...address, roadSector: e.target.value })
                        }
                    />

                    <h3>Payment Method</h3>
                    <div className="payment-options">
                        <label>
                            <input
                                type="radio"
                                name="payment"
                                value="cash"
                                checked={paymentMethod === "cash"}
                                onChange={() => setPaymentMethod("cash")}
                            />
                            Cash on Delivery
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="payment"
                                value="online"
                                checked={paymentMethod === "online"}
                                onChange={() => setPaymentMethod("online")}
                            />
                            Online (SSLCommerz)
                        </label>
                    </div>

                    <button className="place-order-btn" onClick={handlePlaceOrder}>
                        Place Order
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;