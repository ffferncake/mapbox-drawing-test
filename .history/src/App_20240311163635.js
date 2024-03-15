import React, { useState } from "react";
import LoginPage from "./auth/LoginPage";
import MapWithDraw from "./component/MapWithDraw";

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

const App = () => {
  const [user, setUser] = useState(null);

  const handleLogin = (username) => {
    setUser(username);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div>
      {user ? (
        <>
          <Navbar onLogout={handleLogout} />
          <MapWithDraw account={user} />
        </>
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;
