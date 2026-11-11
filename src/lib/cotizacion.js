import { EQUIPOS_POR_ID, nombreCompleto } from '../data/catalogo'
import {
  DESCUENTOS,
  FACTOR_TRANSPORTE,
  PORCENTAJE_DEPOSITO,
  PORCENTAJE_IVA,
  PORCENTAJE_SEGURO,
  TARIFA_OPERADOR,
  ZONAS,
} from '../data/tarifas'
import { diasInclusivos, sumarDias } from './fechas'

const redondearMil = (valor) => Math.round(valor / 1000) * 1000

export const zonaPorId = (id) => ZONAS.find((z) => z.id === id) ?? ZONAS[0]

export const tramoDescuento = (dias) => DESCUENTOS.find((d) => dias >= d.desde) ?? null

export const valorMovilizacion = (maquina, zonaId) =>
  redondearMil(zonaPorId(zonaId).tarifaBase * FACTOR_TRANSPORTE[maquina.transporte] * 2)

export const estimadoAlquiler = (maquina, dias) => {
  const tramo = tramoDescuento(dias)
  const bruto = maquina.tarifaDia * dias
  return bruto - (tramo ? Math.round(bruto * tramo.porcentaje) : 0)
}

export function cotizar({ maquina, inicio, fin, zonaId, conOperador = false, accesorios = [] }) {
  const dias = Math.max(diasInclusivos(inicio, fin), 0)
  const zona = zonaPorId(zonaId)

  const lineas = [
    {
      id: maquina.id,
      tipo: 'maquina',
      concepto: nombreCompleto(maquina),
      cantidad: 1,
      dias,
      unitario: maquina.tarifaDia,
      total: maquina.tarifaDia * dias,
    },
  ]

  accesorios
    .filter((a) => a.cantidad > 0)
    .forEach((a) => {
      const equipo = EQUIPOS_POR_ID[a.id]
      lineas.push({
        id: equipo.id,
        tipo: 'equipo',
        concepto: equipo.nombre,
        cantidad: a.cantidad,
        dias,
        unitario: equipo.tarifaDia,
        total: equipo.tarifaDia * a.cantidad * dias,
      })
    })

  const alquilerBruto = lineas.reduce((s, l) => s + l.total, 0)
  const tramo = tramoDescuento(dias)
  const descuento = tramo ? Math.round(alquilerBruto * tramo.porcentaje) : 0
  const alquilerNeto = alquilerBruto - descuento

  const llevaOperador = maquina.operador === 'incluido' || (maquina.operador === 'opcional' && conOperador)
  const operador = maquina.operador === 'opcional' && conOperador ? TARIFA_OPERADOR * dias : 0

  const movilizacion = valorMovilizacion(maquina, zona.id)
  const seguro = Math.round(alquilerNeto * PORCENTAJE_SEGURO)
  const subtotal = alquilerNeto + operador + movilizacion + seguro
  const iva = Math.round(subtotal * PORCENTAJE_IVA)

  return {
    dias,
    zona,
    lineas,
    alquilerBruto,
    tramo,
    descuento,
    alquilerNeto,
    llevaOperador,
    operador,
    movilizacion,
    seguro,
    subtotal,
    iva,
    total: subtotal + iva,
    deposito: Math.round(alquilerNeto * PORCENTAJE_DEPOSITO),
    despacho: sumarDias(inicio, -zona.diasTransito),
    entrega: inicio,
    devolucion: sumarDias(fin, 1),
  }
}

export const resumenCotizacion = (c) => ({
  dias: c.dias,
  lineas: c.lineas,
  alquilerBruto: c.alquilerBruto,
  tramo: c.tramo,
  descuento: c.descuento,
  alquilerNeto: c.alquilerNeto,
  llevaOperador: c.llevaOperador,
  operador: c.operador,
  movilizacion: c.movilizacion,
  seguro: c.seguro,
  subtotal: c.subtotal,
  iva: c.iva,
  total: c.total,
  deposito: c.deposito,
  despacho: c.despacho,
  entrega: c.entrega,
  devolucion: c.devolucion,
})
