const DIA_MS = 86400000

const dosDigitos = (n) => String(n).padStart(2, '0')

export const desdeISO = (iso) => new Date(`${iso}T00:00:00Z`)

export const aISO = (fecha) => fecha.toISOString().slice(0, 10)

export const sumarDias = (iso, dias) => aISO(new Date(desdeISO(iso).getTime() + dias * DIA_MS))

export const diferenciaDias = (desde, hasta) => Math.round((desdeISO(hasta) - desdeISO(desde)) / DIA_MS)

export const diasInclusivos = (inicio, fin) => diferenciaDias(inicio, fin) + 1

export const seCruzan = (inicioA, finA, inicioB, finB) => inicioA <= finB && inicioB <= finA

export const diasSolapados = (inicioA, finA, inicioB, finB) => {
  const desde = inicioA > inicioB ? inicioA : inicioB
  const hasta = finA < finB ? finA : finB
  return desde > hasta ? 0 : diasInclusivos(desde, hasta)
}

export const mesISO = (iso) => iso.slice(0, 7)

export const sumarMeses = (mes, n) => {
  const [anio, m] = mes.split('-').map(Number)
  const total = anio * 12 + (m - 1) + n
  return `${Math.floor(total / 12)}-${dosDigitos((total % 12) + 1)}`
}

export const finDeMes = (mes) => sumarDias(`${sumarMeses(mes, 1)}-01`, -1)

const hoyLocal = () => {
  const d = new Date()
  return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`
}

export const HOY = hoyLocal()

const formatoCorto = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const formatoLargo = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const formatoMes = new Intl.DateTimeFormat('es-CO', { month: 'short', timeZone: 'UTC' })
const formatoMesLargo = new Intl.DateTimeFormat('es-CO', { month: 'long', timeZone: 'UTC' })
const formatoMesAnio = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric', timeZone: 'UTC' })
const formatoSemana = new Intl.DateTimeFormat('es-CO', { weekday: 'short', timeZone: 'UTC' })

const limpiar = (texto) => texto.replace('.', '')

export const fechaCorta = (iso) => limpiar(formatoCorto.format(desdeISO(iso)))
export const fechaLarga = (iso) => limpiar(formatoLargo.format(desdeISO(iso)))
export const nombreMes = (mes) => limpiar(formatoMes.format(desdeISO(`${mes}-01`)))
export const mesLargo = (mes) => formatoMesLargo.format(desdeISO(`${mes}-01`))
export const mesAnio = (mes) => formatoMesAnio.format(desdeISO(`${mes}-01`))
export const diaSemana = (iso) => limpiar(formatoSemana.format(desdeISO(iso)))
export const diaDelMes = (iso) => Number(iso.slice(8, 10))

export const rangoTexto = (inicio, fin) => {
  if (inicio.slice(0, 4) !== fin.slice(0, 4)) return `${fechaLarga(inicio)} al ${fechaLarga(fin)}`
  if (inicio.slice(0, 7) === fin.slice(0, 7)) return `${diaDelMes(inicio)} al ${fechaLarga(fin)}`
  return `${fechaCorta(inicio)} al ${fechaLarga(fin)}`
}
