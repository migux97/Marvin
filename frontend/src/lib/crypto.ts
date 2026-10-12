import * as ed from '@noble/ed25519'
import { sha256 } from '@noble/hashes/sha256'
import { sha512 } from '@noble/hashes/sha512'
import { bytesToHex, hexToBytes, utf8ToBytes, randomBytes } from '@noble/hashes/utils'
import { canonico, type PayloadReporte } from './model'

// noble-ed25519 necesita sha512 para las funciones síncronas.
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m))

export function generarLlaves(): { publicKey: string; privateKey: string } {
  const priv = ed.utils.randomPrivateKey()
  return { privateKey: bytesToHex(priv), publicKey: bytesToHex(ed.getPublicKey(priv)) }
}

export function hashReporte(p: PayloadReporte): string {
  return bytesToHex(sha256(utf8ToBytes(canonico(p))))
}

// El nodo firma el hash del reporte (32 bytes), igual que haría el ESP32.
export function firmar(hashHex: string, privateKey: string): string {
  return bytesToHex(ed.sign(hexToBytes(hashHex), hexToBytes(privateKey)))
}

export function verificar(hashHex: string, firmaHex: string, publicKey: string): boolean {
  try {
    return ed.verify(hexToBytes(firmaHex), hexToBytes(hashHex), hexToBytes(publicKey))
  } catch {
    return false
  }
}

export function hexAleatorio(bytes: number): string {
  return bytesToHex(randomBytes(bytes))
}
