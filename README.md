# Marvin

## Requisitos

- [Node.js](https://nodejs.org/) 20 o superior (incluye npm)
- Git
- Solo para compilar o probar el contrato: [Rust](https://www.rust-lang.org/tools/install) con el target `wasm32v1-none` (`rustup target add wasm32v1-none`)

## Instalación

```bash
git clone https://github.com/migux97/Marvin.git
cd Marvin/frontend
npm install
```

## Cómo correrlo

```bash
npm run dev
```

Abrir http://localhost:5173 en el navegador. El front ya está conectado al contrato desplegado en Stellar Testnet (`frontend/src/contrato.json`).

Para generar la versión de producción y verla localmente:

```bash
npm run build
npm run preview
```

Contrato (opcional):

```bash
cd contracts
cargo test                                              # pruebas del contrato
cargo build --release --target wasm32v1-none            # compila el .wasm
cp target/wasm32v1-none/release/marvin.wasm dist/       # lo deja listo para desplegar
cd ../frontend && npm run desplegar -- --nuevo          # despliega uno nuevo en Testnet
```

---

En el desarrollo de este proyecto usamos herramientas de inteligencia artificial.
