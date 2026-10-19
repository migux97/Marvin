import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import { Keypair } from '@stellar/stellar-sdk'
import {
  GATEWAY_ID,
  NODOS_BASE,
  TIPOS,
  enlacesExtra,
  vecinos,
  type Enlace,
  type Nodo,
  type PayloadReporte,
  type Reporte,
  type TipoReporte,
} from './model'
import { firmar, generarLlaves, hashReporte, hexAleatorio, llavesDemo, verificar } from './crypto'
import { ErrorContrato, fondear, registrarReporte } from './stellar'
import contrato from '../contrato.json'

// Con un contrato desplegado, la puerta de enlace publica de verdad en Stellar Testnet.
// Sin él (contrato.json vacío), la publicación se simula como en la semana 3.
export const CONTRATO: { contractId: string; admin: string; desplegadoEn: string } = contrato
export const MODO_REAL = Boolean(CONTRATO.contractId)

interface Evento {
  ts: number
  texto: string
  tipo: 'info' | 'ok' | 'error'
}

export interface Estado {
  nodos: Nodo[]
  reportes: Reporte[]
  enlace: Enlace
  ledger: number
  ticks: number
  bitacora: Evento[]
}

type Accion =
  | { type: 'tick'; txHash: string }
  | { type: 'nuevoReporte'; reporte: Reporte }
  | { type: 'enlace'; enlace: Enlace }
  | { type: 'asignar'; id: string; brigada: string }
  | { type: 'altaNodo'; nodo: Nodo }
  | { type: 'revocar'; id: string }
  | { type: 'reactivar'; id: string }
  | { type: 'reiniciar'; estado: Estado }
  | { type: 'publicando'; id: string }
  | { type: 'publicadoReal'; id: string; txHash: string; ledger: number }
  | { type: 'rechazadoRed'; id: string; motivo: string }
  | { type: 'reintentar'; id: string; motivo: string }

const CLAVE = MODO_REAL ? `marvin-demo-v2-${CONTRATO.contractId}` : 'marvin-demo-v2'
const CLAVE_PUERTA = 'marvin-puerta-testnet'

function log(e: Estado, texto: string, tipo: Evento['tipo'] = 'info'): Evento[] {
  return [{ ts: Date.now(), texto, tipo }, ...e.bitacora].slice(0, 60)
}

function construirReporte(
  nodo: Nodo,
  datos: Omit<PayloadReporte, 'id' | 'nodo' | 'ts'> & { ts?: number },
): Reporte {
  const payload: PayloadReporte = {
    id: `R-${hexAleatorio(3).toUpperCase()}`,
    tipo: datos.tipo,
    zona: datos.zona,
    detalle: datos.detalle,
    personas: datos.personas,
    datosPersonales: datos.datosPersonales,
    nodo: nodo.publicKey,
    ts: datos.ts ?? Date.now(),
    anulaA: datos.anulaA,
  }
  const hash = hashReporte(payload)
  return {
    ...payload,
    nodoId: nodo.id,
    hash,
    firma: firmar(hash, nodo.privateKey),
    prioridad: TIPOS[payload.tipo].prioridad,
    estado: 'en_malla',
    alcance: [nodo.id],
    nivel: 0,
  }
}

function estadoInicial(): Estado {
  const nodos: Nodo[] = NODOS_BASE.map((n) => ({ ...n, ...llavesDemo(n.id), estado: 'activo' }))
  const ahora = Date.now()
  const por = (id: string) => nodos.find((n) => n.id === id)!
  const semilla: [string, TipoReporte, string, string, number, string, number][] = [
    ['N1', 'colapso', 'A2', 'Edificio de 3 pisos colapsado, posibles personas atrapadas', 0, '', 38],
    ['N3', 'victima', 'B2', 'Dos personas atrapadas bajo losa, responden a voz', 2, 'Familia Ramírez (calle 5 #120)', 31],
    ['N2', 'ruta', 'C1', 'Puente vehicular con grietas, paso solo peatonal', 0, '', 27],
    ['N4', 'zona', 'A4', 'Manzana revisada completa, sin víctimas', 0, '', 22],
    ['N5', 'victima', 'D3', 'Persona herida con fractura expuesta, requiere traslado', 1, 'Hombre ~40 años, consciente', 12],
    ['N3', 'zona', 'B3', 'Escuela revisada, sin personas dentro', 0, '', 6],
  ]
  let ledger = 1_284_310
  const reportes = semilla.map(([nid, tipo, zona, detalle, personas, datosPersonales, minutos], i) => {
    const r = construirReporte(por(nid), {
      tipo,
      zona,
      detalle,
      personas,
      datosPersonales,
      anulaA: null,
      ts: ahora - minutos * 60_000,
    })
    // En modo real nada se da por publicado: la puerta de enlace lo publica de verdad.
    const publicado = !MODO_REAL && i < 4
    ledger += 37
    return {
      ...r,
      alcance: [...nodos.map((n) => n.id), GATEWAY_ID],
      nivel: 3,
      estado: publicado ? 'publicado' : 'en_gateway',
      ...(publicado
        ? { txHash: hexAleatorio(32), ledger, publicadoEn: r.ts + 4 * 60_000 }
        : {}),
    } as Reporte
  })
  reportes[0].asignadoA = 'Búsqueda y Rescate Urbano'
  return {
    nodos,
    reportes,
    enlace: 'sin',
    ledger: MODO_REAL ? 0 : ledger + 120,
    ticks: 0,
    bitacora: [
      {
        ts: ahora,
        texto: MODO_REAL
          ? 'Demo iniciada: 6 reportes de ejemplo en la puerta de enlace. Activá un enlace para publicarlos en Stellar Testnet.'
          : 'Demo iniciada: 6 reportes de ejemplo, enlace a internet caído.',
        tipo: 'info',
      },
    ],
  }
}

