// src/components/SelectorUbicacion.jsx
import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
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

const iconoPin = (color) => L.divIcon({
  className: '',
  html: `
    <div style="
      width: 38px; height: 38px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      background: ${color};
      border: 3px solid #fff;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center;
    ">
      <span style="transform: rotate(45deg); font-size: 1rem;">📍</span>
    </div>
  `,
  iconSize:   [38, 38],
  iconAnchor: [19, 38],
  popupAnchor:[0, -40],
});

// Mueve el centro del mapa cuando cambia la posición
function CentrarEnPosicion({ posicion }) {
  const map = useMap();
  if (posicion) map.setView(posicion, 16);
  return null;
}

function PinArrastrable({ posicion, setPosicion, colorPin }) {
  useMapEvents({
    click(e) {
      setPosicion([e.latlng.lat, e.latlng.lng]);
    },
  });

  return posicion ? (
    <Marker
      position={posicion}
      icon={iconoPin(colorPin)}
      draggable={true}
      eventHandlers={{
        dragend(e) {
          const { lat, lng } = e.target.getLatLng();
          setPosicion([lat, lng]);
        },
      }}
    />
  ) : null;
}

export default function SelectorUbicacion({
  valor,
  onChange,
  colorPin = '#e74c3c',
  altura = 280,
}) {
  const CENTRO_VALLEDUPAR = [10.4631, -73.2532];

  const [posicion, setPosicion] = useState(
    valor?.lat && valor?.lng ? [valor.lat, valor.lng] : null
  );
  const [busqueda, setBusqueda]     = useState('');
  const [buscando, setBuscando]     = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState('');

  const handleCambio = (nuevaPos) => {
    setPosicion(nuevaPos);
    onChange({ lat: nuevaPos[0], lng: nuevaPos[1] });
  };

  // Llama a Nominatim (OpenStreetMap) para convertir dirección en coordenadas
  // FUTURO: se puede reemplazar por Google Maps Geocoding si se necesita más precisión
  const buscarDireccion = async () => {
    if (!busqueda.trim()) return;
    setBuscando(true);
    setErrorBusqueda('');

    try {
      // Agregamos "Valledupar, Colombia" para mejorar precisión local
      const query = encodeURIComponent(`${busqueda}, Valledupar, Colombia`);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
        {
          headers: {
            // Nominatim requiere identificar la app en el header
            'Accept-Language': 'es',
          },
        }
      );
      const data = await res.json();

      if (data.length === 0) {
        setErrorBusqueda('No se encontró esa dirección. Intenta ser más específico o ubica el pin manualmente.');
        setBuscando(false);
        return;
      }

      const { lat, lon } = data[0];
      handleCambio([parseFloat(lat), parseFloat(lon)]);
    } catch {
      setErrorBusqueda('Error al buscar la dirección. Ubica el pin manualmente.');
    }

    setBuscando(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      buscarDireccion();
    }
  };

  return (
    <div>
      {/* ── Buscador de dirección ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input
          type="text"
          className="form-control"
          placeholder="Ej: Calle 10 #5-32"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ flex: 1 }}
        />
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={buscarDireccion}
          disabled={buscando || !busqueda.trim()}
          style={{ flexShrink: 0, minWidth: 100 }}
        >
          {buscando ? '⏳ Buscando...' : '🔍 Buscar'}
        </button>
      </div>

      {/* Error de búsqueda */}
      {errorBusqueda && (
        <div className="alert alert-error" style={{ marginBottom: 8, fontSize: '0.78rem' }}>
          {errorBusqueda}
        </div>
      )}

      {/* Instrucción */}
      <div style={{
        fontSize: '0.75rem', color: 'var(--muted)',
        marginBottom: 8,
      }}>
        💡 Si la ubicación no es exacta, arrastra el pin o haz clic en el mapa para ajustarla
      </div>

      {/* ── Mapa ── */}
      <div style={{
        borderRadius: 10, overflow: 'hidden',
        border: posicion
          ? '1.5px solid var(--gold)'
          : '1.5px solid var(--border)',
        boxShadow: posicion ? 'var(--shadow-gold)' : 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}>
        <MapContainer
          center={posicion ?? CENTRO_VALLEDUPAR}
          zoom={14}
          style={{ height: altura, width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Centra el mapa cuando se encuentra una dirección */}
          {posicion && <CentrarEnPosicion posicion={posicion} />}
          <PinArrastrable
            posicion={posicion}
            setPosicion={handleCambio}
            colorPin={colorPin}
          />
        </MapContainer>
      </div>

      {/* Coordenadas seleccionadas */}
      {posicion ? (
        <div style={{
          marginTop: 8, padding: '8px 12px',
          background: 'rgba(230,184,106,0.08)',
          border: '1px solid rgba(230,184,106,0.2)',
          borderRadius: 8, fontSize: '0.78rem', color: 'var(--gold)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>✅ {posicion[0].toFixed(5)}, {posicion[1].toFixed(5)}</span>
          <button
            type="button"
            onClick={() => { setPosicion(null); onChange(null); }}
            style={{
              background: 'none', border: 'none',
              color: 'var(--muted)', cursor: 'pointer', fontSize: '0.8rem',
            }}
          >
            ✕ Limpiar
          </button>
        </div>
      ) : (
        <div style={{
          marginTop: 8, fontSize: '0.75rem',
          color: 'var(--muted)', textAlign: 'center',
        }}>
          Sin ubicación seleccionada
        </div>
      )}
    </div>
  );
}