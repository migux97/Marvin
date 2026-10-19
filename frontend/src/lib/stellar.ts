// Conexión con el contrato de Marvin en Stellar Testnet.
// Este módulo no depende de React ni de Vite: lo usan tanto el front como el
// script de despliegue (scripts/desplegar.ts), así el mismo código que se
// prueba al desplegar es el que corre en el navegador.
import {
  Account,
  Address,
  BASE_FEE,
  Contract,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative,
  xdr,
  type Transaction,
} from '@stellar/stellar-sdk'

export const RED = {
  nombre: 'testnet',
  rpcUrl: 'https://soroban-testnet.stellar.org',
  passphrase: Networks.TESTNET,
  explorador: 'https://stellar.expert/explorer/testnet',
}

export const enlaceTx = (hash: string) => `${RED.explorador}/tx/${hash}`
export const enlaceContrato = (id: string) => `${RED.explorador}/contract/${id}`
export const enlaceCuenta = (id: string) => `${RED.explorador}/account/${id}`

const ERRORES: Record<number, string> = {
  1: 'Nodo no autorizado en el contrato',
  2: 'El reporte ya estaba registrado',
  3: 'Tipo de reporte inválido',
  4: 'La corrección apunta a un reporte no registrado',
}

export class ErrorContrato extends Error {
  codigo?: number
  constructor(mensaje: string, codigo?: number) {
    super(mensaje)
    this.codigo = codigo
  }
}

