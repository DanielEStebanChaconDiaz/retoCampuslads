import { useEffect, useRef } from 'react'

export function Capa({ abierta, onCerrar, titulo, variante = 'modal', children, className = '' }) {
  const panel = useRef(null)
  const cerrar = useRef(onCerrar)

  useEffect(() => {
    cerrar.current = onCerrar
  })

  useEffect(() => {
    if (!abierta) return
    const previo = document.activeElement
    const alTeclear = (e) => {
      if (e.key === 'Escape') cerrar.current()
    }
    document.addEventListener('keydown', alTeclear)
    document.body.classList.add('sin-scroll')
    panel.current?.focus()
    return () => {
      document.removeEventListener('keydown', alTeclear)
      document.body.classList.remove('sin-scroll')
      previo?.focus?.()
    }
  }, [abierta])

  if (!abierta) return null

  return (
    <div className={`capa capa--${variante}`} onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <div className={`capa-panel ${className}`} role="dialog" aria-modal="true" aria-label={titulo} tabIndex={-1} ref={panel}>
        <button type="button" className="capa-cerrar" onClick={onCerrar} aria-label="Cerrar">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  )
}
