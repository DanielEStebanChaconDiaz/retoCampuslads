export function LogoSlot({ src, nombre = 'Logo', etiqueta, className = '', claro = false }) {
  if (src) return <img className={`logo-slot logo-slot--imagen ${className}`} src={src} alt={nombre} />
  return (
    <div className={`logo-slot ${claro ? 'logo-slot--claro' : ''} ${className}`} role="img" aria-label={`Espacio para ${nombre}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 15l5-4 4 3 3-2 6 4" />
        <circle cx="16" cy="9" r="1.6" />
      </svg>
      <span>{etiqueta ?? nombre}</span>
    </div>
  )
}