function avanzarMalla(e: Estado): Estado {
  let bitacora = e.bitacora
  const activos = new Set(e.nodos.filter((n) => n.estado === 'activo').map((n) => n.id))
  activos.add(GATEWAY_ID)
  const extra = enlacesExtra(e.nodos)
  const reportes = e.reportes.map((r) => {
    if (r.estado !== 'en_malla') return r
    // Cada nodo que recibe el reporte verifica la firma contra el registro de llaves.
    const origen = e.nodos.find((n) => n.publicKey === r.nodo)
    if (!origen || origen.estado !== 'activo') {
      bitacora = [{ ts: Date.now(), texto: `${r.id} descartado: el nodo ${r.nodoId} está revocado.`, tipo: 'error' as const }, ...bitacora]
      return { ...r, estado: 'rechazado' as const, motivoRechazo: 'Nodo de origen revocado' }
    }
    if (!verificar(r.hash, r.firma, r.nodo)) {
      return { ...r, estado: 'rechazado' as const, motivoRechazo: 'Firma inválida' }
    }
    const nuevos = new Set<string>()
    for (const id of r.alcance) {
      for (const v of vecinos(id, extra)) if (activos.has(v) && !r.alcance.includes(v)) nuevos.add(v)
    }
    if (nuevos.size === 0) return r
    const alcance = [...r.alcance, ...nuevos]
    const llego = alcance.includes(GATEWAY_ID)
    if (llego) {
      bitacora = [{ ts: Date.now(), texto: `${r.id} (${TIPOS[r.tipo].corto}) llegó a la puerta de enlace tras ${r.nivel + 1} saltos.`, tipo: 'ok' as const }, ...bitacora]
    }
    return { ...r, alcance, nivel: r.nivel + 1, estado: llego ? ('en_gateway' as const) : r.estado }
  })
  return { ...e, reportes, bitacora: bitacora.slice(0, 60) }
}

function publicar(e: Estado, txHash: string): Estado {
  if (MODO_REAL || e.enlace === 'sin') return e
  const cada = e.enlace === 'satelital' ? 3 : 2 // el satelital es más lento
  if (e.ticks % cada !== 0) return e
  const cola = e.reportes
    .filter((r) => r.estado === 'en_gateway')
    .sort((a, b) => a.prioridad - b.prioridad || a.ts - b.ts)
  const siguiente = cola[0]
  if (!siguiente) return e
  const ledger = e.ledger + 1
  return {
    ...e,
    ledger,
    reportes: e.reportes.map((r) =>
      r.id === siguiente.id ? { ...r, estado: 'publicado', txHash, ledger, publicadoEn: Date.now() } : r,
    ),
    bitacora: log(e, `${siguiente.id} publicado en Stellar Testnet (ledger ${ledger.toLocaleString('es-MX')}).`, 'ok'),
  }
}

