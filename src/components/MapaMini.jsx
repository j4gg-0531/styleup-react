// src/components/MapaMini.jsx
// Mapa pequeño no interactivo — muestra la ubicación de un barbero o barbería.
// Usado en el perfil del barbero.

import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon   from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl:       markerIcon,
  shadowUrl:     markerShadow,
});

const crearPin = (color, icono) => L.divIcon({
  className: '',
  html: `
    <div style="
      width: 38px; height: 38px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      background: ${color};
      border: 3px solid rgba(255,255,255,0.4);
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
    ">
      <span style="transform: rotate(45deg); font-size: 1rem;">${icono}</span>
    </div>
  `,
  iconSize:   [38, 38],
  iconAnchor: [19, 38],
  popupAnchor:[0, -40],
});

export default function MapaMini({
  lat, lng,
  icono = '💈',
  color = '#e74c3c',
  altura = 220,
}) {
  if (!lat || !lng) return null;

  return (
    <div style={{ borderRadius: 10, overflow: 'hidden' }}>
      <MapContainer
        center={[lat, lng]}
        zoom={16}
        style={{ height: altura, width: '100%' }}
        zoomControl={false}
        // Scroll wheel deshabilitado para no interrumpir el scroll de la página
        scrollWheelZoom={false}
        dragging={true}
        doubleClickZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={[lat, lng]}
          icon={crearPin(color, icono)}
        />
      </MapContainer>
    </div>
  );
}