# Propuesta individual — Emanuel Guzman

## El problema
Cuando ocurre un sismo u otro desastre natural en América Latina, los equipos de rescate pierden la comunicación justo en las horas en que más la necesitan, porque la infraestructura de telecomunicaciones es frágil y se cae o queda intermitente.

## ¿Quién lo sufre?
Lo sufren los equipos de rescate (bomberos, protección civil, brigadas voluntarias y cuerpos de emergencia) que trabajan en la zona afectada y necesitan coordinarse: reportar víctimas localizadas, zonas colapsadas, recursos disponibles y rutas bloqueadas. También lo sufren los equipos de telecomunicaciones que intentan restablecer el servicio, los centros de mando que toman decisiones sin información actualizada y, al final, las personas atrapadas o damnificadas, cuya atención depende de que la información llegue a tiempo.

La región es especialmente vulnerable: gran parte de su territorio está sobre zonas sísmicas activas (el Cinturón de Fuego del Pacífico) y también enfrenta huracanes, inundaciones y deslaves. A esto se suma una infraestructura antisísmica y de telecomunicaciones pobre fuera de las grandes ciudades: antenas sin respaldo de energía, pocos enlaces redundantes y redes que se saturan en cuanto todos intentan conectarse al mismo tiempo.

## ¿Cómo se resuelve hoy y qué cuesta?
Hoy el flujo de información en una emergencia funciona así:
1. Ocurre el desastre y las antenas celulares y enlaces de internet de la zona se caen, se quedan sin energía o se saturan.
2. Los rescatistas intentan comunicarse con sus teléfonos móviles; cada uno depende de tener señal propia, y la red colapsa porque todos se conectan a la vez.
3. Se recurre a radios VHF/UHF o satelitales, que son caros, escasos, no dejan un registro escrito de lo reportado y no todos los equipos los tienen.
4. La información se transmite de voz en voz o en papel hasta un centro de mando, que la consolida a mano.
5. Cuando se recupera la conectividad, los datos se suben a servidores centralizados que, en estas situaciones, también sufren intermitencia; la información llega tarde, incompleta o duplicada, y otros equipos no pueden consultarla hasta que ese servidor vuelve a estar disponible.

El costo se mide en tiempo, que en un rescate significa vidas: las primeras 72 horas son críticas para encontrar sobrevivientes. Además, el equipo satelital o de radio profesional tiene un costo alto por unidad, lo que impide que cada brigada cuente con uno.

## Propuesta de solución
Un software dedicado a emergencias, pensado para equipos de rescate y de telecomunicaciones, que funciona sobre hardware de bajo costo:

- **Red local sin internet:** microcontroladores ESP32 forman una red de malla usando el protocolo ESP-NOW, que permite comunicación directa entre dispositivos a más de 350 metros entre cada uno, sin router ni internet. Los mensajes saltan de un nodo a otro hasta llegar a su destino.
- **Operación offline primero:** la gran mayoría de los dispositivos funciona sin conexión. Todas las operaciones (reportes, ubicaciones, estados de rescate) se guardan localmente en cada nodo.
- **Un único punto de acceso:** solo un nodo necesita salida a internet (satelital, celular o el primer enlace que se recupere). Así no todos los rescatistas tienen que conectarse desde sus móviles a la vez, lo que evita saturar una red ya debilitada.
- **Mensajes ligeros:** el protocolo está optimizado para que cada comunicación ocupe como máximo unos pocos kilobytes, fácil de transmitir por enlaces lentos o inestables.
- **Publicación en la blockchain de Stellar:** cuando el punto de acceso tiene conexión, libera las operaciones acumuladas a la red de Stellar, cifradas o no según su sensibilidad. Cualquier otro equipo, en cualquier lugar, recibe la información simplemente consultando la blockchain, sin depender de que un servidor central específico esté en línea.

## ¿Por qué creo que blockchain podría aportar?
Mi hipótesis es que en un desastre participan muchas organizaciones distintas (gobierno, protección civil, bomberos, ONG, voluntarios, operadoras de telecomunicaciones) que no comparten un mismo servidor ni confían necesariamente en que otro lo mantenga disponible. Hoy la información queda concentrada en servidores centralizados que, justo en la emergencia, fallan o quedan intermitentes. Una red pública como Stellar ofrece un registro compartido, replicado en muchos nodos alrededor del mundo, que ninguna organización controla y que sigue disponible aunque la infraestructura local caiga. Además, el historial de reportes queda inalterable y con marca de tiempo, lo que sirve para auditar la respuesta y coordinar la ayuda después. Stellar encaja por sus bajas comisiones y confirmaciones en pocos segundos. Es una hipótesis a validar, no una certeza: hay que comprobar el alcance real de ESP-NOW en zonas de escombros y cuánta información cabe de forma práctica en cada transacción.
