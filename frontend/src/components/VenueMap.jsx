import React, { useEffect } from 'react';
import { MapContainer, ImageOverlay, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapResizeFix() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [map]);
  return null;
}

export default function VenueMap({ zones = [], guards = [], alerts = [], onZoneClick }) {
  const bounds = [[0, 0], [600, 800]];

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-sm border border-slate-200 relative bg-slate-900">
      <MapContainer
        crs={L.CRS.Simple}
        bounds={bounds}
        maxBounds={bounds}
        style={{ width: '100%', height: '100%', background: '#0F1B33' }}
        zoomControl={false}
        dragging={true}
        scrollWheelZoom={false}
      >
        <MapResizeFix />
        <ImageOverlay url="/venue-map.svg" bounds={bounds} />

        {/* Guards */}
        {guards.map((guard, idx) => {
          if (!guard.x || !guard.y) return null;
          const customIcon = L.divIcon({
            className: 'custom-guard-marker',
            html: `<div style="background:#2DD4BF;width:24px;height:24px;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;color:#0F1B33;box-shadow:0 2px 4px rgba(0,0,0,0.3);">🛡️</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });
          return (
            <Marker key={guard.id || idx} position={[guard.y, guard.x]} icon={customIcon}>
              <Popup>
                <div className="text-xs">
                  <strong>Guard: {guard.name}</strong><br />
                  Status: {guard.status || 'Available'}<br />
                  Zone: {guard.zone || 'Assigned'}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Active Alerts */}
        {alerts.map((alert, idx) => {
          if (!alert.x || !alert.y) return null;
          const alertIcon = L.divIcon({
            className: 'custom-alert-marker',
            html: `<div style="background:#FF6B6B;width:28px;height:28px;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:12px;color:white;box-shadow:0 0 10px #FF6B6B;" class="animate-pulse">🚨</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });
          return (
            <Marker key={alert.id || idx} position={[alert.y, alert.x]} icon={alertIcon}>
              <Popup>
                <div className="text-xs">
                  <strong className="text-red-600">SOS Alert!</strong><br />
                  Zone: {alert.zoneName || alert.zone}<br />
                  Status: {alert.status}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
