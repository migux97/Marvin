// Modelo de datos de Marvin (front de la semana 3).
// La malla ESP-NOW y la publicación en Stellar se simulan en el navegador;
// la firma ed25519 y el hash SHA-256 son reales.

export type TipoReporte = 'victima' | 'colapso' | 'ruta' | 'zona'

export type EstadoReporte =
  | 'en_malla' // viajando de nodo en nodo
  | 'en_gateway' // llegó a la puerta de enlace, esperando enlace
  | 'publicado' // registrado en Stellar (simulado)
  | 'rechazado' // firma inválida o nodo revocado

export type Enlace = 'sin' | 'celular' | 'satelital'

export interface Nodo {
  id: string
  nombre: string
  brigada: string
  publicKey: string // hex
  privateKey: string // hex — en el dispositivo real nunca sale del ESP32
  estado: 'activo' | 'revocado'
  x: number
  y: number
}

export interface PayloadReporte {
  id: string
  tipo: TipoReporte
  zona: string
  detalle: string
  personas: number
  datosPersonales: string
  nodo: string // llave pública del nodo de origen
  ts: number
  anulaA: string | null
}

export interface Reporte extends PayloadReporte {
  nodoId: string
  hash: string
  firma: string
  prioridad: number
  estado: EstadoReporte
  alcance: string[] // nodos que guardan una copia
  nivel: number // salto actual dentro de la malla
  motivoRechazo?: string
  asignadoA?: string
  txHash?: string
  ledger?: number
  publicadoEn?: number
}

export const TIPOS: Record<
  TipoReporte,
  { etiqueta: string; corto: string; prioridad: number; color: string; icono: string }
> = {
  victima: { etiqueta: 'Víctima localizada', corto: 'Víctima', prioridad: 1, color: 'var(--c-victima)', icono: '✚' },
  colapso: { etiqueta: 'Estructura colapsada', corto: 'Colapso', prioridad: 2, color: 'var(--c-colapso)', icono: '▲' },
  ruta: { etiqueta: 'Ruta bloqueada', corto: 'Ruta', prioridad: 3, color: 'var(--c-ruta)', icono: '■' },
  zona: { etiqueta: 'Zona revisada', corto: 'Revisada', prioridad: 4, color: 'var(--c-zona)', icono: '✓' },
}

export const ZONAS = ['A', 'B', 'C', 'D'].flatMap((f) => [1, 2, 3, 4].map((c) => `${f}${c}`))

export const GATEWAY_ID = 'GW'

// Topología fija de la demo: cinco nodos de campo y la puerta de enlace.
export const NODOS_BASE: Omit<Nodo, 'publicKey' | 'privateKey' | 'estado'>[] = [
  { id: 'N1', nombre: 'Nodo N1', brigada: 'Bomberos Norte', x: 70, y: 70 },
  { id: 'N2', nombre: 'Nodo N2', brigada: 'Protección Civil Municipal', x: 70, y: 250 },
  { id: 'N3', nombre: 'Nodo N3', brigada: 'Brigada Voluntaria Centro', x: 240, y: 160 },
  { id: 'N4', nombre: 'Nodo N4', brigada: 'Cruz Roja', x: 410, y: 70 },
  { id: 'N5', nombre: 'Nodo N5', brigada: 'Búsqueda y Rescate Urbano', x: 410, y: 250 },
]

export const POS_GATEWAY = { x: 570, y: 160 }

export const ENLACES_MALLA: [string, string][] = [
  ['N1', 'N2'],
  ['N1', 'N3'],
  ['N2', 'N3'],
  ['N3', 'N4'],
  ['N3', 'N5'],
  ['N4', 'N5'],
  ['N4', GATEWAY_ID],
  ['N5', GATEWAY_ID],
]

export function vecinos(id: string, extra: [string, string][] = []): string[] {
  return [...ENLACES_MALLA, ...extra].flatMap(([a, b]) => (a === id ? [b] : b === id ? [a] : []))
}

export function enlacesExtra(nodos: Nodo[]): [string, string][] {
  // Nodos dados de alta desde Administración se conectan al nodo base más cercano.
  const base = new Set(NODOS_BASE.map((n) => n.id))
  return nodos
    .filter((n) => !base.has(n.id))
    .map((n) => {
      const cercano = NODOS_BASE.reduce((best, b) =>
        Math.hypot(b.x - n.x, b.y - n.y) < Math.hypot(best.x - n.x, best.y - n.y) ? b : best,
      )
      return [n.id, cercano.id] as [string, string]
    })
}

export function payloadDe(r: Reporte | PayloadReporte): PayloadReporte {
  return {
    id: r.id,
    tipo: r.tipo,
    zona: r.zona,
    detalle: r.detalle,
    personas: r.personas,
    datosPersonales: r.datosPersonales,
    nodo: r.nodo,
    ts: r.ts,
    anulaA: r.anulaA,
  }
}

// Serialización canónica: claves en orden fijo para que el hash sea reproducible.
export function canonico(p: PayloadReporte): string {
  return JSON.stringify(payloadDe(p))
}

export function corto(hex: string, n = 6): string {
  return hex.length > n * 2 ? `${hex.slice(0, n)}…${hex.slice(-n)}` : hex
}

export function hora(ts: number): string {
  return new Date(ts).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
