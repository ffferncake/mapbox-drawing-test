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
  const [layers, setLayers] = useState([]); // State to store drawn polygons

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

      map.current.on("draw.create", updateLayers);
      map.current.on("draw.delete", updateLayers);
      map.current.on("draw.update", updateLayers);
    }

    return () => {
      map.current.off("draw.create", updateLayers);
      map.current.off("draw.delete", updateLayers);
      map.current.off("draw.update", updateLayers);
    };
  }, [lng, lat, zoom]);

  // Function to update the state with drawn polygons
  const updateLayers = () => {
    const data = draw.current.getAll();
    setLayers([...layers, data.features]);
    draw.current.deleteAll();
  };

  return (
    <div>
      <div ref={mapContainer} className="map-container" />
      <button onClick={updateLayers}>Save Polygon</button>
      <div>
        {layers.map((layer, index) => (
          <div key={index}>
            Layer {index + 1}:
            {layer.map((feature, i) => (
              <div key={i}>
                Polygon {i + 1}: {JSON.stringify(feature.geometry.coordinates)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
