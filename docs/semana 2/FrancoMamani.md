# Historias de usuario — Franco Mamani

> Semana 2, Fase 1. Producto: **Marvin — Red de reportes de emergencia offline-first** (ver `docs/semana1/ProblemBrief.md`).

## Mis historias de usuario

1. **Como coordinador del centro de mando**, quiero ver en un solo panel todos los reportes de campo (víctimas localizadas, estructuras colapsadas, rutas bloqueadas, recursos faltantes) ordenados por hora y ubicación, para asignar brigadas y recursos sin tener que transcribir a mano lo que llega por radio o papel.
2. **Como rescatista en campo**, quiero marcar una zona como "revisada" desde mi nodo y que esa marca llegue a las demás brigadas por la malla, para que dos equipos no revisen la misma estructura mientras otra queda sin revisar.
3. **Como miembro de una ONG o de Cruz Roja que llega después del desastre**, quiero consultar el registro completo de reportes en Stellar sin pedir permiso a ninguna institución, para tener el panorama acumulado desde mi primera hora en la zona.
4. **Como rescatista en campo**, quiero corregir un reporte que envié con un error publicando un reporte nuevo que anule al anterior, para que la información siga siendo confiable sin borrar el historial.
5. **Como auditor u organismo de control**, quiero verificar la fecha, la firma del nodo de origen y el contenido (hash) de cada reporte de "recurso entregado", para comprobar cómo se usó la ayuda y deslindar responsabilidades.
6. **Como responsable de logística de protección civil**, quiero ver el nivel de batería y la última señal de cada nodo desplegado, para reemplazar o reubicar los nodos antes de que la malla quede con huecos.
7. **Como familiar de una persona damnificada**, quiero consultar si la zona donde vive mi familiar ya fue revisada y si hay reportes de personas localizadas ahí, sin ver datos personales sensibles, para saber qué está pasando sin saturar las líneas de emergencia.

## La más importante y por qué

Ordenadas de mayor a menor importancia:

1. **Panel único del centro de mando (historia 1).** Es la razón de ser de Marvin: si los reportes no llegan consolidados a quien decide, todo lo demás pierde valor. Ataca directamente las fricciones de relevos de voz y consolidación manual, y es lo que hoy cuesta más tiempo dentro de la ventana crítica de 72 horas.
2. **Zonas revisadas compartidas por la malla (historia 2).** Evita el esfuerzo duplicado y las zonas olvidadas, que es el costo más concreto que sufren las brigadas. Es también la prueba mínima de que la red ESP-NOW sirve en campo.
3. **Acceso abierto al registro para otras organizaciones (historia 3).** Es lo que justifica usar Stellar en lugar de un servidor central: quita a una sola institución el control sobre qué se comparte y elimina el punto único de fallo.
4. **Corrección de reportes sin borrar el historial (historia 4).** La inmutabilidad también conserva errores; sin un mecanismo de corrección, el registro deja de ser confiable para decidir. Es un requisito para que las historias 1 a 3 funcionen bien.
5. **Verificación por auditores (historia 5).** Aporta la trazabilidad y la rendición de cuentas, pero se usa después de la emergencia, por eso va detrás de lo que salva tiempo en las primeras horas.
6. **Estado de los nodos (historia 6).** Es operativamente necesaria para mantener la malla viva, pero es una herramienta de soporte, no el valor principal para el usuario.
7. **Consulta para familiares (historia 7).** Tiene impacto humano real, pero exige resolver primero la privacidad de los datos de víctimas, así que conviene dejarla para cuando el resto del sistema esté probado.
