import { Link } from 'react-router-dom'
import { Page } from '../components/ui'
import { useMarvin } from '../lib/store'

const PASOS = [
  { to: '/nodo', n: 'Paso 1 · Rescatista', t: 'Nodo de campo', d: 'Elige una plantilla, el nodo firma el reporte con su llave ed25519 y lo guarda en su memoria.', h: 'H2 · H3 · H4 · H9 · H11' },
  { to: '/malla', n: 'Paso 2 · Malla ESP-NOW', t: 'Red de malla', d: 'Cada nodo verifica la firma, guarda una copia y reenvía el reporte hasta la puerta de enlace.', h: 'H1 · H2 · H3' },
  { to: '/mando', n: 'Paso 3 · Coordinador', t: 'Centro de mando', d: 'Ve los reportes en red local, sin internet, los filtra por zona y asigna brigadas.', h: 'H4 · H7 · H9' },
  { to: '/gateway', n: 'Paso 4 · Técnico', t: 'Puerta de enlace', d: 'Cuando aparece un enlace, publica en Stellar el hash y la firma, primero lo más urgente.', h: 'H5 · H6' },
  { to: '/registro', n: 'Paso 5 · ONG / auditor', t: 'Registro público', d: 'Cualquiera consulta el registro y comprueba que un reporte no fue alterado.', h: 'H8 · H12' },
  { to: '/admin', n: 'Antes del despliegue', t: 'Administración', d: 'Alta y revocación de las llaves de los nodos autorizados a publicar.', h: 'H10' },
]

export default function Inicio() {
  const { estado } = useMarvin()
  const publicados = estado.reportes.filter((r) => r.estado === 'publicado').length
  return (
    <>
      <Page rol="Marvin · MVP semana 3" titulo="Red de reportes de emergencia offline-first">
        Tras un sismo la red celular se cae justo en las primeras 72 horas. Marvin permite que cada brigada
        reporte desde un nodo propio, que los reportes salten de nodo en nodo hasta el centro de mando y que,
        cuando aparece cualquier enlace, queden registrados en Stellar sin que ninguna institución controle el
        registro.
      </Page>

      <div className="grid g4" style={{ marginBottom: 20 }}>
        <div className="card stat">
          <div className="v">{estado.nodos.filter((n) => n.estado === 'activo').length}</div>
          <div className="l">Nodos activos en la malla</div>
        </div>
        <div className="card stat">
          <div className="v">{estado.reportes.length}</div>
          <div className="l">Reportes generados</div>
        </div>
        <div className="card stat">
          <div className="v">{estado.reportes.filter((r) => r.estado === 'en_gateway').length}</div>
          <div className="l">En cola de publicación</div>
        </div>
        <div className="card stat">
          <div className="v">{publicados}</div>
          <div className="l">Registrados en Stellar</div>
        </div>
      </div>

      <h2 style={{ marginBottom: 12 }}>Recorrido de un reporte</h2>
      <div className="flujo" style={{ marginBottom: 20 }}>
        {PASOS.map((p) => (
          <Link to={p.to} key={p.to}>
            <div className="card stack">
              <div className="n">{p.n}</div>
              <h3>{p.t}</h3>
              <p className="muted small">{p.d}</p>
              <span className="tiny">Historias: {p.h}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="banner">
        <b>Qué es real y qué es simulado.</b> El hash SHA-256 y la firma ed25519 de cada reporte se calculan de
        verdad en el navegador, con el mismo algoritmo que usarán los ESP32. La malla ESP-NOW y la publicación en
        Stellar Testnet se simulan: el contrato Soroban se escribe y despliega en la semana 4.
      </div>
    </>
  )
}
