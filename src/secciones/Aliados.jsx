import { Titulo } from '../components/Titulo'
import { CERTIFICACIONES, LOGOS_CLIENTES } from '../data/empresa'

export function Aliados() {
  return (
    <section className="seccion aliados" id="clientes" aria-labelledby="aliados-titulo">
      <div className="contenedor aliados-rejilla">
        <div>
          <Titulo id="aliados-titulo" fino="Grandes" fuerte="clientes" />
          <p>
            Como reconocimiento a la calidad de sus procesos y su compromiso con el medio ambiente y la seguridad, SD S.A.S. mantiene
            certificaciones desde hace más de 10 años consecutivos.
          </p>
          <ul className="aliados-certificaciones">
            {CERTIFICACIONES.map((c) => (
              <li key={c.id}>
                <img src={c.logo} alt={c.nombre} title={c.nombre} loading="lazy" />
              </li>
            ))}
          </ul>
        </div>
        <figure className="aliados-logos">
          <img src={LOGOS_CLIENTES.imagen} alt={LOGOS_CLIENTES.descripcion} loading="lazy" width="1280" height="280" />
        </figure>
      </div>
    </section>
  )
}
