// Administración del registro de nodos en el contrato (firma la cuenta administradora).
//
//   npm run admin -- estado  N2
//   npm run admin -- revocar N2
//   npm run admin -- alta    N2            (o una llave pública en hex)
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Keypair } from '@stellar/stellar-sdk'
import { altaNodo, enlaceTx, nodoActivo, revocarNodo } from '../src/lib/stellar.ts'
import { llavesDemo } from '../src/lib/crypto.ts'

const aqui = dirname(fileURLToPath(import.meta.url))
const raiz = resolve(aqui, '../..')
const config = JSON.parse(readFileSync(resolve(aqui, '../src/contrato.json'), 'utf8'))
const [accion, objetivo] = process.argv.slice(2)

if (!config.contractId) throw new Error('No hay contrato configurado. Corré primero "npm run desplegar".')
if (!accion || !objetivo) {
  console.log('Uso: npm run admin -- <estado|alta|revocar> <N1..N5 | llave hex>')
  process.exit(1)
}
const llave = /^N\d+$/i.test(objetivo) ? llavesDemo(objetivo.toUpperCase()).publicKey : objetivo

if (accion === 'estado') {
  console.log(`${objetivo}: ${(await nodoActivo(config.contractId, llave)) ? 'activo' : 'no autorizado'}`)
} else {
  const ruta = resolve(raiz, '.marvin-admin.json')
  if (!existsSync(ruta)) throw new Error('Falta .marvin-admin.json (la llave de la cuenta administradora).')
  const admin = Keypair.fromSecret(JSON.parse(readFileSync(ruta, 'utf8')).secret)
  const r = accion === 'revocar' ? await revocarNodo(config.contractId, admin, llave) : await altaNodo(config.contractId, admin, llave)
  console.log(`${accion} ${objetivo}: ${enlaceTx(r.txHash)}`)
}
