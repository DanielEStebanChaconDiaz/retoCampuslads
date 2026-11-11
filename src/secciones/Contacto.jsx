import { useState } from 'react'
import { Titulo } from '../components/Titulo'
import { ALQUILER, EMPRESA } from '../data/empresa'
import { HOY } from '../lib/fechas'
import { useApp } from '../store/contexto'

const enlaceTelefono = (telefono) => `tel:${telefono.replace(/\s/g, '')}`

export function Contacto() {
  const { restablecerDatos } = useApp()
  const [restablecido, setRestablecido] = useState(false)

  const canales = [
    {
      id: 'alquiler',
      nombre: ALQUILER.nombre,
      logo: ALQUILER.logoClaro,
      datos: [
        ['Teléfono y WhatsApp', ALQUILER.telefono, enlaceTelefono(ALQUILER.telefono)],
        ['Correo', ALQUILER.correo, `mailto:${ALQUILER.correo}`],
        ['Sitio web', ALQUILER.web, `https://${ALQUILER.web}`],
        ['Bodega', ALQUILER.direccion, null],
      ],
    },
    {
      id: 'sd',
      nombre: EMPRESA.nombre,
      logo: EMPRESA.logoClaro,
      datos: [
        ['Teléfono y WhatsApp', EMPRESA.telefono, enlaceTelefono(EMPRESA.telefono)],
        ['Correo', EMPRESA.correo, `mailto:${EMPRESA.correo}`],
        ['Sitio web', EMPRESA.web, `https://${EMPRESA.web}`],
        ['Redes sociales', EMPRESA.redes, null],
      ],
    },
  ]

  return (
    <footer className="contacto" id="contacto" aria-labelledby="contacto-titulo">
      <div className="contenedor">
        <Titulo id="contacto-titulo" fino="Canales" fuerte="de atención" />
        <div className="contacto-rejilla">
          {canales.map((c) => (
            <section key={c.id} className="contacto-canal" aria-label={c.nombre}>
              <img src={c.logo} alt={`Logo de ${c.nombre}`} className={`contacto-logo contacto-logo--${c.id}`} loading="lazy" />
              <ul className="contacto-canales">
                {c.datos.map(([etiqueta, valor, href]) => (
                  <li key={etiqueta}>
                    <span>{etiqueta}</span>
                    {href ? (
                      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                        {valor}
                      </a>
                    ) : (
                      <strong>{valor}</strong>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>

      <div className="contenedor contacto-legal">
        <p>
          © {HOY.slice(0, 4)} {EMPRESA.razonSocial} y {ALQUILER.razonSocial} Clientes, tarifas y reservas de demostración.
        </p>
        <button
          type="button"
          className="enlace enlace--claro"
          onClick={() => {
            restablecerDatos()
            setRestablecido(true)
          }}
        >
          {restablecido ? 'Datos de prueba restablecidos' : 'Restablecer datos de prueba'}
        </button>
      </div>
    </footer>
  )
}
