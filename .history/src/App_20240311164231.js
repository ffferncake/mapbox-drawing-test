import React, { useState, useEffect } from "react";
import LoginPage from "./auth/LoginPage";
import MapWithDraw from "./component/MapWithDraw";
import Navbar from "./component/Navbar";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const username = localStorage.getItem("username");

    if (isLoggedIn === "true" && username) {
      setUser(username);
    }
  }, []); // Empty dependency array to run once on component mount

  const handleLogin = (username) => {
    setUser(username);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("username", username);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
  };

  return (
    <div>
      {user ? (
        <>
          <Navbar username={user} onLogout={handleLogout} />
          <MapWithDraw account={user} />
        </>
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;
