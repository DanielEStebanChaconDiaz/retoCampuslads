import { useState } from 'react'
import { LogoSlot } from '../components/LogoSlot'
import { ALQUILER, EMPRESA } from '../data/empresa'
import { useApp } from '../store/contexto'

export function Encabezado({ onIngresar }) {
  const { usuario, cliente, esAdmin, salir } = useApp()
  const [menuAbierto, setMenuAbierto] = useState(false)

  const enlaces = [
    { href: '#alquiler', texto: 'Alquiler' },
    usuario && { href: '#mis-alquileres', texto: esAdmin ? 'Reservas' : 'Mis alquileres' },
    esAdmin && { href: '#panel', texto: 'Panel comercial' },
    { href: '#nosotros', texto: 'El grupo' },
    { href: '#contacto', texto: 'Contacto' },
  ].filter(Boolean)

  return (
    <header className="encabezado">
      <div className="encabezado-contenido">
        <a href="#inicio" className="encabezado-marca" aria-label={`${EMPRESA.nombre} y ${ALQUILER.nombre}, ir al inicio`}>
          <LogoSlot src={EMPRESA.logo} nombre={`logo de ${EMPRESA.nombre}`} etiqueta="Logo SD" className="encabezado-logo" />
          <span className="encabezado-separador" aria-hidden="true" />
          <LogoSlot src={ALQUILER.logo} nombre={`logo de ${ALQUILER.nombre}`} etiqueta="Logo TEC" className="encabezado-logo encabezado-logo--tec" />
        </a>

        <button
          type="button"
          className="encabezado-menu"
          aria-expanded={menuAbierto}
          aria-controls="navegacion"
          onClick={() => setMenuAbierto((v) => !v)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={menuAbierto ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h16'} />
          </svg>
          <span className="solo-lectores">Menú</span>
        </button>

        <nav id="navegacion" className={`encabezado-nav ${menuAbierto ? 'esta-abierto' : ''}`} aria-label="Principal">
          <ul>
            {enlaces.map((e) => (
              <li key={e.href}>
                <a href={e.href} onClick={() => setMenuAbierto(false)}>
                  {e.texto}
                </a>
              </li>
            ))}
          </ul>

          <div className="encabezado-sesion">
            {usuario ? (
              <>
                <div className="encabezado-usuario">
                  <strong>{usuario.nombre}</strong>
                  <span>{cliente?.razonSocial ?? 'Administrador'}</span>
                </div>
                <button type="button" className="boton boton--fantasma" onClick={salir}>
                  Salir
                </button>
              </>
            ) : (
              <button
                type="button"
                className="boton boton--primario"
                onClick={() => {
                  setMenuAbierto(false)
                  onIngresar()
                }}
              >
                Ingresar
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
