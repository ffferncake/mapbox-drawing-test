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
  const [polygons, setPolygons] = useState([]); // State to store drawn polygons
  const [drawEnabled, setDrawEnabled] = useState(true); // Toggle draw mode
  const [storedLayers, setStoredLayers] = useState([]); // State to store multiple layers
  const [toggleButtons, setToggleButtons] = useState([]); // State to manage toggle button display

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

      map.current.on("draw.create", updatePolygons);
      map.current.on("draw.delete", updatePolygons);
      map.current.on("draw.update", updatePolygons);
    }

    return () => {
      map.current.off("draw.create", updatePolygons);
      map.current.off("draw.delete", updatePolygons);
      map.current.off("draw.update", updatePolygons);
    };
  }, [lng, lat, zoom]);

  // Function to update the state with drawn polygons
  const updatePolygons = () => {
    const data = draw.current.getAll();
    setPolygons(data.features);
  };

  // Function to toggle draw mode
  const toggleDrawMode = () => {
    draw.current.changeMode(drawEnabled ? "simple_select" : "draw_polygon");
    setDrawEnabled(!drawEnabled);
  };

  // Function to save the current layer
  const saveLayer = () => {
    const data = draw.current.getAll();
    const drawnPolygons = data.features;
    if (drawnPolygons.length > 0) {
      const newLayers = storedLayers.concat(drawnPolygons);
      setStoredLayers(newLayers);
      draw.current.deleteAll(); // Clear drawn polygons
      const newToggleButtons = [...toggleButtons, true]; // Add toggle button for the new layer
      setToggleButtons(newToggleButtons); // Set state to show toggle button for the new layer
    } else {
      console.log("No polygons drawn to save.");
    }
  };

  // Function to toggle the stored layers on and off
  const toggleStoredLayer = (index) => {
    if (draw.current.get(storedLayers[index].id)) {
      draw.current.delete(storedLayers[index].id); // Remove the layer if already displayed
    } else {
      draw.current.add(storedLayers[index]); // Add the layer if not displayed
    }
  };

  return (
    <div>
      <div ref={mapContainer} className="map-container" />
      <button onClick={toggleDrawMode}>
        {drawEnabled ? "Disable Draw" : "Enable Draw"}
      </button>
      <button onClick={saveLayer}>Save</button>
      {toggleButtons.map((button, index) => (
        <button key={index} onClick={() => toggleStoredLayer(index)}>
          {draw.current.get(storedLayers[index].id)
            ? "Hide Layer"
            : "Show Layer"}
        </button>
      ))}
      <div>
        {polygons.map((polygon, index) => (
          <div key={index}>
            Polygon {index + 1}: {JSON.stringify(polygon.geometry.coordinates)}
          </div>
        ))}
      </div>
    </div>
  );
}
