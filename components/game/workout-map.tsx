"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Helper to decode google polyline
function decodePolyline(encoded: string): [number, number][] {
  if (!encoded) return [];
  const points: [number, number][] = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

interface WorkoutMapProps {
  polyline: string | null;
}

// Helper to fit bounds automatically
function MapBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions && positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [map, positions]);
  return null;
}

export default function WorkoutMap({ polyline }: WorkoutMapProps) {
  const positions = React.useMemo(() => {
    return polyline ? decodePolyline(polyline) : [];
  }, [polyline]);

  // Fix leaflet marker icon issue in Next.js
  useEffect(() => {
    // Delete default icon _getIconUrl to prevent loading error
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);

  if (positions.length === 0) {
    return (
      <div className="h-full w-full bg-slate-950/40 border border-slate-900 flex items-center justify-center text-xs font-orbitron font-bold text-slate-500 rounded-xl">
        <span>🗺️ Aucune trace GPS disponible</span>
      </div>
    );
  }

  const startPoint = positions[0];

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-slate-800 shadow-md relative z-10">
      <MapContainer
        center={startPoint}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <Polyline
          pathOptions={{ color: "#8B5CF6", weight: 4, opacity: 0.85, lineJoin: "round" }}
          positions={positions}
        />
        <MapBounds positions={positions} />
      </MapContainer>
    </div>
  );
}
