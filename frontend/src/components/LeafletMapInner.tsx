'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapGeoJSONResponse } from '@/lib/types';
import { getIMDRainfallCategory } from '@/lib/imdCategories';

interface LeafletMapInnerProps {
  mapData: MapGeoJSONResponse;
  activeLayer: 'priority' | 'downscaled' | 'baseline' | 'residual';
  selectedPanchayatId: string;
  onSelectPanchayat: (id: string) => void;
  priorityTiersMap?: Record<string, string>; // Maps panchayat_id -> 'Very High' | 'High' | 'Medium' | 'Low'
}

// Helper to fit map bounds automatically
function FitBounds({ data }: { data: MapGeoJSONResponse }) {
  const map = useMap();
  useEffect(() => {
    if (data && data.features && data.features.length > 0) {
      try {
        const geojsonLayer = L.geoJSON(data as any);
        const bounds = geojsonLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
        }
      } catch (err) {
        console.error('FitBounds error:', err);
      }
    }
  }, [data, map]);
  return null;
}

export const LeafletMapInner: React.FC<LeafletMapInnerProps> = ({
  mapData,
  activeLayer,
  selectedPanchayatId,
  onSelectPanchayat,
  priorityTiersMap = {},
}) => {
  // Compute initial center coordinates dynamically from map features
  let centerLat = 18.48;
  let centerLon = 73.95;
  if (mapData && mapData.features && mapData.features.length > 0) {
    let latSum = 0;
    let lonSum = 0;
    let count = 0;
    for (const f of mapData.features) {
      if (f.geometry && f.geometry.coordinates) {
        const ring = f.geometry.type === 'Polygon' ? f.geometry.coordinates[0] : (f.geometry.coordinates[0] ? f.geometry.coordinates[0][0] : []);
        if (Array.isArray(ring)) {
          for (const pt of ring) {
            if (Array.isArray(pt) && pt.length >= 2) {
              lonSum += pt[0];
              latSum += pt[1];
              count++;
            }
          }
        }
      }
    }
    if (count > 0) {
      centerLat = latSum / count;
      centerLon = lonSum / count;
    }
  }

  // Tier Colors for Priority Map
  const getTierColor = (tierName?: string) => {
    switch (tierName) {
      case 'Very High': return '#D64545'; // Red
      case 'High': return '#F28C28';      // Orange
      case 'Medium': return '#F2C230';    // Yellow
      case 'Low':
      default:
        return '#2E9E4F';                // Green
    }
  };

  const getResidualColor = (val: number) => {
    return val > 4   ? '#d97706' : 
           val > 1.5 ? '#2E8B57' : 
           val > -1.5? '#94a3b8' : 
           val > -4  ? '#0284c7' : 
                      '#4338ca';  
  };

  const styleFeature = (feature: any) => {
    const props = feature.properties;
    const isSelected = props.id === selectedPanchayatId;
    const isBlock = props.type === 'block';

    if (isBlock) {
      return {
        fillColor: '#94a3b8',
        fillOpacity: 0.05,
        color: '#475569',
        weight: 2,
        dashArray: '4, 4',
      };
    }

    const tier = priorityTiersMap[props.id] || props.priority_tier || 'Medium';

    let fillColor = '#2E8B57';
    if (activeLayer === 'priority') {
      fillColor = getTierColor(tier);
    } else if (activeLayer === 'downscaled') {
      fillColor = getIMDRainfallCategory(props.downscaled_rain_mm).mapColor;
    } else if (activeLayer === 'baseline') {
      fillColor = getIMDRainfallCategory(props.block_baseline_rain_mm).mapColor;
    } else if (activeLayer === 'residual') {
      fillColor = getResidualColor(props.residual_delta_mm);
    }

    const isVeryHigh = tier === 'Very High' && activeLayer === 'priority';

    return {
      fillColor,
      fillOpacity: isSelected ? 0.90 : 0.70,
      color: isSelected ? '#000000' : isVeryHigh ? '#D64545' : '#1e293b',
      weight: isSelected ? 3.5 : isVeryHigh ? 3 : 1.5,
      className: isVeryHigh ? 'animate-pulse' : '',
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const props = feature.properties;
    if (props.type === 'block') return;

    const tier = priorityTiersMap[props.id] || props.priority_tier || 'Medium';
    const cat = getIMDRainfallCategory(props.downscaled_rain_mm);

    const popupContent = `
      <div style="font-family: sans-serif; font-size: 12px; padding: 4px; color: #0F172A;">
        <strong style="font-size: 14px; color: #0F172A;">${props.name} Panchayat</strong><br/>
        <span style="color: #64748B;">Elevation: ${props.elevation_m}m</span>
        <hr style="margin: 4px 0; border: none; border-top: 1px solid #e2e8f0;"/>
        <div>Priority Tier: <strong style="color: ${getTierColor(tier)};">${tier}</strong></div>
        <div>Downscaled Rain: <strong>${props.downscaled_rain_mm} mm</strong> (${cat.labelEn})</div>
        <div>Block Baseline: ${props.block_baseline_rain_mm} mm</div>
      </div>
    `;

    layer.bindTooltip(popupContent, { sticky: true, direction: 'top' });

    layer.on({
      click: () => {
        onSelectPanchayat(props.id);
      },
    });
  };

  const mapKey = `map-${centerLat.toFixed(2)}-${centerLon.toFixed(2)}-${activeLayer}-${selectedPanchayatId}`;

  return (
    <MapContainer
      key={mapKey}
      center={[centerLat, centerLon]}
      zoom={12}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeoJSON
        key={`${activeLayer}-${selectedPanchayatId}-${JSON.stringify(mapData)}`}
        data={mapData as any}
        style={styleFeature}
        onEachFeature={onEachFeature}
      />
      <FitBounds data={mapData} />
    </MapContainer>
  );
};
