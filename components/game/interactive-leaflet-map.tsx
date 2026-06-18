"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Polygon, useMap, Tooltip, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Territory, Faction, Department, City, Neighborhood } from "@/lib/types";
import { useLanguage } from "@/components/layout/language-provider";

interface InteractiveLeafletMapProps {
  viewMode: "conquest" | "influence";
  selectedLevel: "region" | "department" | "city" | "neighborhood";
  selectedRegionId: string | null;
  selectedDepartmentId: string | null;
  selectedCityId: string | null;
  selectedNeighborhoodId: string | null;
  onSelectRegion: (id: string | null) => void;
  onSelectDepartment: (id: string | null) => void;
  onSelectCity: (id: string | null) => void;
  onSelectNeighborhood: (id: string | null) => void;
  territories: Territory[];
  departments: Department[];
  cities: City[];
  neighborhoods: Neighborhood[];
  runPaths: {
    id: string;
    coordinates: [number, number][];
    faction: Faction;
    isCurrentUser: boolean;
    username: string;
    distance: number;
  }[];
}

// Map center controller for smooth zoom transitions (flyTo)
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, {
      animate: true,
      duration: 1.2,
    });
  }, [center, zoom, map]);
  return null;
}

export function InteractiveLeafletMap({
  viewMode,
  selectedLevel,
  selectedRegionId,
  selectedDepartmentId,
  selectedCityId,
  selectedNeighborhoodId,
  onSelectRegion,
  onSelectDepartment,
  onSelectCity,
  onSelectNeighborhood,
  territories,
  departments,
  cities,
  neighborhoods,
  runPaths,
}: InteractiveLeafletMapProps) {
  const { t } = useLanguage();

  // Create highly styled, glowing SVG DivIcon markers for regions, departments, and cities
  const createGlowingIcon = (faction: Faction, isSelected: boolean) => {
    if (typeof window === "undefined") return L.divIcon(); // SSR safety

    let color = "#475569";
    let stroke = "#64748B";
    if (faction === "Shadow Runners") {
      color = "#8B5CF6";
      stroke = "#A78BFA";
    } else if (faction === "Solar Cyclists") {
      color = "#F59E0B";
      stroke = "#FBBF24";
    } else if (faction === "Lunar Walkers") {
      color = "#06B6D4";
      stroke = "#22D3EE";
    }

    const size = isSelected ? 36 : 26;
    const innerSize = size - 8;

    // Diamond rotating military shield with pulsating ping wave
    const html = `
      <div class="relative flex items-center justify-center" style="width: ${size}px; height: ${size}px;">
        <!-- Glowing Ping Wave -->
        <div class="absolute inset-0 rounded-full animate-ping opacity-35" style="background-color: ${color};"></div>
        
        <!-- Diamond Shield Badge -->
        <div class="relative rounded-md border flex items-center justify-center transition-all duration-300" 
             style="width: ${innerSize}px; height: ${innerSize}px; background-color: #0c0c1e; border-color: ${stroke}; box-shadow: 0 0 10px ${color}; transform: rotate(45deg);">
          <!-- Inner details rotated back -->
          <div class="flex items-center justify-center" style="transform: rotate(-45deg); width: 100%; height: 100%;">
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
            </svg>
          </div>
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: "custom-tactical-badge",
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  // Center mapping for 13 French regions
  const regionCenters: Record<string, [number, number]> = {
    IDF: [48.8566, 2.3522],
    PAC: [43.9352, 6.0679],
    ARA: [45.4500, 4.5000],
    NAQ: [45.3000, 0.6000],
    OCC: [43.6000, 2.0000],
    BRE: [48.2000, -2.8000],
    NOR: [49.1800, -0.3500],
    HDF: [49.9000, 2.8000],
    GES: [48.6000, 6.0000],
    PDL: [47.5000, -0.8000],
    BFC: [47.2800, 4.5000],
    CVL: [47.5000, 1.7000],
    COR: [42.1500, 9.0800],
  };

  // Determine center and zoom dynamically
  let mapCenter: [number, number] = [46.2276, 2.2137];
  let mapZoom = 6;

  if (selectedLevel === "department" && selectedRegionId) {
    mapCenter = regionCenters[selectedRegionId] || mapCenter;
    mapZoom = 8;
  } else if (selectedLevel === "city" && selectedDepartmentId) {
    const dept = departments.find((d) => d.id === selectedDepartmentId);
    if (dept) {
      mapCenter = dept.center;
    }
    mapZoom = 10;
  } else if (selectedLevel === "neighborhood" && selectedCityId) {
    const city = cities.find((c) => c.id === selectedCityId);
    if (city) {
      mapCenter = city.center;
    }
    mapZoom = 13;
  }

  // Clicks mapping
  const handleRegionClick = (regionId: string) => {
    onSelectRegion(regionId);
    onSelectDepartment(null);
    onSelectCity(null);
    onSelectNeighborhood(null);
  };

  const handleDepartmentClick = (deptId: string) => {
    onSelectDepartment(deptId);
    onSelectCity(null);
    onSelectNeighborhood(null);
  };

  const handleCityClick = (cityId: string) => {
    onSelectCity(cityId);
    onSelectNeighborhood(null);
  };

  const handleNeighborhoodClick = (neighId: string) => {
    onSelectNeighborhood(neighId);
  };

  return (
    <div className="relative w-full h-[450px] bg-[#0A0A1A] border border-slate-900 rounded-xl overflow-hidden shadow-2xl">
      {/* Geonavigation Breadcrumbs */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap gap-1.5 bg-[#0e0e22]/90 backdrop-blur-md border border-slate-800/80 px-3 py-1.5 rounded-lg font-orbitron text-[9px] font-bold tracking-widest uppercase">
        <span
          className="cursor-pointer text-violet-400 hover:text-violet-300 transition-colors"
          onClick={() => {
            onSelectRegion(null);
            onSelectDepartment(null);
            onSelectCity(null);
            onSelectNeighborhood(null);
          }}
        >
          FRANCE
        </span>
        {selectedRegionId && (
          <>
            <span className="text-slate-650">/</span>
            <span
              className="cursor-pointer text-violet-400 hover:text-violet-300 transition-colors"
              onClick={() => {
                onSelectDepartment(null);
                onSelectCity(null);
                onSelectNeighborhood(null);
              }}
            >
              {selectedRegionId}
            </span>
          </>
        )}
        {selectedDepartmentId && (
          <>
            <span className="text-slate-650">/</span>
            <span
              className="cursor-pointer text-violet-400 hover:text-violet-300 transition-colors"
              onClick={() => {
                onSelectCity(null);
                onSelectNeighborhood(null);
              }}
            >
              DPT {selectedDepartmentId}
            </span>
          </>
        )}
        {selectedCityId && (
          <>
            <span className="text-slate-650">/</span>
            <span className="text-slate-200">
              {cities.find((c) => c.id === selectedCityId)?.name}
            </span>
          </>
        )}
      </div>

      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        zoomControl={false}
        className="w-full h-full"
        style={{ background: "#060613" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapController center={mapCenter} zoom={mapZoom} />

        {/* Level 1: Region Markers */}
        {selectedLevel === "region" &&
          territories.map((territory) => {
            const center = regionCenters[territory.id];
            if (!center) return null;
            const isSelected = selectedRegionId === territory.id;
            const customIcon = createGlowingIcon(territory.controlling_faction, isSelected);

            return (
              <Marker
                key={territory.id}
                position={center}
                icon={customIcon}
                eventHandlers={{
                  click: () => handleRegionClick(territory.id),
                }}
              >
                <Tooltip direction="top" offset={[0, -12]} opacity={0.9} className="rpg-tooltip">
                  <div className="font-orbitron font-extrabold text-[10px] text-slate-100 uppercase tracking-widest leading-none">
                    {territory.name}
                  </div>
                  <div className="text-[8px] font-semibold text-slate-400 mt-1">
                    {territory.controlling_faction} ({territory.total_influence_points} IP)
                  </div>
                </Tooltip>
              </Marker>
            );
          })}

        {/* Level 2: Department Markers */}
        {selectedLevel === "department" &&
          departments
            .filter((d) => d.region_id === selectedRegionId)
            .map((dept) => {
              const isSelected = selectedDepartmentId === dept.id;
              const customIcon = createGlowingIcon(dept.controlling_faction, isSelected);

              return (
                <Marker
                  key={dept.id}
                  position={dept.center}
                  icon={customIcon}
                  eventHandlers={{
                    click: () => handleDepartmentClick(dept.id),
                  }}
                >
                  <Tooltip direction="top" offset={[0, -12]} opacity={0.9} className="rpg-tooltip">
                    <div className="font-orbitron font-extrabold text-[10px] text-slate-100 uppercase tracking-widest leading-none">
                      {dept.name} ({dept.id})
                    </div>
                    <div className="text-[8px] font-semibold text-slate-400 mt-1">
                      {dept.controlling_faction} ({dept.total_influence_points} IP)
                    </div>
                  </Tooltip>
                </Marker>
              );
            })}

        {/* Level 3: City Markers */}
        {selectedLevel === "city" &&
          cities
            .filter((c) => c.department_id === selectedDepartmentId)
            .map((city) => {
              const isSelected = selectedCityId === city.id;
              const customIcon = createGlowingIcon(city.controlling_faction, isSelected);

              return (
                <Marker
                  key={city.id}
                  position={city.center}
                  icon={customIcon}
                  eventHandlers={{
                    click: () => handleCityClick(city.id),
                  }}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={0.9} className="rpg-tooltip">
                    <div className="font-orbitron font-extrabold text-[10px] text-slate-100 uppercase tracking-widest leading-none">
                      {city.name}
                    </div>
                    <div className="text-[8px] font-semibold text-slate-400 mt-1">
                      {city.controlling_faction} ({city.total_influence_points} IP)
                    </div>
                  </Tooltip>
                </Marker>
              );
            })}

        {/* Level 4: Neighborhood (Quartiers) overlays */}
        {selectedLevel === "neighborhood" &&
          neighborhoods
            .filter((n) => n.city_id === selectedCityId)
            .map((neigh) => {
              const isSelected = selectedNeighborhoodId === neigh.id;
              
              // Resolve faction styling
              let color = "#475569";
              let stroke = "#64748B";
              if (neigh.controlling_faction === "Shadow Runners") {
                color = "#8B5CF6";
                stroke = "#A78BFA";
              } else if (neigh.controlling_faction === "Solar Cyclists") {
                color = "#F59E0B";
                stroke = "#FBBF24";
              } else if (neigh.controlling_faction === "Lunar Walkers") {
                color = "#06B6D4";
                stroke = "#22D3EE";
              }

              // Polygon coordinates for street alignment
              const polygonCoords = neigh.polygon || [
                // fallback to a small box if no polygon defined
                [neigh.center[0] - 0.005, neigh.center[1] - 0.005],
                [neigh.center[0] + 0.005, neigh.center[1] - 0.005],
                [neigh.center[0] + 0.005, neigh.center[1] + 0.005],
                [neigh.center[0] - 0.005, neigh.center[1] + 0.005],
              ];

              return (
                <Polygon
                  key={neigh.id}
                  positions={polygonCoords}
                  pathOptions={{
                    fillColor: color,
                    fillOpacity: isSelected ? 0.45 : 0.2,
                    color: stroke,
                    weight: isSelected ? 3 : 1.5,
                    dashArray: isSelected ? undefined : "3, 6",
                  }}
                  eventHandlers={{
                    click: () => handleNeighborhoodClick(neigh.id),
                  }}
                >
                  <Tooltip direction="top" opacity={0.9} className="rpg-tooltip">
                    <div className="font-orbitron font-extrabold text-[10px] text-slate-100 uppercase tracking-widest leading-none">
                      {neigh.name}
                    </div>
                    <div className="text-[8px] font-semibold text-slate-400 mt-1">
                      Contrôle : {neigh.controlling_faction} (+{neigh.passive_xp_rate} XP/h)
                    </div>
                  </Tooltip>
                </Polygon>
              );
            })}

        {/* Weekly Runs Paths (Polylines) rendering on top of neighborhoods */}
        {(selectedLevel === "neighborhood" || selectedLevel === "city") &&
          runPaths.map((pathObj) => {
            let color = "#A78BFA"; // default shadow runners violet
            if (pathObj.isCurrentUser) {
              color = "#00F0FF"; // Cyan-white for user
            } else if (pathObj.faction === "Shadow Runners") {
              color = "#8B5CF6";
            } else if (pathObj.faction === "Solar Cyclists") {
              color = "#F59E0B";
            } else if (pathObj.faction === "Lunar Walkers") {
              color = "#06B6D4";
            }

            return (
              <React.Fragment key={pathObj.id}>
                {/* Outer glow polyline */}
                <Polyline
                  positions={pathObj.coordinates}
                  pathOptions={{
                    color: color,
                    weight: pathObj.isCurrentUser ? 7 : 5,
                    opacity: pathObj.isCurrentUser ? 0.35 : 0.25,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />
                {/* Inner core polyline */}
                <Polyline
                  positions={pathObj.coordinates}
                  pathOptions={{
                    color: pathObj.isCurrentUser ? "#FFFFFF" : color,
                    weight: pathObj.isCurrentUser ? 2 : 1.5,
                    opacity: 0.95,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                >
                  <Tooltip direction="top" opacity={0.9} className="rpg-tooltip">
                    <div className="font-orbitron font-extrabold text-[9px] text-slate-100 uppercase tracking-widest leading-none">
                      {pathObj.username}
                    </div>
                    <div className="text-[8px] font-semibold text-slate-400 mt-1">
                      Distance : {pathObj.distance} km ({pathObj.faction})
                    </div>
                  </Tooltip>
                </Polyline>
              </React.Fragment>
            );
          })}
      </MapContainer>
    </div>
  );
}
