// src/pages/cliente/MapaVista.jsx
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { Scissors, MapPin, Phone, Building2 } from 'lucide-react';
import Estrellas from '../../components/Estrellas.jsx';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon   from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl:       markerIcon,
  shadowUrl:     markerShadow,
});

// Pin rojo  → barbero independiente 💈
// Pin dorado → barbería 🏪
// Misma forma, diferente color e icono
const crearPin = (color, icono) => L.divIcon({
  className: '',
  html: `
    <div style="
      width: 42px; height: 42px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      background: ${color};
      border: 3px solid ${color === '#e6b86a' ? '#c49a4a' : 'rgba(255,255,255,0.3)'};
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
    ">
      <span style="transform: rotate(45deg); font-size: 1.1rem; line-height:1;">
        ${icono}
      </span>
    </div>
  `,
  iconSize:   [42, 42],
  iconAnchor: [21, 42],
  popupAnchor:[0, -44],
});

function CentrarMapa({ center }) {
  const map = useMap();
  useEffect(() => { map.setView(center, 14); }, [map, center]);
  return null;
}

export default function MapaVista({ barberos, barberias = [], onVerBarberos, todosBarberos = [] }) {
  const navigate = useNavigate();
  const centro = [10.4631, -73.2532];
  const barberoMap = Object.fromEntries(todosBarberos.map((b) => [b.id, b]));

  const barberosConUbicacion = barberos.filter(
    (b) => b.lat != null && b.lng != null
  );
  const beberiasConUbicacion = barberias.filter(
    (b) => b.lat != null && b.lng != null
  );

  const totalPines = barberosConUbicacion.length + beberiasConUbicacion.length;

  return (
    <div style={{
      borderRadius: 12, overflow: 'hidden',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-md)',
      position: 'relative',
    }}>

      {/* Leyenda */}
      <div style={{
        position: 'absolute', top: 12, left: 12, zIndex: 1000,
        background: 'rgba(22,27,34,0.92)',
        backdropFilter: 'blur(8px)',
        border: '1px solid var(--border)',
        borderRadius: 10, padding: '10px 14px',
        display: 'flex', gap: 16, fontSize: '0.78rem',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#e74c3c', display: 'inline-block' }} />
          Barbero independiente
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#e6b86a', display: 'inline-block' }} />
          Barbería
        </span>
        <span style={{ color: 'var(--muted)' }}>
          {totalPines} en el mapa
        </span>
      </div>

      <MapContainer
        center={centro}
        zoom={14}
        style={{ height: 500, width: '100%' }}
        zoomControl={false}
      >
        <CentrarMapa center={centro} />
        <ZoomControl position="bottomleft" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* ── Pines de barberos independientes (rojos) ── */}
        {barberosConUbicacion.map((b) => (
          <Marker
            key={b.id}
            position={[b.lat, b.lng]}
            icon={crearPin('#e74c3c', '💈')}
          >
            <Popup minWidth={220}>
              <div style={{
                fontFamily: 'Inter, sans-serif', color: '#e6edf3',
                background: '#161b22', borderRadius: 10,
                padding: '4px 2px', minWidth: 210,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: '1.4rem' }}>{b.avatar}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#e6edf3' }}>
                      {b.nombre} {b.apellido}
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: b.disponibleHoy ? '#3fb950' : '#8b949e' }}>
                      {b.disponibleHoy ? '● Disponible hoy' : '● No disponible'}
                    </span>
                  </div>
                </div>
                <div style={{ color: '#e6b86a', fontSize: '0.82rem', marginBottom: 6 }}>
                  <Scissors size={14} /> {b.especialidad}
                </div>
                <div style={{ marginBottom: 6 }}>
                  <Estrellas calificacion={b.calificacion} total={b.totalCalificaciones} />
                </div>
                <div style={{ color: '#8b949e', fontSize: '0.78rem', marginBottom: 10 }}>
                  <MapPin size={14} /> {b.direccion}, {b.ciudad}<br />
                  <Phone size={14} /> {b.telefono}
                </div>
                <button
                  onClick={() => navigate(`/cliente/barberos/${b.id}`)}
                  style={{
                    width: '100%', padding: '8px 0',
                    background: 'linear-gradient(135deg, #c0392b, #e74c3c)',
                    color: '#fff', border: 'none', borderRadius: 7,
                    fontWeight: 600, fontSize: '0.82rem',
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Ver perfil y agendar →
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* ── Pines de barberías (dorados) ── */}
        {beberiasConUbicacion.map((b) => (
          <Marker
            key={b.id}
            position={[b.lat, b.lng]}
            icon={crearPin('#e6b86a', '🏪')}
          >
            <Popup minWidth={240}>
              <div style={{
                fontFamily: 'Inter, sans-serif', color: '#e6edf3',
                background: '#161b22', borderRadius: 10,
                padding: '4px 2px', minWidth: 230,
              }}>
                {/* Nombre barbería */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: '1.4rem', display: 'flex' }}><Building2 size={24} /></span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#e6edf3' }}>
                      {b.nombre}
                    </div>
                    {b.calificacion > 0 && (
                      <Estrellas calificacion={b.calificacion} total={b.totalCalificaciones} />
                    )}
                  </div>
                </div>

                {/* Dirección */}
                <div style={{ color: '#8b949e', fontSize: '0.78rem', marginBottom: 10 }}>
                  <MapPin size={14} /> {b.direccion}, {b.ciudad}<br />
                  <Phone size={14} /> {b.telefono}
                </div>

                {/* Barberos que trabajan aquí */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{
                    fontSize: '0.72rem', color: '#8b949e',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    marginBottom: 6,
                  }}>
                    <Scissors size={12} /> {b.barberoIds.length > 0
                      ? `${b.barberoIds.length} barbero${b.barberoIds.length !== 1 ? 's' : ''}`
                      : 'Sin barberos aún'}
                  </div>
                  {b.barberoIds.length > 0 && (
                    <div style={{ fontSize: '0.78rem', color: '#e6edf3' }}>
                      {b.barberoIds.slice(0, 3).map((id) => barberoMap[id]?.nombre || id).join(', ')}
                      {b.barberoIds.length > 3 && (
                        <span style={{ color: '#8b949e' }}>
                          {' '}y {b.barberoIds.length - 3} más
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onVerBarberos(b)}
                  style={{
                    width: '100%', padding: '8px 0',
                    background: 'linear-gradient(135deg, #c49a4a, #e6b86a)',
                    color: '#000', border: 'none', borderRadius: 7,
                    fontWeight: 700, fontSize: '0.82rem',
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Ver barberos →
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}