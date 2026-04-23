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
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    contacts: false,
    addresses: false,
    hours: false,
    activities: false,
    images: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

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
    // Deep clone to avoid mutating original data
    setFormData(JSON.parse(JSON.stringify(item)));
    // Expand basic section by default when editing
    setExpandedSections({
      basic: true,
      contacts: false,
      addresses: false,
      hours: false,
      activities: false,
      images: false
    });
  };

  // Helper functions for nested array fields
  const updateNestedArray = (field, index, key, value) => {
    const arr = [...(formData[field] || [])];
    arr[index] = { ...arr[index], [key]: value };
    setFormData({ ...formData, [field]: arr });
  };

  const addToArray = (field, template) => {
    const arr = [...(formData[field] || [])];
    arr.push(template);
    setFormData({ ...formData, [field]: arr });
  };

  const removeFromArray = (field, index) => {
    const arr = [...(formData[field] || [])];
    arr.splice(index, 1);
    setFormData({ ...formData, [field]: arr });
  };

  // For contacts which has nested phone_numbers and email_addresses
  const updateContact = (contactType, index, key, value) => {
    const contacts = { ...(formData.contacts || {}) };
    const arr = [...(contacts[contactType] || [])];
    arr[index] = { ...arr[index], [key]: value };
    contacts[contactType] = arr;
    setFormData({ ...formData, contacts });
  };

  const addContact = (contactType, template) => {
    const contacts = { ...(formData.contacts || {}) };
    const arr = [...(contacts[contactType] || [])];
    arr.push(template);
    contacts[contactType] = arr;
    setFormData({ ...formData, contacts });
  };

  const removeContact = (contactType, index) => {
    const contacts = { ...(formData.contacts || {}) };
    const arr = [...(contacts[contactType] || [])];
    arr.splice(index, 1);
    contacts[contactType] = arr;
    setFormData({ ...formData, contacts });
  };

  // For activities (simple string array)
  const updateActivity = (index, value) => {
    const arr = [...(formData.activities || [])];
    arr[index] = value;
    setFormData({ ...formData, activities: arr });
  };

  const addActivity = () => {
    const arr = [...(formData.activities || [])];
    arr.push('');
    setFormData({ ...formData, activities: arr });
  };

  const removeActivity = (index) => {
    const arr = [...(formData.activities || [])];
    arr.splice(index, 1);
    setFormData({ ...formData, activities: arr });
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
          <div className={`edit-modal-content ${editingItem.type === 'park' ? 'park-edit' : ''}`}>
            <h2>Edit {editingItem.type === 'park' ? 'Park' : editingItem.type}</h2>
            <div className="edit-form">
              {editingItem.type === 'park' && (
                <>
                  {/* Basic Info Section */}
                  <div className="form-section">
                    <div className="section-header" onClick={() => toggleSection('basic')}>
                      <h3>Basic Information</h3>
                      <span className={`toggle-icon ${expandedSections.basic ? 'expanded' : ''}`}>▼</span>
                    </div>
                    {expandedSections.basic && (
                      <div className="section-content">
                        <div className="form-row">
                          <label>
                            Name:
                            <input
                              value={formData.name || ''}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                          </label>
                          <label>
                            Full Name:
                            <input
                              value={formData.full_name || ''}
                              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            />
                          </label>
                        </div>
                        <div className="form-row">
                          <label>
                            Park Code:
                            <input
                              value={formData.park_code || ''}
                              onChange={(e) => setFormData({ ...formData, park_code: e.target.value })}
                              disabled
                            />
                          </label>
                          <label>
                            Designation:
                            <input
                              value={formData.designation || ''}
                              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                              placeholder="e.g., National Park, National Monument"
                            />
                          </label>
                        </div>
                        <div className="form-row">
                          <label>
                            Website URL:
                            <input
                              type="url"
                              value={formData.url || ''}
                              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                              placeholder="https://www.nps.gov/..."
                            />
                          </label>
                        </div>
                        <div className="form-row">
                          <label>
                            Latitude:
                            <input
                              type="number"
                              step="any"
                              value={formData.latitude || ''}
                              onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || '' })}
                            />
                          </label>
                          <label>
                            Longitude:
                            <input
                              type="number"
                              step="any"
                              value={formData.longitude || ''}
                              onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || '' })}
                            />
                          </label>
                        </div>
                        <label>
                          Description:
                          <textarea
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                          />
                        </label>
                        <label>
                          Directions Info:
                          <textarea
                            value={formData.directions_info || ''}
                            onChange={(e) => setFormData({ ...formData, directions_info: e.target.value })}
                            rows={3}
                          />
                        </label>
                        <label>
                          Directions URL:
                          <input
                            type="url"
                            value={formData.directions_url || ''}
                            onChange={(e) => setFormData({ ...formData, directions_url: e.target.value })}
                          />
                        </label>
                        <label>
                          Weather Info:
                          <textarea
                            value={formData.weather_info || ''}
                            onChange={(e) => setFormData({ ...formData, weather_info: e.target.value })}
                            rows={3}
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Contacts Section */}
                  <div className="form-section">
                    <div className="section-header" onClick={() => toggleSection('contacts')}>
                      <h3>Contact Information</h3>
                      <span className={`toggle-icon ${expandedSections.contacts ? 'expanded' : ''}`}>▼</span>
                    </div>
                    {expandedSections.contacts && (
                      <div className="section-content">
                        <div className="subsection">
                          <h4>Phone Numbers</h4>
                          {(formData.contacts?.phone_numbers || []).map((phone, idx) => (
                            <div key={idx} className="array-item">
                              <input
                                value={phone.phone_number || ''}
                                onChange={(e) => updateContact('phone_numbers', idx, 'phone_number', e.target.value)}
                                placeholder="Phone number"
                              />
                              <input
                                value={phone.type || ''}
                                onChange={(e) => updateContact('phone_numbers', idx, 'type', e.target.value)}
                                placeholder="Type (Voice, TTY, Fax)"
                              />
                              <button type="button" className="remove-btn" onClick={() => removeContact('phone_numbers', idx)}>×</button>
                            </div>
                          ))}
                          <button type="button" className="add-btn" onClick={() => addContact('phone_numbers', { phone_number: '', type: 'Voice' })}>
                            + Add Phone
                          </button>
                        </div>
                        <div className="subsection">
                          <h4>Email Addresses</h4>
                          {(formData.contacts?.email_addresses || []).map((email, idx) => (
                            <div key={idx} className="array-item">
                              <input
                                type="email"
                                value={email.email_address || ''}
                                onChange={(e) => updateContact('email_addresses', idx, 'email_address', e.target.value)}
                                placeholder="Email address"
                              />
                              <button type="button" className="remove-btn" onClick={() => removeContact('email_addresses', idx)}>×</button>
                            </div>
                          ))}
                          <button type="button" className="add-btn" onClick={() => addContact('email_addresses', { email_address: '' })}>
                            + Add Email
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Addresses Section */}
                  <div className="form-section">
                    <div className="section-header" onClick={() => toggleSection('addresses')}>
                      <h3>Addresses</h3>
                      <span className={`toggle-icon ${expandedSections.addresses ? 'expanded' : ''}`}>▼</span>
                    </div>
                    {expandedSections.addresses && (
                      <div className="section-content">
                        {(formData.addresses || []).map((addr, idx) => (
                          <div key={idx} className="address-item">
                            <div className="address-header">
                              <span className="address-type">{addr.type || 'Address'} #{idx + 1}</span>
                              <button type="button" className="remove-btn" onClick={() => removeFromArray('addresses', idx)}>×</button>
                            </div>
                            <div className="form-row">
                              <label>
                                Type:
                                <select
                                  value={addr.type || 'Physical'}
                                  onChange={(e) => updateNestedArray('addresses', idx, 'type', e.target.value)}
                                >
                                  <option value="Physical">Physical</option>
                                  <option value="Mailing">Mailing</option>
                                </select>
                              </label>
                            </div>
                            <label>
                              Address Line 1:
                              <input
                                value={addr.line1 || ''}
                                onChange={(e) => updateNestedArray('addresses', idx, 'line1', e.target.value)}
                              />
                            </label>
                            <label>
                              Address Line 2:
                              <input
                                value={addr.line2 || ''}
                                onChange={(e) => updateNestedArray('addresses', idx, 'line2', e.target.value)}
                              />
                            </label>
                            <div className="form-row">
                              <label>
                                City:
                                <input
                                  value={addr.city || ''}
                                  onChange={(e) => updateNestedArray('addresses', idx, 'city', e.target.value)}
                                />
                              </label>
                              <label>
                                State:
                                <input
                                  value={addr.state_code || ''}
                                  onChange={(e) => updateNestedArray('addresses', idx, 'state_code', e.target.value)}
                                  maxLength={2}
                                />
                              </label>
                              <label>
                                ZIP:
                                <input
                                  value={addr.postal_code || ''}
                                  onChange={(e) => updateNestedArray('addresses', idx, 'postal_code', e.target.value)}
                                />
                              </label>
                            </div>
                          </div>
                        ))}
                        <button type="button" className="add-btn" onClick={() => addToArray('addresses', { type: 'Physical', line1: '', city: '', state_code: '', postal_code: '' })}>
                          + Add Address
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Operating Hours Section */}
                  <div className="form-section">
                    <div className="section-header" onClick={() => toggleSection('hours')}>
                      <h3>Operating Hours</h3>
                      <span className={`toggle-icon ${expandedSections.hours ? 'expanded' : ''}`}>▼</span>
                    </div>
                    {expandedSections.hours && (
                      <div className="section-content">
                        <p className="hint">Operating hours data is complex. Edit as JSON or plain text description.</p>
                        <label>
                          Operating Hours (JSON):
                          <textarea
                            value={typeof formData.operating_hours === 'string' 
                              ? formData.operating_hours 
                              : JSON.stringify(formData.operating_hours || [], null, 2)}
                            onChange={(e) => {
                              try {
                                const parsed = JSON.parse(e.target.value);
                                setFormData({ ...formData, operating_hours: parsed });
                              } catch {
                                setFormData({ ...formData, operating_hours: e.target.value });
                              }
                            }}
                            rows={8}
                            className="json-input"
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Activities Section */}
                  <div className="form-section">
                    <div className="section-header" onClick={() => toggleSection('activities')}>
                      <h3>Activities ({(formData.activities || []).length})</h3>
                      <span className={`toggle-icon ${expandedSections.activities ? 'expanded' : ''}`}>▼</span>
                    </div>
                    {expandedSections.activities && (
                      <div className="section-content">
                        <div className="activities-list">
                          {(formData.activities || []).map((activity, idx) => (
                            <div key={idx} className="activity-item">
                              <input
                                value={activity || ''}
                                onChange={(e) => updateActivity(idx, e.target.value)}
                                placeholder="Activity name"
                              />
                              <button type="button" className="remove-btn" onClick={() => removeActivity(idx)}>×</button>
                            </div>
                          ))}
                        </div>
                        <button type="button" className="add-btn" onClick={addActivity}>
                          + Add Activity
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Images Section */}
                  <div className="form-section">
                    <div className="section-header" onClick={() => toggleSection('images')}>
                      <h3>Images ({(formData.images || []).length})</h3>
                      <span className={`toggle-icon ${expandedSections.images ? 'expanded' : ''}`}>▼</span>
                    </div>
                    {expandedSections.images && (
                      <div className="section-content">
                        {(formData.images || []).map((img, idx) => (
                          <div key={idx} className="image-item">
                            <div className="image-header">
                              <span>Image #{idx + 1}</span>
                              <button type="button" className="remove-btn" onClick={() => removeFromArray('images', idx)}>×</button>
                            </div>
                            {img.url && (
                              <div className="image-preview">
                                <img src={img.url} alt={img.title || 'Preview'} />
                              </div>
                            )}
                            <label>
                              Image URL:
                              <input
                                type="url"
                                value={img.url || ''}
                                onChange={(e) => updateNestedArray('images', idx, 'url', e.target.value)}
                                placeholder="https://..."
                              />
                            </label>
                            <label>
                              Title:
                              <input
                                value={img.title || ''}
                                onChange={(e) => updateNestedArray('images', idx, 'title', e.target.value)}
                              />
                            </label>
                            <label>
                              Caption:
                              <textarea
                                value={img.caption || ''}
                                onChange={(e) => updateNestedArray('images', idx, 'caption', e.target.value)}
                                rows={2}
                              />
                            </label>
                            <div className="form-row">
                              <label>
                                Credit:
                                <input
                                  value={img.credit || ''}
                                  onChange={(e) => updateNestedArray('images', idx, 'credit', e.target.value)}
                                />
                              </label>
                              <label>
                                Alt Text:
                                <input
                                  value={img.altText || ''}
                                  onChange={(e) => updateNestedArray('images', idx, 'altText', e.target.value)}
                                />
                              </label>
                            </div>
                          </div>
                        ))}
                        <button type="button" className="add-btn" onClick={() => addToArray('images', { url: '', title: '', caption: '', credit: '', altText: '' })}>
                          + Add Image
                        </button>
                      </div>
                    )}
                  </div>
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
                        <button className="edit-btn" onClick={() => navigate(`/admin/parks/${park.park_code}`)}>Edit</button>
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
