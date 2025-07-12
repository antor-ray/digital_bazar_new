import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/CustomerProfile.css';

const CustomerProfile = () => {
  const [customer, setCustomer] = useState({
    email: '',
    customer_name: '',
    password: '',
    city: '',
    region: '',
    detail_address: '',
    phone_number: '',
  });

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
        const response =await axios.get("http://localhost:4000/api/customer/profile",{
            withCredentials:true,
        });
      setCustomer(response.data.customer[0]);
    } catch (error) {
      console.error('Error fetching customer data:', error);
    }
  };

  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await axios.put("http://localhost:4000/api/customer/profile", customer,{
        withCredentials:true,
      }); 
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="profile-container">
      <h2 className="profile-title">Customer Profile</h2>
      <div className="profile-form">
        {Object.keys(customer).map((key) => (
          <div className="form-group" key={key}>
            <label>{key.replace(/_/g, ' ').toUpperCase()}</label>
            <input
              type={key === 'password' ? 'password' : 'text'}
              name={key}
              value={customer[key]}
              onChange={handleChange}
              disabled={!editing}
            />
          </div>
        ))}

        <div className="button-group">
          {!editing ? (
            <button onClick={() => setEditing(true)} className="edit-button">
              Edit
            </button>
          ) : (
            <>
              <button onClick={handleSave} className="save-button">
                Save
              </button>
              <button
                onClick={() => {
                  fetchCustomerData();
                  setEditing(false);
                }}
                className="cancel-button"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;