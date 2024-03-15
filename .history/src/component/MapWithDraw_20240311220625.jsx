import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "./MapWithDraw.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZmVybmNha2UiLCJhIjoiY2txajcyaWwwMDh2bjMwbngwM2hnaGdjZSJ9.w6HwEX8hDJzyYKOC7X7WHg";

const MapboxDrawing = () => {
  const [map, setMap] = useState(null);
  const [draw, setDraw] = useState(null);
  const [dataType, setDataType] = useState("GeoJSON");

  useEffect(() => {
    const initializeMap = () => {
      const mapInstance = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v11",
        center: [0, 0],
        zoom: 2,
      });

      mapInstance.on("load", () => {
        setMap(mapInstance);
        addInteraction();
      });

      mapInstance.addControl(new mapboxgl.NavigationControl(), "top-left");
    };

    initializeMap();

    return () => map && map.remove();
  }, []);

  const addInteraction = () => {
    if (!map) return;

    const drawInstance = new MapboxDraw({
      displayControlsDefault: false,
      controls: {},
      styles: [],
    });

    map.addControl(drawInstance);

    map.on("draw.create", updateData);
    map.on("draw.update", updateData);
    map.on("draw.delete", updateData);

    setDraw(drawInstance);
  };

  const updateData = () => {
    if (!map || !draw) return;

    const data = draw.getAll();
    const format = new ol.format[dataType]();
    let formattedData;
    try {
      formattedData = format.writeFeaturesObject(data.features);
    } catch (error) {
      console.error(error);
      return;
    }

    if (dataType === "GeoJSON") {
      // format is JSON
      document.getElementById("data").value = JSON.stringify(
        formattedData,
        null,
        4
      );
    } else {
      // format is XML (GPX or KML)
      const serializer = new XMLSerializer();
      document.getElementById("data").value =
        serializer.serializeToString(formattedData);
    }
  };

  const handleDataTypeChange = (e) => {
    setDataType(e.target.value);
    updateData();
  };

  const clearMap = () => {
    draw && draw.deleteAll();
    document.getElementById("data").value = "";
  };

  return (
    <div>
      <div id="map" style={{ height: "400px", width: "100%" }}></div>
      <div>
        <label>Data type:</label>
        <select value={dataType} onChange={handleDataTypeChange}>
          <option value="GeoJSON">GeoJSON</option>
          <option value="KML">KML</option>
          <option value="GPX">GPX</option>
        </select>
      </div>
      <div
        onClick={clearMap}
        style={{ textDecoration: "underline", cursor: "pointer" }}
      >
        Delete all features
      </div>
      <label>Data:</label>
      <textarea id="data" rows="12" style={{ width: "100%" }}></textarea>
    </div>
  );
};

export default MapboxDrawing;
