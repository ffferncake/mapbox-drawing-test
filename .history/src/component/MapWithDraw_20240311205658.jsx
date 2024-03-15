import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "./MapWithDraw.css";

// export default function MapWithDraw() {
//   const mapContainer = useRef(null);
//   const map = useRef(null);
//   const draw = useRef(null);
//   const [lng, setLng] = useState(100.49);
//   const [lat, setLat] = useState(13.73);
//   const [zoom, setZoom] = useState(11);
//   const [featuresEnabled, setFeaturesEnabled] = useState({});
//   const [savedFeatures, setSavedFeatures] = useState([]);

//   useEffect(() => {
//     if (map.current) return; // initialize map only once
//     map.current = new mapboxgl.Map({
//       container: mapContainer.current,
//       style: "mapbox://styles/mapbox/navigation-night-v1",
//       center: [lng, lat],
//       zoom: zoom,
//     });

//     map.current.on("move", () => {
//       setLng(map.current.getCenter().lng.toFixed(4));
//       setLat(map.current.getCenter().lat.toFixed(4));
//       setZoom(map.current.getZoom().toFixed(2));
//     });

//     draw.current = new MapboxDraw({
//       displayControlsDefault: false,
//       controls: {
//         polygon: true,
//         trash: true,
//       },
//     });
//     map.current.addControl(draw.current);

//     // Clean up on unmount
//     return () => map.current.remove();
//   }, []); // Empty dependency array to run once on component mount

//   // Function to toggle a specific feature type for saving
//   const toggleFeatureType = (layerId) => {
//     setFeaturesEnabled((prevFeatures) => ({
//       ...prevFeatures,
//       [layerId]: !prevFeatures[layerId], // Toggle the value for the given layer ID
//     }));

//     const allFeatures = draw.current.getAll();
//     const layerIds = Object.keys(allFeatures);

//     if (layerIds.includes(layerId)) {
//       draw.current.setFeatureProperty(
//         layerId,
//         "visible",
//         featuresEnabled[layerId] ? "visible" : "none"
//       );
//     }
//   };

//   // Function to save drawn features
//   const saveFeatures = () => {
//     const allLayers = draw.current.getAll();
//     const featureLayers = Object.values(allLayers).filter(
//       (layer) => layer.type === "Feature"
//     );
//     setSavedFeatures(featureLayers);
//   };

//   return (
//     <div>
//       <div className="sidebar">
//         Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
//       </div>
//       <div className="sidebar">
//         {draw.current && (
//           <>
//             <h3>Toggle Layers:</h3>
//             {Object.entries(draw.current.getAll()).map(([layerId, layer]) => (
//               <div key={layerId}>
//                 <input
//                   type="checkbox"
//                   checked={featuresEnabled[layerId] || false}
//                   onChange={() => toggleFeatureType(layerId)}
//                 />
//                 <label>{layerId}</label>
//               </div>
//             ))}
//             <button onClick={saveFeatures}>Save Features</button>
//           </>
//         )}
//       </div>
//       <div ref={mapContainer} className="map-container" />
//     </div>
//   );
// }

mapboxgl.accessToken =
  "pk.eyJ1IjoiZmVybmNha2UiLCJhIjoiY2txajcyaWwwMDh2bjMwbngwM2hnaGdjZSJ9.w6HwEX8hDJzyYKOC7X7WHg";

const MapWithDraw = () => {
  const [map, setMap] = useState(null);
  const [data, setData] = useState("");
  const [interactionType, setInteractionType] = useState("draw");
  const [geomType, setGeomType] = useState("Point");
  const [dataType, setDataType] = useState("GeoJSON");
  const mapContainer = React.createRef();

  useEffect(() => {
    const initializeMap = () => {
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [0, 0],
        zoom: 2,
      });

      newMap.on("load", () => {
        setMap(newMap);
        addInteraction();
      });
    };

    if (!map) {
      initializeMap();
    }

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  const addInteraction = () => {
    if (map) {
      map.on("draw.create", saveData);

      // You need to implement the interaction functionality here using Mapbox Draw
      // Check Mapbox Draw documentation for how to implement drawing interactions
    }
  };

  const saveData = (event) => {
    const { features } = event;
    const dataFormat = new mapboxgl.superMap[dataType]();
    const dataStr = dataFormat.write(features);

    setData(dataStr);
  };

  const clearMap = () => {
    if (map) {
      map
        .getSource("draw")
        .setData({ type: "FeatureCollection", features: [] });
      setData("");
    }
  };

  const handleInteractionTypeChange = (event) => {
    setInteractionType(event.target.value);
    // You may need to handle interaction type change if required
  };

  const handleGeomTypeChange = (event) => {
    setGeomType(event.target.value);
    // You may need to handle geometry type change if required
  };

  const handleDataTypeChange = (event) => {
    setDataType(event.target.value);
    // You may need to handle data type change if required
  };

  return (
    <div>
      <div ref={mapContainer} className="map" />
      <div>
        <label>Interaction type: &nbsp;</label>
        <label>draw</label>
        <input
          type="radio"
          id="interaction_type_draw"
          name="interaction_type"
          value="draw"
          checked={interactionType === "draw"}
          onChange={handleInteractionTypeChange}
        />
        <label>modify</label>
        <input
          type="radio"
          id="interaction_type_modify"
          name="interaction_type"
          value="modify"
          checked={interactionType === "modify"}
          onChange={handleInteractionTypeChange}
        />
      </div>
      <div>
        <label>Geometry type</label>
        <select id="geom_type" value={geomType} onChange={handleGeomTypeChange}>
          <option value="Point">Point</option>
          <option value="LineString">LineString</option>
          <option value="Polygon">Polygon</option>
        </select>
      </div>
      <div>
        <label>Data type</label>
        <select id="data_type" value={dataType} onChange={handleDataTypeChange}>
          <option value="GeoJSON">GeoJSON</option>
          <option value="KML">KML</option>
          <option value="GPX">GPX</option>
        </select>
      </div>
      <div
        id="delete"
        style={{ textDecoration: "underline", cursor: "pointer" }}
        onClick={clearMap}
      >
        Delete all features
      </div>
      <label>Data:</label>
      <textarea
        id="data"
        rows="12"
        style={{ width: "100%" }}
        value={data}
        readOnly
      />
    </div>
  );
};

export default MapWithDraw;
