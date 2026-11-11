import { CATEGORIAS, MAQUINAS, MAQUINAS_POR_ID } from '../data/catalogo'
import { CLIENTES_POR_ID } from '../data/clientes'
import { HOY, diasInclusivos, diasSolapados, finDeMes, mesISO, sumarDias, sumarMeses } from './fechas'
import { vigentes } from './disponibilidad'

const alquileres = (reservas) => vigentes(reservas).filter((r) => r.tipo === 'alquiler')

export const estadoReserva = (r) => {
  if (r.estado === 'cancelada') return 'cancelada'
  if (r.inicio > HOY) return 'programada'
  if (r.fin < HOY) return 'finalizada'
  return 'en-curso'
}

export const ingresoEnRango = (r, desde, hasta) => {
  const dias = diasSolapados(r.inicio, r.fin, desde, hasta)
  return dias ? (r.cotizacion.subtotal * dias) / r.cotizacion.dias : 0
}

export function ingresosPorMes(reservas, atras = 6, adelante = 2) {
  const actual = mesISO(HOY)
  const lista = alquileres(reservas)
  return Array.from({ length: atras + adelante + 1 }, (_, i) => {
    const mes = sumarMeses(actual, i - atras)
    const desde = `${mes}-01`
    const hasta = finDeMes(mes)
    const total = lista.reduce((s, r) => s + ingresoEnRango(r, desde, hasta), 0)
    let realizado = total
    if (desde > HOY) realizado = 0
    else if (hasta >= HOY) realizado = lista.reduce((s, r) => s + ingresoEnRango(r, desde, sumarDias(HOY, -1)), 0)
    return { mes, total, realizado, programado: total - realizado }
  })
}

export function ocupacionMaquina(maquina, reservas, desde, hasta) {
  const capacidad = maquina.unidades.length * diasInclusivos(desde, hasta)
  const propias = vigentes(reservas).filter((r) => r.maquinaId === maquina.id)
  const ocupados = propias
    .filter((r) => r.tipo === 'alquiler')
    .reduce((s, r) => s + diasSolapados(r.inicio, r.fin, desde, hasta), 0)
  const mantenimiento = propias
    .filter((r) => r.tipo === 'mantenimiento')
    .reduce((s, r) => s + diasSolapados(r.inicio, r.fin, desde, hasta), 0)
  return { capacidad, ocupados, mantenimiento, tasa: capacidad ? ocupados / capacidad : 0 }
}

const acumular = (maquinas, reservas, desde, hasta) => {
  const suma = maquinas.reduce(
    (acc, m) => {
      const o = ocupacionMaquina(m, reservas, desde, hasta)
      return { capacidad: acc.capacidad + o.capacidad, ocupados: acc.ocupados + o.ocupados }
    },
    { capacidad: 0, ocupados: 0 },
  )
  return { ...suma, tasa: suma.capacidad ? suma.ocupados / suma.capacidad : 0 }
}

export const ocupacionFlota = (reservas, desde, hasta) => acumular(MAQUINAS, reservas, desde, hasta)

export const ocupacionPorCategoria = (reservas, desde, hasta) =>
  CATEGORIAS.map((c) => ({
    categoria: c,
    unidades: MAQUINAS.filter((m) => m.categoria === c.id).reduce((s, m) => s + m.unidades.length, 0),
    ...acumular(
      MAQUINAS.filter((m) => m.categoria === c.id),
      reservas,
      desde,
      hasta,
    ),
  })).sort((a, b) => b.tasa - a.tasa)

const recomendar = (tasa, intentos, proximos) => {
  if (tasa >= 0.65 && intentos >= 3) return { texto: 'Evaluar una unidad adicional', tono: 'alta' }
  if (tasa >= 0.65 || proximos >= 0.8) return { texto: 'Demanda alta: sostener tarifa', tono: 'alta' }
  if (tasa < 0.3) return { texto: 'Baja rotación: revisar tarifa o promocionar', tono: 'baja' }
  return { texto: 'Operación estable', tono: 'normal' }
}

