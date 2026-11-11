import { CLIENTES_POR_ID } from '../data/clientes'
import { HOY, diaDelMes, diaSemana, diferenciaDias, nombreMes, rangoTexto, sumarDias } from '../lib/fechas'

const posicion = (desde, dias, inicio, fin) => {
  const a = Math.max(diferenciaDias(desde, inicio), 0)
  const b = Math.min(diferenciaDias(desde, fin) + 1, dias)
  if (b <= 0 || a >= dias) return null
  return { left: `${(a / dias) * 100}%`, width: `${((b - a) / dias) * 100}%`, largo: b - a }
}

const describir = (bloque, clienteActual) => {
  if (bloque.tipo === 'mantenimiento') return 'Mantenimiento'
  if (clienteActual && bloque.clienteId === clienteActual) return 'Tu alquiler'
  return CLIENTES_POR_ID[bloque.clienteId]?.razonSocial ?? 'Alquilada'
}

export function LineaDisponibilidad({ filas, desde, dias, seleccion, clienteActual, compacta = false, mostrarClientes = false }) {
  const columnas = Array.from({ length: dias }, (_, i) => sumarDias(desde, i))
  const marcaHoy = posicion(desde, dias, HOY, HOY)
  const banda = seleccion ? posicion(desde, dias, seleccion.inicio, seleccion.fin) : null
  const paso = dias > 45 ? 7 : dias > 24 ? 2 : 1

  return (
    <div className={`linea ${compacta ? 'linea--compacta' : ''}`}>
      <div className="linea-etiquetas">
        <div className="linea-cabecera" />
        {filas.map((f) => (
          <div key={f.clave ?? f.unidad} className="linea-etiqueta" title={f.titulo ?? f.unidad}>
            {f.etiqueta ?? f.unidad}
          </div>
        ))}
      </div>

      <div className="linea-pistas">
        <div className="linea-cabecera linea-escala" style={{ gridTemplateColumns: `repeat(${dias}, 1fr)` }}>
          {columnas.map((dia, i) => {
            const inicioMes = diaDelMes(dia) === 1 || i === 0
            const finDeSemana = ['sáb', 'dom'].includes(diaSemana(dia))
            return (
              <div key={dia} className={`linea-dia ${finDeSemana ? 'es-finde' : ''} ${inicioMes ? 'es-mes' : ''}`}>
                {inicioMes && <span className="linea-mes">{nombreMes(dia.slice(0, 7))}</span>}
                {(i % paso === 0 || inicioMes) && <span className="linea-numero">{diaDelMes(dia)}</span>}
              </div>
            )
          })}
        </div>

        {filas.map((f) => (
          <div key={f.clave ?? f.unidad} className="linea-pista">
            {f.bloques.map((b) => {
              const p = posicion(desde, dias, b.inicio, b.fin)
              if (!p) return null
              const propio = clienteActual && b.clienteId === clienteActual
              const texto = describir(b, clienteActual)
              return (
                <span
                  key={b.id}
                  className={`linea-bloque linea-bloque--${b.tipo} ${propio ? 'linea-bloque--propio' : ''}`}
                  style={{ left: p.left, width: p.width }}
                  title={`${texto}: ${rangoTexto(b.inicio, b.fin)}`}
                >
                  {(mostrarClientes || propio || b.tipo === 'mantenimiento') && p.largo >= (compacta ? 6 : 4) && (
                    <span className="linea-bloque-texto">{b.tipo === 'mantenimiento' ? 'Mant.' : texto}</span>
                  )}
                </span>
              )
            })}
          </div>
        ))}

        {marcaHoy && <span className="linea-hoy" style={{ left: marcaHoy.left }} aria-hidden="true" />}
        {banda && <span className="linea-seleccion" style={{ left: banda.left, width: banda.width }} aria-hidden="true" />}
      </div>
    </div>
  )
}

export function LeyendaLinea({ conSeleccion = true, conPropio = false }) {
  return (
    <ul className="leyenda">
      <li>
        <span className="leyenda-muestra leyenda-muestra--alquiler" />
        Alquilada
      </li>
      {conPropio && (
        <li>
          <span className="leyenda-muestra leyenda-muestra--propio" />
          Tus alquileres
        </li>
      )}
      <li>
        <span className="leyenda-muestra leyenda-muestra--mantenimiento" />
        Mantenimiento
      </li>
      {conSeleccion && (
        <li>
          <span className="leyenda-muestra leyenda-muestra--seleccion" />
          Fechas solicitadas
        </li>
      )}
      <li>
        <span className="leyenda-muestra leyenda-muestra--hoy" />
        Hoy
      </li>
    </ul>
  )
}
