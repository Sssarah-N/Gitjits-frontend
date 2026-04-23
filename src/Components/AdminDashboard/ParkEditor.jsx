import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BACKEND_URL } from '../../constants';
import './ParkEditor.css';

function ParkEditor() {
  const { parkCode } = useParams();
  const navigate = useNavigate();
  const { isAdmin, authHeader } = useAuth();
  
  const [park, setPark] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPark();
  }, [parkCode]);

  const fetchPark = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/parks/code/${parkCode}`);
      setPark(res.data.Park);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load park data' });
    }
    setLoading(false);
  };

  const startEditing = (field, value) => {
    if (!editMode) return;
    setEditingField(field);
    setTempValue(typeof value === 'object' ? JSON.stringify(value, null, 2) : (value || ''));
  };

  const cancelEditing = () => {
    setEditingField(null);
    setTempValue('');
  };

  const saveField = async (field) => {
    setSaving(true);
    try {
      let valueToSave = tempValue;
      
      // Parse JSON for complex fields
      if (['contacts', 'addresses', 'operating_hours', 'images', 'activities'].includes(field)) {
        try {
          valueToSave = JSON.parse(tempValue);
        } catch {
          // Keep as string if not valid JSON (for activities as comma-separated)
          if (field === 'activities') {
            valueToSave = tempValue.split(',').map(s => s.trim()).filter(Boolean);
          }
        }
      }
      
      // Parse numbers
      if (['latitude', 'longitude'].includes(field)) {
        valueToSave = parseFloat(tempValue) || null;
      }

      await axios.put(
        `${BACKEND_URL}/parks/id/${park._id}`,
        { [field]: valueToSave },
        authHeader()
      );
      
      setPark({ ...park, [field]: valueToSave });
      setEditingField(null);
      setTempValue('');
      showMessage('success', 'Saved!');
    } catch (error) {
      showMessage('error', error.response?.data?.Error || 'Failed to save');
    }
    setSaving(false);
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // Render an editable field
  // eslint-disable-next-line react/prop-types
  const EditableField = ({ label, field, value, multiline = false, type = 'text' }) => {
    const isEditing = editingField === field;
    const displayValue = value === null || value === undefined ? '' : value;
    
    return (
      <div className={`field-row ${editMode ? 'editable' : ''} ${isEditing ? 'editing' : ''}`}>
        <div className="field-label">{label}</div>
        {isEditing ? (
          <div className="field-edit">
            {multiline ? (
              <textarea
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                autoFocus
                rows={4}
              />
            ) : (
              <input
                type={type}
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                autoFocus
              />
            )}
            <div className="field-actions">
              <button className="save-btn" onClick={() => saveField(field)} disabled={saving}>
                {saving ? '...' : '✓'}
              </button>
              <button className="cancel-btn" onClick={cancelEditing}>✕</button>
            </div>
          </div>
        ) : (
          <div 
            className="field-value"
            onClick={() => startEditing(field, displayValue)}
          >
            {displayValue || <span className="empty">Not set</span>}
            {editMode && <span className="edit-hint">Click to edit</span>}
          </div>
        )}
      </div>
    );
  };

  // Render contacts section
  const ContactsSection = () => {
    const contacts = park?.contacts || {};
    // Support both camelCase (from NPS data) and snake_case
    const phones = contacts.phoneNumbers || contacts.phone_numbers || [];
    const emails = contacts.emailAddresses || contacts.email_addresses || [];
    const isEditing = editingField === 'contacts';

    return (
      <div className="section">
        <h3>Contact Information</h3>
        {isEditing ? (
          <div className="json-editor">
            <textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              rows={10}
              placeholder="Edit as JSON"
            />
            <div className="field-actions">
              <button className="save-btn" onClick={() => saveField('contacts')} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button className="cancel-btn" onClick={cancelEditing}>Cancel</button>
            </div>
          </div>
        ) : (
          <div 
            className={`contacts-display ${editMode ? 'editable' : ''}`}
            onClick={() => startEditing('contacts', contacts)}
          >
            {phones.length > 0 && (
              <div className="contact-group">
                <strong>Phone:</strong>
                {phones.map((p, i) => (
                  <div key={i} className="contact-item">
                    {p.phoneNumber || p.phone_number} {p.type && <span className="type">({p.type})</span>}
                  </div>
                ))}
              </div>
            )}
            {emails.length > 0 && (
              <div className="contact-group">
                <strong>Email:</strong>
                {emails.map((e, i) => (
                  <div key={i} className="contact-item">{e.emailAddress || e.email_address}</div>
                ))}
              </div>
            )}
            {phones.length === 0 && emails.length === 0 && (
              <span className="empty">No contact information</span>
            )}
            {editMode && <span className="edit-hint">Click to edit</span>}
          </div>
        )}
      </div>
    );
  };

  // Render addresses section
  const AddressesSection = () => {
    const addresses = park?.addresses || [];
    const isEditing = editingField === 'addresses';

    return (
      <div className="section">
        <h3>Addresses</h3>
        {isEditing ? (
          <div className="json-editor">
            <textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              rows={12}
              placeholder="Edit as JSON"
            />
            <div className="field-actions">
              <button className="save-btn" onClick={() => saveField('addresses')} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button className="cancel-btn" onClick={cancelEditing}>Cancel</button>
            </div>
          </div>
        ) : (
          <div 
            className={`addresses-display ${editMode ? 'editable' : ''}`}
            onClick={() => startEditing('addresses', addresses)}
          >
            {addresses.length > 0 ? addresses.map((addr, i) => (
              <div key={i} className="address-card">
                <div className="address-type">{addr.type || 'Address'}</div>
                <div>{addr.line1}</div>
                {(addr.line2 || addr.line3) && <div>{addr.line2} {addr.line3}</div>}
                <div>{addr.city}, {addr.stateCode || addr.state_code} {addr.postalCode || addr.postal_code}</div>
              </div>
            )) : (
              <span className="empty">No addresses</span>
            )}
            {editMode && <span className="edit-hint">Click to edit</span>}
          </div>
        )}
      </div>
    );
  };

  // Render activities section  
  const ActivitiesSection = () => {
    const activities = park?.activities || [];
    const isEditing = editingField === 'activities';

    return (
      <div className="section">
        <h3>Activities ({activities.length})</h3>
        {isEditing ? (
          <div className="json-editor">
            <textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              rows={6}
              placeholder="Enter activities separated by commas, or as JSON array"
            />
            <div className="field-actions">
              <button className="save-btn" onClick={() => saveField('activities')} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button className="cancel-btn" onClick={cancelEditing}>Cancel</button>
            </div>
          </div>
        ) : (
          <div 
            className={`activities-display ${editMode ? 'editable' : ''}`}
            onClick={() => startEditing('activities', activities.join(', '))}
          >
            {activities.length > 0 ? (
              <div className="tags">
                {activities.map((act, i) => (
                  <span key={i} className="tag">{act}</span>
                ))}
              </div>
            ) : (
              <span className="empty">No activities listed</span>
            )}
            {editMode && <span className="edit-hint">Click to edit</span>}
          </div>
        )}
      </div>
    );
  };

  // Render images section
  const ImagesSection = () => {
    const images = park?.images || [];
    const isEditing = editingField === 'images';

    return (
      <div className="section">
        <h3>Images ({images.length})</h3>
        {isEditing ? (
          <div className="json-editor">
            <textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              rows={15}
              placeholder="Edit as JSON array"
            />
            <div className="field-actions">
              <button className="save-btn" onClick={() => saveField('images')} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button className="cancel-btn" onClick={cancelEditing}>Cancel</button>
            </div>
          </div>
        ) : (
          <div 
            className={`images-display ${editMode ? 'editable' : ''}`}
            onClick={() => startEditing('images', images)}
          >
            {images.length > 0 ? (
              <div className="image-grid">
                {images.map((img, i) => (
                  <div key={i} className="image-card">
                    <img src={img.url} alt={img.title || 'Park image'} />
                    <div className="image-info">
                      <div className="image-title">{img.title}</div>
                      {img.caption && <div className="image-caption">{img.caption}</div>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <span className="empty">No images</span>
            )}
            {editMode && <span className="edit-hint">Click to edit</span>}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="park-editor-wrapper"><h1>Loading...</h1></div>;
  }

  if (!park) {
    return <div className="park-editor-wrapper"><h1>Park not found</h1></div>;
  }

  return (
    <div className="park-editor-wrapper">
      <div className="editor-header">
        <button className="back-btn" onClick={() => navigate('/admin')}>
          ← Back to Dashboard
        </button>
        {isAdmin && (
          <button 
            className={`edit-mode-btn ${editMode ? 'active' : ''}`}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? '✓ Done Editing' : '✎ Edit Mode'}
          </button>
        )}
      </div>

      {message.text && (
        <div className={`toast ${message.type}`}>{message.text}</div>
      )}

      <div className="park-header">
        {park.images?.[0] && (
          <div className="hero-image">
            <img src={park.images[0].url} alt={park.name} />
          </div>
        )}
        <div className="park-title">
          <EditableField label="Name" field="name" value={park.name} />
          <EditableField label="Full Name" field="full_name" value={park.full_name} />
          <div className="park-meta">
            <span className="park-code">{park.park_code}</span>
            <EditableField label="Designation" field="designation" value={park.designation} />
          </div>
        </div>
      </div>

      <div className="park-content">
        <div className="main-info">
          <div className="section">
            <h3>Description</h3>
            <EditableField label="" field="description" value={park.description} multiline />
          </div>

          <div className="section">
            <h3>Location</h3>
            <div className="location-fields">
              <EditableField label="Latitude" field="latitude" value={park.latitude} type="number" />
              <EditableField label="Longitude" field="longitude" value={park.longitude} type="number" />
            </div>
            <EditableField label="State(s)" field="state_code" value={Array.isArray(park.state_code) ? park.state_code.join(', ') : park.state_code} />
          </div>

          <div className="section">
            <h3>Directions</h3>
            <EditableField label="Directions Info" field="directions_info" value={park.directions_info} multiline />
            <EditableField label="Directions URL" field="directions_url" value={park.directions_url} />
          </div>

          <div className="section">
            <h3>Weather</h3>
            <EditableField label="" field="weather_info" value={park.weather_info} multiline />
          </div>

          <div className="section">
            <h3>Website</h3>
            <EditableField label="Official URL" field="url" value={park.url} />
          </div>
        </div>

        <div className="side-info">
          <ContactsSection />
          <AddressesSection />
          <ActivitiesSection />
        </div>
      </div>

      <ImagesSection />
    </div>
  );
}

export default ParkEditor;
