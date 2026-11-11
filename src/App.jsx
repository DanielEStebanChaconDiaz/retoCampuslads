import { useState } from 'react'
import { Capa } from './components/Capa'
import { MAQUINAS_POR_ID } from './data/catalogo'
import { DetalleMaquina } from './flujos/DetalleMaquina'
import { Factura } from './flujos/Factura'
import { Ingreso } from './flujos/Ingreso'
import { Aliados } from './secciones/Aliados'
import { Catalogo } from './secciones/Catalogo'
import { Contacto } from './secciones/Contacto'
import { Encabezado } from './secciones/Encabezado'
import { Hero } from './secciones/Hero'
import { MisAlquileres } from './secciones/MisAlquileres'
import { Nosotros } from './secciones/Nosotros'
import { PanelComercial } from './secciones/PanelComercial'
import { AppProvider } from './store/AppProvider'
import { useApp } from './store/contexto'
import './App.css'

function Landing() {
  const { usuario, esAdmin, busqueda, registrarIntento } = useApp()
  const [detalleId, setDetalleId] = useState(null)
  const [factura, setFactura] = useState(null)
  const [ingreso, setIngreso] = useState(null)

  const abrirMaquina = (maquinaId, disponible, clienteId) => {
    if (!disponible) registrarIntento(maquinaId, busqueda.inicio, busqueda.fin, clienteId)
    setDetalleId(maquinaId)
  }

  const intentarAlquiler = (maquinaId, disponible) => {
    if (!usuario) {
      const maquina = MAQUINAS_POR_ID[maquinaId]
      setIngreso({ pendiente: { maquinaId, disponible }, motivo: `Ingresa para alquilar ${maquina.nombre.toLowerCase()} ${maquina.modelo}.` })
      return
    }
    abrirMaquina(maquinaId, disponible, usuario.clienteId)
  }

  const alIngresar = (nuevoUsuario) => {
    const pendiente = ingreso?.pendiente
    setIngreso(null)
    if (pendiente) abrirMaquina(pendiente.maquinaId, pendiente.disponible, nuevoUsuario.clienteId)
  }

  const alConfirmar = (reservaId) => {
    setDetalleId(null)
    setFactura({ id: reservaId, nueva: true })
  }

  return (
    <>
      <a className="saltar" href="#alquiler">
        Ir al catálogo de alquiler
      </a>
      <Encabezado onIngresar={() => setIngreso({})} />
      <main>
        <Hero />
        <Catalogo onAbrir={intentarAlquiler} />
        {usuario && <MisAlquileres onVerFactura={(id) => setFactura({ id, nueva: false })} />}
        {esAdmin && <PanelComercial onVerFactura={(id) => setFactura({ id, nueva: false })} />}
        <Nosotros />
        <Aliados />
      </main>
      <Contacto />

      <Capa abierta={Boolean(ingreso)} onCerrar={() => setIngreso(null)} titulo="Ingreso de clientes" className="capa-panel--ingreso">
        <Ingreso motivo={ingreso?.motivo} onIngresado={alIngresar} />
      </Capa>

      <Capa abierta={Boolean(detalleId)} onCerrar={() => setDetalleId(null)} titulo="Detalle y cotización" variante="lateral">
        {detalleId && <DetalleMaquina key={detalleId} maquinaId={detalleId} onCambiarMaquina={setDetalleId} onConfirmada={alConfirmar} />}
      </Capa>

      <Capa abierta={Boolean(factura)} onCerrar={() => setFactura(null)} titulo="Factura de alquiler" className="capa-panel--factura">
        {factura && <Factura reservaId={factura.id} nueva={factura.nueva} onCerrar={() => setFactura(null)} />}
      </Capa>
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Landing />
    </AppProvider>
  )
}
