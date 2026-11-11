import { useState } from 'react'
import { BarrasHorizontales, GraficoIngresos } from '../components/Graficos'
import { Estado } from '../components/Estado'
import { LeyendaLinea, LineaDisponibilidad } from '../components/LineaDisponibilidad'
import { Titulo } from '../components/Titulo'
import { CATEGORIAS, MAQUINAS } from '../data/catalogo'
import { CLIENTES_POR_ID } from '../data/clientes'
import {
  clientesPrincipales,
  comparativoMes,
  demandaNoAtendida,
  enCurso,
  ingresosPorMes,
  ocupacionFlota,
  ocupacionPorCategoria,
  proximosDespachos,
  rendimientoEquipos,
} from '../lib/analitica'
import { zonaPorId } from '../lib/cotizacion'
import { bloquesPorUnidad } from '../lib/disponibilidad'
import { HOY, fechaCorta, mesISO, mesLargo, sumarDias, sumarMeses } from '../lib/fechas'
import { cop, millones, plural, porcentaje } from '../lib/formato'
import { useApp } from '../store/contexto'

const TONO_RECOMENDACION = { alta: 'alerta', baja: 'info', normal: 'ok' }

export function PanelComercial({ onVerFactura }) {
  const { reservas, intentos } = useApp()
  const [categoriaPlan, setCategoriaPlan] = useState('tendido')
  const [ordenTabla, setOrdenTabla] = useState('ingresos')

  const desde30 = HOY
  const hasta30 = sumarDias(HOY, 29)
  const flota = ocupacionFlota(reservas, desde30, hasta30)
  const mes = comparativoMes(reservas)
  const activos = enCurso(reservas)
  const despachos = proximosDespachos(reservas, 10)
  const demanda = demandaNoAtendida(intentos, 30)
  const ingresos = ingresosPorMes(reservas, 6, 2)
  const porCategoria = ocupacionPorCategoria(reservas, desde30, hasta30)
  const clientes = clientesPrincipales(reservas, 180)
  const rendimiento = [...rendimientoEquipos(reservas, intentos, 90)].sort((a, b) => b[ordenTabla] - a[ordenTabla])

  const mesActual = mesISO(HOY)
  const mesAnterior = sumarMeses(mesActual, -1)

  const planDesde = sumarDias(HOY, -7)
  const planDias = 49
  const filasPlan = MAQUINAS.filter((m) => m.categoria === categoriaPlan).flatMap((m) =>
    bloquesPorUnidad(m, reservas, planDesde, sumarDias(planDesde, planDias - 1)).map((f) => ({
      ...f,
      clave: f.unidad,
      etiqueta: f.unidad,
      titulo: `${m.nombre} ${m.modelo}`,
    })),
  )

  const maxDemanda = Math.max(...demanda.porMaquina.map((d) => d.total), 1)
  const maxCliente = Math.max(...clientes.map((c) => c.ingresos), 1)

  const columnas = [
    ['ingresos', 'Ingresos 90 días'],
    ['tasa', 'Ocupación 90 días'],
    ['proximos', 'Ocupación próx. 30 días'],
    ['intentos', 'Solicitudes sin unidad'],
  ]

  return (
    <section className="seccion panel" id="panel" aria-labelledby="panel-titulo">
      <div className="contenedor">
        <div className="seccion-cabecera">
          <Titulo id="panel-titulo" fino="Panel" fuerte="comercial" />
          <p>Ocupación, ingresos y demanda de la flota de alquiler con corte al {fechaCorta(HOY)}. Valores netos antes de IVA, calculados sobre datos ficticios.</p>
        </div>

        <div className="indicadores">
          <article className="indicador">
            <h3>Ocupación de la flota, próximos 30 días</h3>
            <p className="indicador-valor">{porcentaje(flota.tasa)}</p>
            <p className="indicador-detalle">
              {plural(flota.ocupados, 'día-unidad', 'días-unidad')} comprometidos de {plural(flota.capacidad, 'disponible', 'disponibles')}
            </p>
          </article>
          <article className="indicador">
            <h3>Ingresos de {mesLargo(mesActual)} a la fecha</h3>
            <p className="indicador-valor">{millones(mes.actual)}</p>
            <p className="indicador-detalle">
              <Estado tono={mes.variacion >= 0 ? 'ok' : 'alerta'}>
                {mes.variacion >= 0 ? '+' : ''}
                {porcentaje(mes.variacion, 1)}
              </Estado>{' '}
              frente a los primeros {plural(mes.dias, 'día')} de {mesLargo(mesAnterior)}
            </p>
          </article>
          <article className="indicador">
            <h3>Alquileres en curso</h3>
            <p className="indicador-valor">{activos.length}</p>
            <p className="indicador-detalle">{plural(despachos.length, 'despacho programado', 'despachos programados')} en los próximos 10 días</p>
          </article>
          <article className="indicador indicador--alerta">
            <h3>Demanda no atendida, 30 días</h3>
            <p className="indicador-valor">{millones(demanda.valorPerdido)}</p>
            <p className="indicador-detalle">
              {plural(demanda.total, 'solicitud', 'solicitudes')} sobre equipos ocupados; {porcentaje(demanda.tasaRecuperacion)} se recuperó con otra
              fecha o una máquina similar
            </p>
          </article>
        </div>

        <div className="panel-rejilla">
          <article className="tarjeta tarjeta--ancha">
            <h3>Ingresos por mes</h3>
            <GraficoIngresos datos={ingresos} mesActual={mesActual} />
          </article>

          <article className="tarjeta">
            <h3>Ocupación por categoría, próximos 30 días</h3>
            <BarrasHorizontales
              datos={porCategoria.map((c) => ({
                id: c.categoria.id,
                nombre: c.categoria.nombre,
                valor: c.tasa,
                detalle: `${c.ocupados} de ${c.capacidad} días-unidad, ${plural(c.unidades, 'unidad', 'unidades')}`,
              }))}
            />
          </article>

          <article className="tarjeta tarjeta--completa">
            <div className="tarjeta-cabecera">
              <h3>Plan de flota</h3>
              <label className="campo campo--en-linea">
                <span className="campo-etiqueta">Categoría</span>
                <select value={categoriaPlan} onChange={(e) => setCategoriaPlan(e.target.value)}>
                  {CATEGORIAS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <LineaDisponibilidad filas={filasPlan} desde={planDesde} dias={planDias} compacta mostrarClientes />
            <LeyendaLinea conSeleccion={false} />
          </article>

          <article className="tarjeta tarjeta--completa">
            <div className="tarjeta-cabecera">
              <h3>Rendimiento por máquina</h3>
              <label className="campo campo--en-linea">
                <span className="campo-etiqueta">Ordenar por</span>
                <select value={ordenTabla} onChange={(e) => setOrdenTabla(e.target.value)}>
                  {columnas.map(([id, texto]) => (
                    <option key={id} value={id}>
                      {texto}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="tabla-desplazable">
              <table className="tabla tabla--compacta">
                <thead>
                  <tr>
                    <th scope="col">Máquina</th>
                    <th scope="col" className="numero">
                      Unidades
                    </th>
                    <th scope="col" className="numero">
                      Días alquilados
                    </th>
                    <th scope="col">Ocupación 90 días</th>
                    <th scope="col" className="numero">
                      Próx. 30 días
                    </th>
                    <th scope="col" className="numero">
                      Ingresos 90 días
                    </th>
                    <th scope="col" className="numero">
                      Sin unidad
                    </th>
                    <th scope="col">Recomendación</th>
                  </tr>
                </thead>
                <tbody>
                  {rendimiento.map((r) => (
                    <tr key={r.maquina.id}>
                      <td>
                        <strong>{r.maquina.nombre}</strong>
                        <span className="tabla-secundario">{r.maquina.modelo}</span>
                      </td>
                      <td className="numero">{r.maquina.unidades.length}</td>
                      <td className="numero">{r.diasAlquilados}</td>
                      <td>
                        <span className="medidor">
                          <span className="medidor-pista" aria-hidden="true">
                            <span style={{ width: `${Math.min(r.tasa, 1) * 100}%` }} />
                          </span>
                          {porcentaje(r.tasa)}
                        </span>
                      </td>
                      <td className="numero">{porcentaje(r.proximos)}</td>
                      <td className="numero">{cop(Math.round(r.ingresos))}</td>
                      <td className="numero">{r.intentos}</td>
                      <td>
                        <Estado tono={TONO_RECOMENDACION[r.recomendacion.tono]}>{r.recomendacion.texto}</Estado>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="tarjeta">
            <h3>Solicitudes sobre máquinas ocupadas, 30 días</h3>
            {demanda.porMaquina.length ? (
              <BarrasHorizontales
                datos={demanda.porMaquina.map((d) => ({
                  id: d.maquina.id,
                  nombre: `${d.maquina.nombre} ${d.maquina.modelo}`,
                  valor: d.total / maxDemanda,
                  etiqueta: d.total,
                }))}
              />
            ) : (
              <p className="texto-suave">Sin solicitudes rechazadas en el periodo.</p>
            )}
          </article>

          <article className="tarjeta">
            <h3>Clientes principales, 180 días</h3>
            <BarrasHorizontales
              datos={clientes.slice(0, 6).map((c) => ({
                id: c.cliente.id,
                nombre: c.cliente.razonSocial,
                valor: c.ingresos / maxCliente,
                etiqueta: millones(c.ingresos),
                detalle: plural(c.alquileres, 'alquiler', 'alquileres'),
              }))}
            />
          </article>

          <article className="tarjeta tarjeta--completa">
            <h3>Próximos despachos</h3>
            {despachos.length ? (
              <div className="tabla-desplazable">
                <table className="tabla tabla--compacta">
                  <thead>
                    <tr>
                      <th scope="col">Despacho</th>
                      <th scope="col">Entrega</th>
                      <th scope="col">Máquina</th>
                      <th scope="col">Cliente</th>
                      <th scope="col">Destino</th>
                      <th scope="col">
                        <span className="solo-lectores">Factura</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {despachos.map((r) => (
                      <tr key={r.id}>
                        <td>{fechaCorta(r.cotizacion.despacho)}</td>
                        <td>{fechaCorta(r.cotizacion.entrega)}</td>
                        <td>
                          {r.cotizacion.lineas[0].concepto}
                          <span className="tabla-secundario">Unidad {r.unidad}</span>
                        </td>
                        <td>{CLIENTES_POR_ID[r.clienteId].razonSocial}</td>
                        <td>{zonaPorId(r.zonaId).nombre}</td>
                        <td>
                          <button type="button" className="enlace" onClick={() => onVerFactura(r.id)}>
                            {r.factura}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="texto-suave">No hay despachos programados en los próximos 10 días.</p>
            )}
          </article>
        </div>
      </div>
    </section>
  )
}
