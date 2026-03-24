import React, { useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../../constants';
import './Login.css';

const LOGIN_ENDPOINT = `${BACKEND_URL}/auth/login`;

function Login() {
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
        setMessage('Login successful!');
        setLoading(false);
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
      </div>
    </div>
  );
}

export default Login;
