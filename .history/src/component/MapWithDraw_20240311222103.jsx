import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZmVybmNha2UiLCJhIjoiY2txajcyaWwwMDh2bjMwbngwM2hnaGdjZSJ9.w6HwEX8hDJzyYKOC7X7WHg";

export default function MapWithDraw() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const draw = useRef(null);
  const [featuresEnabled, setFeaturesEnabled] = useState({});
  const [layerNames, setLayerNames] = useState({});

  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/navigation-night-v1",
        center: [100.49, 13.73],
        zoom: 11,
      });

      map.current.on("load", () => {
        draw.current = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            trash: true,
          },
        });
        map.current.addControl(draw.current);
      });
    }

    return () => map.current.remove();
  }, []);

  const toggleFeatureType = (layerId) => {
    setFeaturesEnabled((prevFeatures) => ({
      ...prevFeatures,
      [layerId]: !prevFeatures[layerId],
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

  const updateLayerName = (layerId, newName) => {
    setLayerNames((prevNames) => ({
      ...prevNames,
      [layerId]: newName,
    }));
  };

  const saveDrawnFeatures = () => {
    const data = draw.current.getAll();
    console.log("Drawn Features Data:", data);
  };

  const featureLayers = Object.entries(draw.current?.getAll() || {}).filter(
    ([, layer]) => layer.type === "Feature"
  );

  useEffect(() => {
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
            <label>{layerNames[layerId] || "Unnamed Layer"}</label>
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
      <div ref={mapContainer} style={{ width: "100%", height: "400px" }} />
    </div>
  );
}
