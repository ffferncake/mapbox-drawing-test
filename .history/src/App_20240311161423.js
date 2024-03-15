import React, { useState } from "react";
import LoginPage from "./auth/LoginPage";
import MapWithDraw from "./component/MapWithDraw";

const App = () => {
  const [user, setUser] = useState(null);

  const handleLogin = (username) => {
    setUser(username);
  };

  return (
    <div>
      {user ? (
        <MapWithDraw account={user} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;