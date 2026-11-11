export const DESCUENTOS = [
  { desde: 30, porcentaje: 0.18, etiqueta: 'Tarifa mensual' },
  { desde: 15, porcentaje: 0.12, etiqueta: 'Tarifa quincenal' },
  { desde: 7, porcentaje: 0.08, etiqueta: 'Tarifa semanal' },
]

export const ZONAS = [
  { id: 'amb', nombre: 'Área metropolitana de Bucaramanga', tarifaBase: 180000, diasTransito: 0 },
  { id: 'santander', nombre: 'Resto de Santander', tarifaBase: 650000, diasTransito: 1 },
  { id: 'nororiente', nombre: 'Norte de Santander, Cesar y Boyacá', tarifaBase: 1400000, diasTransito: 2 },
  { id: 'centro', nombre: 'Cundinamarca, Antioquia y Tolima', tarifaBase: 2100000, diasTransito: 2 },
  { id: 'caribe', nombre: 'La Guajira, Córdoba y Costa Caribe', tarifaBase: 2600000, diasTransito: 3 },
]

export const FACTOR_TRANSPORTE = {
  pesado: 1,
  autopropulsado: 0.6,
  mediano: 0.55,
  liviano: 0.25,
}

export const TARIFA_OPERADOR = 290000
export const PORCENTAJE_SEGURO = 0.025
export const PORCENTAJE_IVA = 0.19
export const PORCENTAJE_DEPOSITO = 0.2
export const DIAS_MAXIMOS = 120
