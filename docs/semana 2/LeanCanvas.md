# Lean Canvas — Marvin

> Lienzo de una página del modelo de Marvin. Enlazado desde [ProductBlueprint.md](ProductBlueprint.md).

| Bloque | Contenido |
| --- | --- |
| **1. Problema** | 1) Tras un desastre, la red celular se cae o se satura y los rescatistas no pueden reportar. 2) Los reportes por radio, voz o papel se pierden o distorsionan y se consolidan a mano. 3) La información queda en el servidor de una sola institución: punto único de fallo y acceso controlado. **Alternativas actuales:** celular, radios VHF/UHF, teléfonos satelitales, papel y transcripción manual en el centro de mando. |
| **2. Segmento de usuarios** | Equipos de rescate en campo (bomberos, protección civil, brigadas voluntarias, equipos de búsqueda y rescate urbano) y centros de mando. **Adoptantes tempranos:** direcciones municipales de protección civil y brigadas voluntarias de zonas sísmicas o con huracanes, sin presupuesto para radios profesionales. Otros actores: ONG, Cruz Roja, ayuda internacional, auditores. |
| **3. Propuesta de valor única** | Reportar y coordinar sin red celular, con un registro común que ninguna institución controla y que nadie puede alterar después. |
| **4. Solución** | 1) Nodos ESP32 en malla ESP-NOW que guardan y reenvían reportes firmados (offline-first). 2) Una puerta de enlace que, con el primer enlace disponible, publica en Stellar el hash y la firma de cada reporte por orden de prioridad. 3) Un panel para el centro de mando y una vista pública del registro para otras organizaciones. |
| **5. Canales** | Direcciones de protección civil municipales y estatales; redes de brigadas voluntarias y Cruz Roja; simulacros y capacitaciones oficiales; convocatorias de innovación humanitaria; comunidad de Stellar y hackatones. |
| **6. Fuentes de ingresos** | Venta de kits de nodos y puertas de enlace a municipios y organismos de protección civil; contratos de soporte, despliegue y capacitación; financiamiento de fondos humanitarios y de innovación. El registro público es gratuito de consultar. |
| **7. Estructura de costos** | Hardware (placas ESP32, baterías, antenas, carcasas); desarrollo de firmware, contrato y panel; comisiones de Stellar (fracciones de centavo por transacción); logística de despliegue y capacitación; pruebas de campo. |
| **8. Métricas clave** | Tiempo desde que se genera un reporte hasta que llega al centro de mando; porcentaje de reportes que llegan sin pérdida; alcance efectivo entre nodos en escombros; reportes publicados en Stellar por hora; zonas revisadas sin duplicar; número de brigadas y municipios que lo usan en simulacros. |
| **9. Ventaja diferencial** | Combina hardware de bajo costo sin dependencia de la red celular con un registro público e inalterable que no pertenece a ninguna institución. Las radios no dejan registro y un servidor central exige que todas confíen en su operador; Marvin no necesita ninguna de las dos cosas. |
