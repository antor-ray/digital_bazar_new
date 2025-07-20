import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
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
      const res = await axios.post('http://localhost:4000/login', {
        ...formData,
      }, {
        withCredentials: true,
      });

      const data = res.data;
      console.log("Login response data:", data);

      // Store the token and role from the login response
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.role);

      console.log("Stored token:", localStorage.getItem('token'));
      console.log("Stored userRole:", localStorage.getItem('userRole'));

      if (res.status === 200) {
        console.log('Login successful, attempting to confirm authentication...');

        // NEW: Confirm authentication by calling a protected endpoint
        try {
          const authConfirmRes = await axios.get("http://localhost:4000/isAuthenticate", {
            withCredentials: true, // This will send the newly set cookie
          });

          if (authConfirmRes.status === 200) {
            console.log('Authentication confirmed successfully.');
            // Navigate based on the role received from the backend's login response
            switch (data.role) {
              case 'customer':
                navigate('/'); // Navigate to customer homepage
                break;
              case 'seller':
                navigate('/SellerPage'); // Navigate to seller dashboard
                break;
              case 'delivery_man':
                navigate('/DeliveryManPage'); // Navigate to delivery man dashboard
                break;
              default:
                navigate('/'); // Fallback for unknown roles
            }
          } else {
            // This case should ideally not be hit if backend is consistent
            console.error("Authentication confirmation failed unexpectedly:", authConfirmRes.data);
            setError('Authentication failed after login. Please try again.');
            // Clear stored data if confirmation fails
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
          }
        } catch (authError) {
          console.error('Error during authentication confirmation:', authError);
          // If the /isAuthenticate call fails, it means the token is not valid or session is not established
          setError('Failed to confirm authentication. Please try again.');
          // Clear stored data if confirmation fails
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
        }
      } else {
        // This block handles non-200 responses from the /login endpoint itself
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Server error or network issue');
      }
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h2>
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

// Styling (kept from original)
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
  borderRadius: '5px',
  border: '1px solid #ddd',
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
  transition: 'background-color 0.3s ease',
};

const registerButton = {
  backgroundColor: '#6c757d',
  color: 'white',
  padding: '10px',
  fontSize: '14px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
};

export default LoginPage;