function reducer(e: Estado, a: Accion): Estado {
  switch (a.type) {
    case 'tick': {
      const avanzado = avanzarMalla({ ...e, ticks: e.ticks + 1 })
      return publicar(avanzado, a.txHash)
    }
    case 'nuevoReporte':
      return {
        ...e,
        reportes: [a.reporte, ...e.reportes],
        bitacora: log(e, `${a.reporte.nodoId} firmó ${a.reporte.id} (${TIPOS[a.reporte.tipo].corto}, zona ${a.reporte.zona}) y lo envió a la malla.`),
      }
    case 'enlace':
      return {
        ...e,
        enlace: a.enlace,
        bitacora: log(e, a.enlace === 'sin' ? 'Enlace a internet perdido. Los reportes quedan en cola.' : `Enlace ${a.enlace} disponible. Publicando por prioridad.`, a.enlace === 'sin' ? 'error' : 'ok'),
      }
    case 'asignar':
      return { ...e, reportes: e.reportes.map((r) => (r.id === a.id ? { ...r, asignadoA: a.brigada } : r)) }
    case 'altaNodo':
      return { ...e, nodos: [...e.nodos, a.nodo], bitacora: log(e, `Alta de ${a.nodo.id} (${a.nodo.brigada}) en el registro de llaves.`, 'ok') }
    case 'revocar':
      return { ...e, nodos: e.nodos.map((n) => (n.id === a.id ? { ...n, estado: 'revocado' } : n)), bitacora: log(e, `Llave de ${a.id} revocada: sus reportes se descartan.`, 'error') }
    case 'reactivar':
      return { ...e, nodos: e.nodos.map((n) => (n.id === a.id ? { ...n, estado: 'activo' } : n)), bitacora: log(e, `Llave de ${a.id} reactivada.`, 'ok') }
    case 'reiniciar':
      return a.estado
    case 'publicando':
      return { ...e, reportes: e.reportes.map((r) => (r.id === a.id ? { ...r, estado: 'publicando' } : r)) }
    case 'publicadoReal':
      return {
        ...e,
        ledger: Math.max(e.ledger, a.ledger),
        reportes: e.reportes.map((r) =>
          r.id === a.id ? { ...r, estado: 'publicado', txHash: a.txHash, ledger: a.ledger, publicadoEn: Date.now() } : r,
        ),
        bitacora: log(e, `${a.id} registrado en Stellar Testnet (ledger ${a.ledger.toLocaleString('es-MX')}).`, 'ok'),
      }
    case 'rechazadoRed':
      return {
        ...e,
        reportes: e.reportes.map((r) => (r.id === a.id ? { ...r, estado: 'rechazado', motivoRechazo: a.motivo } : r)),
        bitacora: log(e, `${a.id} rechazado por el contrato: ${a.motivo}.`, 'error'),
      }
    case 'reintentar':
      return {
        ...e,
        reportes: e.reportes.map((r) => (r.id === a.id ? { ...r, estado: 'en_gateway' } : r)),
        bitacora: log(e, `No se pudo publicar ${a.id} (${a.motivo}). Se reintenta en unos segundos.`, 'error'),
      }
  }
}

function cargar(): Estado {
  try {
    const raw = localStorage.getItem(CLAVE)
    if (raw) {
      const e = JSON.parse(raw) as Estado
      // Una publicación interrumpida al recargar vuelve a la cola.
      return { ...e, reportes: e.reportes.map((r) => (r.estado === 'publicando' ? { ...r, estado: 'en_gateway' } : r)) }
    }
  } catch {
    /* sin almacenamiento: se arranca de cero */
  }
  return estadoInicial()
}

export interface Puerta {
  publicKey: string
  estado: 'sin_fondos' | 'fondeando' | 'lista' | 'error'
  error?: string
}

function cuentaPuerta(): Keypair {
  try {
    const guardada = localStorage.getItem(CLAVE_PUERTA)
    if (guardada) return Keypair.fromSecret(guardada)
  } catch {
    /* se genera una nueva */
  }
  const kp = Keypair.random()
  try {
    localStorage.setItem(CLAVE_PUERTA, kp.secret())
  } catch {
    /* ignorar */
  }
  return kp
}

interface Ctx {
  estado: Estado
  puerta: Puerta | null
  enviarReporte: (nodoId: string, datos: Omit<PayloadReporte, 'id' | 'nodo' | 'ts'>) => Reporte | null
  setEnlace: (e: Enlace) => void
  asignar: (id: string, brigada: string) => void
  altaNodo: (brigada: string) => Nodo
  revocar: (id: string) => void
  reactivar: (id: string) => void
  reiniciar: () => void
}

const Contexto = createContext<Ctx | null>(null)

