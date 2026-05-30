import { Star } from 'lucide-react';

export default function Estrellas({ calificacion, total, size = 'sm' }) {
  const starSize = size === 'lg' ? 20 : 14;
  const estrellas = [];

  for (let i = 1; i <= 5; i++) {
    if (calificacion >= i) {
      estrellas.push(
        <span key={i} style={{ display: 'inline-flex' }}>
          <Star size={starSize} fill="var(--gold)" color="var(--gold)" />
        </span>
      );
    } else if (calificacion >= i - 0.5) {
      estrellas.push(
        <span key={i} style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}>
          <Star size={starSize} color="var(--border)" />
          <span style={{
            position: 'absolute', left: 0, top: 0, width: '50%', overflow: 'hidden',
          }}>
            <Star size={starSize} fill="var(--gold)" color="var(--gold)" />
          </span>
        </span>
      );
    } else {
      estrellas.push(
        <span key={i} style={{ display: 'inline-flex' }}>
          <Star size={starSize} color="var(--border)" />
        </span>
      );
    }
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ display: 'inline-flex', gap: 1, alignItems: 'center' }}>{estrellas}</span>
      <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
        {calificacion.toFixed(1)}
        {total && ` (${total})`}
      </span>
    </span>
  );
}