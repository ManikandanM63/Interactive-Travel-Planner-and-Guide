import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css'; // Make sure your App.css file is linked here

function Header() {
  return (
    <div className="header-container">
      <div className="header-logo">
        <Link to="/">TripWiz</Link>
      </div>
      <div className="header-links">
        <Link to="/accounts" className="header-link">Accounts</Link>
        <Link to="/about" className="header-link">About</Link>
        <Link to="/contact" className="header-link">Contact</Link>
      </div>
    </div>
  );
}

export default Header;
