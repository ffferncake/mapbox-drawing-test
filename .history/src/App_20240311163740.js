import React, { useState } from "react";
import LoginPage from "./auth/LoginPage";
import MapWithDraw from "./component/MapWithDraw";
import Navbar from "./component/Navbar"


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
