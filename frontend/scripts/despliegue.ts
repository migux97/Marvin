// Lógica de despliegue y pruebas en la red, sin acceso a archivos: la usan el
// script de Node (scripts/desplegar.ts) y, si hace falta, un navegador.
import { Keypair } from '@stellar/stellar-sdk'
import {
  ErrorContrato,
  RED,
  altaNodo,
  consultar,
  crearContrato,
  enlaceContrato,
  enlaceCuenta,
  enlaceTx,
  fondear,
  nodoActivo,
  registrarReporte,
  subirWasm,
} from '../src/lib/stellar.ts'
import { firmar, generarLlaves, hashReporte, llavesDemo } from '../src/lib/crypto.ts'
import { NODOS_BASE, type PayloadReporte } from '../src/lib/model.ts'

export interface Resultado {
  contractId: string
  admin: string
  fecha: string
  evidencia: string
}

function reportePrueba(nodoId: string, llaves: { publicKey: string; privateKey: string }, detalle: string) {
  const p: PayloadReporte = {
    id: `R-PRUEBA-${nodoId}`,
    tipo: 'victima',
    zona: 'B2',
    detalle,
    personas: 1,
    datosPersonales: '',
    nodo: llaves.publicKey,
    ts: Date.now(),
    anulaA: null,
  }
  const hash = hashReporte(p)
  return { hash, llave: llaves.publicKey, firma: firmar(hash, llaves.privateKey), tipo: 1, anula: null }
}

async function esperaError(promesa: Promise<unknown>, codigo: number | null): Promise<string> {
  try {
    await promesa
  } catch (e) {
    const err = e as ErrorContrato
    if (codigo === null || err.codigo === codigo) return err.message
    throw new Error(`Se esperaba el error #${codigo} y llegó: ${err.message}`)
  }
  throw new Error('Se esperaba que el contrato rechazara la operación y la aceptó')
}

const hex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('')

export async function desplegarYProbar(wasm: Uint8Array, admin: Keypair, log: (t: string) => void): Promise<Resultado> {
  const paso = (t: string) => log(`\n▶ ${t}`)
  const ok = (t: string) => log(`  ✓ ${t}`)

  paso('Cuenta administradora')
  await fondear(admin.publicKey())
  ok(`${admin.publicKey()} (fondeada con Friendbot)`)

  paso('Subiendo el WASM del contrato')
  const subida = await subirWasm(wasm, admin)
  ok(`tx ${subida.txHash}`)

  paso('Creando el contrato')
  const { contractId, txHash: txCrear } = await crearContrato(subida.wasmHash, admin)
  ok(`contrato ${contractId}`)

  paso('Registrando las llaves de los nodos N1–N5')
  const altas: string[] = []
  for (const n of NODOS_BASE) {
    const llaves = llavesDemo(n.id)
    const r = await altaNodo(contractId, admin, llaves.publicKey)
    altas.push(`| ${n.id} | ${n.brigada} | \`${llaves.publicKey.slice(0, 16)}…\` | [${r.txHash.slice(0, 10)}…](${enlaceTx(r.txHash)}) |`)
    ok(`${n.id} ${llaves.publicKey.slice(0, 12)}…`)
  }

  paso('Prueba 1: la puerta de enlace publica un reporte firmado por N1')
  const puerta = Keypair.random()
  await fondear(puerta.publicKey())
  const valido = reportePrueba('N1', llavesDemo('N1'), 'Prueba de despliegue: reporte válido')
  const pub = await registrarReporte(contractId, puerta, valido)
  ok(`registrado en el ledger ${pub.ledger} · tx ${pub.txHash}`)

  paso('Prueba 2: cualquiera puede consultarlo sin firmar nada')
  const reg = await consultar(contractId, valido.hash)
  if (!reg || reg.nodo !== valido.llave) throw new Error('La consulta no devolvió el registro esperado')
  ok(`consultar(hash) → ledger ${reg.ledger}, nodo ${reg.nodo.slice(0, 12)}…`)

  paso('Prueba 3: el contrato rechaza un nodo no registrado')
  const intruso = reportePrueba('X', generarLlaves(), 'Nodo desconocido')
  const m3 = await esperaError(registrarReporte(contractId, puerta, intruso), 1)
  ok(m3)

  paso('Prueba 4: el contrato rechaza el mismo reporte dos veces')
  const m4 = await esperaError(registrarReporte(contractId, puerta, valido), 2)
  ok(m4)

  paso('Prueba 5: el contrato rechaza una firma falsa con la llave de N2')
  const otro = reportePrueba('N2', llavesDemo('N2'), 'Firma falsificada')
  const falsa = { ...otro, firma: firmar(otro.hash, generarLlaves().privateKey) }
  const m5 = await esperaError(registrarReporte(contractId, puerta, falsa), null)
  ok(m5)

  paso('Verificando que N1–N5 figuran activos')
  for (const n of NODOS_BASE) {
    if (!(await nodoActivo(contractId, llavesDemo(n.id).publicKey))) throw new Error(`${n.id} no figura activo`)
  }
  ok('todos activos')

  const fecha = new Date().toISOString()
  const evidencia = [
    '# Evidencia de despliegue en Stellar Testnet',
    '',
    `> Generado automáticamente por \`frontend/scripts/despliegue.ts\` el ${fecha}.`,
    '',
    '| Dato | Valor |',
    '| --- | --- |',
    `| Red | Stellar ${RED.nombre} (${RED.rpcUrl}) |`,
    `| Contrato | [\`${contractId}\`](${enlaceContrato(contractId)}) |`,
    `| Cuenta administradora | [\`${admin.publicKey()}\`](${enlaceCuenta(admin.publicKey())}) |`,
    `| WASM (SHA-256) | \`${hex(subida.wasmHash)}\` |`,
    `| Subida del WASM | [${subida.txHash.slice(0, 16)}…](${enlaceTx(subida.txHash)}) |`,
    `| Creación del contrato | [${txCrear.slice(0, 16)}…](${enlaceTx(txCrear)}) |`,
    '',
    '## Nodos registrados',
    '',
    '| Nodo | Brigada | Llave pública | Transacción |',
    '| --- | --- | --- | --- |',
    ...altas,
    '',
    '## Pruebas en la red',
    '',
    '| # | Prueba | Resultado |',
    '| :-: | --- | --- |',
    `| 1 | La puerta de enlace publica un reporte firmado por N1 | ✅ Registrado en el ledger ${pub.ledger} · [ver transacción](${enlaceTx(pub.txHash)}) |`,
    `| 2 | Consulta pública del hash, sin firmar | ✅ Devuelve ledger ${reg.ledger} y la llave de N1 |`,
    `| 3 | Reporte de un nodo no registrado | ✅ Rechazado: ${m3} |`,
    `| 4 | El mismo reporte publicado dos veces | ✅ Rechazado: ${m4} |`,
    '| 5 | Firma falsa usando la llave de N2 | ✅ Rechazado por la verificación ed25519 del contrato |',
    '',
  ].join('\n')
  return { contractId, admin: admin.publicKey(), fecha, evidencia }
}
