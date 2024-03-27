// Navbar.js
import React, { useState } from "react";
import "./SideBar.css";
import { Checkbox } from "@mui/material";

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
      [layerId]: !visibleLayers[layerId], // Toggle visibility
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
          <Checkbox
            checked={visibleLayers[layer.id]}
            onChange={() => toggleLayer(layer.id)}
            color="primary"
            inputProps={{ "aria-label": "toggle layer" }}
          />

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
