import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./route/Home";
import CustomerRegistration from "./route/CustomerRegistration";
import LoginOption from "./route/LoginOption";
import ProductDetails from "./route/ProductDetails";
import CartProducts from "./route/CartProducts";
import CategoryPage from "./route/CategoryPage";
import WishlistPage from "./route/WishList";
import SellerDashboard from "./route/SellerPage";
import SellerProfilePage from "./route/SellerProfilepage";
import CheckoutPage from './route/CheckoutPage';
import PaymentSuccess from './route/PaymentSuccess';
import DeliveryManRegistration from './route/DeliveryManRegistration';
import DeliveryManPage from './route/DeliveryManPage'
import CustomerProfile from './route/CustomerProfile';
import DeliveryManProfile from './route/DeliveryManProfile';
import SellerSellingHistoryPage from "./route/SellerSellingHistoryPage";
import SellerRegistration from "./route/SellerRegistration";
import Login from "./route/Login";
import CustomerHistoryPage from "./route/CustomerHistory";
import DeliveryManHistoryPage from "./route/DeliveryManHistory";

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
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
          <Route path="/WishList" element={<WishlistPage />} />
          <Route path="/SellerPage" element={<SellerDashboard />} />
          <Route path="/SellerProfilePage" element={<SellerProfilePage />} />

          <Route
            path="/DeliveryManRegistration"
            element={<DeliveryManRegistration/>}
          />
          <Route path="/deliveryManPage" element={<DeliveryManPage />} />

          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/paymentPage" element={<PaymentSuccess />} />
          <Route path="/customerProfile" element={<CustomerProfile />} />
          <Route path="/deliveryman/profile" element={<DeliveryManProfile />} />
          <Route path="/SellerPage/SellerSellingHistoryPage" element={<SellerSellingHistoryPage />} />
          <Route path="/SellerRegistration" element={<SellerRegistration />} />
          <Route path="/Login" element={<Login/>}/>
          <Route path="/CustomerHistory" element={<CustomerHistoryPage/>}/>
          <Route path="/DeliveryManHistory" element={<DeliveryManHistoryPage/>}/>
        </Routes>
      </Router>
    </div>
  );
};

export default App;
