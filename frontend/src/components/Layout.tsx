import { NavLink, Outlet } from 'react-router-dom'
import { useMarvin } from '../lib/store'

const RUTAS = [
  { to: '/', num: '·', texto: 'Inicio', end: true },
  { to: '/nodo', num: '1', texto: 'Nodo de campo' },
  { to: '/malla', num: '2', texto: 'Red de malla' },
  { to: '/mando', num: '3', texto: 'Centro de mando' },
  { to: '/gateway', num: '4', texto: 'Puerta de enlace' },
  { to: '/registro', num: '5', texto: 'Registro público' },
  { to: '/admin', num: '⚙', texto: 'Administración' },
]

export default function Layout() {
  const { estado, reiniciar } = useMarvin()
  const enlace = estado.enlace === 'sin' ? 'Sin internet' : `Enlace ${estado.enlace}`
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <img src="/marvin.svg" alt="" />
          <div>
            <b>Marvin</b>
            <small>Reportes de emergencia offline-first</small>
          </div>
        </div>
        <nav className="nav">
          {RUTAS.map((r) => (
            <NavLink key={r.to} to={r.to} end={r.end}>
              <span className="num">{r.num}</span>
              {r.texto}
            </NavLink>
          ))}
        </nav>
        <div className="pie">
          <span className={`badge ${estado.enlace === 'sin' ? 'err' : 'ok'}`}>
            <span className="dot" style={{ background: 'currentColor' }} />
            {enlace}
          </span>
          <span>Stellar Testnet · ledger {estado.ledger.toLocaleString('es-MX')}</span>
          <button className="btn" onClick={reiniciar}>
            Reiniciar demo
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
