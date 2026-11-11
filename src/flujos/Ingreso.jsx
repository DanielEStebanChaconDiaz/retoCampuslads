import { useState } from 'react'
import { Titulo } from '../components/Titulo'
import { Torre } from '../components/Torre'
import { CLIENTES_POR_ID, USUARIOS } from '../data/clientes'
import { useApp } from '../store/contexto'

export function Ingreso({ motivo, onIngresado }) {
  const { ingresar } = useApp()
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')

  const enviar = (e) => {
    e.preventDefault()
    const usuario = ingresar(correo, clave)
    if (!usuario) {
      setError('El correo o la contraseña no coinciden. Revisa los datos o usa una de las cuentas de prueba.')
      return
    }
    onIngresado(usuario)
  }

  const usarCuenta = (u) => {
    setCorreo(u.correo)
    setClave(u.clave)
    setError('')
  }

  return (
    <div className="ingreso">
      <div className="ingreso-cielo" aria-hidden="true">
        <Torre cables className="ingreso-torre" />
      </div>
      <form className="ingreso-formulario" onSubmit={enviar}>
        <Titulo nivel={2} fino="Ingreso de" fuerte="clientes" />
        <p className="texto-suave">{motivo ?? 'Ingresa con tu cuenta empresarial para alquilar, ver tus facturas y seguir tus entregas.'}</p>

        <label className="campo">
          <span className="campo-etiqueta">Correo corporativo</span>
          <input type="email" autoComplete="username" required value={correo} onChange={(e) => setCorreo(e.target.value)} />
        </label>
        <label className="campo">
          <span className="campo-etiqueta">Contraseña</span>
          <input type="password" autoComplete="current-password" required value={clave} onChange={(e) => setClave(e.target.value)} />
        </label>
        {error && (
          <p className="texto-alerta" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="boton boton--primario boton--grande boton--bloque">
          Ingresar
        </button>

        <div className="ingreso-pruebas">
          <p>Cuentas de prueba</p>
          <ul>
            {USUARIOS.map((u) => (
              <li key={u.id}>
                <button type="button" onClick={() => usarCuenta(u)}>
                  <strong>{u.nombre}</strong>
                  <span>{u.clienteId ? CLIENTES_POR_ID[u.clienteId].razonSocial : 'Administrador, ve el panel comercial'}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </form>
    </div>
  )
}
