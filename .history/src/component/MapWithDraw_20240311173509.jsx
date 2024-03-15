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
    // Function to save drawn layers to the backend service
    const saveDrawnLayers = async () => {
      if (!user || !draw.current) return;
      const layersData = draw.current.getAll(); // Get all drawn layers
      try {
        // Make API request to save the drawn layers for the current user
        const response = await fetch("your-backend-url/save-layers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`, // Example of sending user's authentication token
          },
          body: JSON.stringify({
            user: user.id,
            layers: layersData,
          }),
        });
        if (response.ok) {
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

  return (
    <div>
      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}
