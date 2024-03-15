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
  const [layers, setLayers] = useState([]); // State to store drawn polygons

  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/navigation-night-v1",
        center: [100.49, 13.73],
        zoom: 11,
      });

      map.current.on("move", () => {
        const { lng, lat } = map.current.getCenter();
        setLng(lng.toFixed(4));
        setLat(lat.toFixed(4));
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
  }, []);

  // Function to update the state with drawn polygons
  const updateLayers = () => {
    const data = draw.current.getAll();
    const newLayers = data.features.map((feature) => ({
      ...feature,
      visible: true, // Initially set all layers to be visible
    }));
    setLayers([...layers, ...newLayers]);
    draw.current.deleteAll();
  };

  // Function to toggle the visibility of a layer
  const toggleLayerVisibility = (index) => {
    const updatedLayers = [...layers];
    updatedLayers[index].visible = !updatedLayers[index].visible;
    setLayers(updatedLayers);
  };

  return (
    <div>
      <div ref={mapContainer} className="map-container" />
      <button onClick={updateLayers}>Save Polygon</button>
      <div>
        {layers.map((layer, index) => (
          <div key={index}>
            <button onClick={() => toggleLayerVisibility(index)}>
              {layer.visible ? "Hide" : "Show"} Layer {index + 1}
            </button>
            {layer.visible && (
              <div>
                {layer.geometry.coordinates.map((coords, i) => (
                  <div key={i}>
                    Polygon {i + 1}: {JSON.stringify(coords)}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
