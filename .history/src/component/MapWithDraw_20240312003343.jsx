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
  const [visibleLayers, setVisibleLayers] = useState({}); // State to store visibility of layers

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
      const newLayers = storedLayers.concat(
        drawnPolygons.map((poly) => ({
          ...poly,
          id: Math.random().toString(36).substring(7),
        }))
      );
      setStoredLayers(newLayers);

      // Initialize visibility state for the new layer
      setVisibleLayers((prevState) => {
        const newVisibility = { ...prevState };
        newVisibility[newLayers[newLayers.length - 1].id] = true;
        return newVisibility;
      });

      draw.current.deleteAll(); // Clear drawn polygons
    } else {
      console.log("No polygons drawn to save.");
    }
  };

  // Function to toggle the visibility of a stored layer
  const toggleStoredLayer = (id) => {
    setVisibleLayers((prevState) => {
      const newVisibility = { ...prevState };
      newVisibility[id] = !newVisibility[id]; // Toggle visibility
      if (!newVisibility[id]) {
        // Layer is invisible, remove it from the map
        const layer = storedLayers.find((layer) => layer.id === id);
        if (layer) {
          const { source, sourceId, layerId } = layer;
          if (map.current.getSource(sourceId)) {
            map.current.removeLayer(layerId);
            map.current.removeSource(sourceId);
          }
        }
      } else {
        // Layer is visible, add it to the map
        const layer = storedLayers.find((layer) => layer.id === id);
        if (layer) {
          const { sourceId, layerId, source, type, paint } = layer;
          if (!map.current.getSource(sourceId)) {
            map.current.addSource(sourceId, source);
            map.current.addLayer({
              id: layerId,
              source: sourceId,
              type,
              paint,
            });
          }
        }
      }
      return newVisibility;
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
        <button key={layer.id} onClick={() => toggleStoredLayer(layer.id)}>
          Layer {index + 1}
        </button>
      ))}
      <div>
        {storedLayers.map(
          (layer, index) =>
            visibleLayers[layer.id] && ( // Render if layer is visible
              <div key={layer.id}>
                Polygon {index + 1}:{" "}
                {JSON.stringify(layer.geometry.coordinates)}
              </div>
            )
        )}
      </div>
    </div>
  );
}
