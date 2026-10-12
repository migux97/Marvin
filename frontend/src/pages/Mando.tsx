import { useState } from 'react'
import { Estado, Page, Tipo } from '../components/ui'
import { NODOS_BASE, TIPOS, ZONAS, hora, type TipoReporte } from '../lib/model'
import { useMarvin, vigentes } from '../lib/store'

export default function Mando() {
  const { estado, asignar } = useMarvin()
  const [filtro, setFiltro] = useState<TipoReporte | 'todos'>('todos')
  const [zonaSel, setZonaSel] = useState<string | null>(null)
  const [verAnulados, setVerAnulados] = useState(false)

  const recibidos = estado.reportes.filter((r) => r.estado === 'en_gateway' || r.estado === 'publicado')
  const activos = vigentes(estado.reportes)
  const idsActivos = new Set(activos.map((r) => r.id))
  const lista = (verAnulados ? recibidos : activos)
    .filter((r) => filtro === 'todos' || r.tipo === filtro)
    .filter((r) => !zonaSel || r.zona === zonaSel)
    .sort((a, b) => a.prioridad - b.prioridad || b.ts - a.ts)

  const cuenta = (t: TipoReporte) => activos.filter((r) => r.tipo === t).length
  const personas = activos.filter((r) => r.tipo === 'victima').reduce((s, r) => s + r.personas, 0)
  const enCamino = estado.reportes.filter((r) => r.estado === 'en_malla').length

  return (
    <>
      <Page rol="Paso 3 · Coordinador del centro de mando" titulo="Centro de mando">
        Todos los reportes en un solo panel, sin transcribir a mano. Funciona en la red local de la puerta de
        enlace, así que la coordinación no se detiene aunque no haya internet; solo se retrasa la publicación.
      </Page>

      <div className="grid g4" style={{ marginBottom: 16 }}>
        <div className="card stat">
          <div className="v" style={{ color: TIPOS.victima.color }}>{cuenta('victima')}</div>
          <div className="l">Víctimas reportadas · {personas} personas</div>
        </div>
        <div className="card stat">
          <div className="v" style={{ color: TIPOS.colapso.color }}>{cuenta('colapso')}</div>
          <div className="l">Estructuras colapsadas</div>
        </div>
        <div className="card stat">
          <div className="v" style={{ color: TIPOS.ruta.color }}>{cuenta('ruta')}</div>
          <div className="l">Rutas bloqueadas</div>
        </div>
        <div className="card stat">
          <div className="v" style={{ color: TIPOS.zona.color }}>
            {new Set(activos.filter((r) => r.tipo === 'zona').map((r) => r.zona)).size}/{ZONAS.length}
          </div>
          <div className="l">Zonas revisadas</div>
        </div>
      </div>

      <div className="split ancho">
        <div className="card">
          <div className="card-head">
            <h2>Mapa por zonas</h2>
            {zonaSel && (
              <button className="btn" onClick={() => setZonaSel(null)}>
                Ver todas
              </button>
            )}
          </div>
          <div className="mapa">
            <span />
            {[1, 2, 3, 4].map((c) => (
              <span key={c} className="eje">{c}</span>
            ))}
            {['A', 'B', 'C', 'D'].map((f) => (
              <Fila key={f} fila={f} />
            ))}
          </div>
          <div className="leyenda" style={{ marginTop: 12 }}>
            {(Object.keys(TIPOS) as TipoReporte[]).map((t) => (
              <span key={t} className="row" style={{ gap: 4 }}>
                <span className="dot" style={{ background: TIPOS[t].color }} /> {TIPOS[t].corto}
              </span>
            ))}
          </div>
          <p className="tiny" style={{ marginTop: 10 }}>
            {enCamino > 0 ? `${enCamino} reporte(s) todavía viajando por la malla.` : 'No hay reportes en tránsito.'}
          </p>
        </div>

        <div className="card">
          <div className="card-head">
            <h2>Reportes {zonaSel && `· zona ${zonaSel}`}</h2>
            <div className="row">
              <div className="seg">
                <button className={filtro === 'todos' ? 'on' : ''} onClick={() => setFiltro('todos')}>Todos</button>
                {(Object.keys(TIPOS) as TipoReporte[]).map((t) => (
                  <button key={t} className={filtro === t ? 'on' : ''} onClick={() => setFiltro(t)}>
                    {TIPOS[t].corto}
                  </button>
                ))}
              </div>
              <label className="row small muted">
                <input type="checkbox" checked={verAnulados} onChange={(e) => setVerAnulados(e.target.checked)} /> Ver corregidos
              </label>
            </div>
          </div>
          {lista.length === 0 ? (
            <div className="empty">No hay reportes con este filtro.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Zona</th>
                    <th>Detalle</th>
                    <th>Asignado a</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((r) => (
                    <tr key={r.id} className={idsActivos.has(r.id) ? '' : 'anulado'}>
                      <td>
                        <Tipo tipo={r.tipo} corto />
                        <div className="tiny mono">{r.id} · {hora(r.ts)}</div>
                      </td>
                      <td><b>{r.zona}</b></td>
                      <td>
                        {r.detalle}
                        {r.personas > 0 && <div className="tiny">{r.personas} persona(s)</div>}
                        {r.datosPersonales && <div className="tiny">🔒 {r.datosPersonales}</div>}
                        <div className="tiny">
                          {r.nodoId} · {estado.nodos.find((n) => n.id === r.nodoId)?.brigada}
                          {r.anulaA && ` · corrige ${r.anulaA}`}
                        </div>
                      </td>
                      <td>
                        {r.tipo === 'zona' ? (
                          <span className="tiny">—</span>
                        ) : (
                          <select className="input" value={r.asignadoA ?? ''} onChange={(e) => asignar(r.id, e.target.value)} style={{ minWidth: 130 }}>
                            <option value="">Sin asignar</option>
                            {NODOS_BASE.map((n) => (
                              <option key={n.id}>{n.brigada}</option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td><Estado r={r} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )

  function Fila({ fila }: { fila: string }) {
    return (
      <>
        <span className="eje">{fila}</span>
        {[1, 2, 3, 4].map((c) => {
          const z = `${fila}${c}`
          const aqui = activos.filter((r) => r.zona === z)
          const revisada = aqui.some((r) => r.tipo === 'zona')
          return (
            <button
              key={z}
              className={`celda ${zonaSel === z ? 'sel' : ''}`}
              style={revisada ? { background: 'var(--ok-soft)' } : undefined}
              onClick={() => setZonaSel(zonaSel === z ? null : z)}
              title={`Zona ${z}`}
            >
              <span className="z">{z}</span>
              <span className="marcas">
                {aqui.map((r) => (
                  <span key={r.id} className="m" style={{ background: TIPOS[r.tipo].color }}>
                    {TIPOS[r.tipo].icono}
                  </span>
                ))}
              </span>
            </button>
          )
        })}
      </>
    )
  }
}
