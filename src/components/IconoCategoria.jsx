const TRAZOS = {
  tendido: (
    <>
      <circle cx="9" cy="13" r="6" />
      <circle cx="9" cy="13" r="2" />
      <path d="M15 13h6M18 10v6M3 21h18" />
    </>
  ),
  izaje: (
    <>
      <path d="M4 21V9l11-5 5 5" />
      <path d="M4 9h11M15 4v5M20 9v5" />
      <path d="M18.5 14h3l-1.5 2.5z" />
      <path d="M2 21h8" />
    </>
  ),
  carga: (
    <>
      <path d="M3 17V9h7l2 4h4v4" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="14" cy="18" r="2" />
      <path d="M16 13l3-5h2l1 5z" />
    </>
  ),
  medicion: (
    <>
      <path d="M4 16a8 8 0 1 1 16 0" />
      <path d="M12 16l4-5" />
      <circle cx="12" cy="16" r="1.4" />
      <path d="M4 20h16" />
    </>
  ),
  energia: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="1.5" />
      <path d="M13 8l-3 4.5h4L11 17" />
      <path d="M6 18v2M18 18v2" />
    </>
  ),
  obra: (
    <>
      <path d="M6 8l9-3 3 8-9 3z" />
      <path d="M9 16l-2 5M15 13l2 8" />
      <path d="M3 21h18" />
    </>
  ),
  lineas: (
    <>
      <path d="M12 3l-4 18M12 3l4 18M7 8h10M5 12h14" />
      <path d="M9 15l6 4M15 15l-6 4" />
    </>
  ),
  campamento: (
    <>
      <rect x="3" y="7" width="18" height="11" />
      <path d="M7 7v11M11 7v11M15 7v11M3 4h18" />
    </>
  ),
  industrial: (
    <>
      <path d="M8 3h8v6H8z" />
      <path d="M12 9v6" strokeDasharray="1.5 1.5" />
      <path d="M5 19h14M7 15h10v4H7z" />
    </>
  ),
}

export function IconoCategoria({ categoria, className = '' }) {
  return (
    <svg className={`icono ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      {TRAZOS[categoria] ?? TRAZOS.lineas}
    </svg>
  )
}
