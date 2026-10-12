# Historias de usuario — Emanuel Guzman

> Semana 2, Fase 1. Producto: **Marvin — Red de reportes de emergencia offline-first** (ver `docs/semana1/ProblemBrief.md`).

## Mis historias de usuario

1. **Como rescatista en campo**, quiero que mi nodo verifique la firma de cada reporte que recibe por la malla, para descartar reportes falsos o de nodos que no están registrados.
2. **Como técnico a cargo del nodo puerta de enlace**, quiero que los reportes se publiquen en Stellar por prioridad (víctimas primero, luego rutas y recursos) cuando el enlace es lento o intermitente, para que lo urgente salga primero aunque la conexión se corte.
3. **Como responsable de protección de datos de la institución**, quiero que los datos personales de las víctimas viajen cifrados y que en Stellar solo quede el hash del reporte, para cumplir la ley de datos personales sin perder la trazabilidad.
4. **Como administrador de la red de nodos**, quiero dar de alta y revocar la llave de cada nodo, para que un nodo perdido o robado deje de poder publicar reportes.
5. **Como jefe de sector de bomberos**, quiero recibir una alerta en mi nodo cuando se reporta una víctima atrapada en mi sector, para enviar al equipo disponible más cercano.
6. **Como integrante de un equipo internacional de búsqueda y rescate urbano (USAR)**, quiero unir mi propio nodo a la malla y ver los reportes con códigos de marcaje estándar (INSARAG), para integrarme a la operación sin aprender un sistema local.
7. **Como desarrollador del sistema de otra institución**, quiero leer los reportes publicados desde Horizon con un formato documentado, para integrarlos a nuestros tableros sin depender de una aplicación de Marvin.

## La más importante y por qué

Ordenadas de mayor a menor importancia:

1. **Verificación de firmas (historia 1).** Un registro inmutable de reportes falsos es peor que no tener registro. Sin firmas verificables no se puede confiar en nada de lo que circula por la malla ni en lo que se publica en Stellar.
2. **Publicación por prioridad en la puerta de enlace (historia 2).** El enlace hacia afuera es el cuello de botella del sistema. Si se corta a mitad del envío, lo que ya salió tiene que ser lo que salva vidas.
3. **Cifrado y solo hash en Stellar (historia 3).** Publicar datos de víctimas en una red pública sin protección haría que ninguna institución adopte el sistema. Es un requisito para salir a campo, no una mejora.
4. **Alta y revocación de nodos (historia 4).** Complementa la verificación de firmas: define quién puede publicar y cómo se corta el acceso a un nodo comprometido.
5. **Alertas por sector (historia 5).** Acelera la respuesta, pero depende de que los reportes ya sean confiables y lleguen bien, por eso va después de las anteriores.
6. **Interoperabilidad con equipos USAR (historia 6).** Da mucho valor en desastres grandes con ayuda internacional, aunque no se necesita en todas las emergencias.
7. **Lectura documentada desde Horizon (historia 7).** Es lo que hace útil el registro abierto para otras instituciones, pero Horizon ya permite leer los datos; documentar el formato puede esperar a que el formato se estabilice.
