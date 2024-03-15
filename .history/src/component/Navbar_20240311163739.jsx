// Navbar.js
import React from "react";

const Navbar = ({ onLogout }) => {
  return (
    <nav>
      <ul>
        <li>Home</li>
        <li>About</li>
        <li>Contact</li>
        <li onClick={onLogout}>Logout</li>
      </ul>
    </nav>
  );
};

export default Navbar;
