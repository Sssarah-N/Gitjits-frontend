import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../../constants';
import './Login.css';

const LOGIN_ENDPOINT = `${BACKEND_URL}/auth/login`;

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    axios.post(LOGIN_ENDPOINT, { username, password })
      .then((response) => {
        console.log('Login response:', response.data);
        
        // Save user data and token to localStorage
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } else {
          // If no user object in response, store username
          localStorage.setItem('user', JSON.stringify({ username }));
        }
        
        setMessage('Login successful! Redirecting...');
        setLoading(false);
        
        // Redirect to profile page after 1 second
        setTimeout(() => {
          navigate('/profile');
        }, 1000);
      })
      .catch((error) => {
        console.error('Login error:', error);
        setMessage('Login failed. Please check your credentials.');
        setLoading(false);
      });
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        {message && (
          <div className={message.includes('successful') ? 'success-message' : 'error-message'}>
            {message}
          </div>
        )}
        
        <div className="register-link-container">
          <p>Don&apos;t have an account?</p>
          <Link to="/register" className="register-link">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
