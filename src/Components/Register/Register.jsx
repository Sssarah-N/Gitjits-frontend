import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { BACKEND_URL } from '../../constants';
import EmailInput from '../EmailInput/EmailInput';
import './Register.css';

const REGISTER_FORM_ENDPOINT = `${BACKEND_URL}/auth/register-form`;

function Register() {
  const [formDefinition, setFormDefinition] = useState(null);
  const [formData, setFormData] = useState({});
  const [roleOptions, setRoleOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get(REGISTER_FORM_ENDPOINT)
      .then((response) => {
        console.log('Form definition:', response.data);
        setFormDefinition(response.data);
        
        const roleField = response.data.form.find(field => field.choices_endpoint);
        if (roleField) {
          return axios.get(`${BACKEND_URL}${roleField.choices_endpoint}`);
        }
        return null;
      })
      .then((rolesResponse) => {
        if (rolesResponse) {
          console.log('Role options:', rolesResponse.data);
          setRoleOptions(rolesResponse.data.options || []);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load registration form.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="register-wrapper">
        <div className="register-card">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="register-wrapper">
        <div className="register-card">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  const handleChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    const registerUrl = `${BACKEND_URL}${formDefinition.submit_url}`;
    
    axios.post(registerUrl, formData)
      .then((response) => {
        console.log('Registration successful:', response.data);
        setMessage('Registration successful! You can now login.');
        setFormData({});
        setSubmitting(false);
      })
      .catch((error) => {
        console.error('Registration error:', error);
        const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
        setError(errorMessage);
        setSubmitting(false);
      });
  };

  return (
    <div className="register-wrapper">
      <div className="register-card">
        <h1>Register</h1>
        
        <form onSubmit={handleSubmit}>
          {formDefinition.form.map((field) => (
            <div key={field.fld_nm} className="form-group">
              <label htmlFor={field.fld_nm}>
                {field.question}
                {!field.optional && <span className="required">*</span>}
              </label>
              
              {field.description && (
                <p className="field-description">{field.description}</p>
              )}
              
              {field.choices_endpoint ? (
                <select
                  id={field.fld_nm}
                  value={formData[field.fld_nm] || field.default || ''}
                  onChange={(e) => handleChange(field.fld_nm, e.target.value)}
                  required={!field.optional}
                  className="form-select"
                >
                  {roleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                field.fld_nm === 'email' ? (
                  <EmailInput field={field} formData={formData} handleChange={handleChange} />
                ) : (
                <input
                  type={field.input_type || 'text'}
                  id={field.fld_nm}
                  value={formData[field.fld_nm] || ''}
                  onChange={(e) => handleChange(field.fld_nm, e.target.value)}
                    required={!field.optional}
                    className="form-input"
                  />
                )
              )}
            </div>
          ))}
          
          <button type="submit" className="register-button" disabled={submitting}>
            {submitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        {message && (
          <div className="success-message">
            {message}
            <div style={{ marginTop: '10px' }}>
              <Link to="/login" className="login-link">
                Go to Login
              </Link>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default Register;
