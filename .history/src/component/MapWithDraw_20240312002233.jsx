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
  const [visibleLayers, setVisibleLayers] = useState([]); // State to store visible layers

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

  useEffect(() => {
    setVisibleLayers(storedLayers.map(() => true)); // Set all layers to initially visible
  }, [storedLayers]);

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

      // Initialize visibility status for the new layer
      setVisibleLayers((prevState) => [...prevState, true]);

      draw.current.deleteAll(); // Clear drawn polygons from the map
    } else {
      console.log("No polygons drawn to save.");
    }
  };

  // Function to toggle the stored layers on and off
  const toggleStoredLayer = (index) => {
    if (visibleLayers[index]) {
      // Layer is visible, remove it
      draw.current.delete(storedLayers[index].id);
    } else {
      // Layer is not visible, add it
      draw.current.add(storedLayers[index]);
    }
    // Toggle visibility in the state
    setVisibleLayers((prevState) => {
      const updatedVisibility = [...prevState];
      updatedVisibility[index] = !updatedVisibility[index]; // Toggle visibility
      return updatedVisibility;
    });
  };

  return (
    <div>
      <div ref={mapContainer} className="map-container" />
      <button onClick={toggleDrawMode}>
        {drawEnabled ? "Disable Draw" : "Enable Draw"}
      </button>
      <button onClick={saveLayer}>Save</button>
      {storedLayers.map((layer, index) => (
        <button key={index} onClick={() => toggleStoredLayer(index)}>
          Layer {index + 1}
        </button>
      ))}
      <div>
        {storedLayers.map(
          (layer, index) =>
            visibleLayers[index] && ( // Render only if the layer is visible
              <div key={index}>
                Polygon {index + 1}:{" "}
                {JSON.stringify(layer.geometry.coordinates)}
              </div>
            )
        )}
      </div>
    </div>
  );
}
