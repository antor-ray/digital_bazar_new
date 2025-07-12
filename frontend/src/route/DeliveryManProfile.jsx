import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/DeliveryManProfile.css';

const DeliveryManProfile = () => {
    const [deliveryMan, setDeliveryMan] = useState({
        email: '',
        name: '',
        password: '',
        city: '',
        region: '',
        phone_number: '',
    });

    const [editing, setEditing] = useState(false);

    useEffect(() => {
        fetchDeliveryManData();
    }, []);

    const fetchDeliveryManData = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/deliveryman/profile', {
                withCredentials: true,
            });
            setDeliveryMan(response.data.deliveryMan[0]); // Assuming deliveryMan is returned as array
        } catch (error) {
            console.error('Error fetching delivery man data:', error);
        }
    };

    const handleChange = (e) => {
        setDeliveryMan({ ...deliveryMan, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            await axios.put('http://localhost:4000/api/deliveryman/profile', deliveryMan, {
                withCredentials: true,
            });
            setEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    return (
        <div className="profile-container">
            <h2 className="profile-title">Delivery Man Profile</h2>
            <div className="profile-form">
                {Object.keys(deliveryMan).map((key) => (
                    <div className="form-group" key={key}>
                        <label>{key.replace(/_/g, ' ').toUpperCase()}</label>
                        <input
                            type={key === 'password' ? 'password' : 'text'}
                            name={key}
                            value={deliveryMan[key]}
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
                                    fetchDeliveryManData();
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

export default DeliveryManProfile;