import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "./MapWithDraw.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZmVybmNha2UiLCJhIjoiY2txajcyaWwwMDh2bjMwbngwM2hnaGdjZSJ9.w6HwEX8hDJzyYKOC7X7WHg";

export default function MapWithDraw() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const draw = useRef(null);
  const [lng, setLng] = useState(100.49);
  const [lat, setLat] = useState(13.73);
  const [zoom, setZoom] = useState(11);
  const [featuresEnabled, setFeaturesEnabled] = useState({});
  const [layerNames, setLayerNames] = useState({});

  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/navigation-night-v1",
        center: [lng, lat],
        zoom: zoom,
      });

      map.current.on("move", () => {
        setLng(map.current.getCenter().lng.toFixed(4));
        setLat(map.current.getCenter().lat.toFixed(4));
        setZoom(map.current.getZoom().toFixed(2));
      });

      draw.current = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true,
        },
      });
      map.current.addControl(draw.current);
    }

    // Clean up on unmount
    return () => map.current.remove();
  }, [lng, lat, zoom]);

  // Function to toggle a specific feature type for saving
  const toggleFeatureType = (layerId) => {
    setFeaturesEnabled((prevFeatures) => ({
      ...prevFeatures,
      [layerId]: !prevFeatures[layerId], // Toggle the value for the given layer ID
    }));

    const layer = draw.current.getLayer(layerId);
    if (layer) {
      map.current.setLayoutProperty(
        layerId,
        "visibility",
        featuresEnabled[layerId] ? "visible" : "none"
      );
    }
  };

  // Function to save the drawn features
  const saveDrawnFeatures = () => {
    const data = draw.current.getAll();
    // Do something with the drawn features data, such as sending it to a server
    console.log("Drawn Features Data:", data);
  };

  // Function to update layer name
  const updateLayerName = (layerId, newName) => {
    setLayerNames((prevNames) => ({
      ...prevNames,
      [layerId]: newName,
    }));
  };

  // Get all drawn layers
  const allLayers = draw.current?.getAll() || {};
  // Filter layers by type (features)
  const featureLayers = Object.entries(allLayers).filter(
    ([, layer]) => layer.type === "Feature"
  );

  useEffect(() => {
    // Add layers to the map and set their names
    featureLayers.forEach(([layerId]) => {
      map.current.addLayer({
        id: layerId,
        source: "draw",
        type: "fill",
        paint: {
          "fill-color": "#088",
          "fill-opacity": 0.4,
        },
        filter: ["==", "$type", "Polygon"],
      });
    });
  }, [featureLayers]);

  return (
    <div>
      <div className="sidebar">
        <h3>Toggle Layers:</h3>
        {featureLayers.map(([layerId, layer]) => (
          <div key={layerId}>
            <input
              type="checkbox"
              checked={featuresEnabled[layerId] || false}
              onChange={() => toggleFeatureType(layerId)}
            />
            <label>
              {layerNames[layerId] || "Unnamed Layer"}{" "}
              {/* Display layer name or "Unnamed Layer" */}
            </label>
            <input
              type="text"
              placeholder="Layer Name"
              value={layerNames[layerId] || ""}
              onChange={(e) => updateLayerName(layerId, e.target.value)}
            />
          </div>
        ))}
        <button onClick={saveDrawnFeatures}>Save Drawn Features</button>
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}
