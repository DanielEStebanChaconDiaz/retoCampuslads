import { useState } from 'react'
import { CamposBusqueda } from '../components/CamposBusqueda'
import { Estado } from '../components/Estado'
import { IconoCategoria } from '../components/IconoCategoria'
import { Titulo } from '../components/Titulo'
import { CATEGORIAS, MAQUINAS } from '../data/catalogo'
import { estimadoAlquiler, tramoDescuento } from '../lib/cotizacion'
import { estadoMaquina } from '../lib/disponibilidad'
import { HOY, diasInclusivos, fechaCorta, rangoTexto } from '../lib/fechas'
import { cop, plural } from '../lib/formato'
import { useApp } from '../store/contexto'

const normalizar = (texto) =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

export function Catalogo({ onAbrir }) {
  const { reservas, busqueda } = useApp()
  const [categoria, setCategoria] = useState('todas')
  const [texto, setTexto] = useState('')
  const [soloDisponibles, setSoloDisponibles] = useState(false)

  const { inicio, fin } = busqueda
  const fechasValidas = Boolean(inicio && fin && fin >= inicio && inicio >= HOY)
  const dias = fechasValidas ? diasInclusivos(inicio, fin) : 0
  const tramo = tramoDescuento(dias)
  const filtro = normalizar(texto.trim())

  const evaluadas = MAQUINAS.map((maquina) => ({
    maquina,
    ...(fechasValidas ? estadoMaquina(maquina, reservas, inicio, fin) : { libres: maquina.unidades, disponible: true, proxima: null }),
  }))

  const visibles = evaluadas.filter(({ maquina, disponible }) => {
    if (categoria !== 'todas' && maquina.categoria !== categoria) return false
    if (soloDisponibles && !disponible) return false
    if (filtro && !normalizar(`${maquina.nombre} ${maquina.modelo} ${maquina.resumen}`).includes(filtro)) return false
    return true
  })

  const grupos = CATEGORIAS.map((c) => ({ categoria: c, items: visibles.filter((v) => v.maquina.categoria === c.id) })).filter(
    (g) => g.items.length,
  )

  const totalDisponibles = evaluadas.filter((e) => e.disponible).length

  const limpiarFiltros = () => {
    setCategoria('todas')
    setTexto('')
    setSoloDisponibles(false)
  }

  return (
    <section className="seccion catalogo" id="alquiler" aria-labelledby="catalogo-titulo">
      <div className="contenedor">
        <div className="catalogo-cabecera">
          <Titulo id="catalogo-titulo" fino="Alquiler de" fuerte="maquinaria y equipos" />
          <p>
            Equipos del portafolio de Alquiler TEC. Elige las fechas y el destino de tu obra: el sistema calcula qué máquinas están libres en ese
            periodo, cuánto cuesta el alquiler y cuándo se libera cada equipo ocupado.
          </p>
        </div>

        <div className="catalogo-filtros">
          <CamposBusqueda className="campos-busqueda--fila" />
          <div className="catalogo-refinar">
            <label className="campo">
              <span className="campo-etiqueta">Categoría</span>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                <option value="todas">Todas las categorías</option>
                {CATEGORIAS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="campo campo--ancho">
              <span className="campo-etiqueta">Buscar</span>
              <input type="search" placeholder="Malacate, planta, Tesmec…" value={texto} onChange={(e) => setTexto(e.target.value)} />
            </label>
            <label className="interruptor">
              <input type="checkbox" checked={soloDisponibles} onChange={(e) => setSoloDisponibles(e.target.checked)} />
              <span>Solo disponibles</span>
            </label>
          </div>
        </div>

        <div className="catalogo-resumen" aria-live="polite">
          {fechasValidas ? (
            <p>
              <strong>
                {totalDisponibles} de {MAQUINAS.length} máquinas
              </strong>{' '}
              tienen unidades libres del {rangoTexto(inicio, fin)} ({plural(dias, 'día')}).
              {tramo && (
                <span className="catalogo-tramo">
                  {' '}
                  Aplica {tramo.etiqueta.toLowerCase()}: {Math.round(tramo.porcentaje * 100)} % de descuento.
                </span>
              )}
            </p>
          ) : (
            <p className="texto-alerta">Elige una fecha de inicio desde hoy y una fecha de fin igual o posterior para calcular la disponibilidad.</p>
          )}
        </div>

        {grupos.length === 0 && (
          <div className="vacio">
            <p>Ninguna máquina coincide con los filtros. Quita alguno para ver más resultados.</p>
            <button type="button" className="boton boton--secundario" onClick={limpiarFiltros}>
              Quitar filtros
            </button>
          </div>
        )}

        {grupos.map(({ categoria: c, items }) => (
          <div key={c.id} className="catalogo-grupo">
            <h3 className="catalogo-grupo-titulo">
              <IconoCategoria categoria={c.id} />
              {c.nombre}
            </h3>
            <ul className="equipos">
              {items.map(({ maquina, libres, disponible, proxima }) => (
                <li key={maquina.id} className={`equipo ${disponible ? '' : 'equipo--ocupado'}`}>
                  <div className="equipo-imagen">
                    {maquina.imagen ? (
                      <img src={maquina.imagen} alt="" loading="lazy" width="800" height="600" />
                    ) : (
                      <IconoCategoria categoria={maquina.categoria} />
                    )}
                  </div>

                  <div className="equipo-info">
                    <h4>
                      {maquina.nombre} <span className="equipo-modelo">{maquina.modelo}</span>
                    </h4>
                    <p className="equipo-specs">
                      {maquina.specs.slice(0, 3).map(([k, v]) => (
                        <span key={k}>
                          {k} <b>{v}</b>
                        </span>
                      ))}
                    </p>
                  </div>

                  <div className="equipo-estado">
                    {disponible ? (
                      <Estado tono="ok">
                        {libres.length === maquina.unidades.length
                          ? plural(maquina.unidades.length, 'unidad libre', 'unidades libres')
                          : `${libres.length} de ${maquina.unidades.length} unidades libres`}
                      </Estado>
                    ) : (
                      <Estado tono="ocupado">{proxima ? `Ocupada, libre desde el ${fechaCorta(proxima.inicio)}` : 'Ocupada en esas fechas'}</Estado>
                    )}
                  </div>

                  <div className="equipo-precio">
                    <strong>{cop(maquina.tarifaDia)}</strong>
                    <span>por día</span>
                    {dias > 0 && (
                      <span className="equipo-estimado">
                        {cop(estimadoAlquiler(maquina, dias))} por {plural(dias, 'día')}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className={`boton ${disponible ? 'boton--primario' : 'boton--secundario'}`}
                    onClick={() => onAbrir(maquina.id, disponible && fechasValidas)}
                    disabled={!fechasValidas}
                  >
                    {disponible ? 'Alquilar' : 'Ver fechas y similares'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
