export default function AvatarDisplay({ src, alt, size, style, className }) {
  if (typeof src === 'string' && src.startsWith('http')) {
    return <img src={src} alt={alt || ''} style={{ width: size || '100%', height: size || '100%', borderRadius: '50%', objectFit: 'cover', ...style }} className={className} />;
  }
  return <span style={{ fontSize: size || '2.8rem', ...style }} className={className}>{src || '💈'}</span>;
}
