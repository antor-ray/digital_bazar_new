import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CustomerRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    customer_name: '',
    password: '',
    city: '',
    region: '',
    detail_address: '',
    phone_number: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch("http://localhost:4000/register", {  // 🔁 Replace PORT with your backend port
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess("Registration successful!");
      navigate("/");
    } catch (err) {
      console.error("Registration error:", err.message);
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center' }}>Customer Registration</h2>
      <form onSubmit={handleSubmit}>
        {[
          'email',
          'customer_name',
          'password',
          'city',
          'region',
          'detail_address',
          'phone_number',
        ].map((field) => (
          <div key={field} style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', textTransform: 'capitalize' }}>
              {field.replace('_', ' ')}:
            </label>
            <input
              type={field === 'password' ? 'password' : 'text'}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
        ))}

        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', fontSize: '16px', border: 'none', borderRadius: '4px' }}>
          Submit
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      {success && <p style={{ color: 'green', marginTop: '10px' }}>{success}</p>}
    </div>
  );
};

export default CustomerRegistration;
