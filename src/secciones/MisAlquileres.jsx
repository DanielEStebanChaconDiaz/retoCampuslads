import { useState } from 'react'
import { Estado } from '../components/Estado'
import { Titulo } from '../components/Titulo'
import { MAQUINAS_POR_ID } from '../data/catalogo'
import { CLIENTES_POR_ID } from '../data/clientes'
import { estadoReserva } from '../lib/analitica'
import { rangoTexto } from '../lib/fechas'
import { cop, plural } from '../lib/formato'
import { useApp } from '../store/contexto'

const FILTROS = [
  { id: 'todas', texto: 'Todas' },
  { id: 'programada', texto: 'Programadas' },
  { id: 'en-curso', texto: 'En curso' },
  { id: 'finalizada', texto: 'Finalizadas' },
  { id: 'cancelada', texto: 'Canceladas' },
]

const TONOS = {
  programada: ['info', 'Programada'],
  'en-curso': ['ok', 'En curso'],
  finalizada: ['info', 'Finalizada'],
  cancelada: ['cancelado', 'Cancelada'],
}

const POR_PAGINA = 12

export function MisAlquileres({ onVerFactura }) {
  const { reservas, cliente, esAdmin, cancelarReserva } = useApp()
  const [filtro, setFiltro] = useState('todas')
  const [limite, setLimite] = useState(POR_PAGINA)
  const [porCancelar, setPorCancelar] = useState(null)

  const propias = reservas
    .filter((r) => r.tipo === 'alquiler' && (esAdmin || r.clienteId === cliente?.id))
    .map((r) => ({ ...r, situacion: estadoReserva(r) }))
    .sort((a, b) => b.inicio.localeCompare(a.inicio))

  const conteo = FILTROS.reduce(
    (acc, f) => ({ ...acc, [f.id]: f.id === 'todas' ? propias.length : propias.filter((r) => r.situacion === f.id).length }),
    {},
  )

  const lista = propias.filter((r) => filtro === 'todas' || r.situacion === filtro)
  const visibles = lista.slice(0, limite)

  const totalActivo = propias.filter((r) => ['programada', 'en-curso'].includes(r.situacion)).reduce((s, r) => s + r.cotizacion.total, 0)

  return (
    <section className="seccion seccion--niebla" id="mis-alquileres" aria-labelledby="mis-alquileres-titulo">
      <div className="contenedor">
        <div className="seccion-cabecera">
          <Titulo id="mis-alquileres-titulo" fino={esAdmin ? 'Reservas de' : 'Mis'} fuerte={esAdmin ? 'la flota' : 'alquileres'} />
          <p>
            {plural(conteo.programada + conteo['en-curso'], 'alquiler activo', 'alquileres activos')} por {cop(totalActivo)}.{' '}
            {esAdmin ? 'Consulta cualquier factura o libera una reserva programada.' : 'Consulta tus facturas o cancela un alquiler antes del despacho.'}
          </p>
        </div>

        <div className="pestanas" role="tablist" aria-label="Filtrar alquileres">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filtro === f.id}
              className={filtro === f.id ? 'esta-activa' : ''}
              onClick={() => {
                setFiltro(f.id)
                setLimite(POR_PAGINA)
              }}
            >
              {f.texto} <span>{conteo[f.id]}</span>
            </button>
          ))}
        </div>

        {visibles.length === 0 ? (
          <div className="vacio">
            <p>{filtro === 'todas' ? 'Todavía no tienes alquileres. Elige fechas en el catálogo y alquila tu primera máquina.' : 'No hay alquileres en este estado.'}</p>
            {filtro === 'todas' && (
              <a className="boton boton--primario" href="#alquiler">
                Ir al catálogo
              </a>
            )}
          </div>
        ) : (
          <div className="tabla-desplazable">
            <table className="tabla">
              <thead>
                <tr>
                  <th scope="col">Factura</th>
                  {esAdmin && <th scope="col">Cliente</th>}
                  <th scope="col">Máquina</th>
                  <th scope="col">Fechas</th>
                  <th scope="col">Estado</th>
                  <th scope="col" className="numero">
                    Total
                  </th>
                  <th scope="col">
                    <span className="solo-lectores">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((r) => {
                  const maquina = MAQUINAS_POR_ID[r.maquinaId]
                  const [tono, texto] = TONOS[r.situacion]
                  return (
                    <tr key={r.id}>
                      <td className="tabla-codigo">{r.factura}</td>
                      {esAdmin && <td>{CLIENTES_POR_ID[r.clienteId].razonSocial}</td>}
                      <td>
                        <strong>{maquina.nombre}</strong>
                        <span className="tabla-secundario">
                          {maquina.modelo}, unidad {r.unidad}
                        </span>
                      </td>
                      <td>
                        {rangoTexto(r.inicio, r.fin)}
                        <span className="tabla-secundario">{plural(r.cotizacion.dias, 'día')}</span>
                      </td>
                      <td>
                        <Estado tono={tono}>{texto}</Estado>
                      </td>
                      <td className="numero">{cop(r.cotizacion.total)}</td>
                      <td className="tabla-acciones">
                        <button type="button" className="enlace" onClick={() => onVerFactura(r.id)}>
                          Ver factura
                        </button>
                        {r.situacion === 'programada' &&
                          (porCancelar === r.id ? (
                            <span className="confirmar-cancelar">
                              <button
                                type="button"
                                className="enlace enlace--peligro"
                                onClick={() => {
                                  cancelarReserva(r.id)
                                  setPorCancelar(null)
                                }}
                              >
                                Sí, cancelar
                              </button>
                              <button type="button" className="enlace" onClick={() => setPorCancelar(null)}>
                                No
                              </button>
                            </span>
                          ) : (
                            <button type="button" className="enlace enlace--peligro" onClick={() => setPorCancelar(r.id)}>
                              Cancelar
                            </button>
                          ))}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {lista.length > limite && (
          <button type="button" className="boton boton--secundario boton--centrado" onClick={() => setLimite((l) => l + POR_PAGINA)}>
            Ver {Math.min(POR_PAGINA, lista.length - limite)} más
          </button>
        )}
      </div>
    </section>
  )
}
