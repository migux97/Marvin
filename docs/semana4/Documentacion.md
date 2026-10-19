# Documentación — Semana 4: Validated MVP

**Proyecto:** Marvin — Red de reportes de emergencia offline-first
**Contrato en Testnet:** [`CD5LRX24DHEDDHS47TN7IFBD4EMAZSLDTABA7Z7UPDYN3I7ZGI5RRGDR`](https://stellar.expert/explorer/testnet/contract/CD5LRX24DHEDDHS47TN7IFBD4EMAZSLDTABA7Z7UPDYN3I7ZGI5RRGDR)
**Evidencia del despliegue y de las pruebas en la red:** [Despliegue.md](Despliegue.md)

---

## 1. Qué cambió desde la semana 3

En la semana 3 la publicación en Stellar estaba simulada. Esta semana cumplimos la decisión técnica que habíamos tomado (opción A, contrato propio):

| Pieza | Semana 3 | Semana 4 |
| --- | --- | --- |
| Contrato Soroban | Solo diseñado | Escrito en Rust, con 10 pruebas, compilado y desplegado en Testnet (`contracts/`) |
| Puerta de enlace | Transacciones ficticias | Invoca `registrar_reporte` en el contrato real y muestra el enlace de cada transacción |
| Registro público | Buscaba en la memoria del navegador | Le pregunta al contrato con `consultar(hash)` |
| Nodos N1–N5 | Llaves aleatorias en cada demo | Llaves fijas de demo, registradas en el contrato |
| Malla entre nodos | Simulada | Sigue simulada (es hardware; ver sección 6) |

## 2. El contrato

Código: [`contracts/marvin/src/lib.rs`](../../contracts/marvin/src/lib.rs) · pruebas: [`test.rs`](../../contracts/marvin/src/test.rs) · binario desplegado: `contracts/dist/marvin.wasm` (11 KB).

| Función | Quién la llama | Qué hace |
| --- | --- | --- |
| `__constructor(admin)` | Al desplegar | Guarda la cuenta administradora. |
| `alta_nodo(llave)` / `revocar_nodo(llave)` | Administrador (firma obligatoria) | Autoriza o revoca la llave ed25519 de un nodo de campo. |
| `registrar_reporte(puerta, hash, llave, firma, tipo, anula)` | Puerta de enlace (firma obligatoria) | Comprueba que el nodo esté autorizado, que el tipo sea válido, que el hash no esté repetido y que, si es una corrección, el reporte corregido exista; **verifica la firma ed25519 del nodo en la red**; guarda un registro mínimo y emite un evento. |
| `consultar(hash)` | Cualquiera, sin firmar | Devuelve nodo, tipo, reporte corregido, ledger y hora, o nada si el hash no existe. |
| `nodo_activo(llave)` | Cualquiera | Indica si una llave está autorizada. |

**Errores:** `1` nodo no autorizado · `2` reporte duplicado · `3` tipo inválido · `4` la corrección apunta a un reporte no registrado. Una firma falsa interrumpe la ejecución y la transacción falla.

**Qué queda en la red:** solo el hash del reporte (32 bytes), la llave del nodo, el tipo y la hora. La zona, la nota y los datos personales nunca salen de la red local.

**Pruebas automáticas** (`cargo test`): reporte válido y consulta, nodo no registrado, nodo revocado, duplicado, tipo inválido, correcciones, firma falsa, alta sin permiso del administrador, hash desconocido y una prueba que carga el `.wasm` compilado en el host de Soroban y repite el flujo. Las 10 pasan.

## 3. Integración con el front

- `frontend/src/lib/stellar.ts` concentra todo lo que habla con Stellar (`@stellar/stellar-sdk` y Stellar RPC). Lo usan el front y el script de despliegue, así que el código que se probó en la red es el mismo que corre en la interfaz.
- `frontend/src/contrato.json` guarda el ID del contrato. Si está vacío, el front vuelve al modo simulado de la semana 3.
- **Puerta de enlace:** al activar un enlace (celular o satelital), el navegador crea su propia cuenta de Testnet, la fondea con Friendbot y publica la cola por prioridad, una transacción por reporte. Cada fila publicada enlaza a la transacción en StellarExpert. Si el contrato rechaza un reporte, aparece en «Rechazados» con el motivo.
- **Registro público:** «Verificar» recalcula el hash del reporte original y se lo pregunta al contrato. Si alguien cambió un dato, el hash ya no existe en la red.
- **Por qué no usamos una wallet como Freighter:** en Marvin quien firma no es una persona sino un dispositivo. Los nodos firman los reportes con su propia llave y la puerta de enlace paga las comisiones con su cuenta. Una wallet de navegador agregaría un clic de confirmación por cada reporte, que es justo lo que no queremos en una emergencia.

**Para probarlo (2 minutos):**

1. `cd frontend && npm install && npm run dev`.
2. En **Puerta de enlace**, elegir **Celular**: los seis reportes de ejemplo se publican en Testnet, primero las víctimas. Abrir cualquier enlace ↗ para ver la transacción.
3. En **Nodo de campo**, enviar un reporte nuevo y ver cómo llega y se publica.
4. En **Administración**, dar de alta un nodo nuevo y enviar un reporte desde él: la malla lo deja pasar, pero el contrato lo rechaza con «Nodo no autorizado».
5. En **Registro público**, verificar un reporte y luego probar con uno alterado.

## 4. Evidencia en Testnet

El despliegue y cinco pruebas contra la red real están documentados con enlaces a cada transacción en [Despliegue.md](Despliegue.md):

1. Un reporte firmado por N1 queda registrado (ledger 5.270.504).
2. Cualquiera lo consulta sin firmar nada.
3. Un nodo no registrado es rechazado.
4. El mismo reporte no puede registrarse dos veces.
5. Una firma falsificada con la llave de N2 es rechazada por la verificación ed25519 del contrato.

## 5. Validación del producto

### Hipótesis críticas

| # | Hipótesis | Cómo la validamos | Criterio de éxito |
| :-: | --- | --- | --- |
| H-A | Un brigadista puede enviar un reporte bajo presión sin capacitación previa. | Prueba de usabilidad: «reportá dos personas atrapadas en la zona C3», sin explicación previa. | 4 de 5 personas lo logran en menos de 30 segundos. |
| H-B | Un coordinador entiende el panorama en el centro de mando sin ayuda. | Pedir que diga qué zona atender primero y por qué. | 4 de 5 responden con la zona de mayor prioridad. |
| H-C | Una organización externa confía en el registro público. | Mostrar la verificación de un reporte íntegro y de uno alterado y preguntar si lo usaría para auditar. | 3 de 5 dicen que sí y entienden la diferencia. |
| H-D | El alcance radio entre nodos es suficiente entre edificios. | Prueba de campo con dos placas (ver sección 6). | Al menos 500 m entre nodos en zona urbana. |

### Resultados

_Pendiente:_ las pruebas de usabilidad (H-A a H-C) se harán con 5 personas antes del cierre del programa, y los resultados se registrarán en esta sección. H-D requiere el hardware de la sección 6.

## 6. Revisión de riesgos y cambios priorizados

Revisando el diseño encontramos que el riesgo más grande no está en la blockchain sino en la radio:

| Riesgo | Evaluación | Cambio priorizado |
| --- | --- | --- |
| **Alcance de ESP-NOW** | Unos 350 m en campo abierto; entre escombros, concreto y metal puede bajar a decenas de metros. Exigiría demasiados nodos. | Pasar a **LoRa (915 MHz)** con placas ESP32+LoRa (por ejemplo Heltec V3 o LilyGO T-Beam), de 1 a 3 km en ciudad, y evaluar montarse sobre **Meshtastic**. La firma ed25519 y el contrato no cambian. |
| **Personas aisladas** | El diseño cubre a rescatistas, no a civiles. | Nodos de relevo fijos con panel solar en zonas de riesgo y una red WiFi local del propio nodo para reportar desde cualquier celular. |
| **La puerta de enlace omite reportes** | Las firmas impiden falsificar, pero no impiden callar. | Varias puertas de enlace de distintas instituciones publicando en paralelo; el contrato ya descarta duplicados. |
| **Revocar sin internet** | Un nodo robado sigue activo hasta que haya enlace. | Propagar la lista de revocaciones también por la malla. |
| **Llaves de demo** | Las llaves de N1–N5 se derivan de una semilla pública: sirven solo para la demo en Testnet. | En producción, cada ESP32 genera su llave y nunca la expone. |

## 7. Participación del equipo

| Integrante | GitHub | Aporte en este entregable |
| --- | --- | --- |
| Franco Alejandro Mamani | [`migux97`](https://github.com/migux97) | Contrato Soroban y pruebas, despliegue en Testnet, integración con el front y documentación. |

## 8. Siguiente paso

1. Hacer las pruebas de usabilidad y completar la sección 5.
2. Grabar el video de demostración (máximo 3 minutos) y armar la hoja de ruta de 30 días para el Demo Package.
3. Comprar dos placas ESP32+LoRa y medir el alcance real entre edificios.
