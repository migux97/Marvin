# Evidencia de despliegue en Stellar Testnet

> Generado automáticamente por `frontend/scripts/despliegue.ts` el 2026-10-19T02:15:07.385Z.

| Dato | Valor |
| --- | --- |
| Red | Stellar testnet (https://soroban-testnet.stellar.org) |
| Contrato | [`CD5LRX24DHEDDHS47TN7IFBD4EMAZSLDTABA7Z7UPDYN3I7ZGI5RRGDR`](https://stellar.expert/explorer/testnet/contract/CD5LRX24DHEDDHS47TN7IFBD4EMAZSLDTABA7Z7UPDYN3I7ZGI5RRGDR) |
| Cuenta administradora | [`GCASTATANR2VXZHM5J2BQQ6HRFKBEJ2RQPP2TWAWV3QL2QAEFCWRBSQT`](https://stellar.expert/explorer/testnet/account/GCASTATANR2VXZHM5J2BQQ6HRFKBEJ2RQPP2TWAWV3QL2QAEFCWRBSQT) |
| WASM (SHA-256) | `c3dbb3f3a1b5a5ef1eb552cb65aa9644df955039f61c0d874d9219749c9fc3ed` |
| Subida del WASM | [e70caf7ed6d54e0c…](https://stellar.expert/explorer/testnet/tx/e70caf7ed6d54e0cc92aab26266b7da75065b0925ea4fc7e4cda1b32a14ad811) |
| Creación del contrato | [c85c0b190a7f374c…](https://stellar.expert/explorer/testnet/tx/c85c0b190a7f374c7ef4a32d6910dac6d5c556c4fd15522166e4393f60f5fa7c) |

## Nodos registrados

| Nodo | Brigada | Llave pública | Transacción |
| --- | --- | --- | --- |
| N1 | Bomberos Norte | `bfaa2b910f186630…` | [9b2a460a92…](https://stellar.expert/explorer/testnet/tx/9b2a460a9207f3b943b94770a07049bb25f1b13d2e13a5b59d1d779c49d6f72c) |
| N2 | Protección Civil Municipal | `3a52252f3fa0c811…` | [0d9b7821e8…](https://stellar.expert/explorer/testnet/tx/0d9b7821e88e73771878a7189c0d60b3021cb34725b284de26f7d5c4028d4b3d) |
| N3 | Brigada Voluntaria Centro | `779ead0bb911d394…` | [5fefd7b293…](https://stellar.expert/explorer/testnet/tx/5fefd7b2939842043b0ff128ece04dc99640d333721d824affdbd2f7d93a53dc) |
| N4 | Cruz Roja | `017ace7051c695c2…` | [39aff35ba8…](https://stellar.expert/explorer/testnet/tx/39aff35ba80946cf23e56a13769a9c00ce59aebe461d5f8403cd57bb9ce7eaf2) |
| N5 | Búsqueda y Rescate Urbano | `6f7a05120528f8d5…` | [d51b17261a…](https://stellar.expert/explorer/testnet/tx/d51b17261a94eee9c63e5bab0657e60df9767e22d2aae526c4bcb904a18a1be3) |

## Pruebas en la red

| # | Prueba | Resultado |
| :-: | --- | --- |
| 1 | La puerta de enlace publica un reporte firmado por N1 | ✅ Registrado en el ledger 5270504 · [ver transacción](https://stellar.expert/explorer/testnet/tx/7b91f8fde0c74f4d16a472befc6914073c628bd4f99a321aea01ab8adbab62d6) |
| 2 | Consulta pública del hash, sin firmar | ✅ Devuelve ledger 5270504 y la llave de N1 |
| 3 | Reporte de un nodo no registrado | ✅ Rechazado: Nodo no autorizado en el contrato |
| 4 | El mismo reporte publicado dos veces | ✅ Rechazado: El reporte ya estaba registrado |
| 5 | Firma falsa usando la llave de N2 | ✅ Rechazado por la verificación ed25519 del contrato |
