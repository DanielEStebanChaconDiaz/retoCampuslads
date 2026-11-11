import { Estado } from '../components/Estado'
import { LogoSlot } from '../components/LogoSlot'
import { MAQUINAS_POR_ID, nombreCompleto } from '../data/catalogo'
import { CLIENTES_POR_ID } from '../data/clientes'
import { ALQUILER } from '../data/empresa'
import { PORCENTAJE_IVA, PORCENTAJE_SEGURO, TARIFA_OPERADOR } from '../data/tarifas'
import { estadoReserva } from '../lib/analitica'
import { zonaPorId } from '../lib/cotizacion'
import { fechaLarga, rangoTexto } from '../lib/fechas'
import { cop, plural } from '../lib/formato'
import { useApp } from '../store/contexto'

const ETIQUETAS_ESTADO = {
  programada: ['info', 'Programada'],
  'en-curso': ['ok', 'En curso'],
  finalizada: ['info', 'Finalizada'],
  cancelada: ['cancelado', 'Cancelada'],
}

export function Factura({ reservaId, nueva, onCerrar }) {
  const { reservas } = useApp()
  const reserva = reservas.find((r) => r.id === reservaId)
  if (!reserva) return null

  const maquina = MAQUINAS_POR_ID[reserva.maquinaId]
  const cliente = CLIENTES_POR_ID[reserva.clienteId]
  const zona = zonaPorId(reserva.zonaId)
  const c = reserva.cotizacion
  const [tono, textoEstado] = ETIQUETAS_ESTADO[estadoReserva(reserva)]

  const filas = [
    ...c.lineas.map((l) => ({ ...l, concepto: l.tipo === 'maquina' ? `${l.concepto} (unidad ${reserva.unidad})` : l.concepto })),
    c.operador > 0 && { id: 'operador', concepto: 'Operador certificado', cantidad: 1, dias: c.dias, unitario: TARIFA_OPERADOR, total: c.operador },
  ].filter(Boolean)

  return (
    <div className="factura-envoltura">
      {nueva && (
        <div className="aviso aviso--exito sin-imprimir" role="status">
          <p>
            <strong>Alquiler confirmado.</strong> La unidad {reserva.unidad} quedó bloqueada a tu nombre del {rangoTexto(reserva.inicio, reserva.fin)}.
          </p>
        </div>
      )}

      <article className="factura" aria-label={`Factura ${reserva.factura}`}>
        <header className="factura-cabecera">
          <div className="factura-emisor">
            <LogoSlot src={ALQUILER.logo} nombre={`logo de ${ALQUILER.nombre}`} etiqueta="Logo TEC" className="factura-logo" />
            <div>
              <strong>{ALQUILER.razonSocial}</strong>
              <span>NIT {ALQUILER.nit}</span>
              <span>{ALQUILER.direccion}</span>
              <span>{ALQUILER.ciudad}</span>
              <span>
                {ALQUILER.telefono}, {ALQUILER.correo}
              </span>
            </div>
          </div>
          <div className="factura-numero">
            <span>Factura de alquiler</span>
            <strong>{reserva.factura}</strong>
            <span>Emitida el {fechaLarga(reserva.creada)}</span>
            <Estado tono={tono}>{textoEstado}</Estado>
          </div>
        </header>

        <div className="factura-datos">
          <section>
            <h4>Cliente</h4>
            <p>
              <strong>{cliente.razonSocial}</strong>
              <span>NIT {cliente.nit}</span>
              <span>{cliente.contacto}</span>
              <span>{cliente.telefono}</span>
              <span>{cliente.correo}</span>
            </p>
          </section>
          <section>
            <h4>Pedido</h4>
            <p>
              <strong>{nombreCompleto(maquina)}</strong>
              <span>Unidad {reserva.unidad}</span>
              <span>{reserva.accesorios.length ? plural(reserva.accesorios.reduce((s, a) => s + a.cantidad, 0), 'equipo adicional', 'equipos adicionales') : 'Sin equipos adicionales'}</span>
              <span>{c.llevaOperador ? 'Con operador' : 'Sin operador'}</span>
              <span>Obra: {reserva.obra}</span>
            </p>
          </section>
          <section>
            <h4>Fechas y entrega</h4>
            <dl>
              <div>
                <dt>Alquiler</dt>
                <dd>
                  {rangoTexto(reserva.inicio, reserva.fin)} ({plural(c.dias, 'día')})
                </dd>
              </div>
              <div>
                <dt>Despacho</dt>
                <dd>{fechaLarga(c.despacho)}</dd>
              </div>
              <div>
                <dt>Entrega estimada</dt>
                <dd>{fechaLarga(c.entrega)}</dd>
              </div>
              <div>
                <dt>Retiro</dt>
                <dd>{fechaLarga(c.devolucion)}</dd>
              </div>
              <div>
                <dt>Destino</dt>
                <dd>{zona.nombre}</dd>
              </div>
            </dl>
          </section>
        </div>

        <div className="tabla-desplazable">
          <table className="factura-tabla">
            <thead>
              <tr>
                <th scope="col">Concepto</th>
                <th scope="col">Cant.</th>
                <th scope="col">Días</th>
                <th scope="col">Valor día</th>
                <th scope="col">Total</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.id}>
                  <td>{f.concepto}</td>
                  <td>{f.cantidad}</td>
                  <td>{f.dias}</td>
                  <td>{cop(f.unitario)}</td>
                  <td>{cop(f.total)}</td>
                </tr>
              ))}
              <tr>
                <td>Movilización ida y regreso a {zona.nombre}</td>
                <td>1</td>
                <td>–</td>
                <td>–</td>
                <td>{cop(c.movilizacion)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <dl className="factura-totales">
          <div>
            <dt>Alquiler de equipos</dt>
            <dd>{cop(c.alquilerBruto)}</dd>
          </div>
          {c.descuento > 0 && (
            <div>
              <dt>
                {c.tramo.etiqueta} ({Math.round(c.tramo.porcentaje * 100)} %)
              </dt>
              <dd>−{cop(c.descuento)}</dd>
            </div>
          )}
          {c.operador > 0 && (
            <div>
              <dt>Operador</dt>
              <dd>{cop(c.operador)}</dd>
            </div>
          )}
          <div>
            <dt>Movilización</dt>
            <dd>{cop(c.movilizacion)}</dd>
          </div>
          <div>
            <dt>Póliza de daños ({(PORCENTAJE_SEGURO * 100).toLocaleString('es-CO')} %)</dt>
            <dd>{cop(c.seguro)}</dd>
          </div>
          <div className="factura-subtotal">
            <dt>Subtotal</dt>
            <dd>{cop(c.subtotal)}</dd>
          </div>
          <div>
            <dt>IVA ({Math.round(PORCENTAJE_IVA * 100)} %)</dt>
            <dd>{cop(c.iva)}</dd>
          </div>
          <div className="factura-total">
            <dt>Total a pagar</dt>
            <dd>{cop(c.total)}</dd>
          </div>
        </dl>

        <footer className="factura-pie">
          <p>
            Depósito reembolsable de {cop(c.deposito)}, exigible antes del despacho y devuelto al recibir el equipo en buen estado. Los valores
            corresponden a la cotización generada el {fechaLarga(reserva.creada)}. Las cancelaciones se aceptan sin costo hasta el día anterior al
            despacho.
          </p>
          <p className="factura-simulada">Documento generado por un prototipo con datos ficticios. No tiene validez fiscal ni es una factura electrónica.</p>
          <p>
            {ALQUILER.web}, {ALQUILER.correo}
          </p>
        </footer>
      </article>

      <div className="factura-acciones sin-imprimir">
        <button type="button" className="boton boton--primario" onClick={() => window.print()}>
          Imprimir o guardar PDF
        </button>
        <button type="button" className="boton boton--secundario" onClick={onCerrar}>
          Cerrar
        </button>
      </div>
    </div>
  )
}
