import { useState } from 'react'
import { Page, Tipo } from '../components/ui'
import { canonico, corto, hora, payloadDe, type PayloadReporte, type Reporte } from '../lib/model'
import { hashReporte, verificar } from '../lib/crypto'
import { CONTRATO, MODO_REAL, useMarvin } from '../lib/store'
import { consultar, enlaceContrato, enlaceTx } from '../lib/stellar'

type Resultado = { ok: boolean; titulo: string; lineas: string[]; tx?: string }

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

  const [consultando, setConsultando] = useState(false)

  // Modo real: se le pregunta al contrato en Stellar Testnet, no a la memoria local.
  async function comprobarEnRed(p: PayloadReporte, hash: string) {
    setConsultando(true)
    try {
      const reg = await consultar(CONTRATO.contractId, hash)
      const local = publicados.find((r) => r.hash === hash)
      if (!reg) {
        const mismoId = publicados.find((r) => r.id === p.id)
        setRes({
          ok: false,
          titulo: 'El reporte NO está en el contrato',
          lineas: [
            `Hash calculado: ${corto(hash, 12)}`,
            mismoId
              ? `En Stellar, ${p.id} está registrado con el hash ${corto(mismoId.hash, 12)}: el contenido fue alterado.`
              : 'El contrato no tiene ningún reporte con este hash.',
          ],
        })
        return
      }
      const nodo = estado.nodos.find((n) => n.publicKey === reg.nodo)
      setRes({
        ok: reg.nodo === p.nodo,
        titulo: reg.nodo === p.nodo ? 'Reporte íntegro: el contrato lo tiene registrado' : 'El hash existe, pero firmado por otro nodo',
        lineas: [
          `Consultado en vivo al contrato ${corto(CONTRATO.contractId, 6)} en Stellar Testnet`,
          `Registrado en el ledger ${reg.ledger.toLocaleString('es-MX')} (${new Date(reg.timestamp * 1000).toLocaleString('es-MX')})`,
          `Firma verificada por el contrato al registrarlo · nodo ${corto(reg.nodo, 8)} (${nodo?.id ?? '¿?'} · ${nodo?.brigada ?? 'desconocido'})`,
        ],
        tx: local?.txHash,
      })
    } catch (e) {
      setRes({ ok: false, titulo: 'No se pudo consultar Stellar Testnet', lineas: [e instanceof Error ? e.message : String(e)] })
    } finally {
      setConsultando(false)
    }
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
    if (MODO_REAL) {
      void comprobarEnRed(p, hash)
      return
    }
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
            <h2>
              Eventos del contrato
              {MODO_REAL && (
                <a className="tiny" style={{ marginLeft: 8, fontWeight: 400 }} href={enlaceContrato(CONTRATO.contractId)} target="_blank" rel="noreferrer">
                  ver contrato ↗
                </a>
              )}
            </h2>
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
                    <td className="mono">
                      {MODO_REAL && r.txHash ? (
                        <a href={enlaceTx(r.txHash)} target="_blank" rel="noreferrer">{corto(r.hash, 6)} ↗</a>
                      ) : (
                        corto(r.hash, 6)
                      )}
                    </td>
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
            <button className="btn primary" onClick={comprobar} disabled={!texto.trim() || consultando}>{consultando ? 'Consultando…' : 'Comprobar'}</button>
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
              {res.tx && (
                <div className="small" style={{ marginTop: 4 }}>
                  <a href={enlaceTx(res.tx)} target="_blank" rel="noreferrer">Ver la transacción en el explorador ↗</a>
                </div>
              )}
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
