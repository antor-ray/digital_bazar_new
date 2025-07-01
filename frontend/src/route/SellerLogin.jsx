// SellerAuth.jsx
import React, { useState } from 'react';
import "../css/SellerLogin.css";

const SellerAuth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [registerData, setRegisterData] = useState({
        email: '', password: '', confirmPassword: '',
        business_name: '', about: '', phone_number: '', address: ''
    });

    const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
    const handleRegisterChange = (e) => setRegisterData({ ...registerData, [e.target.name]: e.target.value });

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const response = await fetch('http://localhost:4000/api/v1/seller/login', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                credentials: 'include', body: JSON.stringify(loginData)
            });
            const data = await response.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
                setTimeout(() => { window.location.href = '/seller/dashboard'; }, 2000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Login failed' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Login failed. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
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
            const response = await fetch('http://localhost:4000/api/v1/seller/register', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                credentials: 'include', body: JSON.stringify(dataToSend)
            });
            const data = await response.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Registration successful! Please login.' });
                setTimeout(() => {
                    setIsLogin(true);
                    setRegisterData({ email: '', password: '', confirmPassword: '', business_name: '', about: '', phone_number: '', address: '' });
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

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setMessage({ type: '', text: '' });
        setLoginData({ email: '', password: '' });
        setRegisterData({ email: '', password: '', confirmPassword: '', business_name: '', about: '', phone_number: '', address: '' });
    };

    return (
        <div className="seller-auth-wrapper">
            <div className="seller-auth-card">
                <div className="seller-auth-header">
                    <h1>{isLogin ? 'Seller Login' : 'Seller Registration'}</h1>
                    <p>{isLogin ? 'Welcome back! Please sign in to your account.' : 'Join our marketplace as a seller!'}</p>
                </div>

                <div className="seller-auth-body">
                    {message.text && (
                        <div className={`message-box ${message.type}`}>{message.text}</div>
                    )}

                    {isLogin ? (
                        <form onSubmit={handleLogin} className="auth-form">
                            <input type="email" name="email" value={loginData.email} onChange={handleLoginChange} placeholder="Email" required />
                            <input type="password" name="password" value={loginData.password} onChange={handleLoginChange} placeholder="Password" required />
                            <button type="submit" disabled={loading}>{loading ? 'Signing In...' : 'Sign In'}</button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister} className="auth-form">
                            <input type="email" name="email" value={registerData.email} onChange={handleRegisterChange} placeholder="Email" required />
                            <input type="text" name="business_name" value={registerData.business_name} onChange={handleRegisterChange} placeholder="Business Name" required />
                            <input type="tel" name="phone_number" value={registerData.phone_number} onChange={handleRegisterChange} placeholder="Phone Number" required />
                            <textarea name="address" value={registerData.address} onChange={handleRegisterChange} placeholder="Address" required />
                            <textarea name="about" value={registerData.about} onChange={handleRegisterChange} placeholder="About Your Business" />
                            <input type="password" name="password" value={registerData.password} onChange={handleRegisterChange} placeholder="Password" required />
                            <input type="password" name="confirmPassword" value={registerData.confirmPassword} onChange={handleRegisterChange} placeholder="Confirm Password" required />
                            <button type="submit" disabled={loading}>{loading ? 'Creating Account...' : 'Create Account'}</button>
                        </form>
                    )}

                    <div className="auth-toggle">
                        <p>{isLogin ? "Don't have a seller account?" : 'Already have an account?'}</p>
                        <button onClick={toggleAuthMode}>{isLogin ? 'Register as Seller' : 'Sign In Instead'}</button>
                    </div>

                    <div className="back-link">
                        <a href="/">&larr; Back to Store</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerAuth;
