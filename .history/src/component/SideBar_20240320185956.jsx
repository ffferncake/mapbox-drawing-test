// Navbar.js
import React from "react";
import "./SideBar.css";

const SideBar = ({ username, onLogout }) => {
  return (
    <div className="sidebar">
      <h1>รายงานเส้นทาง</h1>
      <div id="reports"></div>
    </div>
  );
};

export default SideBar;
