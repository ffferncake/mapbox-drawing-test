import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
// import MapboxDraw from "@mapbox/mapbox-gl-draw";
import MapboxDrawPro from "@map.ir/mapbox-gl-draw-geospatial-tools";
import axios from "./axios";
import { v4 as uuidv4 } from "uuid";

// import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "./MapWithDraw.css";
import SideBar from "./SideBar";
import SaveDBIcon from "../assets/db.svg";

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
  const [marker, setMarker] = useState(null);
  const [imageSelected, setImageSelected] = useState(false);

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
        displayControlsDefault: true,
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

    map.current.on("click", handleClick);

    return () => {
      map.current.off("draw.create", updatePolygons);
      map.current.off("draw.delete", updatePolygons);
      map.current.off("draw.update", updatePolygons);
      map.current.off("click", handleClick);
    };
  }, [lng, lat, zoom]);

  // Function to update the state with drawn polygons
  const updatePolygons = () => {
    const data = draw.current.getAll();
    setPolygons(data.features);
  };

  // Function to generate a unique ID for sourceId and layerId
  // const generateLayerId = () => {
  //   return Math.random().toString(36).substring(7);
  // };
  // Function to generate a unique ID for sourceId and layerId
  const generateLayerId = () => {
    return uuidv4();
  };

  // Function to save the current layer
  const saveLayer = () => {
    const data = draw.current.getAll();
    const drawnPolygons = data.features;
    if (drawnPolygons.length > 0) {
      const newLayers = drawnPolygons.map((poly) => ({
        ...poly,
        id: generateLayerId(),
        // sourceId: `source-${generateLayerId()}`,
        sourceId: `${generateLayerId()}`,
        // layerId: `layer-${generateLayerId()}`,
        layerId: `${generateLayerId()}`,
        source: {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [poly],
          },
        },
      }));

      setStoredLayers((prevLayers) => [...prevLayers, ...newLayers]);

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

      // Initialize visibility state for the new layers
      setVisibleLayers((prevState) => {
        const newVisibility = { ...prevState };
        newLayers.forEach((layer) => {
          newVisibility[layer.id] = true;
        });
        return newVisibility;
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
    console.log(layer.geometry);
    try {
      const newLayer = { ...layer, key: uuidv4() }; // Add a unique key to the layer object
      await axios.post("/geo_vector", {
        geom: layer.geometry,
        vector_id: newLayer.id,
        layer_id: newLayer.layerId,
        source: newLayer.source,
        source_id: newLayer.sourceId,
        vector_type_id: 1,
        map_id: "a28ab3195c8cd344d8b8b2b463532eb3", //mock
        is_active: true, //mock
      });
      alert("Data saved successfully!");

      // Update the stored layers state with the newLayer
      // setStoredLayers((prevLayers) => [...prevLayers, newLayer]);
    } catch (error) {
      // console.error("Failed to save GeoJSON data:", error);
      alert(
        "Failed to save data. This data is already stored in the database."
      );
    }
  };

  const handleClick = (e) => {
    if (imageSelected && !marker) {
      const newMarker = new mapboxgl.Marker()
        .setLngLat(e.lngLat)
        .addTo(map.current);
      setMarker(newMarker);
      setImageSelected(false); // Reset image selection state
    }
  };

  const createMarkerElement = (imageUrl) => {
    const element = document.createElement("div");
    element.className = "custom-marker";
    element.style.backgroundImage = `url(${imageUrl})`;
    element.style.backgroundSize = "cover";
    element.style.width = "40px";
    element.style.height = "40px";
    return element;
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result;
      const markerElement = createMarkerElement(url);
      const newMarker = new mapboxgl.Marker(markerElement)
        .setLngLat([lng, lat])
        .addTo(map.current);

      markerElement.addEventListener("click", () => {
        new mapboxgl.Popup()
          .setLngLat([lng, lat])
          .setHTML(`Latitude: ${lat}, Longitude: ${lng}`)
          .addTo(map.current);
      });

      setMarker(newMarker);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <button className="mapboxgl-ctrl mapboxgl-ctrl-group" onClick={saveLayer}>
        <img src={SaveDBIcon} alt="DB Icon" />
      </button>
      {/* {storedLayers.map((layer, index) => (
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
      ))} */}
      <div ref={mapContainer} className="map-container" />
      <input type="file" accept="image/*" onChange={handleImageSelect} />
      <SideBar
        storedLayers={storedLayers}
        saveIndividualLayer={saveIndividualLayer}
        toggleStoredLayer={toggleStoredLayer}
        visibleLayers={visibleLayers}
        setVisibleLayers={setVisibleLayers}
      />{" "}
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
    </>
  );
}
