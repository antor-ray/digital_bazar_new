import React, { useState } from 'react';
import "../css/Login.css";

const SellerRegistration = () => {
    const [registerData, setRegisterData] = useState({
        email: '', password: '', confirmPassword: '',
        business_name: '', about: '', phone_number: '', address: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        if (registerData.password !== registerData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match!' });
            setLoading(false);
            return;
        }

        const requiredFields = ['email', 'password', 'business_name', 'phone_number', 'address'];
        const missing = requiredFields.filter(field => !registerData[field]);
        if (missing.length > 0) {
            setMessage({ type: 'error', text: 'Please fill in all required fields!' });
            setLoading(false);
            return;
        }

        try {
            const { confirmPassword, ...dataToSend } = registerData;
            const response = await fetch('http://localhost:4000/SellerRegister', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(dataToSend)
            });
            const data = await response.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Registration successful! Please login.' });
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Registration failed' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Registration failed. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="seller-auth-wrapper">
            <div className="seller-auth-card">
                <div className="seller-auth-header">
                    <h1>Seller Registration</h1>
                    <p>Join our marketplace as a seller!</p>
                </div>
                <div className="seller-auth-body">
                    {message.text && (
                        <div className={`message-box ${message.type}`}>{message.text}</div>
                    )}
                    <form onSubmit={handleSubmit} className="auth-form">
                        <input type="email" name="email" value={registerData.email} onChange={handleChange} placeholder="Email" required />
                        <input type="text" name="business_name" value={registerData.business_name} onChange={handleChange} placeholder="Business Name" required />
                        <input type="tel" name="phone_number" value={registerData.phone_number} onChange={handleChange} placeholder="Phone Number" required />
                        <textarea name="address" value={registerData.address} onChange={handleChange} placeholder="Address" required />
                        <textarea name="about" value={registerData.about} onChange={handleChange} placeholder="About Your Business" />
                        <input type="password" name="password" value={registerData.password} onChange={handleChange} placeholder="Password" required />
                        <input type="password" name="confirmPassword" value={registerData.confirmPassword} onChange={handleChange} placeholder="Confirm Password" required />
                        <button type="submit" disabled={loading}>{loading ? 'Creating Account...' : 'Create Account'}</button>
                    </form>

                    <div className="auth-toggle">
                        <p>Already have an account?</p>
                        <a href="/SellerLogin">Sign In Instead</a>
                    </div>

                    <div className="back-link">
                        <a href="/">&larr; Back to Store</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerRegistration;
