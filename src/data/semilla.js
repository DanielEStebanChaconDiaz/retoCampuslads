import { MAQUINAS, MAQUINAS_POR_ID, EQUIPOS_POR_ID } from './catalogo'
import { CLIENTES } from './clientes'
import { cotizar, resumenCotizacion } from '../lib/cotizacion'
import { HOY, diasInclusivos, seCruzan, sumarDias } from '../lib/fechas'

function generador(semilla) {
  let a = semilla
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const OBRAS = [
  'Variante línea 230 kV, tramo 4',
  'Ampliación subestación 115 kV, bahía de línea',
  'Mantenimiento línea 500 kV, torres 112 a 140',
  'Interconexión parque solar 20 MWp',
  'Cambio de aislamiento en línea 230 kV',
  'Reubicación de redes de media tensión',
  'Cimentaciones profundas, torre 34',
  'Muros cortafuego en subestación',
  'Tendido de fibra OPGW, 18 km',
  'Montaje de transformador de potencia',
]

const PESO_ZONAS = ['amb', 'amb', 'santander', 'santander', 'santander', 'nororiente', 'nororiente', 'centro', 'caribe']
const PESO_CLIENTES = ['c-01', 'c-01', 'c-02', 'c-02', 'c-03', 'c-03', 'c-04', 'c-05', 'c-06']

const FIJAS = [
  ['camion-grua', 'CG-01', 1, 16, 'c-02', 'nororiente'],
  ['frenadora-afs404', 'FRE-01', -3, 11, 'c-04', 'caribe'],
  ['frenadora-afs404', 'FRE-02', 2, 14, 'c-03', 'santander'],
  ['malacate-hidraulico', 'MAL-01', -2, 9, 'c-04', 'caribe'],
  ['malacate-hidraulico', 'MAL-02', 4, 18, 'c-03', 'santander'],
  ['laser-removedor', 'LAS-01', 0, 20, 'c-02', 'nororiente'],
  ['minicargador-l218', 'MC-01', 5, 12, 'c-06', 'santander'],
  ['pluma-36', 'PL36-01', -5, 25, 'c-05', 'santander'],
  ['estacion-gts236w', 'TOP-01', 3, 8, 'c-01', 'amb'],
  ['oficina-20', 'OFI-01', -20, 40, 'c-05', 'santander'],
  ['bodega-20', 'BOD-01', -20, 40, 'c-05', 'santander'],
  ['elevador-cvi602', 'EB-01', -2, 12, 'c-04', 'caribe'],
  ['elevador-cvi602', 'EB-02', -2, 12, 'c-04', 'caribe'],
  ['malacate-u5', 'MU5-01', 18, 30, 'c-01', 'amb'],
  ['telurometro-tm25m', 'TEL-01', 6, 9, 'c-06', 'santander'],
  ['planta-yde8500', 'PY-01', -1, 6, 'c-01', 'amb'],
]

const MANTENIMIENTOS = [
  ['planta-gpk22', 'PK-01', 1, 4],
  ['camion-grua', 'CG-01', 20, 22],
  ['frenadora-afs404', 'FRE-01', 15, 17],
  ['minicargador-l218', 'MC-02', 9, 10],
]

const INTENTOS_FRECUENTES = ['camion-grua', 'camion-grua', 'frenadora-afs404', 'frenadora-afs404', 'malacate-hidraulico', 'laser-removedor', 'minicargador-l218', 'pluma-36', 'camion-grua', 'malacate-hidraulico']

export function generarSemilla() {
  const azar = generador(2026)
  const entre = (min, max) => min + Math.floor(azar() * (max - min + 1))
  const elegir = (lista) => lista[Math.floor(azar() * lista.length)]

  const borradores = []

  const libre = (maquinaId, unidad, inicio, fin) =>
    !borradores.some((b) => b.maquinaId === maquinaId && b.unidad === unidad && seCruzan(b.inicio, b.fin, inicio, fin))

  const alquiler = (maquinaId, unidad, inicio, fin, clienteId, zonaId) => {
    const maquina = MAQUINAS_POR_ID[maquinaId]
    const accesorios = maquina.accesorios
      .filter(() => azar() < 0.45)
      .slice(0, 2)
      .map((id) => ({ id, cantidad: Math.min(entre(1, 3), EQUIPOS_POR_ID[id].stock) }))
    const conOperador = maquina.operador === 'opcional' && azar() < 0.5
    const atraso = entre(2, 14)
    const creada = sumarDias(inicio, -atraso) > HOY ? sumarDias(HOY, -entre(1, 6)) : sumarDias(inicio, -atraso)
    borradores.push({
      tipo: 'alquiler',
      maquinaId,
      unidad,
      inicio,
      fin,
      clienteId,
      zonaId,
      conOperador,
      accesorios,
      obra: elegir(OBRAS),
      creada,
      estado: 'confirmada',
    })
  }

  FIJAS.forEach(([maquinaId, unidad, desde, hasta, clienteId, zonaId]) =>
    alquiler(maquinaId, unidad, sumarDias(HOY, desde), sumarDias(HOY, hasta), clienteId, zonaId),
  )

  MANTENIMIENTOS.forEach(([maquinaId, unidad, desde, hasta]) =>
    borradores.push({
      tipo: 'mantenimiento',
      maquinaId,
      unidad,
      inicio: sumarDias(HOY, desde),
      fin: sumarDias(HOY, hasta),
      obra: 'Mantenimiento preventivo programado',
      creada: sumarDias(HOY, -10),
      estado: 'confirmada',
    }),
  )

  MAQUINAS.forEach((maquina) => {
    maquina.unidades.forEach((unidad) => {
      let cursor = sumarDias(HOY, -185 + entre(0, 10))
      for (;;) {
        const duracion = 3 + Math.floor(azar() * (8 + maquina.demanda * 14))
        const fin = sumarDias(cursor, duracion - 1)
        if (fin >= sumarDias(HOY, 45)) break
        const futura = cursor >= HOY
        const probabilidad = cursor < sumarDias(HOY, 14) ? maquina.demanda * 0.1 : maquina.demanda * 0.8
        if (libre(maquina.id, unidad, cursor, fin) && (!futura || azar() < probabilidad)) {
          if (!futura && azar() < 0.06) {
            const finMant = sumarDias(cursor, entre(1, 2))
            borradores.push({ tipo: 'mantenimiento', maquinaId: maquina.id, unidad, inicio: cursor, fin: finMant, obra: 'Mantenimiento correctivo', creada: cursor, estado: 'confirmada' })
          } else {
            alquiler(maquina.id, unidad, cursor, fin, elegir(PESO_CLIENTES), elegir(PESO_ZONAS))
          }
        }
        const pausa = 1 + Math.floor(azar() * (16 * (1 - maquina.demanda) + 3))
        cursor = sumarDias(fin, 1 + pausa)
      }
    })
  })

  borradores.sort((a, b) => (a.creada === b.creada ? a.inicio.localeCompare(b.inicio) : a.creada.localeCompare(b.creada)))

  let consecutivo = 1000
  const reservas = borradores.map((b) => {
    consecutivo += 1
    const base = { ...b, id: `R-${consecutivo}` }
    if (b.tipo !== 'alquiler') return base
    const cotizacion = cotizar({
      maquina: MAQUINAS_POR_ID[b.maquinaId],
      inicio: b.inicio,
      fin: b.fin,
      zonaId: b.zonaId,
      conOperador: b.conOperador,
      accesorios: b.accesorios,
    })
    return {
      ...base,
      factura: `FV-${b.creada.slice(0, 4)}-${String(consecutivo).padStart(5, '0')}`,
      cotizacion: resumenCotizacion(cotizacion),
    }
  })

  const intentos = Array.from({ length: 34 }, (_, i) => {
    const maquinaId = elegir(INTENTOS_FRECUENTES)
    const fecha = sumarDias(HOY, -entre(1, 88))
    const inicio = sumarDias(fecha, entre(1, 10))
    const fin = sumarDias(inicio, entre(4, 15))
    const r = azar()
    return {
      id: `I-${500 + i}`,
      fecha,
      maquinaId,
      inicio,
      fin,
      dias: diasInclusivos(inicio, fin),
      clienteId: elegir(CLIENTES).id,
      resultado: r < 0.3 ? 'reprogramada' : r < 0.55 ? 'alternativa' : 'sin-cierre',
    }
  }).sort((a, b) => a.fecha.localeCompare(b.fecha))

  return { reservas, intentos, consecutivo, generado: HOY }
}
