// Navbar.js
import React from "react";
import "./Navbar.css";

const Navbar = ({ username, onLogout }) => {
  return (
    <nav>
      <ul>
        {/* <li>Home</li>
        <li>About</li>
        <li>Contact</li> */}
        {username && <li>{username}</li>}
        <li onClick={onLogout}>Logout</li>
      </ul>
    </nav>
  );
};

export default Navbar;
