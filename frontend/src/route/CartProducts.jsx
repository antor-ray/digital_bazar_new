import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/cart.css";

const CartProducts = () => {
  const [cartItems, setCartItems] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const navigate = useNavigate();

  // Fetch cart items from backend
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const res = await axios.get("http://localhost:4000/cartItems", {
          withCredentials: true, 
        });

        const itemsWithQuantity = res.data.items.map(item => ({
          ...item,
          quantity: 1,
        }));

        setCartItems(itemsWithQuantity);
      } catch (error) {
        console.error("Error fetching cart items:", error);
        if (error.response?.status === 401) {
          alert('please login first');
        }
      }
    };

    fetchCartItems();
  }, []);

  // Recalculate total whenever cart items or quantity changes
  useEffect(() => {
    const total = cartItems.reduce(
      (sum, item) => sum + item.selling_price * item.quantity,
      0
    );
    setGrandTotal(total);
  }, [cartItems]);

  // Quantity change handler
  const handleQuantityChange = (productId, delta) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.product_id === productId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  // Delete cart item
  const handleDelete = async (productId) => {
    try {
      await axios.delete("http://localhost:4000/api/v1/cart/delete", {
        data: { product_id: productId }, // No need for customer_id if token is used
        withCredentials: true,
        headers: {
          "Content-Type": "application/json"
        }
      });

      setCartItems(prev => prev.filter(item => item.product_id !== productId));
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  return (
    <div className="cart-container">
      <h2 className="cart-title">CART ITEMS</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Price (৳)</th>
                <th>Quantity</th>
                <th>Total (৳)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map(item => (
                <tr key={item.product_id}>
                  <td>{item.product_name}</td>
                  <td>{item.selling_price}</td>
                  <td>
                    <button onClick={() => handleQuantityChange(item.product_id, -1)}>-</button>
                    <span className="qty">{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(item.product_id, 1)}>+</button>
                  </td>
                  <td>{item.selling_price * item.quantity}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(item.product_id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cart-summary">
            <h3>Grand Total: ৳{grandTotal}</h3>
            <button className="checkout-btn" onClick={() => navigate(`/checkout/${grandTotal}`)}>
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartProducts;