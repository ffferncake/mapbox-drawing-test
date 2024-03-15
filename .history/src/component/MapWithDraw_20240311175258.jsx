import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "./MapWithDraw.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZmVybmNha2UiLCJhIjoiY2txajcyaWwwMDh2bjMwbngwM2hnaGdjZSJ9.w6HwEX8hDJzyYKOC7X7WHg";

export default function MapWithDraw({ user }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const draw = useRef(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(9);

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

  useEffect(() => {
    // Function to save drawn layers to the mock API
    const saveDrawnLayers = async () => {
      if (!user || !draw.current) return;
      const layersData = draw.current.getAll(); // Get all drawn layers
      try {
        // Simulating API request to save the drawn layers for the current user
        const response = await saveLayersToAPI(layersData, user.token);
        if (response.success) {
          console.log("Layers saved successfully");
        } else {
          console.error("Failed to save layers");
        }
      } catch (error) {
        console.error("Error saving layers:", error);
      }
    };

    // Save drawn layers whenever the user changes
    saveDrawnLayers();
  }, [user]); // Call the effect whenever the user changes

  // Mock function to simulate saving layers to the mock API
  const saveLayersToAPI = async (layersData, userToken) => {
    // Simulate an asynchronous operation (e.g., sending data to the server)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if the user token is valid (for demonstration purposes)
        if (userToken !== MOCK_USER_TOKEN) {
          reject(new Error("Invalid user token"));
        } else {
          // Simulate successful saving of layers
          console.log("Mock API: Saving layers to", SAVE_LAYERS_API);
          console.log("Mock API: Layers data:", layersData);
          resolve({ success: true });
        }
      }, 1000); // Simulate a delay of 1 second
    });
  };

  // Mock API endpoint
  const SAVE_LAYERS_API = "http://localhost:3000//save-layers";

  // Mock user token
  const MOCK_USER_TOKEN = "abdc1234";

  return (
    <div>
      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}
