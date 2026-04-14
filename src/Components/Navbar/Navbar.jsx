import React, { useState, useEffect } from 'react';
import propTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!user);
  }, [location]);

  return (
    <nav>
      <div className="wrapper nav-container">
        <ul className="nav-left">
          {PAGES.map((page) => <NavLink key={page.destination} page={page} />)}
        </ul>
        <ul className="nav-right">
          <li>
            {isLoggedIn ? (
              <Link to="/profile">Profile</Link>
            ) : (
              <Link to="/login">Login</Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
