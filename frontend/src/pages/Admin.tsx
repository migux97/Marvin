import { useState } from 'react'
import { Page } from '../components/ui'
import { corto } from '../lib/model'
import { MODO_REAL, useMarvin } from '../lib/store'

export default function Admin() {
  const { estado, altaNodo, revocar, reactivar } = useMarvin()
  const [brigada, setBrigada] = useState('')
  const [nuevo, setNuevo] = useState<string | null>(null)

  return (
    <>
      <Page rol="Antes del despliegue · Administrador de la red" titulo="Administración de nodos">
        Registro de llaves autorizadas. Antes de salir a campo cada nodo genera su par de llaves ed25519 y la
        llave pública se da de alta en el contrato. Si un nodo se pierde o lo roban, se revoca y la malla descarta
        sus reportes.
      </Page>

      <div className="split">
        <div className="card stack">
          <h2>Dar de alta un nodo</h2>
          <label className="field">
            Brigada u organización
            <input className="input" value={brigada} onChange={(e) => setBrigada(e.target.value)} placeholder="Ej. Brigada Voluntaria Sur" />
          </label>
          <button
            className="btn primary"
            disabled={!brigada.trim()}
            onClick={() => {
              const n = altaNodo(brigada.trim())
              setNuevo(n.id)
              setBrigada('')
            }}
          >
            Generar llaves y registrar
          </button>
          {nuevo && <div className="verif ok small">{nuevo} registrado y conectado a la malla.</div>}
          <p className="tiny">
            En el MVP esto invoca <code>alta_nodo(llave)</code> en el contrato, firmado por la cuenta administradora.
            La llave privada se queda en el ESP32.
          </p>
        </div>

        <div className="card">
          <h2>Llaves registradas</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nodo</th>
                  <th>Brigada</th>
                  <th>Llave pública</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {estado.nodos.map((n) => (
                  <tr key={n.id}>
                    <td><b>{n.id}</b></td>
                    <td>{n.brigada}</td>
                    <td className="mono">{corto(n.publicKey, 8)}</td>
                    <td>
                      <span className={`badge ${n.estado === 'activo' ? 'ok' : 'err'}`}>{n.estado === 'activo' ? 'Activa' : 'Revocada'}</span>
                    </td>
                    <td>
                      {n.estado === 'activo' ? (
                        <button className="btn danger" onClick={() => revocar(n.id)}>Revocar</button>
                      ) : (
                        <button className="btn" onClick={() => reactivar(n.id)}>Reactivar</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="tiny" style={{ marginTop: 8 }}>
            Probá revocar un nodo y enviar un reporte desde él: la malla lo descarta en el primer salto.
          </p>
          {MODO_REAL && (
            <div className="banner" style={{ marginTop: 12 }}>
              <b>En el contrato de Testnet</b> están registrados N1 a N5. Los nodos que des de alta acá existen solo
              en la malla local: si envían un reporte, la malla lo deja pasar pero el contrato lo rechaza con
              «Nodo no autorizado». Así se ve que la autorización vive en la red y no en la puerta de enlace. Las altas
              y revocaciones en el contrato las firma la cuenta administradora con <code>npm run admin</code>.
            </div>
          )}
        </div>
      </div>
    </>
  )
}
