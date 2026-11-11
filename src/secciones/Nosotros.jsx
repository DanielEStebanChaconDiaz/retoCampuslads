import { Titulo } from '../components/Titulo'
import { DIFERENCIALES, UNIDADES_GRUPO } from '../data/empresa'

const SERVICIOS = [
  'Mantenimiento electromecánico, poda y tala de servidumbres en líneas de media y alta tensión hasta 500 kV',
  'Mantenimientos preventivos y correctivos en modalidad TcT hasta 500 kV',
  'Diseño, suministro, construcción y puesta en servicio de líneas y subestaciones (EPC)',
  'Tendido, empalmes y pruebas de fibra óptica ADSS y OPGW',
  'Obra civil, montaje, tendido y conexionado para parques solares',
  'Topografía, fotogrametría, termografía y levantamiento LIDAR con dron',
  'Corte de vegetación sobre líneas con herramientas láser a distancia',
  'Consultorías, asesorías y capacitación en trabajos con tensión',
]

export function Nosotros() {
  return (
    <section className="seccion nosotros" id="nosotros" aria-labelledby="nosotros-titulo">
      <div className="contenedor">
        <div className="seccion-cabecera">
          <Titulo id="nosotros-titulo" fino="Un grupo," fuerte="tres frentes de servicio" />
          <p>Infraestructura eléctrica, operaciones especializadas con tensión y alquiler de equipos para obra, desde Santander para el país.</p>
        </div>

        <ul className="grupo">
          {UNIDADES_GRUPO.map((u) => (
            <li key={u.id} className="grupo-unidad">
              <img src={u.logo} alt={`Logo de ${u.nombre}`} className="grupo-logo" />
              <h3>
                {u.nombre}
                <span>{u.enfoque}</span>
              </h3>
              <p>{u.texto}</p>
            </li>
          ))}
        </ul>

        <div className="nosotros-rejilla">
          <div className="nosotros-historia">
            <Titulo nivel={3} fino="Lo que nos" fuerte="hace diferentes" />
            <ul className="nosotros-diferenciales">
              {DIFERENCIALES.map((d) => (
                <li key={d.titulo}>
                  <strong>{d.titulo}</strong>
                  <span>{d.texto}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="nosotros-servicios">
            <Titulo nivel={3} fino="Nuestros" fuerte="servicios" />
            <ul className="lista-marcas">
              {SERVICIOS.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
