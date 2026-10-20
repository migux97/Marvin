# MVP funcional — Semana 4

**Proyecto:** Marvin — Red de reportes de emergencia offline-first
**Repositorio:** [migux97/Marvin](https://github.com/migux97/Marvin)

## Evidencia verificable

| Qué | Enlace |
| --- | --- |
| Contrato Soroban en Testnet | [`CD5LRX24DHEDDHS47TN7IFBD4EMAZSLDTABA7Z7UPDYN3I7ZGI5RRGDR`](https://stellar.expert/explorer/testnet/contract/CD5LRX24DHEDDHS47TN7IFBD4EMAZSLDTABA7Z7UPDYN3I7ZGI5RRGDR) |
| Creación del contrato | [transacción](https://stellar.expert/explorer/testnet/tx/c85c0b190a7f374c7ef4a32d6910dac6d5c556c4fd15522166e4393f60f5fa7c) |
| Reporte registrado por la puerta de enlace | [transacción](https://stellar.expert/explorer/testnet/tx/7b91f8fde0c74f4d16a472befc6914073c628bd4f99a321aea01ab8adbab62d6) |
| Alta de los nodos N1–N5 y pruebas en la red | [Despliegue.md](Despliegue.md) |
| Video del producto y pitch (máx. 3 min) | _[pendiente: enlace de YouTube]_ |
| Producto en línea | _[pendiente: enlace de Vercel]_ · para correrlo localmente ver el [README](../../README.md) |

**Qué se construyó:** el contrato propio declarado en el Entregable 3 (opción A), escrito en Rust ([`contracts/marvin`](../../contracts/marvin/src/lib.rs)), con 10 pruebas automáticas, desplegado en Testnet y conectado al front. La puerta de enlace publica cada reporte con `registrar_reporte` y el registro público lo verifica con `consultar`. El back que une el front con el contrato está en [`frontend/src/lib/stellar.ts`](../../frontend/src/lib/stellar.ts). El detalle técnico está en [Documentacion.md](Documentacion.md).

## Aprendizajes y ajustes priorizados

Lo más importante que aprendimos es que la blockchain no es el punto débil de Marvin: lo es la radio entre nodos. El contrato resolvió bien lo que prometía. Verifica en la red que cada reporte esté firmado por un nodo autorizado, rechaza duplicados y firmas falsas, y cualquiera puede consultarlo sin pedir permiso. En cambio, ESP-NOW alcanza unos 350 metros en campo abierto y mucho menos entre escombros, lo que obligaría a desplegar demasiados nodos.

También aprendimos que, en una emergencia, una wallet que pide confirmar cada transacción es un obstáculo. Por eso firman los dispositivos y la puerta de enlace paga las comisiones con su propia cuenta.

Ajustes ordenados por impacto y esfuerzo:

| Ajuste | Impacto | Esfuerzo | Cuándo |
| --- | :-: | :-: | --- |
| Publicar el front en línea y grabar el video | Alto | Bajo | Antes del cierre |
| Pruebas de usabilidad con brigadistas y coordinadores | Alto | Medio | Antes del cierre |
| Pasar de ESP-NOW a LoRa (915 MHz), posiblemente sobre Meshtastic | Alto | Alto | Después del cierre |
| Varias puertas de enlace publicando en paralelo | Medio | Medio | Después del cierre |
| Cifrar los datos personales en la red local | Medio | Medio | Después del cierre |

## Riesgos y pendientes

**Alcance de la radio.** Es el riesgo principal. Si los nodos no se alcanzan entre edificios caídos, los reportes no llegan al centro de mando, por más que el registro en Stellar funcione. La respuesta es cambiar a LoRa, que llega a varios kilómetros, con relevos en puntos altos. Hay que validarlo en campo con dos placas antes de comprometerse.

**La malla todavía está simulada.** Hoy el front muestra la propagación entre nodos, pero no hay hardware. Lo real en este MVP es la firma de cada reporte, el hash y todo lo que pasa en Stellar.

**Personas aisladas.** El diseño cubre a los rescatistas, no a la población. Un pueblo incomunicado no puede reportar si no llega una brigada. Se puede mitigar con nodos fijos con panel solar en zonas de riesgo y una red WiFi local del nodo para reportar desde cualquier celular.

**La puerta de enlace puede omitir reportes.** Las firmas impiden que falsifique datos, pero no que se calle. Hace falta que varias instituciones operen puertas de enlace propias; el contrato ya descarta duplicados.

**Revocación sin internet.** Un nodo robado sigue activo hasta que haya enlace para revocarlo en el contrato. Habría que propagar la lista de revocaciones también por la malla.

**Llaves de demostración.** Las llaves de N1–N5 salen de una semilla pública y solo sirven para la demo en Testnet. En producción, cada dispositivo genera su llave y nunca la expone.

**Adopción.** Falta comprobar que una dirección de protección civil acepte un registro que no controla.

**Pendientes antes del cierre:** video, producto en línea, pruebas de usabilidad y la hoja de ruta de 30 días.

## Plan de validación con usuarios

**A quiénes.** Al usuario del Problem Brief: brigadistas en campo (bomberos, protección civil, brigadas voluntarias) y coordinadores de centros de mando. Como usuarios secundarios, personal de ONG o de Cruz Roja que consultaría el registro. Buscamos cinco personas de cada grupo, empezando por brigadas voluntarias y direcciones municipales de protección civil de zonas sísmicas.

**Con qué métodos.**

1. **Entrevistas cortas (20 minutos)** sobre la última emergencia en la que participaron: cómo se comunicaron, qué información se perdió y quién la consolidó.
2. **Pruebas con el producto**, sin explicación previa y cronometradas:
   - Al brigadista: «reportá dos personas atrapadas en la zona C3».
   - Al coordinador: «decí qué zona atenderías primero y asigná una brigada».
   - A la ONG: «comprobá si este reporte fue alterado».
3. **Simulacro de mesa** con una brigada: varias personas reportando a la vez mientras se corta y vuelve el enlace a internet.
4. **Prueba de campo de alcance** con dos placas LoRa entre edificios.

**Hipótesis y criterios de éxito.**

| Hipótesis | Se cumple si… |
| --- | --- |
| Un brigadista reporta bajo presión sin capacitación. | 4 de 5 lo logran en menos de 30 segundos y sin errores de zona. |
| El coordinador entiende el panorama sin transcribir nada. | 4 de 5 eligen la zona de mayor prioridad en menos de un minuto. |
| Una ONG confía en el registro público. | 3 de 5 distinguen el reporte íntegro del alterado y dicen que lo usarían para auditar. |
| La radio alcanza en ciudad. | Al menos 500 m entre dos nodos con edificios de por medio. |
| Una institución adoptaría un registro que no controla. | Al menos una dirección de protección civil acepta un piloto o un simulacro. |

**Métricas iniciales:** tiempo desde que se crea un reporte hasta que aparece en el centro de mando, porcentaje de reportes que llegan sin pérdida, tiempo hasta publicarse en Stellar una vez que hay enlace y errores por tarea en las pruebas de usabilidad.

Los resultados se registrarán en esta sección y orientarán la hoja de ruta de 30 días.
