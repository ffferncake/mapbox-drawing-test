import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
// import MapboxDraw from "@mapbox/mapbox-gl-draw";
import MapboxDrawPro from "@map.ir/mapbox-gl-draw-geospatial-tools";
import axios from "./axios";

// import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
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

      draw.current = new MapboxDrawPro({
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

  // Function to generate a unique ID for sourceId and layerId
  const generateLayerId = () => {
    return Math.random().toString(36).substring(7);
  };

  // Function to save the current layer
  const saveLayer = () => {
    const data = draw.current.getAll();
    const drawnPolygons = data.features;
    if (drawnPolygons.length > 0) {
      const newLayers = drawnPolygons.map((poly) => ({
        ...poly,
        id: generateLayerId(),
        sourceId: `source-${generateLayerId()}`,
        layerId: `layer-${generateLayerId()}`,
        source: {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [poly],
          },
        },
      }));
      setStoredLayers((prevLayers) => [...prevLayers, ...newLayers]);

      console.log(newLayers);
      // Initialize visibility state for the new layers
      setVisibleLayers((prevState) => {
        const newVisibility = { ...prevState };
        newLayers.forEach((layer) => {
          newVisibility[layer.id] = true;
        });
        return newVisibility;
      });

      newLayers.forEach((layer) => {
        // Add the source and layer to the map
        map.current.addSource(layer.sourceId, layer.source);
        map.current.addLayer({
          id: layer.layerId,
          source: layer.sourceId,
          type: "fill",
          paint: {
            "fill-color": "#088",
            "fill-opacity": 0.8,
          },
        });
      });

      draw.current.deleteAll(); // Clear drawn polygons
    } else {
      console.log("No polygons drawn to save.");
    }
  };

  // const saveLayer = async () => {
  //   const data = draw.current.getAll();
  //   const drawnPolygons = data.features;
  //   if (drawnPolygons.length > 0) {
  //     const newLayers = drawnPolygons.map((poly) => ({
  //       ...poly,
  //       id: generateLayerId(),
  //       sourceId: `source-${generateLayerId()}`,
  //       layerId: `layer-${generateLayerId()}`,
  //       source: {
  //         type: "geojson",
  //         data: {
  //           type: "FeatureCollection",
  //           features: [poly],
  //         },
  //       },
  //     }));

  //     try {
  //       // Save the GeoJSON data to the backend
  //       await axios.post("/geo_vector", {
  //         geom: newLayers.geometry,
  //         vector_id: newLayers.id,
  //         layerId: newLayers.layerId,
  //         source: newLayers.source,
  //         sourceId: newLayers.sourceId,
  //         vector_type_id: 1,
  //         map_id : 1,
  //         is_active : true
  //       });

  //       // Update the stored layers state and clear drawn polygons
  //       setStoredLayers((prevLayers) => [...prevLayers, ...newLayers]);
  //       draw.current.deleteAll();
  //     } catch (error) {
  //       console.error("Failed to save GeoJSON data:", error);
  //     }
  //   } else {
  //     console.log("No polygons drawn to save.");
  //   }
  // };

  const toggleStoredLayer = (id) => {
    setVisibleLayers((prevState) => {
      const newVisibility = { ...prevState };
      newVisibility[id] = !newVisibility[id]; // Toggle visibility

      const layer = storedLayers.find((layer) => layer.id === id);
      if (!layer) {
        console.error(`Layer with ID ${id} not found.`);
        return prevState; // Return previous state if layer is not found
      }

      const { sourceId, layerId } = layer;

      if (!newVisibility[id]) {
        // Layer is invisible, remove it from the map if it exists
        if (map.current.getLayer(layerId)) {
          map.current.removeLayer(layerId);
        } else {
          // console.error(
          //   `Layer with ID ${layerId} does not exist in the map's style.`
          // );
        }

        if (map.current.getSource(sourceId)) {
          map.current.removeSource(sourceId);
        } else {
          // console.error(
          //   `Source with ID ${sourceId} does not exist in the map.`
          // );
        }
      } else {
        // Layer is visible, add it back to the map if source does not exist
        if (!map.current.getSource(sourceId)) {
          map.current.addSource(sourceId, layer.source);
          map.current.addLayer({
            id: layerId,
            source: sourceId,
            type: "fill",
            paint: {
              "fill-color": "#088",
              "fill-opacity": 0.8,
            },
          });
        } else {
          console.warn(`Source with ID ${sourceId} already exists in the map.`);
        }
      }
      return newVisibility;
    });
  };

  const saveIndividualLayer = async (layer) => {
    try {
      await axios.post("/geo_vector", {
        geom: layer.geometry,
        vector_id: layer.id,
        layerId: layer.layerId,
        source: layer.source,
        sourceId: layer.sourceId,
        vector_type_id: 1,
        map_id: 1,
        is_active: true,
      });

      // Update the stored layers state
      setStoredLayers((prevLayers) => [...prevLayers, layer]);
    } catch (error) {
      console.error("Failed to save GeoJSON data:", error);
    }
  };

  return (
    <div>
      <div ref={mapContainer} className="map-container" />
      {/* <button onClick={toggleDrawMode}>
        {drawEnabled ? "Disable Draw" : "Enable Draw"}
      </button> */}
      <button onClick={saveLayer}>Save</button>
      {storedLayers.map((layer, index) => (
        <div key={layer.id}>
          <button onClick={() => saveIndividualLayer(layer)}>
            Save Layer {index + 1}
          </button>
          <button onClick={() => toggleStoredLayer(layer.id)}>
            Toggle Layer {index + 1}
          </button>
          {visibleLayers[layer.id] && (
            <div>
              Polygon {index + 1}:{" "}
              <pre>{JSON.stringify(layer.source.data, null, 2)}</pre>
            </div>
          )}
        </div>
      ))}
      {/* {storedLayers.map((layer, index) => (
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
                <pre>{JSON.stringify(layer.source.data, null, 2)}</pre>
              </div>
            )
        )}
      </div> */}
    </div>
  );
}
