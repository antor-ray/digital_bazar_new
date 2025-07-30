import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../css/Login.css";

const Login = () => {
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [showRoleSelect, setShowRoleSelect] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch('http://localhost:4000/Login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(loginData)
            });
            const data = await response.json();

            if (response.ok) {
                const { token, role,name,email,id} = data;

                localStorage.setItem('token', token);       // optional: store token
                localStorage.setItem('role', role);         // ✅ save role in localStorage
                localStorage.setItem('email', email);       // optional: store email   
                localStorage.setItem('userId', id);    // optional: store user ID 
                localStorage.setItem('name', name); // optional: store user name

                setMessage({ type: 'success', text: 'Login successful! Redirecting...' });

                // Redirect based on role
                if (role === 'seller') {
                    window.location.href = '/SellerPage';
                } else if (role === 'customer') {
                    window.location.href = '/';
                } else if (role === 'delivery_man') {
                    window.location.href = '/DeliveryManPage';
                }
                // setTimeout(() => window.location.href = '/', 1000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Login failed' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Login failed. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleRoleSelect = (e) => {
        const role = e.target.value;
        if (role === 'seller') navigate('/SellerRegistration');
        else if (role === 'customer') navigate('/CustomerRegistration');
        else if (role === 'deliveryman') navigate('/DeliveryManRegistration');
    };

    return (
        <div className="seller-auth-wrapper">
            <div className="seller-auth-card">
                <div className="seller-auth-header">
                    <h1>Login</h1>
                    <p>Welcome back! Please sign in to your account.</p>
                </div>
                <div className="seller-auth-body">
                    {message.text && (
                        <div className={`message-box ${message.type}`}>{message.text}</div>
                    )}
                    <form onSubmit={handleSubmit} className="auth-form">
                        <input type="email" name="email" value={loginData.email} onChange={handleChange} placeholder="Email" required />
                        <input type="password" name="password" value={loginData.password} onChange={handleChange} placeholder="Password" required />
                        <button type="submit" disabled={loading}>{loading ? 'Signing In...' : 'Sign In'}</button>
                    </form>

                    <div className="auth-toggle">
                        <p>Don't have an account?</p>
                        <button onClick={() => setShowRoleSelect(true)}>Register</button>

                        {showRoleSelect && (
                            <select onChange={handleRoleSelect} defaultValue="">
                                <option value="" disabled>Select Role</option>
                                <option value="customer">Customer</option>
                                <option value="seller">Seller</option>
                                <option value="deliveryman">Deliveryman</option>
                            </select>
                        )}
                    </div>

                    <div className="back-link">
                        <a href="/">&larr; Back to Store</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
