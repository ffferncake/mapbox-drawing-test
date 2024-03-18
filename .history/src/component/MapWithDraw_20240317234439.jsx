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

  // Function to generate a unique layer ID
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
        id: generateLayerId(), // Ensure each layer has a valid unique ID
        sourceId: `source-${generateLayerId()}`, // Generate a unique source ID
        layerId: `layer-${generateLayerId()}`, // Generate a unique layer ID
      }));
      setStoredLayers((prevLayers) => [...prevLayers, ...newLayers]);

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
        map.current.addSource(layer.sourceId, {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [layer],
          },
        });
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
      const source = layer.source; // Get the source property from the layer object
      if (!source) {
        console.error(`Source object for layer with ID ${id} is not defined.`);
        return prevState; // Return previous state if source is not defined
      }

      if (!newVisibility[id]) {
        // Layer is invisible, remove it from the map
        if (map.current.getLayer(layerId)) {
          map.current.removeLayer(layerId);
        } else {
          console.error(
            `Layer with ID ${layerId} does not exist in the map's style.`
          );
        }

        if (map.current.getSource(sourceId)) {
          map.current.removeSource(sourceId);
        } else {
          console.error(
            `Source with ID ${sourceId} does not exist in the map.`
          );
        }
      } else {
        // Layer is visible, add it back to the map
        if (!source.type) {
          console.error(
            `Source object for layer with ID ${id} does not have a type property.`
          );
          return prevState; // Return previous state if source type is not defined
        }
        map.current.addSource(sourceId, source);
        map.current.addLayer({
          id: layerId,
          source: sourceId,
          type: source.type,
          paint: {}, // Assuming a default paint object
        });
      }
      return newVisibility;
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = reader.result;
      const image = new Image();
      image.src = imageUrl;
      image.onload = () => {
        const markerButton = document.createElement("button");
        markerButton.className = "custom-marker-button";
        markerButton.style.backgroundImage = `url(${imageUrl})`;
        markerButton.style.width = "40px";
        markerButton.style.height = "40px";
        markerButton.onclick = () => {
          // Add event listener for map click
          const clickListener = map.current.on("click", (e) => {
            console.log("Clicked on map:", e.lngLat);
            const markerElement = document.createElement("div");
            markerElement.className = "custom-marker";
            markerElement.style.backgroundImage = `url(${imageUrl})`;
            markerElement.style.width = "40px";
            markerElement.style.height = "40px";

            new mapboxgl.Marker({
              element: markerElement,
            })
              .setLngLat(e.lngLat)
              .addTo(map.current);

            // Remove map click event listener after placing marker
            clickListener.remove();
          });
        };

        document.addEventListener("DOMContentLoaded", () => {
          document.body.appendChild(markerButton);
        });
      };
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <input
        type="file"
        accept="image/png, image/jpeg"
        onChange={handleFileChange}
      />
      <div ref={mapContainer} className="map-container" />
      {/* <button onClick={toggleDrawMode}>
        {drawEnabled ? "Disable Draw" : "Enable Draw"}
      </button> */}
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
