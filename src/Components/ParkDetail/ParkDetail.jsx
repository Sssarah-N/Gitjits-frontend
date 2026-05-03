import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { BACKEND_URL } from '../../constants';
import './ParkDetail.css';

function ParkDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const fromSearch = location.state?.from === 'search';
  const { countryCode, stateCode, parkCode } = useParams();
  const [park, setPark] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [enlargedImage, setEnlargedImage] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    axios
      .get(`${BACKEND_URL}/auth/me/saved-parks`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const parks = res.data.saved_parks || [];
        setSaved(parks.includes(parkCode));
      })
      .catch(() => { });
  }, [parkCode]);

  const convertLatLongToMapsURL = (lat, long) => {
    const url = `https://www.google.com/maps?q=${lat}+${long}`;
    return url.replaceAll(" ", "+");
  }

  const handleSave = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setSaveLoading(true);
    setSaveMessage('');

    if (saved) {
      axios
        .delete(
          `${BACKEND_URL}/auth/me/saved-parks/${parkCode}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(() => {
          setSaved(false);
          setSaveMessage('Park removed.');
          setTimeout(() => setSaveMessage(''), 3000);
        })
        .catch(() => {
          setSaveMessage('Could not remove park. Please try again.');
          setTimeout(() => setSaveMessage(''), 3000);
        })
        .finally(() => {
          setSaveLoading(false);
        });
    } else {
      axios
        .post(
          `${BACKEND_URL}/auth/me/saved-parks`,
          { park_code: parkCode },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(() => {
          setSaved(true);
          setSaveMessage('Park saved!');
          setTimeout(() => setSaveMessage(''), 3000);
        })
        .catch(() => {
          setSaveMessage('Could not save park. Please try again.');
          setTimeout(() => setSaveMessage(''), 3000);
        })
        .finally(() => {
          setSaveLoading(false);
        });
    }
  };

  useEffect(() => {
    setLoading(true);
    setError('');

    axios
      .get(`${BACKEND_URL}/parks/code/${parkCode}`)
      .then((res) => {
        console.log("Backend park response:", res.data);
        setPark(res.data.Park);
        setLoading(false);
      })
      .catch(() => {
        setError('There was a problem retrieving the park data.');
        setLoading(false);
      });
  }, [parkCode]);

  if (loading) {
    return (
      <div className="park-detail-wrapper">
        <h1>Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="park-detail-wrapper">
        <div className="error-message">{error}</div>
        <Link to={fromSearch ? '/parks' : `/countries/${countryCode}/states/${stateCode}`} className="back-link">
          {fromSearch ? '← Back to All Parks' : `← Back to ${stateCode} Parks`}
        </Link>
      </div>
    );
  }

  return (
    <div className="park-detail-wrapper">
      <Link to={fromSearch ? '/parks' : `/countries/${countryCode}/states/${stateCode}`} className="back-link">
        {fromSearch ? '← Back to All Parks' : `← Back to ${stateCode} Parks`}
      </Link>

      {park?.images?.length > 0 && (
        <div className="park-images">
          {park.images.map((image) => (
            <img key={image.url} src={image.url} alt={image.title}
              onClick={() => setEnlargedImage(image.url)}
            />
          ))}
        </div>
      )}

      {enlargedImage && (
        <div className="enlarged-image-container">
          <img src={enlargedImage} alt="Enlarged" />
          <button onClick={() => setEnlargedImage(null)}>Close</button>
        </div>
      )}

      <div className="page-header">
        <div className="park-title-row">
          <h1>{park?.name || parkCode}</h1>
          <button
            className={`save-btn${saved ? ' save-btn--saved' : ''}`}
            onClick={handleSave}
            disabled={saveLoading}
            aria-label={saved ? 'Remove from saved parks' : 'Save park'}
            title={saved ? 'Remove from saved' : 'Save this park'}
          >
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {saved ? (
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              ) : (
                <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" />
              )}
            </svg>
            {saveLoading ? (saved ? 'Removing…' : 'Saving…') : saved ? 'Saved' : 'Save'}
          </button>
        </div>
        {saveMessage && (
          <p className={`save-message${saveMessage.startsWith('Could not') ? ' save-message--error' : ''}`}>{saveMessage}</p>
        )}
        <div className="park-meta">
          {park.city && <span className="meta-badge"> {park.city}</span>}
          {park.state_code && <span className="meta-badge">{Array.isArray(park.state_code) ? park.state_code.join(", ") : park.state_code}</span>}
          {park.country_code && <span className="meta-badge">Country: {park.country_code}</span>}
          {park.type && <span className="meta-badge">Type: {park.type}</span>}
          {park.area && <span className="meta-badge">Area: {park.area}</span>}
          {park.designation && <span className="meta-badge">{park.designation}</span>}

        </div>
      </div>

      {park.topics && park.topics.length > 0 && (
        <div className="park-activities">
          <h4>Topics</h4>
          <div className="activity-badges">
            {park.topics.map((topic, index) => (
              <span key={index} className="meta-badge">{topic}</span>
            ))}
          </div>
        </div>
      )}

      {park.activities && park.activities.length > 0 && (
        <div className="park-activities">
          <h4>Activities</h4>
          <div className="activity-badges">
            {park.activities.map((activity, index) => (
              <span key={index} className="meta-badge">{activity}</span>
            ))}
          </div>
        </div>
      )}

      {park.description && (
        <div className="park-directions-info">
          <h4>Description</h4>
          <p>{park.description}</p>
        </div>
      )}

      <div className="park-address-content-container">
        {park.addresses && (
          <div className="park-addresses">
            {park.addresses.filter((address) => address.type == "Physical").map((address) => (
              <div key={address.id} className="park-address">
                <h4>Address
                  <a className="google-maps-link"
                    onClick={() => window.open(convertLatLongToMapsURL(park.latitude, park.longitude), '_blank')}
                  >(View on Google Maps)</a>
                </h4>
                {address.line1 && <p>{address.line1}</p>}
                {address.line2 && <p>{address.line2}</p>}
                {address.line3 && <p>{address.line3}</p>}
                <p>{address.city}, {address.stateCode} {address.postalCode}</p>
              </div>
            ))}
          </div>
        )}

        {park.contacts && (
          <div className="park-contact">

            {park.contacts.emailAddresses && park.contacts.emailAddresses.length > 0 && (
              <div>
                {park.contacts.emailAddresses.map((email, index) => (
                  <div key={`email-${index}`}>
                    <h4>Email {email.description && `(${email.description})`}</h4>
                    <p>
                      <a href={`mailto:${email.emailAddress}`}>
                        {email.emailAddress}
                      </a>
                    </p>
                  </div>
                ))}
              </div>
            )}

            {park.contacts.phoneNumbers && park.contacts.phoneNumbers.length > 0 && (
              <div>
                {park.contacts.phoneNumbers.map((phone, index) => (
                  <div key={`phone-${index}`}>
                    <h4>Phone {phone.description && `(${phone.description})`}</h4>
                    <p>
                      <a href={`tel:${phone.phoneNumber.replace(/[^0-9+]/g, '')}`}>
                        {phone.phoneNumber}
                      </a>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {park.entrance_fees?.length > 0 && (
        <div className="park-entrance-fees">
          <h4>Entrance Fees</h4>
          {park.entrance_fees.map((fee, i) => (
            <div key={i} className="park-body-item">
              <div className="park-body-item-header">
                <span className="park-body-item-title">{fee.title}</span>
                <span className="park-body-item-cost">{fee.cost === '0.00' ? 'Free' : `$${fee.cost}`}</span>
              </div>
              {fee.description && <p className="park-body-item-description">{fee.description}</p>}
            </div>
          ))}
        </div>
      )}

      <h4>Hours</h4>
      {park.operating_hours && (
        <div className="park-body-items-container">
          { Object.entries(park.operating_hours).map(([unitName, unit]) => (
            <div key={unitName} className="park-body-item">
              <h4 className="park-body-item-title">Hours for {unitName}</h4>
              <div className="park-hours-body-container">
                <p className="park-body-item-description">{unit.description}</p>
                {unit.standardHours && (
                  <table className="park-hours-table">
                    <tbody>
                      { DAYS.map((day) => (
                        unit.standardHours[day] && (
                          <tr key={day}>
                            <th scope="row">{day.charAt(0).toUpperCase() + day.slice(1)}</th>
                            <td>{unit.standardHours[day]}</td>
                          </tr>
                        )
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )) }
        </div>
      )}
    </div>
  );
}

export default ParkDetail;