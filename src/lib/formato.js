const pesos = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
const numero = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })

export const cop = (valor) => pesos.format(valor).replace(/\s/g, ' ')

export const millones = (valor) => {
  const m = valor / 1_000_000
  const decimales = m >= 100 ? 0 : 1
  return `$${m.toLocaleString('es-CO', { minimumFractionDigits: decimales, maximumFractionDigits: decimales })} M`
}

export const entero = (valor) => numero.format(valor)

export const porcentaje = (valor, decimales = 0) =>
  `${(valor * 100).toLocaleString('es-CO', { minimumFractionDigits: decimales, maximumFractionDigits: decimales })} %`

export const plural = (n, singular, pluralTexto = `${singular}s`) => `${entero(n)} ${n === 1 ? singular : pluralTexto}`
