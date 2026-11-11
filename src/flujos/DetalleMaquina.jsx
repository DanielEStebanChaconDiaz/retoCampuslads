import { useState } from 'react'
import { CamposBusqueda } from '../components/CamposBusqueda'
import { Estado } from '../components/Estado'
import { IconoCategoria } from '../components/IconoCategoria'
import { LeyendaLinea, LineaDisponibilidad } from '../components/LineaDisponibilidad'
import { Titulo } from '../components/Titulo'
import { CATEGORIAS_POR_ID, EQUIPOS, EQUIPOS_POR_ID, MAQUINAS_POR_ID } from '../data/catalogo'
import { CLIENTES } from '../data/clientes'
import { ALQUILER } from '../data/empresa'
import { DIAS_MAXIMOS, PORCENTAJE_IVA, PORCENTAJE_SEGURO, TARIFA_OPERADOR } from '../data/tarifas'
import { cotizar, estimadoAlquiler, zonaPorId } from '../lib/cotizacion'
import { bloquesPorUnidad, estadoMaquina, maquinasSimilares, stockLibre } from '../lib/disponibilidad'
import { HOY, diasInclusivos, diferenciaDias, fechaCorta, fechaLarga, rangoTexto, sumarDias } from '../lib/fechas'
import { cop, plural } from '../lib/formato'
import { useApp } from '../store/contexto'

const VENTANA_MINIMA = 49

function Cantidad({ valor, maximo, onCambiar, etiqueta }) {
  return (
    <div className="cantidad" role="group" aria-label={`Cantidad de ${etiqueta}`}>
      <button type="button" onClick={() => onCambiar(Math.max(valor - 1, 0))} disabled={valor <= 0} aria-label="Quitar uno">
        −
      </button>
      <output aria-live="polite">{valor}</output>
      <button type="button" onClick={() => onCambiar(Math.min(valor + 1, maximo))} disabled={valor >= maximo} aria-label="Agregar uno">
        +
      </button>
    </div>
  )
}

