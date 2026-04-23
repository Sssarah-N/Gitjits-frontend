import React from 'react';
import propTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PAGES = [
  { label: 'Countries', destination: '/countries' },
  { label: 'Parks', destination: '/parks' },
];

function NavLink({ page }) {
  const { label, destination } = page;
  return (
    <li>
      <Link to={destination}>{label}</Link>
    </li>
  );
}
NavLink.propTypes = {
  page: propTypes.shape({
    label: propTypes.string.isRequired,
    destination: propTypes.string.isRequired,
  }).isRequired,
};

function Navbar() {
  const { isLoggedIn, isAdmin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <nav>
      <div className="wrapper nav-container">
        <ul className="nav-left">
          {PAGES.map((page) => <NavLink key={page.destination} page={page} />)}
          {isAdmin && (
            <li>
              <Link to="/admin" className="admin-link">Admin</Link>
            </li>
          )}
        </ul>
        <ul className="nav-right">
          {isLoggedIn ? (
            <>
              <li>
                <Link to="/profile">Profile</Link>
              </li>
              <li>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login">Login</Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