export function MarvinProvider({ children }: { children: ReactNode }) {
  const [estado, dispatch] = useReducer(reducer, undefined, cargar)

  useEffect(() => {
    const t = setInterval(() => dispatch({ type: 'tick', txHash: hexAleatorio(32) }), 900)
    return () => clearInterval(t)
  }, [])

  // ---- Publicación real en Stellar Testnet ----
  const keypair = useRef<Keypair | null>(null)
  const ocupado = useRef(false)
  const esperarHasta = useRef(0)
  const [puerta, setPuerta] = useState<Puerta | null>(null)

  useEffect(() => {
    if (!MODO_REAL) return
    keypair.current = cuentaPuerta()
    setPuerta({ publicKey: keypair.current.publicKey(), estado: 'sin_fondos' })
  }, [])

  useEffect(() => {
    if (!MODO_REAL || !keypair.current || estado.enlace === 'sin' || ocupado.current) return
    if (Date.now() < esperarHasta.current) return
    const siguiente = estado.reportes
      .filter((r) => r.estado === 'en_gateway')
      .sort((a, b) => a.prioridad - b.prioridad || a.ts - b.ts)[0]
    if (!siguiente) return
    const kp = keypair.current
    ocupado.current = true
    const original = siguiente.anulaA ? estado.reportes.find((r) => r.id === siguiente.anulaA) : undefined
    ;(async () => {
      try {
        if (puerta?.estado !== 'lista') {
          setPuerta({ publicKey: kp.publicKey(), estado: 'fondeando' })
          await fondear(kp.publicKey())
          setPuerta({ publicKey: kp.publicKey(), estado: 'lista' })
        }
        dispatch({ type: 'publicando', id: siguiente.id })
        const r = await registrarReporte(CONTRATO.contractId, kp, {
          hash: siguiente.hash,
          llave: siguiente.nodo,
          firma: siguiente.firma,
          tipo: siguiente.prioridad,
          anula: original?.estado === 'publicado' ? original.hash : null,
        })
        dispatch({ type: 'publicadoReal', id: siguiente.id, txHash: r.txHash, ledger: r.ledger })
      } catch (err) {
        if (err instanceof ErrorContrato && err.codigo) {
          dispatch({ type: 'rechazadoRed', id: siguiente.id, motivo: err.message })
        } else {
          const motivo = err instanceof Error ? err.message.slice(0, 120) : 'error de red'
          esperarHasta.current = Date.now() + 8000
          dispatch({ type: 'reintentar', id: siguiente.id, motivo })
          setPuerta((p) => (p && p.estado !== 'lista' ? { ...p, estado: 'error', error: motivo } : p))
        }
      } finally {
        ocupado.current = false
      }
    })()
  }, [estado.ticks, estado.enlace, estado.reportes, puerta?.estado])

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(estado))
    } catch {
      /* ignorar */
    }
  }, [estado])

  const enviarReporte = useCallback<Ctx['enviarReporte']>(
    (nodoId, datos) => {
      const nodo = estado.nodos.find((n) => n.id === nodoId)
      if (!nodo) return null
      const reporte = construirReporte(nodo, datos)
      dispatch({ type: 'nuevoReporte', reporte })
      return reporte
    },
    [estado.nodos],
  )

  const altaNodo = useCallback(
    (brigada: string) => {
      const num = estado.nodos.length + 1
      const nodo: Nodo = {
        id: `N${num}`,
        nombre: `Nodo N${num}`,
        brigada,
        ...generarLlaves(),
        estado: 'activo',
        x: 150 + ((num * 97) % 300),
        y: num % 2 ? 300 : 20,
      }
      dispatch({ type: 'altaNodo', nodo })
      return nodo
    },
    [estado.nodos.length],
  )

  const valor = useMemo<Ctx>(
    () => ({
      estado,
      puerta,
      enviarReporte,
      setEnlace: (enlace) => dispatch({ type: 'enlace', enlace }),
      asignar: (id, brigada) => dispatch({ type: 'asignar', id, brigada }),
      altaNodo,
      revocar: (id) => dispatch({ type: 'revocar', id }),
      reactivar: (id) => dispatch({ type: 'reactivar', id }),
      reiniciar: () => dispatch({ type: 'reiniciar', estado: estadoInicial() }),
    }),
    [estado, puerta, enviarReporte, altaNodo],
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMarvin(): Ctx {
  const c = useContext(Contexto)
  if (!c) throw new Error('useMarvin fuera de MarvinProvider')
  return c
}

// Reportes que ya llegaron al centro de mando y siguen vigentes: los anulados por una corrección quedan fuera del panorama.
// eslint-disable-next-line react-refresh/only-export-components
export function vigentes(reportes: Reporte[]): Reporte[] {
  const recibido = (r: Reporte) => r.estado === 'en_gateway' || r.estado === 'publicando' || r.estado === 'publicado'
  const anulados = new Set(reportes.filter((r) => r.anulaA && recibido(r)).map((r) => r.anulaA))
  return reportes.filter((r) => recibido(r) && !anulados.has(r.id))
}
