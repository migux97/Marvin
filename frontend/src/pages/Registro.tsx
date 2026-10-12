import { useState } from 'react'
import { Page, Tipo } from '../components/ui'
import { canonico, corto, hora, payloadDe, type PayloadReporte, type Reporte } from '../lib/model'
import { hashReporte, verificar } from '../lib/crypto'
import { useMarvin } from '../lib/store'

type Resultado = { ok: boolean; titulo: string; lineas: string[] }

export default function Registro() {
  const { estado } = useMarvin()
  const publicados = estado.reportes
    .filter((r) => r.estado === 'publicado')
    .sort((a, b) => (b.ledger ?? 0) - (a.ledger ?? 0))
  const [texto, setTexto] = useState('')
  const [res, setRes] = useState<Resultado | null>(null)

  function cargar(r: Reporte, alterar = false) {
    const p = payloadDe(r)
    if (alterar) p.personas = p.personas + 3
    setTexto(JSON.stringify(p, null, 2))
    setRes(null)
  }

  function comprobar() {
    let p: PayloadReporte
    try {
      p = JSON.parse(texto)
    } catch {
      setRes({ ok: false, titulo: 'No es un JSON válido', lineas: [] })
      return
    }
    const hash = hashReporte(p)
    const enCadena = publicados.find((r) => r.hash === hash)
    if (!enCadena) {
      const mismoId = publicados.find((r) => r.id === p.id)
      setRes({
        ok: false,
        titulo: 'El reporte NO coincide con el registro',
        lineas: [
          `Hash calculado: ${corto(hash, 12)}`,
          mismoId
            ? `En Stellar, ${p.id} tiene el hash ${corto(mismoId.hash, 12)}: el contenido fue alterado.`
            : 'Ningún reporte publicado tiene este hash.',
        ],
      })
      return
    }
    const firmaOk = verificar(enCadena.hash, enCadena.firma, enCadena.nodo)
    const nodo = estado.nodos.find((n) => n.publicKey === enCadena.nodo)
    setRes({
      ok: firmaOk,
      titulo: firmaOk ? 'Reporte íntegro y firmado' : 'Hash encontrado pero la firma no es válida',
      lineas: [
        `Hash ${corto(hash, 12)} encontrado en el ledger ${enCadena.ledger?.toLocaleString('es-MX')}`,
        `Firma ed25519 ${firmaOk ? 'válida' : 'inválida'} para la llave ${corto(enCadena.nodo, 8)} (${nodo?.id ?? '¿?'} · ${nodo?.brigada ?? 'desconocida'})`,
        `Registrado a las ${enCadena.publicadoEn ? hora(enCadena.publicadoEn) : '—'}, generado a las ${hora(p.ts)}`,
      ],
    })
  }

  return (
    <>
      <Page rol="Paso 5 · ONG, telecom o auditor" titulo="Registro público">
        Lo que cualquiera ve en Stellar, sin pedir permiso ni depender de un servidor de Marvin: hash, llave del
        nodo, firma y hora del ledger. Con el reporte original en la mano se puede comprobar que nadie lo alteró.
      </Page>

      <div className="grid g32">
        <div className="card">
          <div className="card-head">
            <h2>Eventos del contrato</h2>
            <span className="tiny">{publicados.length} reportes registrados</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ledger</th>
                  <th>Tipo</th>
                  <th>Hash</th>
                  <th>Nodo</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {publicados.map((r) => (
                  <tr key={r.id}>
                    <td className="mono">{r.ledger?.toLocaleString('es-MX')}</td>
                    <td><Tipo tipo={r.tipo} corto /></td>
                    <td className="mono">{corto(r.hash, 6)}</td>
                    <td className="mono">{corto(r.nodo, 4)}</td>
                    <td>
                      <button className="btn" onClick={() => cargar(r)}>Verificar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="tiny" style={{ marginTop: 8 }}>
            No aparecen zona, nota ni datos personales: esos datos se quedan con las instituciones que los generan.
          </p>
        </div>

        <div className="card stack">
          <h2>Verificar un reporte</h2>
          <p className="small muted">
            Pegá el reporte original (lo tiene el centro de mando o la brigada). Se recalcula su hash y se busca en el
            registro.
          </p>
          <textarea className="input" value={texto} onChange={(e) => { setTexto(e.target.value); setRes(null) }} placeholder='{"id": "R-...", "tipo": "victima", ...}' rows={10} />
          <div className="row">
            <button className="btn primary" onClick={comprobar} disabled={!texto.trim()}>Comprobar</button>
            {publicados[0] && (
              <button className="btn" onClick={() => cargar(publicados[0], true)}>Probar con un reporte alterado</button>
            )}
          </div>
          {res && (
            <div className={`verif ${res.ok ? 'ok' : 'err'}`}>
              <b>{res.ok ? '✓ ' : '✕ '}{res.titulo}</b>
              {res.lineas.map((l) => (
                <div key={l} className="small" style={{ marginTop: 4 }}>{l}</div>
              ))}
            </div>
          )}
          <details className="tiny">
            <summary>Cómo se calcula el hash</summary>
            <p style={{ marginTop: 6 }}>
              SHA-256 sobre la serialización canónica del reporte (claves en orden fijo). Ejemplo:{' '}
              <code>{publicados[0] ? canonico(publicados[0]).slice(0, 80) + '…' : ''}</code>
            </p>
          </details>
        </div>
      </div>
    </>
  )
}
