import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../../constants';
import './Profile.css';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [savedParks, setSavedParks] = useState([]);
  const [parksLoading, setParksLoading] = useState(false);
  const [parksError, setParksError] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    setParksLoading(true);
    setParksError('');

    axios
      .get(`${BACKEND_URL}/auth/me/saved-parks`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data;
        const raw = data.saved_parks || [];

        // If items are plain park-code strings, fetch each full park object
        if (raw.length > 0 && typeof raw[0] === 'string') {
          return Promise.all(
            raw.map((code) =>
              axios.get(`${BACKEND_URL}/parks/code/${code}`).then((r) => r.data.Park)
            )
          ).then((fullParks) => {
            setSavedParks(fullParks);
            setParksLoading(false);
          });
        }

        setSavedParks(raw);
        setParksLoading(false);
      })
      .catch(() => {
        setParksError('Could not load saved parks.');
        setParksLoading(false);
      });
  }, [user]);

  const getParkUrl = (park) => {
    const stateCode = Array.isArray(park.state_code) ? park.state_code[0] : park.state_code;
    return `/countries/${park.country_code}/states/${stateCode}/parks/${park.park_code}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="profile-wrapper">
        <div className="profile-card">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-wrapper">
      <div className="profile-card">
        <h1>My Profile</h1>

        <div className="profile-info">
          <div className="info-group">
            <label>Username:</label>
            <p>{user.username}</p>
          </div>

          <div className="info-group">
            <label>Email:</label>
            <p>{user.email}</p>
          </div>
        </div>

        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      <div className="saved-parks-section">
        <h2>Saved Parks</h2>

        {parksLoading && (
          <p className="saved-parks-status">Loading saved parks...</p>
        )}

        {parksError && (
          <p className="saved-parks-status saved-parks-status--error">{parksError}</p>
        )}

        {!parksLoading && !parksError && savedParks.length === 0 && (
          <p className="saved-parks-status">
            No saved parks yet. Explore parks and save your favorites!
          </p>
        )}

        {!parksLoading && savedParks.length > 0 && (
          <div className="saved-parks-grid">
            {savedParks.map((park) => (
              <Link
                key={park.park_code || park.name}
                to={getParkUrl(park)}
                className="saved-park-card"
              >
                <div className="saved-park-image-wrapper">
                  {park.images && park.images.length > 0 ? (
                    <img
                      src={park.images[0].url}
                      alt={park.images[0].title || park.name}
                    />
                  ) : (
                    <div className="saved-park-no-image">No image available</div>
                  )}
                </div>
                <div className="saved-park-name">{park.name}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
