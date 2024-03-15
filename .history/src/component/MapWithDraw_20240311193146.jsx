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
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(9);
  const [saveEnabled, setSaveEnabled] = useState(false);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
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

    // Clean up on unmount
    return () => map.current.remove();
  }, []); // Empty dependency array to run once on component mount

  // Function to save drawn layers to local storage
  const saveDrawnLayers = () => {
    if (!draw.current) return;
    const layersData = draw.current.getAll(); // Get all drawn layers
    localStorage.setItem("drawnLayers", JSON.stringify(layersData));
    console.log("Layers saved to local storage");
  };

  // Function to toggle save functionality
  const toggleSave = () => {
    setSaveEnabled(!saveEnabled);
    if (saveEnabled) {
      saveDrawnLayers(); // Save drawn layers when toggling off the save functionality
    }
  };

  return (
    <div>
      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        <button onClick={toggleSave}>
          {saveEnabled ? "Disable Save" : "Enable Save"}
        </button>
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}
