export const CLIENTES = [
  { id: 'c-01', razonSocial: 'Montajes Andinos S.A.S.', nit: '900.482.117-3', contacto: 'Laura Méndez', telefono: '+57 310 482 1173', correo: 'compras@montajesandinos.co', ciudad: 'Bucaramanga' },
  { id: 'c-02', razonSocial: 'Redes del Oriente Ltda.', nit: '890.215.664-1', contacto: 'Carlos Rueda', telefono: '+57 315 664 2150', correo: 'logistica@redesoriente.co', ciudad: 'Cúcuta' },
  { id: 'c-03', razonSocial: 'Ingeniería Chicamocha S.A.S.', nit: '901.337.902-8', contacto: 'Andrea Pinzón', telefono: '+57 301 902 3378', correo: 'proyectos@chicamocha.co', ciudad: 'Piedecuesta' },
  { id: 'c-04', razonSocial: 'Transmisiones del Caribe S.A.S.', nit: '900.774.530-6', contacto: 'Jorge Daza', telefono: '+57 318 530 7746', correo: 'operaciones@transcaribe.co', ciudad: 'Valledupar' },
  { id: 'c-05', razonSocial: 'Solar La Mesa E.S.P.', nit: '901.120.448-2', contacto: 'Natalia Gómez', telefono: '+57 312 448 1202', correo: 'obra@solarlamesa.co', ciudad: 'Barrancabermeja' },
  { id: 'c-06', razonSocial: 'Constructora Guane S.A.S.', nit: '900.951.276-0', contacto: 'Felipe Ardila', telefono: '+57 317 276 9510', correo: 'equipos@constructoraguane.co', ciudad: 'San Gil' },
]

export const CLIENTES_POR_ID = Object.fromEntries(CLIENTES.map((c) => [c.id, c]))

export const USUARIOS = [
  { id: 'u-01', correo: 'compras@montajesandinos.co', clave: 'demo2026', nombre: 'Laura Méndez', rol: 'cliente', clienteId: 'c-01' },
  { id: 'u-02', correo: 'logistica@redesoriente.co', clave: 'demo2026', nombre: 'Carlos Rueda', rol: 'cliente', clienteId: 'c-02' },
  { id: 'u-03', correo: 'comercial@sdsas.demo', clave: 'admin2026', nombre: 'Coordinación comercial', rol: 'admin', clienteId: null },
]
