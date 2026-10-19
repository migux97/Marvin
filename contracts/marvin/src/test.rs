extern crate std;

use super::*;
use ed25519_dalek::{Signer, SigningKey};
use soroban_sdk::testutils::{Address as _, Events};
use soroban_sdk::{BytesN, Env};

struct Escenario {
    env: Env,
    cliente: MarvinClient<'static>,
    puerta: Address,
}

fn escenario() -> Escenario {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let id = env.register(Marvin, (admin.clone(),));
    let cliente = MarvinClient::new(&env, &id);
    let puerta = Address::generate(&env);
    Escenario { env, cliente, puerta }
}

fn nodo(semilla: u8) -> SigningKey {
    SigningKey::from_bytes(&[semilla; 32])
}

fn llave(env: &Env, n: &SigningKey) -> BytesN<32> {
    BytesN::from_array(env, &n.verifying_key().to_bytes())
}

fn firmado(env: &Env, n: &SigningKey, contenido: u8) -> (BytesN<32>, BytesN<64>) {
    let hash = [contenido; 32];
    let firma = n.sign(&hash).to_bytes();
    (BytesN::from_array(env, &hash), BytesN::from_array(env, &firma))
}

#[test]
fn registra_un_reporte_valido_y_se_puede_consultar() {
    let e = escenario();
    let n = nodo(1);
    e.cliente.alta_nodo(&llave(&e.env, &n));
    let (hash, firma) = firmado(&e.env, &n, 7);

    let ledger = e
        .cliente
        .registrar_reporte(&e.puerta, &hash, &llave(&e.env, &n), &firma, &1, &None);
    assert_eq!(e.env.events().all().len(), 1);

    let r = e.cliente.consultar(&hash).unwrap();
    assert_eq!(r.ledger, ledger);
    assert_eq!(r.tipo, 1);
    assert_eq!(r.nodo, llave(&e.env, &n));
    assert_eq!(r.puerta, e.puerta);
}

#[test]
fn rechaza_un_nodo_no_registrado() {
    let e = escenario();
    let n = nodo(2);
    let (hash, firma) = firmado(&e.env, &n, 1);
    let r = e
        .cliente
        .try_registrar_reporte(&e.puerta, &hash, &llave(&e.env, &n), &firma, &2, &None);
    assert_eq!(r, Err(Ok(Error::NodoNoAutorizado)));
}

#[test]
fn rechaza_un_nodo_revocado() {
    let e = escenario();
    let n = nodo(3);
    e.cliente.alta_nodo(&llave(&e.env, &n));
    assert!(e.cliente.nodo_activo(&llave(&e.env, &n)));
    e.cliente.revocar_nodo(&llave(&e.env, &n));
    assert!(!e.cliente.nodo_activo(&llave(&e.env, &n)));
    let (hash, firma) = firmado(&e.env, &n, 1);
    let r = e
        .cliente
        .try_registrar_reporte(&e.puerta, &hash, &llave(&e.env, &n), &firma, &3, &None);
    assert_eq!(r, Err(Ok(Error::NodoNoAutorizado)));
}

#[test]
fn rechaza_duplicados() {
    let e = escenario();
    let n = nodo(4);
    e.cliente.alta_nodo(&llave(&e.env, &n));
    let (hash, firma) = firmado(&e.env, &n, 9);
    e.cliente
        .registrar_reporte(&e.puerta, &hash, &llave(&e.env, &n), &firma, &4, &None);
    let r = e
        .cliente
        .try_registrar_reporte(&e.puerta, &hash, &llave(&e.env, &n), &firma, &4, &None);
    assert_eq!(r, Err(Ok(Error::ReporteDuplicado)));
}

#[test]
fn rechaza_tipo_invalido() {
    let e = escenario();
    let n = nodo(5);
    e.cliente.alta_nodo(&llave(&e.env, &n));
    let (hash, firma) = firmado(&e.env, &n, 9);
    let r = e
        .cliente
        .try_registrar_reporte(&e.puerta, &hash, &llave(&e.env, &n), &firma, &9, &None);
    assert_eq!(r, Err(Ok(Error::TipoInvalido)));
}

#[test]
fn una_correccion_debe_apuntar_a_un_reporte_registrado() {
    let e = escenario();
    let n = nodo(6);
    e.cliente.alta_nodo(&llave(&e.env, &n));
    let (original, f1) = firmado(&e.env, &n, 1);
    let (correccion, f2) = firmado(&e.env, &n, 2);
    let (fantasma, _) = firmado(&e.env, &n, 3);

    let r = e.cliente.try_registrar_reporte(
        &e.puerta, &correccion, &llave(&e.env, &n), &f2, &1, &Some(fantasma),
    );
    assert_eq!(r, Err(Ok(Error::AnulaInexistente)));

    e.cliente
        .registrar_reporte(&e.puerta, &original, &llave(&e.env, &n), &f1, &1, &None);
    e.cliente.registrar_reporte(
        &e.puerta, &correccion, &llave(&e.env, &n), &f2, &1, &Some(original.clone()),
    );
    assert_eq!(e.cliente.consultar(&correccion).unwrap().anula, Some(original));
}

#[test]
#[should_panic]
fn rechaza_una_firma_falsa() {
    let e = escenario();
    let n = nodo(7);
    let impostor = nodo(8);
    e.cliente.alta_nodo(&llave(&e.env, &n));
    // El impostor firma, pero se presenta con la llave del nodo autorizado.
    let (hash, firma) = firmado(&e.env, &impostor, 5);
    e.cliente
        .registrar_reporte(&e.puerta, &hash, &llave(&e.env, &n), &firma, &1, &None);
}

#[test]
#[should_panic]
fn solo_el_admin_da_de_alta_nodos() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let id = env.register(Marvin, (admin,));
    let cliente = MarvinClient::new(&env, &id);
    // Sin autorización del admin.
    cliente.alta_nodo(&BytesN::from_array(&env, &[1; 32]));
}

#[test]
fn consultar_un_hash_desconocido_devuelve_none() {
    let e = escenario();
    assert_eq!(e.cliente.consultar(&BytesN::from_array(&e.env, &[0; 32])), None);
}

/// Carga el .wasm compilado (si existe) en el host de Soroban y repite el flujo
/// principal, para comprobar que el binario que se despliega es válido.
#[test]
fn el_wasm_compilado_funciona_en_el_host() {
    let ruta = concat!(env!("CARGO_MANIFEST_DIR"), "/../target/wasm32v1-none/release/marvin.wasm");
    let Ok(wasm) = std::fs::read(ruta) else {
        std::println!("(sin wasm compilado, se omite)");
        return;
    };
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let id = env.register(wasm.as_slice(), (admin.clone(),));
    let cliente = MarvinClient::new(&env, &id);
    assert_eq!(cliente.admin(), admin);
    let n = nodo(9);
    cliente.alta_nodo(&llave(&env, &n));
    let (hash, firma) = firmado(&env, &n, 4);
    let puerta = Address::generate(&env);
    cliente.registrar_reporte(&puerta, &hash, &llave(&env, &n), &firma, &2, &None);
    assert_eq!(cliente.consultar(&hash).unwrap().tipo, 2);
    let (h2, _) = firmado(&env, &n, 5);
    let (_, firma_mala) = firmado(&env, &nodo(10), 5);
    assert!(cliente
        .try_registrar_reporte(&puerta, &h2, &llave(&env, &n), &firma_mala, &1, &None)
        .is_err());
}
