import { useId } from 'react'
import { ZONAS } from '../data/tarifas'
import { HOY } from '../lib/fechas'
import { useApp } from '../store/contexto'

export function CamposBusqueda({ className = '' }) {
  const { busqueda, actualizarBusqueda } = useApp()
  const id = useId()

  const cambiarInicio = (valor) => {
    const cambios = { inicio: valor }
    if (valor && busqueda.fin && busqueda.fin < valor) cambios.fin = valor
    actualizarBusqueda(cambios)
  }

  return (
    <div className={`campos-busqueda ${className}`}>
      <label className="campo" htmlFor={`${id}-inicio`}>
        <span className="campo-etiqueta">Desde</span>
        <input id={`${id}-inicio`} type="date" min={HOY} value={busqueda.inicio} onChange={(e) => cambiarInicio(e.target.value)} />
      </label>
      <label className="campo" htmlFor={`${id}-fin`}>
        <span className="campo-etiqueta">Hasta</span>
        <input
          id={`${id}-fin`}
          type="date"
          min={busqueda.inicio || HOY}
          value={busqueda.fin}
          onChange={(e) => actualizarBusqueda({ fin: e.target.value })}
        />
      </label>
      <label className="campo campo--ancho" htmlFor={`${id}-zona`}>
        <span className="campo-etiqueta">Destino de la obra</span>
        <select id={`${id}-zona`} value={busqueda.zonaId} onChange={(e) => actualizarBusqueda({ zonaId: e.target.value })}>
          {ZONAS.map((z) => (
            <option key={z.id} value={z.id}>
              {z.nombre}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
