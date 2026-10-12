import { useState } from 'react'
import { Estado, Page, Tipo } from '../components/ui'
import { TIPOS, ZONAS, corto, hora, type Reporte, type TipoReporte } from '../lib/model'
import { useMarvin } from '../lib/store'

export default function Nodo() {
  const { estado, enviarReporte } = useMarvin()
  const [nodoId, setNodoId] = useState('N3')
  const [tipo, setTipo] = useState<TipoReporte | null>(null)
  const [zona, setZona] = useState('B2')
  const [personas, setPersonas] = useState(0)
  const [detalle, setDetalle] = useState('')
  const [datosPersonales, setDatosPersonales] = useState('')
  const [corrige, setCorrige] = useState<Reporte | null>(null)
  const [ultimo, setUltimo] = useState<Reporte | null>(null)

  const nodo = estado.nodos.find((n) => n.id === nodoId)!
  // Memoria local del nodo: todo lo que generó o le llegó por la malla.
  const memoria = estado.reportes.filter((r) => r.alcance.includes(nodoId))

  function enviar() {
    if (!tipo) return
    const r = enviarReporte(nodoId, {
      tipo,
      zona,
      personas,
      detalle: detalle.trim() || TIPOS[tipo].etiqueta,
      datosPersonales: datosPersonales.trim(),
      anulaA: corrige?.id ?? null,
    })
    setUltimo(r)
    setTipo(null)
    setDetalle('')
    setDatosPersonales('')
    setPersonas(0)
    setCorrige(null)
  }

  function corregir(r: Reporte) {
    setCorrige(r)
    setTipo(r.tipo)
    setZona(r.zona)
    setPersonas(r.personas)
    setDetalle(r.detalle)
    setDatosPersonales(r.datosPersonales)
    setUltimo(null)
  }

  return (
    <>
      <Page rol="Paso 1 · Rescatista en campo" titulo="Nodo de campo">
        Simula el kit ESP32 con pantalla y botones. Cuatro plantillas y pocos datos para usarlo bajo estrés y sin
        capacitación. El reporte se firma en el propio nodo y se guarda en su memoria antes de salir a la malla.
      </Page>

      <div className="split">
        <div className="device">
          <div className="device-top">
            <select value={nodoId} onChange={(e) => { setNodoId(e.target.value); setUltimo(null); setCorrige(null) }}>
              {estado.nodos.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.id} · {n.brigada}
                </option>
              ))}
            </select>
            <span>ESP-NOW ● {nodo.estado === 'activo' ? 'malla OK' : 'REVOCADO'}</span>
          </div>

          <div className="screen">
            {ultimo ? (
              <>
                <div className="t">✓ {ultimo.id} FIRMADO Y ENVIADO</div>
                <div>hash {corto(ultimo.hash, 8)}</div>
                <div>firma {corto(ultimo.firma, 8)}</div>
                <div>guardado en flash · prioridad {ultimo.prioridad}</div>
              </>
            ) : corrige ? (
              <>
                <div className="t">CORRIGIENDO {corrige.id}</div>
                <div>El nuevo reporte anula al anterior.</div>
                <div>El original queda en el registro.</div>
              </>
            ) : tipo ? (
              <>
                <div className="t">{TIPOS[tipo].etiqueta.toUpperCase()}</div>
                <div>zona {zona} · personas {personas}</div>
                <div>pulsa ENVIAR para firmar</div>
              </>
            ) : (
              <>
                <div className="t">{nodo.id} · {nodo.brigada}</div>
                <div>llave {corto(nodo.publicKey, 6)}</div>
                <div>{memoria.length} reportes en memoria</div>
                <div>elige una plantilla ↓</div>
              </>
            )}
          </div>

          <div className="keys">
            {(Object.keys(TIPOS) as TipoReporte[]).map((t) => (
              <button
                key={t}
                className={`key ${tipo === t ? 'sel' : ''}`}
                style={{ background: TIPOS[t].color }}
                onClick={() => { setTipo(t); setUltimo(null) }}
              >
                <span className="i">{TIPOS[t].icono}</span>
                {TIPOS[t].corto}
              </button>
            ))}
          </div>

          <div className="ctrl">
            <div>
              <span className="lbl">Zona</span>
              <select value={zona} onChange={(e) => setZona(e.target.value)}>
                {ZONAS.map((z) => (
                  <option key={z}>{z}</option>
                ))}
              </select>
            </div>
            <div>
              <span className="lbl">Personas</span>
              <input type="number" min={0} max={99} value={personas} onChange={(e) => setPersonas(Number(e.target.value))} />
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <span className="lbl">Nota breve (opcional)</span>
            <input value={detalle} maxLength={80} onChange={(e) => setDetalle(e.target.value)} placeholder="Ej. losa caída, responden a voz" />
          </div>
          {tipo === 'victima' && (
            <div style={{ marginTop: 8 }}>
              <span className="lbl">Datos personales (se cifran, nunca van a Stellar)</span>
              <input value={datosPersonales} maxLength={60} onChange={(e) => setDatosPersonales(e.target.value)} placeholder="Nombre o seña de la víctima" />
            </div>
          )}
          <button className="send" disabled={!tipo} onClick={enviar}>
            {corrige ? 'ENVIAR CORRECCIÓN' : 'ENVIAR'}
          </button>
        </div>

        <div className="card">
          <div className="card-head">
            <h2>Memoria local de {nodo.id}</h2>
            <span className="tiny">Offline-first: sobrevive aunque la red caiga por completo</span>
          </div>
          {memoria.length === 0 ? (
            <div className="empty">Este nodo todavía no generó ni recibió reportes.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Reporte</th>
                    <th>Zona</th>
                    <th>Origen</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {memoria.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <Tipo tipo={r.tipo} corto />
                        <div className="tiny mono">
                          {r.id} · {hora(r.ts)}
                          {r.anulaA && ` · corrige ${r.anulaA}`}
                        </div>
                      </td>
                      <td>{r.zona}</td>
                      <td>{r.nodoId === nodoId ? 'Propio' : r.nodoId}</td>
                      <td>
                        <Estado r={r} />
                      </td>
                      <td>
                        {r.nodoId === nodoId && r.estado !== 'rechazado' && (
                          <button className="btn" onClick={() => corregir(r)}>
                            Corregir
                          </button>
                        )}
                      </td>
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
}
