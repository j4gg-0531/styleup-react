// src/components/Estrellas.jsx
// Componente reutilizable para mostrar calificación en estrellas
// FUTURO: agregará lógica de calificar cuando se conecte la BD

export default function Estrellas({ calificacion, total, size = 'sm' }) {
  const fontSize = size === 'lg' ? '1.3rem' : '0.95rem';
  const estrellas = [];

  for (let i = 1; i <= 5; i++) {
    if (calificacion >= i) {
      // Estrella llena
      estrellas.push(
        <span key={i} style={{ color: 'var(--gold)', fontSize }}>★</span>
      );
    } else if (calificacion >= i - 0.5) {
      // Media estrella
      estrellas.push(
        <span key={i} style={{ position: 'relative', fontSize, display: 'inline-block' }}>
          <span style={{ color: 'var(--border)' }}>★</span>
          <span style={{
            color: 'var(--gold)', position: 'absolute',
            left: 0, top: 0, width: '50%', overflow: 'hidden'
          }}>★</span>
        </span>
      );
    } else {
      // Estrella vacía
      estrellas.push(
        <span key={i} style={{ color: 'var(--border)', fontSize }}>★</span>
      );
    }
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ display: 'inline-flex', gap: 1 }}>{estrellas}</span>
      <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
        {calificacion.toFixed(1)}
        {total && ` (${total})`}
      </span>
    </span>
  );
}