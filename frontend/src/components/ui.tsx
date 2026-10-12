import { TIPOS, type EstadoReporte, type Reporte, type TipoReporte } from '../lib/model'

export function Tipo({ tipo, corto = false }: { tipo: TipoReporte; corto?: boolean }) {
  const t = TIPOS[tipo]
  return (
    <span className="tipo">
      <span className="ico" style={{ background: t.color }}>
        {t.icono}
      </span>
      {corto ? t.corto : t.etiqueta}
    </span>
  )
}

const ESTADOS: Record<EstadoReporte, { texto: string; clase: string }> = {
  en_malla: { texto: 'En la malla', clase: 'acc' },
  en_gateway: { texto: 'En cola', clase: '' },
  publicado: { texto: 'En Stellar', clase: 'ok' },
  rechazado: { texto: 'Rechazado', clase: 'err' },
}

export function Estado({ r }: { r: Reporte }) {
  const e = ESTADOS[r.estado]
  return <span className={`badge ${e.clase}`}>{e.texto}</span>
}

export function Page({
  rol,
  titulo,
  children,
  acciones,
}: {
  rol: string
  titulo: string
  children?: React.ReactNode
  acciones?: React.ReactNode
}) {
  return (
    <div className="page-head">
      <div>
        <div className="rol">{rol}</div>
        <h1>{titulo}</h1>
        {children && <p>{children}</p>}
      </div>
      {acciones}
    </div>
  )
}
