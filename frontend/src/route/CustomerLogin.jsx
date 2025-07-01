import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CustomerLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials:"include",
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      console.log(data.token);
      localStorage.setItem('token', data.token);
      console.log(localStorage.getItem('token'));

      if (res.ok) {
        console.log('Login Success:', data.customer);
        navigate('/');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Server error');
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Customer Login</h2>
      <form onSubmit={handleLogin} style={formStyle}>
        <div style={inputGroup}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>
        <div style={inputGroup}>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        <button type="submit" style={loginButton}>Login</button>

        <button
          type="button"
          style={registerButton}
          onClick={() => navigate('/CustomerRegistration')}
        >
          Not registered? Register here
        </button>

        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </form>
    </div>
  );
};

// Styling
const containerStyle = {
  maxWidth: '400px',
  margin: '60px auto',
  padding: '30px',
  border: '1px solid #ccc',
  borderRadius: '10px',
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
};

const inputGroup = {
  marginBottom: '15px',
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  fontSize: '16px',
  marginTop: '5px',
};

const loginButton = {
  backgroundColor: '#007bff',
  color: 'white',
  padding: '10px',
  fontSize: '16px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginBottom: '10px',
};

const registerButton = {
  backgroundColor: '#6c757d',
  color: 'white',
  padding: '10px',
  fontSize: '14px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

export default CustomerLogin;