function traducirError(texto: string): ErrorContrato {
  const m = /Error\(Contract, #(\d+)\)/.exec(texto)
  if (m) {
    const codigo = Number(m[1])
    return new ErrorContrato(ERRORES[codigo] ?? `Error del contrato #${codigo}`, codigo)
  }
  if (/ed25519|Crypto|InvalidInput/i.test(texto)) return new ErrorContrato('Firma inválida: el contrato la rechazó')
  return new ErrorContrato(texto.slice(0, 300))
}

export function servidor(): rpc.Server {
  return new rpc.Server(RED.rpcUrl)
}

const hexABytes = (hex: string) => Uint8Array.from(hex.match(/../g)!.map((b) => parseInt(b, 16)))
const bytesN = (hex: string) => xdr.ScVal.scvBytes(hexABytes(hex))
const opcionBytes = (hex: string | null) => (hex ? bytesN(hex) : xdr.ScVal.scvVoid())

/** Fondea una cuenta nueva en Testnet con Friendbot. */
export async function fondear(publicKey: string): Promise<void> {
  const s = servidor()
  try {
    await s.getAccount(publicKey)
    return // ya existe
  } catch {
    /* no existe: se fondea */
  }
  await s.requestAirdrop(publicKey)
}

async function enviar(tx: Transaction, firmante: Keypair): Promise<rpc.Api.GetSuccessfulTransactionResponse> {
  const s = servidor()
  let preparada: Transaction
  try {
    preparada = await s.prepareTransaction(tx)
  } catch (e) {
    throw traducirError(String((e as Error)?.message ?? e))
  }
  preparada.sign(firmante)
  const envio = await s.sendTransaction(preparada)
  if (envio.status === 'ERROR') {
    throw traducirError(JSON.stringify(envio.errorResult?.toXDR('base64') ?? envio))
  }
  const final = await s.pollTransaction(envio.hash, { attempts: 30 })
  if (final.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
    throw new ErrorContrato(`La transacción ${envio.hash} terminó con estado ${final.status}`)
  }
  return final as rpc.Api.GetSuccessfulTransactionResponse
}

async function invocar(contractId: string, firmante: Keypair, metodo: string, args: xdr.ScVal[]) {
  const s = servidor()
  const cuenta = await s.getAccount(firmante.publicKey())
  const tx = new TransactionBuilder(cuenta, { fee: BASE_FEE, networkPassphrase: RED.passphrase })
    .addOperation(new Contract(contractId).call(metodo, ...args))
    .setTimeout(60)
    .build()
  const r = await enviar(tx, firmante)
  return { txHash: r.txHash, ledger: r.ledger, valor: r.returnValue ? scValToNative(r.returnValue) : undefined }
}

async function leer(contractId: string, metodo: string, args: xdr.ScVal[]): Promise<unknown> {
  const s = servidor()
  // Las lecturas se simulan: no se firma ni se paga nada.
  const origen = new Account(Keypair.random().publicKey(), '0')
  const tx = new TransactionBuilder(origen, { fee: BASE_FEE, networkPassphrase: RED.passphrase })
    .addOperation(new Contract(contractId).call(metodo, ...args))
    .setTimeout(60)
    .build()
  const sim = await s.simulateTransaction(tx)
  if (rpc.Api.isSimulationError(sim)) throw traducirError(sim.error)
  const ret = (sim as rpc.Api.SimulateTransactionSuccessResponse).result?.retval
  return ret ? scValToNative(ret) : undefined
}

// ---------- Despliegue y administración (los usa el script) ----------

export async function subirWasm(wasm: Uint8Array, admin: Keypair): Promise<{ wasmHash: Uint8Array; txHash: string }> {
  const s = servidor()
  const cuenta = await s.getAccount(admin.publicKey())
  const tx = new TransactionBuilder(cuenta, { fee: BASE_FEE, networkPassphrase: RED.passphrase })
    .addOperation(Operation.uploadContractWasm({ wasm }))
    .setTimeout(60)
    .build()
  const r = await enviar(tx, admin)
  return { wasmHash: scValToNative(r.returnValue!) as Uint8Array, txHash: r.txHash }
}

export async function crearContrato(wasmHash: Uint8Array, admin: Keypair): Promise<{ contractId: string; txHash: string }> {
  const s = servidor()
  const cuenta = await s.getAccount(admin.publicKey())
  const tx = new TransactionBuilder(cuenta, { fee: BASE_FEE, networkPassphrase: RED.passphrase })
    .addOperation(
      Operation.createCustomContract({
        address: new Address(admin.publicKey()),
        wasmHash,
        salt: Uint8Array.from(Keypair.random().rawPublicKey()),
        constructorArgs: [new Address(admin.publicKey()).toScVal()],
      }),
    )
    .setTimeout(60)
    .build()
  const r = await enviar(tx, admin)
  const contractId = Address.fromScVal(r.returnValue!).toString()
  return { contractId, txHash: r.txHash }
}

export async function altaNodo(contractId: string, admin: Keypair, llaveHex: string) {
  return invocar(contractId, admin, 'alta_nodo', [bytesN(llaveHex)])
}

export async function revocarNodo(contractId: string, admin: Keypair, llaveHex: string) {
  return invocar(contractId, admin, 'revocar_nodo', [bytesN(llaveHex)])
}

// ---------- Lo que usa la puerta de enlace ----------

export interface ReporteAPublicar {
  hash: string
  llave: string
  firma: string
  tipo: number
  anula: string | null // hash del reporte que corrige
}

export async function registrarReporte(contractId: string, puerta: Keypair, r: ReporteAPublicar) {
  return invocar(contractId, puerta, 'registrar_reporte', [
    new Address(puerta.publicKey()).toScVal(),
    bytesN(r.hash),
    bytesN(r.llave),
    bytesN(r.firma),
    nativeToScVal(r.tipo, { type: 'u32' }),
    opcionBytes(r.anula),
  ])
}

// ---------- Lecturas públicas ----------

export interface RegistroEnCadena {
  nodo: string
  tipo: number
  anula: string | null
  ledger: number
  timestamp: number
  puerta: string
}

const aHex = (b: unknown) => (b ? Array.from(b as Uint8Array, (x) => x.toString(16).padStart(2, '0')).join('') : null)

export async function consultar(contractId: string, hashHex: string): Promise<RegistroEnCadena | null> {
  const v = (await leer(contractId, 'consultar', [bytesN(hashHex)])) as Record<string, unknown> | undefined
  if (!v) return null
  return {
    nodo: aHex(v.nodo)!,
    tipo: Number(v.tipo),
    anula: aHex(v.anula),
    ledger: Number(v.ledger),
    timestamp: Number(v.timestamp),
    puerta: String(v.puerta),
  }
}

export async function nodoActivo(contractId: string, llaveHex: string): Promise<boolean> {
  return Boolean(await leer(contractId, 'nodo_activo', [bytesN(llaveHex)]))
}
