import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>LOGIN AS</h1>
      <div style={{ marginTop: '30px' }}>
        <button onClick={() => navigate('/CustomerLogin')} style={buttonStyle}>Customer</button>
        <button onClick={() => navigate('/seller')} style={buttonStyle}>Seller</button>
        <button onClick={() => navigate('/delivery')} style={buttonStyle}>Delivery Man</button>
        <button onClick={() => navigate('/admin')} style={buttonStyle}>Admin</button>
      </div>
    </div>
  );
};

const buttonStyle = {
  margin: '10px',
  padding: '12px 24px',
  fontSize: '16px',
  cursor: 'pointer'
};

export default Home;
