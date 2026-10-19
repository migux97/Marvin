import { NavLink, Outlet } from 'react-router-dom'
import { CONTRATO, MODO_REAL, useMarvin } from '../lib/store'
import { corto } from '../lib/model'
import { enlaceContrato } from '../lib/stellar'

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
          <img src={`${import.meta.env.BASE_URL}marvin.svg`} alt="" />
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
          {MODO_REAL ? (
            <span>
              Stellar Testnet · contrato{' '}
              <a href={enlaceContrato(CONTRATO.contractId)} target="_blank" rel="noreferrer" className="mono">
                {corto(CONTRATO.contractId, 4)}
              </a>
              {estado.ledger > 0 && <> · ledger {estado.ledger.toLocaleString('es-MX')}</>}
            </span>
          ) : (
            <span>Stellar Testnet (simulado) · ledger {estado.ledger.toLocaleString('es-MX')}</span>
          )}
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
