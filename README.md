# Alquiler de maquinaria | SD S.A.S. y Alquiler TEC

Landing page con herramienta de alquiler de maquinaria y equipos para obras eléctricas y civiles. Funciona sin backend: los datos de prueba se generan al cargar y se guardan en `localStorage`.

## Demo

https://danielestebanchacondiaz.github.io/retoCampuslads/

## Ejecutar en local

```bash
npm install
npm run dev
```

## Cuentas de prueba

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Cliente | compras@montajesandinos.co | demo2026 |
| Cliente | logistica@redesoriente.co | demo2026 |
| Administrador | comercial@sdsas.demo | admin2026 |

## Flujo

1. Ingreso del usuario.
2. El usuario elige fechas y destino, e intenta alquilar una máquina.
3. El sistema calcula qué unidades están libres en ese rango.
4. Si la máquina está ocupada muestra la próxima fecha disponible para la misma duración y la maquinaria similar.
5. La cotización se recalcula según días, tarifa por duración, equipos adicionales, operador, movilización, póliza e IVA.
6. Al confirmar, la unidad queda bloqueada en ese horario.
7. Se genera la factura con datos del cliente, máquina, equipos, fechas, despacho, entrega estimada y totales.

El administrador ve además el panel comercial: ocupación de la flota, ingresos por mes, plan de flota, rendimiento por máquina, demanda no atendida, clientes principales y próximos despachos.

## Estructura

- `src/data`: catálogo (tomado del portafolio de alquiler), tarifas, clientes, datos de empresa y generador de datos de prueba.
- `src/lib`: fechas, disponibilidad, cotización y analítica.
- `src/store`: estado global, sesión y persistencia.
- `src/secciones`: secciones de la landing.
- `src/flujos`: ingreso, detalle con cotización y factura.
- `src/components`: piezas reutilizables, incluida la línea de disponibilidad por unidad.

## Autor

Daniel Esteban Chacón Díaz, Reto Empresarial Campuslands.

## Logos y marcas

Los logos de SD S.A.S. y TEC, los sellos de certificación y la franja de clientes se extrajeron de los brochures y están en `public/marca/`. Las rutas se configuran en `src/data/empresa.js`; si una ruta queda en `null`, se muestra un espacio reservado.

Las fotos de las máquinas están en `public/maquinas/<id>.jpg` (800 × 600, proporción 4:3) y se asignan en la propiedad `imagen` de cada máquina en `src/data/catalogo.js`. Si una máquina no tiene `imagen`, se muestra el ícono de su categoría.
