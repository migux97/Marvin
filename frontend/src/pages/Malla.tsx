import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Estado, Page, Tipo } from '../components/ui'
import { ENLACES_MALLA, GATEWAY_ID, POS_GATEWAY, TIPOS, enlacesExtra, hora } from '../lib/model'
import { useMarvin } from '../lib/store'

export default function Malla() {
  const { estado } = useMarvin()
  const recientes = estado.reportes.slice(0, 8)
  const [selId, setSelId] = useState<string | null>(null)
  const sel = estado.reportes.find((r) => r.id === selId) ?? estado.reportes.find((r) => r.estado === 'en_malla') ?? recientes[0]

  const pos = (id: string) => (id === GATEWAY_ID ? POS_GATEWAY : estado.nodos.find((n) => n.id === id)!)
  const enlaces = [...ENLACES_MALLA, ...enlacesExtra(estado.nodos)]
  const tiene = (id: string) => sel?.alcance.includes(id)
  const color = sel ? TIPOS[sel.tipo].color : 'var(--accent)'

  return (
    <>
      <Page rol="Paso 2 · Malla ESP-NOW" titulo="Red de malla">
        Sin router ni internet: cada nodo que recibe un reporte verifica la firma contra las llaves registradas,
        guarda una copia, descarta duplicados y lo reenvía a sus vecinos hasta llegar a la puerta de enlace.
      </Page>

      <div className="grid g21">
        <div className="card malla">
          <div className="card-head">
            <h2>Topología</h2>
            {sel && (
              <span className="row small">
                <Tipo tipo={sel.tipo} corto /> <span className="mono">{sel.id}</span> · {sel.alcance.length - (tiene(GATEWAY_ID) ? 1 : 0)} nodos con copia
              </span>
            )}
          </div>
          <svg viewBox="0 0 640 330" role="img" aria-label="Malla de nodos ESP32 y puerta de enlace">
            {enlaces.map(([a, b]) => {
              const pa = pos(a)
              const pb = pos(b)
              const activo = tiene(a) && tiene(b)
              return (
                <line
                  key={a + b}
                  x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                  stroke={activo ? color : 'var(--line)'}
                  strokeWidth={activo ? 3 : 2}
                  strokeDasharray={activo ? undefined : '5 5'}
                />
              )
            })}
            {estado.nodos.map((n) => {
              const revocado = n.estado === 'revocado'
              return (
                <g key={n.id}>
                  <circle cx={n.x} cy={n.y} r={26} fill={tiene(n.id) ? color : 'var(--surface)'} stroke={revocado ? 'var(--err)' : 'var(--ink-3)'} strokeWidth={2} strokeDasharray={revocado ? '4 3' : undefined} />
                  <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="13" fontWeight="700" fill={tiene(n.id) ? '#fff' : 'var(--ink)'}>{n.id}</text>
                  <text x={n.x} y={n.y + 44} textAnchor="middle" fontSize="10.5" fill={revocado ? 'var(--err)' : 'var(--ink-2)'}>
                    {revocado ? 'revocado' : n.brigada.length > 22 ? n.brigada.slice(0, 21) + '…' : n.brigada}
                  </text>
                </g>
              )
            })}
            <g>
              <rect x={POS_GATEWAY.x - 34} y={POS_GATEWAY.y - 26} width={68} height={52} rx={10} fill={tiene(GATEWAY_ID) ? color : 'var(--surface)'} stroke="var(--ink)" strokeWidth={2} />
              <text x={POS_GATEWAY.x} y={POS_GATEWAY.y + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill={tiene(GATEWAY_ID) ? '#fff' : 'var(--ink)'}>GW</text>
              <text x={POS_GATEWAY.x} y={POS_GATEWAY.y + 44} textAnchor="middle" fontSize="10.5" fill="var(--ink-2)">Puerta de enlace</text>
              <text x={POS_GATEWAY.x} y={POS_GATEWAY.y - 36} textAnchor="middle" fontSize="10.5" fill={estado.enlace === 'sin' ? 'var(--err)' : 'var(--ok)'}>
                {estado.enlace === 'sin' ? '✕ sin internet' : `↑ ${estado.enlace}`}
              </text>
            </g>
          </svg>
          <p className="tiny" style={{ marginTop: 8 }}>
            Los nodos coloreados guardan una copia del reporte seleccionado. Enviá uno nuevo desde el{' '}
            <Link to="/nodo">nodo de campo</Link> para verlo propagarse salto a salto.
          </p>
        </div>

        <div className="card">
          <h2>Reportes recientes</h2>
          <div className="stack">
            {recientes.map((r) => (
              <button
                key={r.id}
                className="btn"
                style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', gap: 8, outline: sel?.id === r.id ? '2px solid var(--ink)' : undefined }}
                onClick={() => setSelId(r.id)}
              >
                <span>
                  <Tipo tipo={r.tipo} corto />
                  <span className="tiny mono" style={{ display: 'block' }}>
                    {r.id} · {r.nodoId} · zona {r.zona}
                  </span>
                </span>
                <Estado r={r} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2>Bitácora de la red</h2>
        <div className="log">
          {estado.bitacora.map((e, i) => (
            <div key={i}>
              <span className="t mono">{hora(e.ts)}</span>
              <span style={{ color: e.tipo === 'error' ? 'var(--err)' : e.tipo === 'ok' ? 'var(--ok)' : undefined }}>{e.texto}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
