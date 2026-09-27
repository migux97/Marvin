# Problem Brief

> Fase 2. Problema elegido entre las propuestas individuales (`FrancoMamani.md`, `EmanuelConte.md`, `AldoDuran.md`, `EmanuelGuzman.md`).

## Decisión del problema

### Problema elegido
Cuando ocurre un sismo u otro desastre natural en América Latina, los equipos de rescate pierden la comunicación y el registro compartido de lo que reportan justo en las primeras horas críticas, porque la infraestructura de telecomunicaciones se cae, se satura o queda intermitente. Propuesto por **Emanuel Guzman** (`EmanuelGuzman.md`).

### Por qué elegimos este
- **Varias partes que no confían entre sí comparten un mismo registro:** en un desastre intervienen protección civil, bomberos, fuerzas armadas, Cruz Roja, ONG, brigadas voluntarias y operadoras de telecomunicaciones. Ninguna es dueña natural del registro común y ninguna puede garantizar que su servidor siga en línea durante la emergencia.
- **El histórico no puede alterarse:** los reportes (víctimas localizadas, zonas revisadas, recursos entregados) sirven después para auditar la respuesta y rendir cuentas del uso de ayuda.
- **Se elimina un punto único de fallo:** hoy la confianza y la disponibilidad dependen de un servidor central o de un centro de mando que consolida a mano.
- Además, es un problema recurrente en la región, con impacto directo en vidas y con un componente técnico (hardware de bajo costo + red pública) que el equipo puede prototipar.

### Propuestas descartadas
- **Remesas internacionales — Franco Mamani:** el caso encaja, pero es el más explorado del ecosistema (Stellar ya tiene anclas y productos de remesas en producción) y depende de licencias financieras y anclas de retiro que el equipo no controla.
- **Titularidad de propiedades — Emanuel Conte:** el cuello de botella es legal e institucional; un registro en cadena no tiene validez jurídica sin que el registro público estatal lo adopte, y el problema de "basura entra, basura sale" en el alta inicial es difícil de resolver en el bootcamp.
- **Mantenimiento de flotillas — Aldo Duran:** hay solo dos partes y una relación comercial; una plataforma compartida con bitácora firmada o un tercero auditor lo resuelve sin necesidad de un registro distribuido.

### Cómo tomamos la decisión
<!-- COMPLETAR: método real (votación, consenso tras debate, etc.), fecha y resultado. -->
Cada integrante presentó su propuesta individual y el equipo las comparó contra los tres criterios de la Sesión 1 (partes que no confían entre sí, histórico inalterable, eliminación de un intermediario que concentra la confianza). Se eligió el problema de comunicaciones de emergencia por ser el que cumple los tres criterios de forma más clara. _[Por confirmar: votación o consenso y resultado.]_

---

## Problem Brief

### Encabezado
**Marvin — Red de reportes de emergencia offline-first.**
Los equipos de rescate en América Latina pierden la comunicación y la trazabilidad de lo que reportan justo en las primeras horas tras un desastre natural, cuando más la necesitan.

### Equipo y roles
| Integrante | GitHub | Rol |
|---|---|---|
| Franco Alejandro Mamani | `migux97` | Project Lead |
| Emanuel Guzman | `Emanuel250YT` | Full Stack Developer (autor del problema) |
| Emanuel Conte | _[por confirmar]_ | Market |
| Aldo Duran | _[por confirmar]_ | _Por definir_ |

- **Responsable de las entregas:** Franco Alejandro Mamani (Project Lead)
- **Canal de coordinación interna:** _[por confirmar]_

### Problema y evidencia
**Enunciado:** tras un desastre natural, los equipos de rescate no pueden intercambiar ni conservar de forma confiable la información operativa (víctimas localizadas, estructuras colapsadas, rutas bloqueadas, recursos disponibles) porque las redes de telecomunicaciones de la zona dejan de funcionar.

