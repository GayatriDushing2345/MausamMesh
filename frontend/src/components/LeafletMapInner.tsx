'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapGeoJSONResponse, MapFeature } from '@/lib/types';

interface LeafletMapInnerProps {
  mapData: MapGeoJSONResponse;
  activeLayer: 'downscaled' | 'baseline' | 'residual';
  selectedPanchayatId: string;
  onSelectPanchayat: (id: string) => void;
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

  // Color scale functions - Agricultural Green & Amber Palette for MausamMesh
  const getRainColor = (val: number) => {
    return val > 30 ? '#14532d' : // Heavy rain (dark forest green)
           val > 24 ? '#15803d' : // Moderate-heavy rain (deep agricultural green)
           val > 18 ? '#22c55e' : // Moderate rain (vibrant green)
           val > 12 ? '#86efac' : // Light rain (soft sage green)
           val > 5  ? '#fde047' : // Very light rain (light amber)
                      '#fef9c3';  // Minimal rain (warm pale yellow)
  };

  const getResidualColor = (val: number) => {
    return val > 4   ? '#d97706' : // strong positive residual (amber-600)
           val > 1.5 ? '#15803d' : // moderate positive residual (agricultural green)
           val > -1.5? '#94a3b8' : // near zero (neutral slate)
           val > -4  ? '#0284c7' : // moderate negative residual (sky blue)
                      '#4338ca';  // strong negative residual (indigo)
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

    let fillColor = '#15803d';
    if (activeLayer === 'downscaled') {
      fillColor = getRainColor(props.downscaled_rain_mm);
    } else if (activeLayer === 'baseline') {
      fillColor = getRainColor(props.block_baseline_rain_mm);
    } else if (activeLayer === 'residual') {
      fillColor = getResidualColor(props.residual_delta_mm);
    }

    return {
      fillColor,
      fillOpacity: isSelected ? 0.85 : 0.65,
      color: isSelected ? '#0f172a' : '#1e293b',
      weight: isSelected ? 3 : 1.5,
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const props = feature.properties;
    if (props.type === 'block') return;

    const popupContent = `
      <div style="font-family: sans-serif; font-size: 12px; padding: 4px;">
        <strong style="font-size: 14px; color: #0f172a;">${props.name} Panchayat</strong><br/>
        <span style="color: #64748b;">Elevation: ${props.elevation_m}m</span><hr style="margin: 4px 0; border: none; border-top: 1px solid #e2e8f0;"/>
        <div>Downscaled Rain: <strong>${props.downscaled_rain_mm} mm</strong></div>
        <div>Block Baseline: ${props.block_baseline_rain_mm} mm</div>
        <div>Predicted Residual: <strong style="color: ${props.residual_delta_mm >= 0 ? '#047857' : '#b45309'};">${props.residual_delta_mm >= 0 ? '+' : ''}${props.residual_delta_mm} mm</strong></div>
        <div>Heavy Rain Prob: ${props.heavy_rain_prob_pct}%</div>
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
      style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
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
