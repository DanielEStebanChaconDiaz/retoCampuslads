import { CamposBusqueda } from '../components/CamposBusqueda'
import { Titulo } from '../components/Titulo'
import { Torre } from '../components/Torre'
import { MAQUINAS } from '../data/catalogo'
import { ALQUILER } from '../data/empresa'

const unidades = MAQUINAS.reduce((s, m) => s + m.unidades.length, 0)

export function Hero() {
  const consultar = (e) => {
    e.preventDefault()
    document.getElementById('alquiler')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="hero" id="inicio" aria-labelledby="hero-titulo">
      <div className="hero-texto">
        <Titulo nivel={1} id="hero-titulo" fino="Alquiler de maquinaria" fuerte="para obras eléctricas" />
        <p className="hero-bajada">
          Consulta qué equipos de {ALQUILER.nombre} están libres en tus fechas, cotiza al instante y recibe la factura con la entrega
          programada. Frenadoras, malacates, izaje, medición y obra civil para proyectos de transmisión y subestaciones.
        </p>

        <form className="hero-busqueda" onSubmit={consultar}>
          <CamposBusqueda />
          <button type="submit" className="boton boton--primario boton--grande">
            Consultar disponibilidad
          </button>
        </form>

        <dl className="hero-datos">
          <div>
            <dt>Máquinas en catálogo</dt>
            <dd>{MAQUINAS.length} referencias</dd>
          </div>
          <div>
            <dt>Unidades en la demo</dt>
            <dd>{unidades} unidades</dd>
          </div>
          <div>
            <dt>Bodega de despacho</dt>
            <dd>{ALQUILER.bodega.split(',')[0]}</dd>
          </div>
          <div>
            <dt>Tensión de trabajo</dt>
            <dd>hasta 500 kV</dd>
          </div>
        </dl>
      </div>

      <div className="hero-cielo" aria-hidden="true">
        <Torre cables className="hero-torre" />
        <Torre className="hero-torre hero-torre--lejana" />
      </div>
    </section>
  )
}
