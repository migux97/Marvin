//! Contrato de Marvin en Soroban.
//!
//! Dos responsabilidades:
//! 1. Registro de nodos autorizados: el administrador da de alta y revoca las
//!    llaves públicas ed25519 de los nodos de campo.
//! 2. Registro de reportes: una puerta de enlace publica el hash de un reporte
//!    junto con la llave y la firma del nodo que lo generó. El contrato verifica
//!    en la red que el nodo esté autorizado y que la firma sea válida, rechaza
//!    duplicados, guarda un registro mínimo y emite un evento.
//!
//! En la red nunca se guardan datos del reporte: solo su hash (32 bytes).
#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, Bytes, BytesN, Env,
};

/// Tiempo de vida de las entradas persistentes (en ledgers, ~5 s cada uno).
const TTL_MINIMO: u32 = 100_000; // ~6 días
const TTL_EXTENDIDO: u32 = 500_000; // ~29 días

#[contracttype]
#[derive(Clone)]
enum Clave {
    Admin,
    Nodo(BytesN<32>),
    Reporte(BytesN<32>),
}

/// Lo que queda en la red por cada reporte.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Registro {
    /// Llave pública ed25519 del nodo de origen.
    pub nodo: BytesN<32>,
    /// 1 víctima · 2 colapso · 3 ruta bloqueada · 4 zona revisada.
    pub tipo: u32,
    /// Hash del reporte que este corrige, si corresponde.
    pub anula: Option<BytesN<32>>,
    /// Ledger y hora (Unix) en que quedó registrado.
    pub ledger: u32,
    pub timestamp: u64,
    /// Cuenta de la puerta de enlace que lo publicó.
    pub puerta: Address,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NodoNoAutorizado = 1,
    ReporteDuplicado = 2,
    TipoInvalido = 3,
    AnulaInexistente = 4,
}

#[contract]
pub struct Marvin;

#[contractimpl]
impl Marvin {
    /// Se ejecuta una sola vez, al desplegar el contrato.
    pub fn __constructor(env: Env, admin: Address) {
        env.storage().instance().set(&Clave::Admin, &admin);
    }

    pub fn admin(env: Env) -> Address {
        env.storage().instance().get(&Clave::Admin).unwrap()
    }

    /// Da de alta (o reactiva) la llave de un nodo. Solo el administrador.
    pub fn alta_nodo(env: Env, llave: BytesN<32>) {
        Self::admin(env.clone()).require_auth();
        Self::guardar_nodo(&env, &llave, true);
        #[allow(deprecated)]
        env.events().publish((symbol_short!("alta"),), llave);
    }

    /// Revoca la llave de un nodo perdido o robado. Solo el administrador.
    pub fn revocar_nodo(env: Env, llave: BytesN<32>) {
        Self::admin(env.clone()).require_auth();
        Self::guardar_nodo(&env, &llave, false);
        #[allow(deprecated)]
        env.events().publish((symbol_short!("revoca"),), llave);
    }

    pub fn nodo_activo(env: Env, llave: BytesN<32>) -> bool {
        env.storage()
            .persistent()
            .get(&Clave::Nodo(llave))
            .unwrap_or(false)
    }

    /// Registra un reporte firmado por un nodo autorizado.
    /// Devuelve el número de ledger en que quedó registrado.
    pub fn registrar_reporte(
        env: Env,
        puerta: Address,
        hash: BytesN<32>,
        llave: BytesN<32>,
        firma: BytesN<64>,
        tipo: u32,
        anula: Option<BytesN<32>>,
    ) -> Result<u32, Error> {
        puerta.require_auth();

        if !(1..=4).contains(&tipo) {
            return Err(Error::TipoInvalido);
        }
        if !Self::nodo_activo(env.clone(), llave.clone()) {
            return Err(Error::NodoNoAutorizado);
        }
        let clave = Clave::Reporte(hash.clone());
        if env.storage().persistent().has(&clave) {
            return Err(Error::ReporteDuplicado);
        }
        if let Some(previo) = &anula {
            if !env.storage().persistent().has(&Clave::Reporte(previo.clone())) {
                return Err(Error::AnulaInexistente);
            }
        }

        // La firma del nodo es sobre los 32 bytes del hash. Si no es válida,
        // la ejecución se interrumpe y la transacción falla.
        let mensaje: Bytes = hash.clone().into();
        env.crypto().ed25519_verify(&llave, &mensaje, &firma);

        let registro = Registro {
            nodo: llave.clone(),
            tipo,
            anula: anula.clone(),
            ledger: env.ledger().sequence(),
            timestamp: env.ledger().timestamp(),
            puerta,
        };
        env.storage().persistent().set(&clave, &registro);
        env.storage()
            .persistent()
            .extend_ttl(&clave, TTL_MINIMO, TTL_EXTENDIDO);
        env.storage()
            .instance()
            .extend_ttl(TTL_MINIMO, TTL_EXTENDIDO);

        #[allow(deprecated)]
        env.events()
            .publish((symbol_short!("reporte"), tipo), (hash, llave, anula));

        Ok(registro.ledger)
    }

    /// Consulta pública: cualquiera puede comprobar si un hash está registrado.
    pub fn consultar(env: Env, hash: BytesN<32>) -> Option<Registro> {
        env.storage().persistent().get(&Clave::Reporte(hash))
    }

    fn guardar_nodo(env: &Env, llave: &BytesN<32>, activo: bool) {
        let clave = Clave::Nodo(llave.clone());
        env.storage().persistent().set(&clave, &activo);
        env.storage()
            .persistent()
            .extend_ttl(&clave, TTL_MINIMO, TTL_EXTENDIDO);
        env.storage()
            .instance()
            .extend_ttl(TTL_MINIMO, TTL_EXTENDIDO);
    }
}

#[cfg(test)]
mod test;
