// Navbar.js
import React, { useState } from "react";
import "./SideBar.css";

const SideBar = ({
  storedLayers,
  saveIndividualLayer,
  toggleStoredLayer,
  visibleLayers,
}) => {
  const [toggledLayers, setToggledLayers] = useState({});

  const toggleLayer = (layerId) => {
    setToggledLayers((prevState) => ({
      ...prevState,
      [layerId]: !prevState[layerId],
    }));
    toggleStoredLayer(layerId);
  };
  return (
    <div className="sidebar">
      <h1>Data List</h1>
      {storedLayers.map((layer, index) => (
        <div key={layer.id}>
          <button onClick={() => saveIndividualLayer(layer)}>
            Save Layer {index + 1}
          </button>
          <button onClick={() => toggleLayer(layer.id)}>
            {toggledLayers[layer.id] ? "Disable" : "Enable"} Layer {index + 1}
          </button>
          {visibleLayers[layer.id] && (
            <div>
              Polygon {index + 1}:{" "}
              <pre>{JSON.stringify(layer.source.data, null, 2)}</pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SideBar;
