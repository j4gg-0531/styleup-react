// src/pages/cliente/MapaVista.jsx
// Muestra un mapa interactivo con la ubicación de los barberos.
// Usa Leaflet (OpenStreetMap) — gratis, sin API key.
// FUTURO: las coordenadas vendrán de la BD; hoy están en barberosService.

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import Estrellas from '../../components/Estrellas.jsx';

// ── Fix: Leaflet necesita sus iconos explícitamente en Vite/React ──
// Sin esto, los marcadores aparecen rotos (imagen rota)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon   from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl:       markerIcon,
  shadowUrl:     markerShadow,
});

// ── Icono personalizado: verde si disponible, gris si no ──
// Así el cliente puede distinguir de un vistazo quién puede atenderlo
const crearIcono = (disponible) =>
  L.divIcon({
    className: '',
    html: `
      <div style="
        width: 42px; height: 42px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        background: ${disponible
          ? 'linear-gradient(135deg, #c0392b, #e74c3c)'
          : 'linear-gradient(135deg, #444, #666)'};
        border: 3px solid ${disponible ? '#e6b86a' : '#555'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        display: flex; align-items: center; justify-content: center;
      ">
        <span style="
          transform: rotate(45deg);
          font-size: 1.1rem;
          line-height: 1;
        ">💈</span>
      </div>
    `,
    iconSize:   [42, 42],
    iconAnchor: [21, 42],   // el pico del pin apunta a la coordenada exacta
    popupAnchor:[0, -44],
  });

// ── Componente auxiliar: centra el mapa en Valledupar al montar ──
function CentrarMapa({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [map, center]);
  return null;
}

// ── Componente principal ──
export default function MapaVista({ barberos }) {
  const navigate = useNavigate();

  // Centro del mapa: Valledupar
  const centro = [10.4631, -73.2532];

  // Solo mostramos barberos que tengan coordenadas definidas
  // FUTURO: todos tendrán coordenadas al guardarse en la BD
  const barberosConUbicacion = barberos.filter(
    (b) => b.lat != null && b.lng != null
  );

  return (
    <div style={{
      borderRadius: 12,
      overflow: 'hidden',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-md)',
      position: 'relative',
    }}>

      {/* Leyenda encima del mapa */}
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
          Disponible hoy
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#555', display: 'inline-block' }} />
          No disponible
        </span>
      </div>

      {/* El mapa en sí */}
      <MapContainer
        center={centro}
        zoom={14}
        style={{ height: 500, width: '100%' }}
        zoomControl={false}
      >
        <CentrarMapa center={centro} />
        {/* Zoom movido abajo-izquierda para no tapar la leyenda */}
        <ZoomControl position="bottomleft" />

        {/* Tiles de OpenStreetMap — gratuito, sin API key */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Un marcador por cada barbero */}
        {barberosConUbicacion.map((b) => (
          <Marker
            key={b.id}
            position={[b.lat, b.lng]}
            icon={crearIcono(b.disponibleHoy)}
          >
            {/* Popup que aparece al hacer clic en el marcador */}
            <Popup minWidth={220}>
              <div style={{
                fontFamily: 'Inter, sans-serif',
                color: '#e6edf3',
                background: '#161b22',
                borderRadius: 10,
                padding: '4px 2px',
                minWidth: 210,
              }}>

                {/* Nombre y badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: '1.4rem' }}>{b.avatar}</span>
                  <div>
                    <div style={{
                      fontWeight: 700, fontSize: '0.95rem',
                      color: '#e6edf3',
                    }}>
                      {b.nombre} {b.apellido}
                    </div>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 600,
                      color: b.disponibleHoy ? '#3fb950' : '#8b949e',
                    }}>
                      {b.disponibleHoy ? '● Disponible hoy' : '● No disponible'}
                    </span>
                  </div>
                </div>

                {/* Especialidad */}
                <div style={{ color: '#e6b86a', fontSize: '0.82rem', marginBottom: 6 }}>
                  ✂ {b.especialidad}
                </div>

                {/* Estrellas */}
                <div style={{ marginBottom: 6 }}>
                  <Estrellas calificacion={b.calificacion} total={b.totalCalificaciones} />
                </div>

                {/* Dirección */}
                <div style={{ color: '#8b949e', fontSize: '0.78rem', marginBottom: 10 }}>
                  📍 {b.direccion}, {b.ciudad}<br />
                  📞 {b.telefono}
                </div>

                {/* Botón ver perfil */}
                <button
                  onClick={() => navigate(`/cliente/barberos/${b.id}`)}
                  style={{
                    width: '100%',
                    padding: '8px 0',
                    background: 'linear-gradient(135deg, #c0392b, #e74c3c)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 7,
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Ver perfil y agendar →
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}