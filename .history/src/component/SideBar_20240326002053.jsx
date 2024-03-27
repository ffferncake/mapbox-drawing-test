import React, { useState } from "react";
import "./SideBar.css";
import { Checkbox, Button } from "@mui/material";

const SideBar = ({
  storedLayers,
  saveIndividualLayer,
  toggleStoredLayer,
  visibleLayers,
  setVisibleLayers,
}) => {
  const [showAllLayers, setShowAllLayers] = useState(false);

  const toggleAllLayers = () => {
    setShowAllLayers(!showAllLayers);
    setVisibleLayers((prevState) => {
      const newState = {};
      storedLayers.forEach((layer) => {
        newState[layer.id] = !showAllLayers;
      });
      return newState;
    });
  };

  return (
    <div className="sidebar">
      <h1>Data List</h1>
      <Button onClick={toggleAllLayers}>
        {showAllLayers ? "Hide All Layers" : "Show All Layers"}
      </Button>
      {showAllLayers &&
        storedLayers.map((layer, index) => (
          <div key={layer.id}>
            <button onClick={() => saveIndividualLayer(layer)}>
              Save Layer {index + 1}
            </button>
            <Checkbox
              checked={visibleLayers[layer.id]}
              onChange={() => toggleStoredLayer(layer.id)}
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