export function rendimientoEquipos(reservas, intentos, dias = 90) {
  const desde = sumarDias(HOY, -dias)
  const hasta = sumarDias(HOY, -1)
  const lista = alquileres(reservas)
  return MAQUINAS.map((maquina) => {
    const historico = ocupacionMaquina(maquina, reservas, desde, hasta)
    const proximos = ocupacionMaquina(maquina, reservas, HOY, sumarDias(HOY, 29))
    const ingresos = lista.filter((r) => r.maquinaId === maquina.id).reduce((s, r) => s + ingresoEnRango(r, desde, hasta), 0)
    const intentosMaquina = intentos.filter((i) => i.maquinaId === maquina.id && i.fecha >= desde).length
    return {
      maquina,
      diasAlquilados: historico.ocupados,
      tasa: historico.tasa,
      proximos: proximos.tasa,
      ingresos,
      intentos: intentosMaquina,
      recomendacion: recomendar(historico.tasa, intentosMaquina, proximos.tasa),
    }
  }).sort((a, b) => b.ingresos - a.ingresos)
}

export function demandaNoAtendida(intentos, dias = 30) {
  const desde = sumarDias(HOY, -dias)
  const lista = intentos.filter((i) => i.fecha >= desde)
  const perdidos = lista.filter((i) => i.resultado === 'sin-cierre')
  const valorPerdido = perdidos.reduce((s, i) => s + MAQUINAS_POR_ID[i.maquinaId].tarifaDia * i.dias, 0)
  const porMaquina = Object.entries(
    lista.reduce((acc, i) => ({ ...acc, [i.maquinaId]: (acc[i.maquinaId] ?? 0) + 1 }), {}),
  )
    .map(([id, total]) => ({ maquina: MAQUINAS_POR_ID[id], total }))
    .sort((a, b) => b.total - a.total)
  return {
    total: lista.length,
    perdidos: perdidos.length,
    recuperados: lista.length - perdidos.length,
    tasaRecuperacion: lista.length ? (lista.length - perdidos.length) / lista.length : 0,
    valorPerdido,
    porMaquina,
  }
}

export function clientesPrincipales(reservas, dias = 180) {
  const desde = sumarDias(HOY, -dias)
  const hasta = sumarDias(HOY, 60)
  const acumulado = {}
  alquileres(reservas).forEach((r) => {
    const valor = ingresoEnRango(r, desde, hasta)
    if (!valor) return
    const actual = acumulado[r.clienteId] ?? { cliente: CLIENTES_POR_ID[r.clienteId], ingresos: 0, alquileres: 0 }
    actual.ingresos += valor
    actual.alquileres += 1
    acumulado[r.clienteId] = actual
  })
  return Object.values(acumulado).sort((a, b) => b.ingresos - a.ingresos)
}

export const proximosDespachos = (reservas, dias = 10) =>
  alquileres(reservas)
    .filter((r) => r.inicio >= HOY && r.cotizacion.despacho <= sumarDias(HOY, dias))
    .sort((a, b) => a.cotizacion.despacho.localeCompare(b.cotizacion.despacho))

export function comparativoMes(reservas) {
  const lista = alquileres(reservas)
  const corte = sumarDias(HOY, -1)
  const inicioActual = `${mesISO(HOY)}-01`
  const inicioAnterior = `${sumarMeses(mesISO(HOY), -1)}-01`
  const dias = diasInclusivos(inicioActual, corte)
  const corteAnterior = sumarDias(inicioAnterior, dias - 1)
  const total = (desde, hasta) => (hasta < desde ? 0 : lista.reduce((s, r) => s + ingresoEnRango(r, desde, hasta), 0))
  const actual = total(inicioActual, corte)
  const anterior = total(inicioAnterior, corteAnterior)
  return { actual, anterior, dias, variacion: anterior ? actual / anterior - 1 : 0 }
}

export const enCurso = (reservas) => alquileres(reservas).filter((r) => estadoReserva(r) === 'en-curso')
