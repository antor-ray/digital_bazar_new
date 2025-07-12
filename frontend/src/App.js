import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./route/Home";
import CustomerLogin from "./route/CustomerLogin";
import CustomerRegistration from "./route/CustomerRegistration";
import LoginOption from "./route/LoginOption";
import ProductDetails from "./route/ProductDetails";
import CartProducts from "./route/CartProducts";
import CategoryPage from "./route/CategoryPage";
import SellerAuth from "./route/SellerLogin";
import WishlistPage from "./route/WishList";
import SellerDashboard from "./route/SellerPage";
import SellerProfilePage from "./route/SellerProfilepage";
import CheckoutPage from './route/CheckoutPage';
import PaymentSuccess from './route/PaymentSuccess';
import DeliveryManLogin from './route/DeliveryManLogin';
import DeliveryManRegistration from './route/DeliveryManRegistration';
import DeliveryManPage from './route/DeliveryManPage'
import CustomerProfile from './route/CustomerProfile';
import DeliveryManProfile from './route/DeliveryManProfile';

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/CustomerLogin" element={<CustomerLogin />} />
          <Route
            path="/CustomerRegistration"
            element={<CustomerRegistration />}
          />
          <Route path="/LoginOption" element={<LoginOption />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/CartItems" element={<CartProducts />} />
          <Route
            path="/CategoryPage/:categoryName"
            element={<CategoryPage />}
          />
          <Route path="/SellerLogin" element={<SellerAuth />} />
          <Route path="/WishList" element={<WishlistPage />} />
          <Route path="/SellerPage" element={<SellerDashboard />} />
          <Route path="/SellerProfilePage" element={<SellerProfilePage />} />

          <Route path="/DeliveryManLogin" element={<DeliveryManLogin />} />
          <Route
            path="/registerDeliveryMan"
            element={<DeliveryManRegistration />}
          />
          <Route path="/deliveryManPage" element={<DeliveryManPage />} />

          <Route path="/checkout/:storedTotal" element={<CheckoutPage />} />
          <Route path="/paymentPage" element={<PaymentSuccess />} />
          <Route path="/customerProfile" element={<CustomerProfile />} />
          <Route path="/deliveryman/profile" element={<DeliveryManProfile />} />


        </Routes>
      </Router>
    </div>
  );
};

export default App;
