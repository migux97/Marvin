// Despliega el contrato de Marvin en Stellar Testnet, registra los nodos de la
// demo, prueba el flujo completo y deja la evidencia en docs/semana4.
//
//   npm run desplegar            (despliega si todavía no hay contrato)
//   npm run desplegar -- --nuevo (fuerza un despliegue nuevo)
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Keypair } from '@stellar/stellar-sdk'
import { enlaceContrato } from '../src/lib/stellar.ts'
import { desplegarYProbar } from './despliegue.ts'

const aqui = dirname(fileURLToPath(import.meta.url))
const raiz = resolve(aqui, '../..')
const RUTA_WASM = resolve(raiz, 'contracts/dist/marvin.wasm')
const RUTA_CONFIG = resolve(aqui, '../src/contrato.json')
const RUTA_ADMIN = resolve(raiz, '.marvin-admin.json') // ignorado por git
const RUTA_EVIDENCIA = resolve(raiz, 'docs/semana4/Despliegue.md')

function cuentaAdmin(): Keypair {
  if (existsSync(RUTA_ADMIN)) return Keypair.fromSecret(JSON.parse(readFileSync(RUTA_ADMIN, 'utf8')).secret)
  const kp = Keypair.random()
  writeFileSync(RUTA_ADMIN, JSON.stringify({ publicKey: kp.publicKey(), secret: kp.secret() }, null, 2))
  return kp
}

async function main() {
  const config = JSON.parse(readFileSync(RUTA_CONFIG, 'utf8'))
  if (config.contractId && !process.argv.includes('--nuevo')) {
    console.log(`Ya hay un contrato configurado: ${config.contractId}`)
    console.log('Usá "npm run desplegar -- --nuevo" para desplegar otro.')
    return
  }
  const r = await desplegarYProbar(new Uint8Array(readFileSync(RUTA_WASM)), cuentaAdmin(), console.log)
  writeFileSync(RUTA_CONFIG, JSON.stringify({ contractId: r.contractId, admin: r.admin, desplegadoEn: r.fecha }, null, 2) + '\n')
  writeFileSync(RUTA_EVIDENCIA, r.evidencia)
  console.log('  ✓ src/contrato.json y docs/semana4/Despliegue.md actualizados')
  console.log(`\nLISTO. Contrato: ${enlaceContrato(r.contractId)}`)
}

main().catch((e) => {
  console.error('\n✗ ERROR:', e instanceof Error ? e.message : e)
  process.exit(1)
})
