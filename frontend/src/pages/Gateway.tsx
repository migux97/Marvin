import { Page, Tipo } from '../components/ui'
import { corto, hora, type Enlace } from '../lib/model'
import { CONTRATO, MODO_REAL, useMarvin } from '../lib/store'
import { enlaceContrato, enlaceCuenta, enlaceTx } from '../lib/stellar'

const ENLACES: { v: Enlace; t: string }[] = [
  { v: 'sin', t: 'Sin internet' },
  { v: 'celular', t: 'Celular' },
  { v: 'satelital', t: 'Satelital' },
]

export default function Gateway() {
  const { estado, setEnlace, puerta } = useMarvin()
  const cola = estado.reportes
    .filter((r) => r.estado === 'en_gateway')
    .sort((a, b) => a.prioridad - b.prioridad || a.ts - b.ts)
  const publicados = estado.reportes
    .filter((r) => r.estado === 'publicado')
    .sort((a, b) => (b.publicadoEn ?? 0) - (a.publicadoEn ?? 0))
  const enCurso = estado.reportes.find((r) => r.estado === 'publicando')
  const siguiente = enCurso ?? cola[0]
  const rechazadosRed = estado.reportes.filter((r) => r.estado === 'rechazado' && r.motivoRechazo && r.nodoId && r.alcance.includes('GW'))

  return (
    <>
      <Page
        rol="Paso 4 · Técnico de la puerta de enlace"
        titulo="Puerta de enlace"
        acciones={
          <div className="stack" style={{ alignItems: 'flex-end' }}>
            <span className="tiny">Enlace a internet</span>
            <div className="seg">
              {ENLACES.map((e) => (
                <button key={e.v} className={estado.enlace === e.v ? 'on' : ''} onClick={() => setEnlace(e.v)}>
                  {e.t}
                </button>
              ))}
            </div>
          </div>
        }
      >
        Único punto donde entra la red. Junta los reportes de la malla en una cola por prioridad y, cuando consigue
        el primer enlace disponible, los publica en Stellar: primero víctimas, después colapsos, rutas y zonas
        revisadas. A la red solo viajan el hash, la llave del nodo y la firma.
      </Page>

      <div className="grid g3" style={{ marginBottom: 16 }}>
        <div className="card stat">
          <div className="v">{cola.length}</div>
          <div className="l">En cola, esperando enlace</div>
        </div>
        <div className="card stat">
          <div className="v">{publicados.length}</div>
          <div className="l">Publicados en Stellar Testnet</div>
        </div>
        <div className="card stat">
          <div className="v" style={{ color: estado.enlace === 'sin' ? 'var(--err)' : 'var(--ok)' }}>
            {estado.enlace === 'sin' ? 'Caído' : estado.enlace === 'celular' ? 'Celular' : 'Satelital'}
          </div>
          <div className="l">
            {estado.enlace === 'sin' ? 'La cola se conserva hasta que vuelva un enlace' : MODO_REAL ? 'Una transacción por reporte, ~5–10 s cada una en Testnet' : '~1 transacción cada 2–3 s en la demo'}
          </div>
        </div>
      </div>

      <div className="grid g2" style={{ alignItems: 'start' }}>
        <div className="card">
          <div className="card-head">
            <h2>Cola por prioridad</h2>
            <span className="tiny">1 víctima · 2 colapso · 3 ruta · 4 zona</span>
          </div>
          {cola.length === 0 ? (
            <div className="empty">Cola vacía. Todo lo recibido ya está en Stellar.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Reporte</th>
                    <th>Prioridad</th>
                    <th>Recibido</th>
                  </tr>
                </thead>
                <tbody>
                  {cola.map((r, i) => (
                    <tr key={r.id}>
                      <td>{i + 1}</td>
                      <td>
                        <Tipo tipo={r.tipo} corto />
                        <div className="tiny mono">{r.id} · zona {r.zona}</div>
                      </td>
                      <td>{r.prioridad}</td>
                      <td className="mono">{hora(r.ts)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <h2>{enCurso ? 'Invocando el contrato…' : 'Próxima invocación al contrato'}</h2>
          {siguiente ? (
            <pre className="mono" style={{ background: 'var(--surface-2)', padding: 12, borderRadius: 8, overflowX: 'auto', margin: 0, fontSize: '0.75rem', lineHeight: 1.6 }}>
{`contrato.registrar_reporte(
  hash:  ${corto(siguiente.hash, 10)},
  nodo:  ${corto(siguiente.nodo, 10)},
  firma: ${corto(siguiente.firma, 10)},
  tipo:  ${siguiente.prioridad},
  anula: ${siguiente.anulaA ? `hash(${siguiente.anulaA})` : 'None'}
)`}
            </pre>
          ) : (
            <div className="empty">Nada pendiente.</div>
          )}
          <p className="tiny" style={{ marginTop: 10 }}>
            Los datos personales y la nota del reporte no salen de la red local; en Stellar solo queda el compromiso
            (hash) para poder verificarlo después. Las comisiones las paga la cuenta de la puerta de enlace, no los nodos.
          </p>
          {MODO_REAL && (
            <div className="stack small" style={{ marginTop: 12, gap: 6 }}>
              <div>
                Contrato:{' '}
                <a className="mono" href={enlaceContrato(CONTRATO.contractId)} target="_blank" rel="noreferrer">
                  {corto(CONTRATO.contractId, 8)}
                </a>
              </div>
              {puerta && (
                <div>
                  Cuenta de la puerta de enlace:{' '}
                  <a className="mono" href={enlaceCuenta(puerta.publicKey)} target="_blank" rel="noreferrer">
                    {corto(puerta.publicKey, 8)}
                  </a>{' '}
                  <span className={`badge ${puerta.estado === 'lista' ? 'ok' : puerta.estado === 'error' ? 'err' : ''}`}>
                    {puerta.estado === 'lista' ? 'Con fondos' : puerta.estado === 'fondeando' ? 'Pidiendo fondos a Friendbot…' : puerta.estado === 'error' ? 'Sin conexión' : 'Se fondea al activar el enlace'}
                  </span>
                  {puerta.error && <div className="tiny" style={{ color: 'var(--err)' }}>{puerta.error}</div>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2>Transacciones publicadas</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Reporte</th>
                <th>Ledger</th>
                <th>Transacción</th>
                <th>Publicado</th>
              </tr>
            </thead>
            <tbody>
              {publicados.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Tipo tipo={r.tipo} corto />
                    <div className="tiny mono">{r.id}</div>
                  </td>
                  <td className="mono">{r.ledger?.toLocaleString('es-MX')}</td>
                  <td className="mono">
                    {MODO_REAL && r.txHash ? (
                      <a href={enlaceTx(r.txHash)} target="_blank" rel="noreferrer">{corto(r.txHash, 10)} ↗</a>
                    ) : (
                      corto(r.txHash ?? '', 10)
                    )}
                  </td>
                  <td className="mono">{r.publicadoEn ? hora(r.publicadoEn) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="tiny" style={{ marginTop: 8 }}>
          {MODO_REAL
            ? 'Transacciones reales en Stellar Testnet: cada enlace abre la transacción en el explorador público.'
            : 'Transacciones simuladas: falta configurar el contrato en src/contrato.json.'}
        </p>
      </div>

      {rechazadosRed.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <h2>Rechazados</h2>
          <div className="table-wrap">
            <table>
              <tbody>
                {rechazadosRed.map((r) => (
                  <tr key={r.id}>
                    <td><Tipo tipo={r.tipo} corto /><div className="tiny mono">{r.id} · {r.nodoId}</div></td>
                    <td style={{ color: 'var(--err)' }}>{r.motivoRechazo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