export function DetalleMaquina({ maquinaId, onCambiarMaquina, onConfirmada }) {
  const { reservas, busqueda, actualizarBusqueda, cliente, esAdmin, crearReserva } = useApp()
  const maquina = MAQUINAS_POR_ID[maquinaId]
  const { inicio, fin, zonaId } = busqueda

  const [conOperador, setConOperador] = useState(false)
  const [cantidades, setCantidades] = useState({})
  const [obra, setObra] = useState('')
  const [clienteId, setClienteId] = useState(cliente?.id ?? CLIENTES[0].id)
  const [verOtros, setVerOtros] = useState(false)
  const [verSimilares, setVerSimilares] = useState(false)
  const [error, setError] = useState('')

  const zona = zonaPorId(zonaId)
  const minimoInicio = sumarDias(HOY, zona.diasTransito)
  const errores = []
  if (!inicio || !fin) errores.push('Elige la fecha de inicio y la de fin del alquiler.')
  else if (fin < inicio) errores.push('La fecha de fin debe ser igual o posterior a la de inicio.')
  else {
    if (inicio < minimoInicio) {
      errores.push(
        zona.diasTransito
          ? `Hacia ${zona.nombre} el despacho toma ${plural(zona.diasTransito, 'día')}: la entrega más cercana es el ${fechaLarga(minimoInicio)}.`
          : 'La fecha de inicio no puede ser anterior a hoy.',
      )
    }
    if (diasInclusivos(inicio, fin) > DIAS_MAXIMOS) {
      errores.push(`En línea se pueden alquilar hasta ${DIAS_MAXIMOS} días. Para periodos más largos escribe a ${ALQUILER.correo}.`)
    }
  }
  const fechasValidas = errores.length === 0
  const rangoConsultable = Boolean(inicio && fin && fin >= inicio)

  const estado = rangoConsultable ? estadoMaquina(maquina, reservas, inicio, fin) : null
  const disponible = Boolean(estado?.disponible)
  const proxima = estado?.proxima

  const sugeridos = maquina.accesorios.map((id) => EQUIPOS_POR_ID[id])
  const otros = EQUIPOS.filter((e) => !maquina.accesorios.includes(e.id))
  const stock = (equipo) => (rangoConsultable ? stockLibre(equipo, reservas, inicio, fin) : equipo.stock)

  const accesorios = Object.entries(cantidades)
    .filter(([, cantidad]) => cantidad > 0)
    .map(([id, cantidad]) => ({ id, cantidad }))
  const excedidos = accesorios.filter((a) => a.cantidad > stock(EQUIPOS_POR_ID[a.id]))

  const cotizacion = rangoConsultable ? cotizar({ maquina, inicio, fin, zonaId, conOperador, accesorios }) : null

  const desde = rangoConsultable ? [sumarDias(HOY, -3), sumarDias(inicio, -10)].sort()[1] : sumarDias(HOY, -3)
  const diasVentana = rangoConsultable ? Math.min(Math.max(VENTANA_MINIMA, diferenciaDias(desde, fin) + 10), 120) : VENTANA_MINIMA
  const hasta = sumarDias(desde, diasVentana - 1)

  const similares = rangoConsultable ? maquinasSimilares(maquina, reservas, inicio, fin) : []
  const mostrarSimilares = !disponible || verSimilares

  const motivoBloqueo = !fechasValidas
    ? errores[0]
    : !disponible
      ? 'No hay unidades libres en esas fechas. Usa la próxima fecha disponible o elige una máquina similar.'
      : excedidos.length
        ? `Solo quedan ${stock(EQUIPOS_POR_ID[excedidos[0].id])} unidades de ${EQUIPOS_POR_ID[excedidos[0].id].nombre.toLowerCase()} en esas fechas.`
        : ''

  const confirmar = (e) => {
    e.preventDefault()
    if (motivoBloqueo) return
    const resultado = crearReserva({
      maquinaId: maquina.id,
      inicio,
      fin,
      zonaId,
      conOperador,
      accesorios,
      obra,
      clienteId: esAdmin ? clienteId : cliente.id,
    })
    if (!resultado.ok) {
      setError(resultado.error)
      return
    }
    onConfirmada(resultado.reserva.id)
  }

  const filaEquipo = (equipo) => {
    const libre = stock(equipo)
    const valor = cantidades[equipo.id] ?? 0
    return (
      <li key={equipo.id} className={libre === 0 && valor === 0 ? 'esta-agotado' : ''}>
        <div>
          <span className="adicional-nombre">{equipo.nombre}</span>
          <span className="adicional-meta">
            {cop(equipo.tarifaDia)} por día, {libre === 0 ? 'sin unidades libres' : `${libre} libres`}
          </span>
        </div>
        <Cantidad valor={valor} maximo={libre} etiqueta={equipo.nombre} onCambiar={(n) => setCantidades((c) => ({ ...c, [equipo.id]: n }))} />
      </li>
    )
  }

  return (
    <div className="detalle">
      <div className="detalle-principal">
        <p className="detalle-categoria">
          <IconoCategoria categoria={maquina.categoria} />
          {CATEGORIAS_POR_ID[maquina.categoria].nombre}
        </p>
        <Titulo nivel={2} fino={maquina.nombre} fuerte={maquina.modelo} className="detalle-titulo" />

        <div className="detalle-ficha">
          <div className="detalle-imagen">
            {maquina.imagen ? (
              <img src={maquina.imagen} alt={`${maquina.nombre} ${maquina.modelo}`} width="800" height="600" />
            ) : (
              <>
                <IconoCategoria categoria={maquina.categoria} />
                <span>Espacio para fotografía del equipo</span>
              </>
            )}
          </div>
          <div>
            <p className="detalle-resumen">{maquina.resumen}</p>
            <dl className="especificaciones">
              {maquina.specs.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {maquina.detalles.length > 0 && (
          <ul className="lista-marcas detalle-caracteristicas">
            {maquina.detalles.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        )}

        <section className="detalle-bloque" aria-labelledby="disponibilidad-titulo">
          <div className="detalle-bloque-cabecera">
            <h3 id="disponibilidad-titulo">Disponibilidad por unidad</h3>
            {rangoConsultable &&
              (disponible ? (
                <Estado tono="ok">
                  {estado.libres.length} de {maquina.unidades.length} libres del {rangoTexto(inicio, fin)}
                </Estado>
              ) : (
                <Estado tono="ocupado">Ocupada del {rangoTexto(inicio, fin)}</Estado>
              ))}
          </div>

          {rangoConsultable && !disponible && (
            <div className="aviso aviso--ocupado">
              {proxima ? (
                <p>
                  Todas las unidades están comprometidas en las fechas que elegiste. La próxima ventana de{' '}
                  <strong>{plural(diasInclusivos(inicio, fin), 'día')}</strong> empieza el <strong>{fechaLarga(proxima.inicio)}</strong> y termina
                  el {fechaLarga(proxima.fin)} con la unidad {proxima.unidad}.
                </p>
              ) : (
                <p>No encontramos una ventana libre de esa duración en los próximos meses.</p>
              )}
              <div className="aviso-acciones">
                {proxima && (
                  <button type="button" className="boton boton--primario" onClick={() => actualizarBusqueda({ inicio: proxima.inicio, fin: proxima.fin })}>
                    Usar desde el {fechaCorta(proxima.inicio)}
                  </button>
                )}
                <a className="boton boton--secundario" href="#similares">
                  Ver maquinaria similar
                </a>
              </div>
            </div>
          )}

          <LineaDisponibilidad
            filas={bloquesPorUnidad(maquina, reservas, desde, hasta)}
            desde={desde}
            dias={diasVentana}
            seleccion={rangoConsultable ? { inicio, fin } : null}
            clienteActual={esAdmin ? clienteId : cliente?.id}
          />
          <LeyendaLinea conPropio />
        </section>

        <section className="detalle-bloque" id="similares" aria-labelledby="similares-titulo">
          <div className="detalle-bloque-cabecera">
            <h3 id="similares-titulo">Maquinaria similar</h3>
            {disponible && (
              <button type="button" className="enlace" onClick={() => setVerSimilares((v) => !v)} aria-expanded={verSimilares}>
                {verSimilares ? 'Ocultar' : 'Mostrar alternativas'}
              </button>
            )}
          </div>
          {mostrarSimilares &&
            (similares.length ? (
              <ul className="similares">
                {similares.map((s) => (
                  <li key={s.maquina.id}>
                    <span className="similares-imagen">
                      {s.maquina.imagen ? (
                        <img src={s.maquina.imagen} alt="" loading="lazy" width="800" height="600" />
                      ) : (
                        <IconoCategoria categoria={s.maquina.categoria} />
                      )}
                    </span>
                    <p className="similares-info">
                      <strong>{s.maquina.nombre}</strong>
                      <span>{s.maquina.modelo}</span>
                    </p>
                    <div className="similares-detalle">
                      {s.disponible ? (
                        <Estado tono="ok">Libre en tus fechas</Estado>
                      ) : (
                        <Estado tono="ocupado">{s.proxima ? `Libre desde el ${fechaCorta(s.proxima.inicio)}` : 'Ocupada'}</Estado>
                      )}
                      <span className="similares-precio">
                        {cop(estimadoAlquiler(s.maquina, diasInclusivos(inicio, fin)))}
                        <small>alquiler estimado</small>
                      </span>
                    </div>
                    <button type="button" className="boton boton--secundario boton--chico" onClick={() => onCambiarMaquina(s.maquina.id)}>
                      Ver esta máquina
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="texto-suave">
                Este equipo no tiene equivalentes en la flota. Escríbenos a {ALQUILER.correo} y buscamos una alternativa con aliados.
              </p>
            ))}
        </section>
      </div>

      <form className="cotizacion" onSubmit={confirmar} aria-labelledby="cotizacion-titulo">
        <h3 id="cotizacion-titulo">Cotización del alquiler</h3>

        <CamposBusqueda className="campos-busqueda--apilados" />
        {errores.map((e) => (
          <p key={e} className="texto-alerta">
            {e}
          </p>
        ))}

        {maquina.operador === 'incluido' && <p className="cotizacion-nota">Incluye operador certificado durante todo el alquiler.</p>}
        {maquina.operador === 'opcional' && (
          <label className="interruptor">
            <input type="checkbox" checked={conOperador} onChange={(e) => setConOperador(e.target.checked)} />
            <span>Agregar operador certificado ({cop(TARIFA_OPERADOR)} por día)</span>
          </label>
        )}

        <fieldset className="adicionales">
          <legend>Equipos adicionales</legend>
          {sugeridos.length > 0 && <ul>{sugeridos.map(filaEquipo)}</ul>}
          <button type="button" className="enlace" onClick={() => setVerOtros((v) => !v)} aria-expanded={verOtros}>
            {verOtros ? 'Ocultar otros equipos' : sugeridos.length ? 'Agregar otros equipos' : 'Agregar equipos de apoyo'}
          </button>
          {verOtros && <ul>{otros.map(filaEquipo)}</ul>}
        </fieldset>

        <label className="campo">
          <span className="campo-etiqueta">Obra o frente de trabajo</span>
          <input type="text" value={obra} onChange={(e) => setObra(e.target.value)} placeholder="Ej. Variante línea 230 kV, torre 18" maxLength={90} />
        </label>

        {esAdmin && (
          <label className="campo">
            <span className="campo-etiqueta">Cliente</span>
            <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
              {CLIENTES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.razonSocial}
                </option>
              ))}
            </select>
          </label>
        )}

        {cotizacion && (
          <dl className="desglose">
            {cotizacion.lineas.map((l) => (
              <div key={l.id}>
                <dt>
                  {l.tipo === 'maquina' ? 'Alquiler de la máquina' : l.concepto}
                  <small>
                    {l.cantidad > 1 ? `${l.cantidad} × ` : ''}
                    {plural(l.dias, 'día')} × {cop(l.unitario)}
                  </small>
                </dt>
                <dd>{cop(l.total)}</dd>
              </div>
            ))}
            {cotizacion.descuento > 0 && (
              <div className="desglose-descuento">
                <dt>
                  {cotizacion.tramo.etiqueta}
                  <small>{Math.round(cotizacion.tramo.porcentaje * 100)} % sobre el alquiler</small>
                </dt>
                <dd>−{cop(cotizacion.descuento)}</dd>
              </div>
            )}
            {cotizacion.operador > 0 && (
              <div>
                <dt>
                  Operador certificado<small>{plural(cotizacion.dias, 'día')}</small>
                </dt>
                <dd>{cop(cotizacion.operador)}</dd>
              </div>
            )}
            <div>
              <dt>
                Movilización ida y regreso<small>{zona.nombre}</small>
              </dt>
              <dd>{cop(cotizacion.movilizacion)}</dd>
            </div>
            <div>
              <dt>
                Póliza de daños<small>{(PORCENTAJE_SEGURO * 100).toLocaleString('es-CO')} % del alquiler</small>
              </dt>
              <dd>{cop(cotizacion.seguro)}</dd>
            </div>
            <div className="desglose-subtotal">
              <dt>Subtotal</dt>
              <dd>{cop(cotizacion.subtotal)}</dd>
            </div>
            <div>
              <dt>IVA {Math.round(PORCENTAJE_IVA * 100)} %</dt>
              <dd>{cop(cotizacion.iva)}</dd>
            </div>
            <div className="desglose-total">
              <dt>Total estimado</dt>
              <dd>{cop(cotizacion.total)}</dd>
            </div>
          </dl>
        )}

        {cotizacion && fechasValidas && (
          <ul className="cotizacion-logistica">
            <li>
              <span>Despacho desde bodega</span>
              <strong>{fechaCorta(cotizacion.despacho)}</strong>
            </li>
            <li>
              <span>Entrega estimada en obra</span>
              <strong>{fechaCorta(cotizacion.entrega)}</strong>
            </li>
            <li>
              <span>Depósito reembolsable</span>
              <strong>{cop(cotizacion.deposito)}</strong>
            </li>
          </ul>
        )}

        {error && <p className="texto-alerta">{error}</p>}
        {motivoBloqueo && fechasValidas && <p className="texto-suave cotizacion-motivo">{motivoBloqueo}</p>}

        <button type="submit" className="boton boton--primario boton--grande boton--bloque" disabled={Boolean(motivoBloqueo)}>
          Confirmar alquiler
        </button>
      </form>
    </div>
  )
}
