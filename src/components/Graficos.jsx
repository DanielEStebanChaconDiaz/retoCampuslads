import { useState } from 'react'
import { mesAnio, nombreMes } from '../lib/fechas'
import { cop, millones, porcentaje } from '../lib/formato'

const pasoAmable = (maximo, divisiones = 4) => {
  const bruto = maximo / divisiones
  const magnitud = 10 ** Math.floor(Math.log10(bruto || 1))
  const normal = bruto / magnitud
  const factor = normal <= 1 ? 1 : normal <= 2 ? 2 : normal <= 2.5 ? 2.5 : normal <= 5 ? 5 : 10
  return factor * magnitud
}

export function GraficoIngresos({ datos, mesActual }) {
  const [activo, setActivo] = useState(null)
  const maximo = Math.max(...datos.map((d) => d.total), 1)
  const paso = pasoAmable(maximo)
  const tope = Math.ceil(maximo / paso) * paso
  const marcas = Array.from({ length: Math.round(tope / paso) + 1 }, (_, i) => i * paso)

  return (
    <figure className="grafico">
      <ul className="leyenda">
        <li>
          <span className="leyenda-muestra leyenda-muestra--realizado" />
          Ejecutado
        </li>
        <li>
          <span className="leyenda-muestra leyenda-muestra--programado" />
          Programado
        </li>
      </ul>
      <div className="barras">
        <div className="barras-eje" aria-hidden="true">
          {marcas.map((m) => (
            <span key={m} style={{ bottom: `${(m / tope) * 100}%` }}>
              {m === 0 ? '0' : millones(m)}
            </span>
          ))}
        </div>
        <div className="barras-area">
          {marcas.map((m) => (
            <span key={m} className="barras-guia" style={{ bottom: `${(m / tope) * 100}%` }} aria-hidden="true" />
          ))}
          {datos.map((d) => (
            <div
              key={d.mes}
              className={`barras-columna ${d.mes === mesActual ? 'es-actual' : ''}`}
              tabIndex={0}
              onMouseEnter={() => setActivo(d.mes)}
              onMouseLeave={() => setActivo(null)}
              onFocus={() => setActivo(d.mes)}
              onBlur={() => setActivo(null)}
              aria-label={`${mesAnio(d.mes)}: ejecutado ${cop(d.realizado)}, programado ${cop(d.programado)}`}
            >
              <div className="barras-pila" style={{ height: `${(d.total / tope) * 100}%` }}>
                {d.programado > 0 && <span className="barras-programado" style={{ flexGrow: d.programado }} />}
                {d.realizado > 0 && <span className="barras-realizado" style={{ flexGrow: d.realizado }} />}
              </div>
              <span className="barras-etiqueta">{nombreMes(d.mes)}</span>
              {activo === d.mes && (
                <div className="tooltip" role="tooltip">
                  <strong>{mesAnio(d.mes)}</strong>
                  <span>Ejecutado {cop(Math.round(d.realizado))}</span>
                  {d.programado > 0 && <span>Programado {cop(Math.round(d.programado))}</span>}
                  <span className="tooltip-total">Total {cop(Math.round(d.total))}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <figcaption className="solo-lectores">Ingresos netos antes de IVA por mes, ejecutados y programados.</figcaption>
    </figure>
  )
}

export function BarrasHorizontales({ datos }) {
  return (
    <ul className="horizontales">
      {datos.map((d) => (
        <li key={d.id} title={d.detalle}>
          <span className="horizontales-nombre">{d.nombre}</span>
          <span className="horizontales-pista" aria-hidden="true">
            <span className="horizontales-relleno" style={{ width: `${Math.min(d.valor, 1) * 100}%` }} />
          </span>
          <span className="horizontales-valor">{d.etiqueta ?? porcentaje(d.valor)}</span>
        </li>
      ))}
    </ul>
  )
}
