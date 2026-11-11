const ICONOS = {
  ok: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  ocupado: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  alerta: <path d="M12 4l9 16H3zM12 10v4M12 17v.5" />,
  info: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 11v5M12 8v.5" />
    </>
  ),
  cancelado: <path d="M7 7l10 10M17 7L7 17" />,
}

export function Estado({ tono = 'info', children, className = '' }) {
  return (
    <span className={`estado estado--${tono} ${className}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {ICONOS[tono] ?? ICONOS.info}
      </svg>
      {children}
    </span>
  )
}
