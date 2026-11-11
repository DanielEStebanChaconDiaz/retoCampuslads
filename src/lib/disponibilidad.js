import { MAQUINAS, MAQUINAS_POR_ID } from '../data/catalogo'
import { diasInclusivos, seCruzan, sumarDias } from './fechas'

export const vigentes = (reservas) => reservas.filter((r) => r.estado !== 'cancelada')

const reservasDe = (maquinaId, reservas) => vigentes(reservas).filter((r) => r.maquinaId === maquinaId)

export function unidadesLibres(maquina, reservas, inicio, fin) {
  const ocupadas = new Set(
    reservasDe(maquina.id, reservas)
      .filter((r) => seCruzan(r.inicio, r.fin, inicio, fin))
      .map((r) => r.unidad),
  )
  return maquina.unidades.filter((u) => !ocupadas.has(u))
}

export function proximaDisponibilidad(maquina, reservas, inicio, dias) {
  const propias = reservasDe(maquina.id, reservas)
  const candidatas = [inicio, ...propias.map((r) => sumarDias(r.fin, 1)).filter((f) => f > inicio)].sort()
  for (const candidata of candidatas) {
    const fin = sumarDias(candidata, dias - 1)
    const libres = unidadesLibres(maquina, propias, candidata, fin)
    if (libres.length) return { inicio: candidata, fin, unidad: libres[0] }
  }
  return null
}

export function estadoMaquina(maquina, reservas, inicio, fin) {
  const libres = unidadesLibres(maquina, reservas, inicio, fin)
  const disponible = libres.length > 0
  return {
    libres,
    disponible,
    proxima: disponible ? null : proximaDisponibilidad(maquina, reservas, inicio, diasInclusivos(inicio, fin)),
  }
}

export function stockLibre(equipo, reservas, inicio, fin) {
  const conEquipo = vigentes(reservas)
    .filter((r) => seCruzan(r.inicio, r.fin, inicio, fin))
    .map((r) => ({ r, cantidad: r.accesorios?.find((a) => a.id === equipo.id)?.cantidad ?? 0 }))
    .filter((x) => x.cantidad > 0)

  let maximo = 0
  for (let dia = inicio; dia <= fin; dia = sumarDias(dia, 1)) {
    const usado = conEquipo.reduce((s, { r, cantidad }) => (r.inicio <= dia && dia <= r.fin ? s + cantidad : s), 0)
    if (usado > maximo) maximo = usado
  }
  return Math.max(equipo.stock - maximo, 0)
}

export function maquinasSimilares(maquina, reservas, inicio, fin) {
  const ids = new Set(maquina.similares)
  MAQUINAS.filter((m) => m.categoria === maquina.categoria && m.id !== maquina.id).forEach((m) => ids.add(m.id))
  return [...ids]
    .map((id) => MAQUINAS_POR_ID[id])
    .map((m) => ({ maquina: m, ...estadoMaquina(m, reservas, inicio, fin) }))
    .sort((a, b) => Number(b.disponible) - Number(a.disponible))
}

export function bloquesPorUnidad(maquina, reservas, desde, hasta) {
  const propias = reservasDe(maquina.id, reservas).filter((r) => seCruzan(r.inicio, r.fin, desde, hasta))
  return maquina.unidades.map((unidad) => ({
    unidad,
    bloques: propias.filter((r) => r.unidad === unidad),
  }))
}
