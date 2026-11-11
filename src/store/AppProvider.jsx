import { useEffect, useState } from 'react'
import { AppContexto } from './contexto'
import { generarSemilla } from '../data/semilla'
import { USUARIOS, CLIENTES_POR_ID } from '../data/clientes'
import { MAQUINAS_POR_ID } from '../data/catalogo'
import { cotizar, resumenCotizacion } from '../lib/cotizacion'
import { unidadesLibres } from '../lib/disponibilidad'
import { HOY, diasInclusivos, sumarDias } from '../lib/fechas'

const CLAVE_DATOS = 'sd-alquiler:datos:v4'
const CLAVE_SESION = 'sd-alquiler:sesion'

const leer = (clave) => {
  try {
    const valor = localStorage.getItem(clave)
    return valor ? JSON.parse(valor) : null
  } catch {
    return null
  }
}

const guardar = (clave, valor) => {
  try {
    if (valor === null) localStorage.removeItem(clave)
    else localStorage.setItem(clave, JSON.stringify(valor))
  } catch {
    return
  }
}

const cargarDatos = () => {
  const guardados = leer(CLAVE_DATOS)
  if (Array.isArray(guardados?.reservas) && Array.isArray(guardados?.intentos)) return guardados
  return generarSemilla()
}

const busquedaInicial = () => ({
  inicio: sumarDias(HOY, 3),
  fin: sumarDias(HOY, 11),
  zonaId: 'santander',
})

export function AppProvider({ children }) {
  const [datos, setDatos] = useState(cargarDatos)
  const [usuarioId, setUsuarioId] = useState(() => leer(CLAVE_SESION))
  const [busqueda, setBusqueda] = useState(busquedaInicial)
  const [intentoAbierto, setIntentoAbierto] = useState(null)

  useEffect(() => {
    guardar(CLAVE_DATOS, datos)
  }, [datos])

  useEffect(() => {
    guardar(CLAVE_SESION, usuarioId)
  }, [usuarioId])

  const usuario = USUARIOS.find((u) => u.id === usuarioId) ?? null
  const cliente = usuario?.clienteId ? CLIENTES_POR_ID[usuario.clienteId] : null

  const ingresar = (correo, clave) => {
    const encontrado = USUARIOS.find((u) => u.correo.toLowerCase() === correo.trim().toLowerCase() && u.clave === clave)
    if (!encontrado) return null
    setUsuarioId(encontrado.id)
    return encontrado
  }

  const salir = () => {
    setUsuarioId(null)
    setIntentoAbierto(null)
  }

  const actualizarBusqueda = (cambios) => setBusqueda((b) => ({ ...b, ...cambios }))

  const registrarIntento = (maquinaId, inicio, fin, clienteId) => {
    const id = `I-${Date.now()}`
    setDatos((d) => ({
      ...d,
      intentos: [
        ...d.intentos,
        { id, fecha: HOY, maquinaId, inicio, fin, dias: diasInclusivos(inicio, fin), clienteId, resultado: 'sin-cierre' },
      ],
    }))
    setIntentoAbierto({ id, maquinaId })
  }

  const crearReserva = ({ maquinaId, inicio, fin, zonaId, conOperador, accesorios, obra, clienteId }) => {
    const maquina = MAQUINAS_POR_ID[maquinaId]
    const libres = unidadesLibres(maquina, datos.reservas, inicio, fin)
    if (!libres.length) return { ok: false, error: 'La máquina dejó de estar disponible en esas fechas. Elige otra fecha o una máquina similar.' }

    const consecutivo = datos.consecutivo + 1
    const cotizacion = cotizar({ maquina, inicio, fin, zonaId, conOperador, accesorios })
    const reserva = {
      id: `R-${consecutivo}`,
      tipo: 'alquiler',
      maquinaId,
      unidad: libres[0],
      inicio,
      fin,
      clienteId,
      zonaId,
      conOperador,
      accesorios: accesorios.filter((a) => a.cantidad > 0),
      obra: obra.trim() || 'Sin especificar',
      creada: HOY,
      estado: 'confirmada',
      factura: `FV-${HOY.slice(0, 4)}-${String(consecutivo).padStart(5, '0')}`,
      cotizacion: resumenCotizacion(cotizacion),
    }

    const intento = intentoAbierto
    setDatos((d) => ({
      ...d,
      consecutivo,
      reservas: [...d.reservas, reserva],
      intentos: intento
        ? d.intentos.map((i) =>
            i.id === intento.id ? { ...i, resultado: intento.maquinaId === maquinaId ? 'reprogramada' : 'alternativa' } : i,
          )
        : d.intentos,
    }))
    setIntentoAbierto(null)
    return { ok: true, reserva }
  }

  const cancelarReserva = (id) =>
    setDatos((d) => ({
      ...d,
      reservas: d.reservas.map((r) => (r.id === id ? { ...r, estado: 'cancelada' } : r)),
    }))

  const restablecerDatos = () => {
    setDatos(generarSemilla())
    setBusqueda(busquedaInicial())
    setIntentoAbierto(null)
  }

  const valor = {
    reservas: datos.reservas,
    intentos: datos.intentos,
    usuario,
    cliente,
    esAdmin: usuario?.rol === 'admin',
    busqueda,
    ingresar,
    salir,
    actualizarBusqueda,
    registrarIntento,
    crearReserva,
    cancelarReserva,
    restablecerDatos,
  }

  return <AppContexto.Provider value={valor}>{children}</AppContexto.Provider>
}
