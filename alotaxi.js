{
  "name": "movilidad-rpp",
  "version": "1.0.0",
  "description": "Agente de reservas de taxi corporativo - Grupo RPP",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "setup-alotaxi": "node scripts/setup-alotaxi.js",
    "setup-somara": "node scripts/setup-somara.js",
    "setup-cabify": "node scripts/setup-cabify.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "playwright": "^1.40.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
