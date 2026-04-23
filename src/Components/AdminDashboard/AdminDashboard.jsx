import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BACKEND_URL } from '../../constants';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, isLoggedIn, loading: authLoading, authHeader } = useAuth();
  const [activeTab, setActiveTab] = useState('parks');
  const [parks, setParks] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (!authLoading && (!isLoggedIn || !isAdmin)) {
      navigate('/login');
    }
  }, [isAdmin, isLoggedIn, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [activeTab, isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'parks') {
        const res = await axios.get(`${BACKEND_URL}/parks`);
        setParks(res.data.Parks || []);
      } else if (activeTab === 'states') {
        const res = await axios.get(`${BACKEND_URL}/states`);
        setStates(res.data.States || []);
      } else if (activeTab === 'cities') {
        const res = await axios.get(`${BACKEND_URL}/cities`);
        setCities(res.data.Cities || []);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch data' });
    }
    setLoading(false);
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      if (type === 'park') {
        await axios.delete(`${BACKEND_URL}/parks/code/${id}`, authHeader());
      } else if (type === 'state') {
        const [countryCode, stateCode] = id.split('|');
        await axios.delete(`${BACKEND_URL}/countries/${countryCode}/states/${stateCode}`, authHeader());
      } else if (type === 'city') {
        await axios.delete(`${BACKEND_URL}/cities/${id}`, authHeader());
      }
      setMessage({ type: 'success', text: 'Item deleted successfully' });
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.Error || 'Failed to delete' });
    }
  };

  const handleEdit = (item, type) => {
    setEditingItem({ ...item, type });
    setFormData(item);
  };

  const handleSave = async () => {
    try {
      if (editingItem.type === 'park') {
        await axios.put(`${BACKEND_URL}/parks/id/${editingItem._id}`, formData, authHeader());
      } else if (editingItem.type === 'state') {
        await axios.put(
          `${BACKEND_URL}/countries/${editingItem.country_code}/states/${editingItem.state_code}`,
          formData,
          authHeader()
        );
      } else if (editingItem.type === 'city') {
        await axios.put(`${BACKEND_URL}/cities/${editingItem._id}`, formData, authHeader());
      }
      setMessage({ type: 'success', text: 'Item updated successfully' });
      setEditingItem(null);
      setFormData({});
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.Error || 'Failed to update' });
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setFormData({});
  };

  if (authLoading) {
    return <div className="admin-wrapper"><h1>Loading...</h1></div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-wrapper">
      <h1>Admin Dashboard</h1>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
          <button onClick={() => setMessage({ type: '', text: '' })}>×</button>
        </div>
      )}

      <div className="admin-tabs">
        <button 
          className={activeTab === 'parks' ? 'active' : ''} 
          onClick={() => setActiveTab('parks')}
        >
          Parks ({parks.length})
        </button>
        <button 
          className={activeTab === 'states' ? 'active' : ''} 
          onClick={() => setActiveTab('states')}
        >
          States ({states.length})
        </button>
        <button 
          className={activeTab === 'cities' ? 'active' : ''} 
          onClick={() => setActiveTab('cities')}
        >
          Cities ({cities.length})
        </button>
      </div>

      {editingItem && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h2>Edit {editingItem.type}</h2>
            <div className="edit-form">
              {editingItem.type === 'park' && (
                <>
                  <label>
                    Name:
                    <input
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </label>
                  <label>
                    Park Code:
                    <input
                      value={formData.park_code || ''}
                      onChange={(e) => setFormData({ ...formData, park_code: e.target.value })}
                    />
                  </label>
                  <label>
                    Description:
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </label>
                </>
              )}
              {editingItem.type === 'state' && (
                <>
                  <label>
                    Name:
                    <input
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </label>
                  <label>
                    Capital:
                    <input
                      value={formData.capital || ''}
                      onChange={(e) => setFormData({ ...formData, capital: e.target.value })}
                    />
                  </label>
                  <label>
                    Population:
                    <input
                      type="number"
                      value={formData.population || ''}
                      onChange={(e) => setFormData({ ...formData, population: parseInt(e.target.value) || 0 })}
                    />
                  </label>
                </>
              )}
              {editingItem.type === 'city' && (
                <>
                  <label>
                    Name:
                    <input
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </label>
                  <label>
                    Population:
                    <input
                      type="number"
                      value={formData.population || ''}
                      onChange={(e) => setFormData({ ...formData, population: parseInt(e.target.value) || 0 })}
                    />
                  </label>
                </>
              )}
            </div>
            <div className="edit-actions">
              <button className="save-btn" onClick={handleSave}>Save</button>
              <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-content">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {activeTab === 'parks' && (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Park Code</th>
                    <th>State</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {parks.map((park) => (
                    <tr key={park.park_code || park._id}>
                      <td>{park.name}</td>
                      <td>{park.park_code}</td>
                      <td>{Array.isArray(park.state_code) ? park.state_code.join(', ') : park.state_code}</td>
                      <td className="actions">
                        <button className="edit-btn" onClick={() => handleEdit(park, 'park')}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDelete('park', park.park_code)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'states' && (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>State Code</th>
                    <th>Country</th>
                    <th>Capital</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {states.map((state) => (
                    <tr key={`${state.country_code}-${state.state_code}`}>
                      <td>{state.name}</td>
                      <td>{state.state_code}</td>
                      <td>{state.country_code}</td>
                      <td>{state.capital}</td>
                      <td className="actions">
                        <button className="edit-btn" onClick={() => handleEdit(state, 'state')}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDelete('state', `${state.country_code}|${state.state_code}`)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'cities' && (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>State</th>
                    <th>Country</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cities.map((city) => (
                    <tr key={city._id}>
                      <td>{city.name}</td>
                      <td>{city.state_code}</td>
                      <td>{city.country_code}</td>
                      <td className="actions">
                        <button className="edit-btn" onClick={() => handleEdit(city, 'city')}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDelete('city', city._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
