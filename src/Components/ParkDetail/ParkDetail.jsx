import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';

import { BACKEND_URL } from '../../constants';
import './ParkDetail.css';

function ParkDetail() {
  const location = useLocation();
  const fromSearch = location.state?.from === 'search';
  const { countryCode, stateCode, parkCode } = useParams();
  const [park, setPark] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [enlargedImage, setEnlargedImage] = useState(null);

  const convertLatLongToMapsURL = (lat, long) => {
    const url = `https://www.google.com/maps?q=${lat}+${long}`;
    return url.replaceAll(" ", "+");
  }

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

      { enlargedImage && (
        <div className="enlarged-image-container">
          <img src={enlargedImage} alt="Enlarged" />
          <button onClick={() => setEnlargedImage(null)}>Close</button>
        </div>
      )}

      <div className="page-header">
        <h1>{park?.name || parkCode}</h1>
        <div className="park-meta">
          {park.city && <span className="meta-badge"> {park.city}</span>}
          {park.state_code && <span className="meta-badge">{Array.isArray(park.state_code) ? park.state_code.join(", ") : park.state_code}</span>}
          {park.country_code && <span className="meta-badge">Country: {park.country_code}</span>}
          {park.type && <span className="meta-badge">Type: {park.type}</span>}
          {park.area && <span className="meta-badge">Area: {park.area}</span>}
          {park.designation && <span className="meta-badge">{park.designation}</span>}

        </div>
      </div>

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

      {park.operating_hours && Object.entries(park.operating_hours).map(([unitName, unit]) => (
        <div key={unitName} className="park-hours">
          <h4>Hours</h4>
          <p>{unit.description}</p>
          {unit.standardHours && (
            <ul>
              {Object.entries(unit.standardHours).map(([day, hours]) => (
                <li key={day}>
                  <strong>{day.charAt(0).toUpperCase() + day.slice(1)}:</strong> {hours}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}


    </div>
  );
}

export default ParkDetail;