**Contexto y alcance:** buena parte de América Latina está sobre el Cinturón de Fuego del Pacífico y además enfrenta huracanes, inundaciones y deslaves. Fuera de las grandes ciudades, las antenas celulares suelen carecer de respaldo de energía prolongado y de enlaces redundantes, y la red se satura en cuanto toda la población intenta comunicarse a la vez. No es un evento excepcional: la región sufre cada año varios desastres de magnitud nacional.

**Evidencia:**
- **Terremoto de Colombia (10 de agosto de 2026, M7,4, San José del Palmar, Chocó):** según MinTIC, **3.403 de 7.379 estaciones base (46,1 %)** quedaron fuera de servicio en siete departamentos; en Risaralda, el 77 %. Claro y Tigo lo atribuyeron a cortes de energía, daños en la infraestructura y sobrecarga de tráfico. El Gobierno declaró desastre nacional con más de 100 fallecidos. ([El País](https://www.elpais.com.co/colombia/terremoto-en-colombia-casi-la-mitad-de-las-antenas-moviles-estan-fuera-de-servicio-estos-son-los-departamentos-mas-afectados-1143.html), [Infobae](https://www.infobae.com/tecno/2026/08/10/colombia-tiene-fallas-en-telecomunicaciones-tras-el-terremoto-claro-y-tigo-con-telefonia-e-internet/), [Chequeado](https://chequeado.com/el-explicador/terremoto-de-magnitud-7-4-en-colombia-el-gobierno-declara-desastre-nacional-y-reporta-al-menos-111-muertos/))
- **Lluvias de octubre de 2025 (Hidalgo, Veracruz, Puebla):** más de 20 días después seguían **112 localidades incomunicadas**; 10 en Hidalgo sin acceso terrestre ni aéreo. ([El Universal](https://www.eluniversal.com.mx/nacion/sin-comunicacion-112-comunidades-de-veracruz-hidalgo-y-puebla-10-zonas-hidalguenses-no-tienen-acceso-terrestre-o-aereo-pc/))
- **Huracán Melissa (Jamaica, octubre de 2025):** las cinco parroquias más golpeadas perdieron toda comunicación. ([Wikipedia](https://en.wikipedia.org/wiki/Hurricane_Melissa))
- **Inundaciones de Rio Grande do Sul (Brasil, mayo de 2024):** hasta 87 ciudades sin telefonía ni internet; la alcaldía de Bento Gonçalves reportó que esto dificultaba el contacto entre Defensa Civil y SAMU. ([Agência Brasil](https://agenciabrasil.ebc.com.br/geral/noticia/2024-05/chuvas-afetam-telecomunicacoes-dificultando-resgates-no-rs))

### Usuario y actores
**Usuario principal:** los equipos de rescate en campo —bomberos, protección civil, brigadas voluntarias, grupos de búsqueda y rescate urbano— que necesitan reportar y consultar en tiempo casi real qué zonas se revisaron, dónde hay víctimas, qué rutas están bloqueadas y qué recursos faltan.

**Cómo lo resuelven hoy:** con celulares que dependen de una red caída o saturada; con radios VHF/UHF o teléfonos satelitales, que son caros, escasos y no dejan registro escrito; y con mensajes de voz en voz o en papel que alguien transcribe en el centro de mando. **Costo:** tiempo perdido en la ventana crítica de 72 horas, esfuerzo duplicado (dos brigadas revisando la misma estructura o ninguna revisándola), información perdida o contradictoria, y equipos profesionales de radio o satélite cuyo precio por unidad impide que cada brigada tenga uno.

**Otros actores:**
- **Centro de mando / Sistema de Comando de Incidentes:** consolida reportes, asigna recursos y decide prioridades.
- **Autoridades de protección civil (municipal, estatal, federal):** coordinan la respuesta oficial y emiten informes.
- **Operadoras de telecomunicaciones:** restablecen la red; también necesitan saber qué zonas están sin servicio.
- **ONG, Cruz Roja y ayuda internacional:** llegan después y necesitan el panorama acumulado.
- **Personas damnificadas y sus familias:** su atención depende de que la información llegue a tiempo.
- **Auditores y organismos de control:** revisan después cómo se usaron los recursos.

### Flujo actual de valor
El activo que se mueve es **información operativa** (reportes de campo). Hoy el recorrido es:

1. **Ocurre el desastre.** Antenas y enlaces de la zona se caen por daño físico o falta de energía, o se saturan por la demanda simultánea.
2. **Rescatista en campo** detecta una víctima, un colapso o una ruta bloqueada e intenta reportarlo por celular (llamada, WhatsApp); depende de tener señal propia.
3. **Sin señal**, recurre a una **radio VHF/UHF o satelital** si su brigada la tiene. El reporte es solo de voz; nadie conserva un registro fiel.
4. **Operador de radio o mensajero** transmite el reporte al **centro de mando**, a veces tras varios relevos de voz o en papel.
5. **Centro de mando** transcribe y consolida a mano (pizarrones, hojas, planillas). _Paso normativo:_ los formatos de reporte y la cadena de mando responden al Sistema de Comando de Incidentes y a la legislación de protección civil de cada país.
6. **Al recuperarse la conectividad**, la información se captura en el **servidor central** de una sola institución, que también puede estar intermitente.
7. **Otras organizaciones** (ONG, otras brigadas, telecom, ayuda internacional) solicitan la información a esa institución, que decide qué compartir y cuándo.

```
Rescatista → [red celular caída] → radio/voz/papel → operador → centro de mando
   → transcripción manual → servidor central (1 institución) → otras organizaciones
```

Cada flecha es un intermediario humano o técnico que puede fallar o introducir retraso.

### Fricciones identificadas
1. **Paso 2 — Dependencia de la red celular.** Causa: infraestructura sin respaldo energético ni redundancia, y saturación por demanda simultánea. Afecta a todos los rescatistas y a la población.
2. **Paso 3 — Escasez y costo de radios profesionales.** Causa: equipos VHF/UHF y satelitales caros por unidad, que requieren licencias y capacitación. Afecta sobre todo a brigadas voluntarias y municipios pequeños.
3. **Pasos 3–4 — Pérdida de información en relevos de voz.** Causa: la radio no deja registro escrito; cada retransmisión puede distorsionar datos (direcciones, cantidades, horarios). Afecta al centro de mando, que decide con información imprecisa.
4. **Paso 5 — Consolidación manual.** Causa: los reportes llegan en formatos heterogéneos y hay que transcribirlos. Genera cuellos de botella, duplicados y omisiones. Afecta a la asignación de recursos.
5. **Paso 6 — Servidor central como punto único de fallo.** Causa: la información queda en la infraestructura de una sola institución, que puede estar en la misma zona afectada. Si cae, nadie más puede consultar.
6. **Paso 7 — Acceso controlado por una sola organización.** Causa: no hay un registro común; cada institución guarda su versión y comparte por canales informales. Afecta a ONG, telecom y ayuda internacional, que trabajan con información incompleta o desfasada.
7. **Posterior — Falta de trazabilidad.** Causa: no hay un historial fechado e inalterable de quién reportó qué y cuándo. Dificulta auditar la respuesta y rendir cuentas.

### Oportunidad e hipótesis
**Oportunidad priorizada:** las fricciones 5 y 6 —la información queda atrapada en un servidor central de una sola institución y el resto de organizaciones depende de que esté en línea y de que decida compartirla—, apoyadas por una solución de campo a las fricciones 1 a 4.

**Motivo:** es el punto donde la falta de un registro común entre organizaciones independientes causa más daño y donde una red distribuida aporta algo que una mejor base de datos no resuelve. Las fricciones de campo se atacan con hardware de bajo costo, pero sin un destino común confiable los reportes vuelven a quedar aislados.

**Hipótesis:**
- En campo, nodos **ESP32** forman una red de malla con **ESP-NOW** (sin router ni internet); cada rescatista genera reportes estructurados de pocos kilobytes que se guardan localmente en cada nodo (offline-first) y saltan de nodo en nodo.
- Un **único nodo puerta de enlace** con el primer enlace disponible (satelital, celular, el primero que se recupere) publica en lote los reportes en la **red de Stellar**: un compromiso (hash) de cada reporte firmado por el nodo de origen, y los datos, cifrados o no según su sensibilidad.
- **Qué cambiaría para el usuario:** cualquier brigada, ONG, operadora o centro de mando, en cualquier lugar, consulta el mismo registro sin pedir permiso ni depender de que un servidor específico esté en línea; los rescatistas dejan de competir por la red celular; y queda un historial fechado de cada reporte para coordinar y auditar la respuesta.

### Criterio de pertinencia
Una base de datos tradicional o una integración entre sistemas existentes no alcanza por tres razones, alineadas con los criterios de la Sesión 1:

1. **Varias partes que no confían entre sí necesitan compartir un mismo registro.** En un desastre participan organismos de distintos niveles de gobierno, fuerzas armadas, bomberos, Cruz Roja, ONG nacionales e internacionales, voluntarios y empresas de telecomunicaciones. No hay una autoridad que todas acepten como dueña de la base de datos, y en la práctica cada una mantiene la suya. Una integración entre sistemas exigiría acuerdos, APIs y servidores disponibles justo cuando no lo están.
2. **Se elimina un intermediario que hoy concentra la confianza y la disponibilidad.** Hoy el centro de mando o el servidor de una institución decide qué se comparte y es un punto único de fallo, a menudo ubicado en la propia zona afectada. Stellar es un registro replicado por validadores en distintos países que ninguna organización controla; sigue disponible aunque la infraestructura local caiga, y cualquiera lo puede leer.
3. **El histórico no puede alterarse.** Cada reporte queda con marca de tiempo del ledger y firma del nodo que lo generó. Nadie puede borrar ni modificar a posteriori un reporte de "zona revisada" o de "recurso entregado", lo que permite auditar la respuesta y deslindar responsabilidades.

Stellar en particular encaja por comisiones de fracciones de centavo y confirmación en unos 5 segundos, lo que permite publicar muchos reportes pequeños sin costo relevante. Una base de datos replicada entre organizaciones podría resolver la disponibilidad, pero requeriría que alguien la opere y que las demás confíen en ese operador, que es justamente lo que hoy falla.

### Supuestos y riesgos
**Supuestos:**
1. **ESP-NOW alcanza distancias útiles en zonas de escombros.** El alcance anunciado (más de 350 m entre nodos) se mide en campo abierto; entre estructuras colapsadas, concreto y metal puede reducirse mucho. _Lo invalida:_ que se necesite una densidad de nodos imposible de desplegar a tiempo. _Mitigación a evaluar:_ antenas externas o LoRa como respaldo de largo alcance.
2. **Cabe información útil en las transacciones de Stellar a un costo práctico.** El memo de texto admite 28 bytes y cada entrada `manageData` 64 bytes por valor, así que un reporte completo no cabe en una sola operación. _Lo invalida:_ que publicar cada reporte requiera tantas operaciones que el costo, el tamaño de subida por un enlace lento o el límite de operaciones por transacción lo vuelvan impráctico. _Alternativa:_ publicar solo el hash del reporte en Stellar y el contenido en almacenamiento distribuido.
3. **Las organizaciones adoptarían un registro que no controlan.** _Lo invalida:_ que las autoridades exijan por norma que la información oficial resida en sus propios sistemas, o que no acepten datos de fuentes voluntarias.

**Riesgos adicionales:**
- **Privacidad:** los reportes pueden incluir datos personales de víctimas; publicarlos en una red pública, aun cifrados, exige definir qué se publica y quién tiene las llaves.
- **Reportes falsos o erróneos:** la inmutabilidad también conserva errores; hace falta un mecanismo de corrección (reportes nuevos que anulan anteriores) y de identidad de los nodos emisores.
- **Energía y logística:** los nodos necesitan baterías y alguien que los despliegue durante la emergencia.
