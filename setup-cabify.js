# Agente de Movilidad RPP

Backend de automatización de reservas de taxi corporativo para Grupo RPP.

## Arquitectura

```
Netlify Form (public/index.html)
    ↓ POST /reservar
Express Server (server.js)
    ↓
Playwright Browser
    ├── Aló Taxi
    ├── Somara Corporativo
    └── Cabify para Empresas
    ↓
JSON con N° de reserva
    ↓
Formulario muestra confirmación al usuario
```

## Setup (una sola vez en tu laptop)

### 1. Instalar dependencias

```bash
npm install
npx playwright install chromium
```

### 2. Guardar sesiones de las plataformas

Ejecutar cada script una vez. Se abre Chrome, ingresas manualmente, cierras la ventana.

```bash
npm run setup-alotaxi   # Guarda sesión de Aló Taxi
npm run setup-somara    # Guarda sesión de Somara
npm run setup-cabify    # Guarda sesión de Cabify
```

Esto crea archivos en `sessions/` con las cookies autenticadas.

### 3. Deployar en Railway

1. Ir a [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Subir este proyecto a un repositorio de GitHub
3. Railway detecta `railway.json` y hace el deploy automáticamente
4. Copiar la URL del proyecto (ej: `https://movilidad-rpp.up.railway.app`)

### 4. Subir sesiones al servidor

Las sesiones (archivos en `sessions/`) NO van al repositorio de GitHub por seguridad.
Subirlas directamente al servidor de Railway:

```bash
# Instalar Railway CLI
npm install -g @railway/cli
railway login
railway up --service movilidad-rpp
```

O usar las variables de entorno de Railway para almacenar las cookies.

### 5. Actualizar la URL en el formulario

En `public/index.html`, cambiar:
```javascript
const API_URL = 'https://TU-PROYECTO.up.railway.app';
```
Por la URL real de Railway.

### 6. Subir el formulario a Netlify

Arrastrar `public/index.html` a [app.netlify.com/drop](https://app.netlify.com/drop)

## Renovar sesiones

Cuando una plataforma muestra error `sesion_expirada`:

1. Correr el script correspondiente en tu laptop:
```bash
npm run setup-alotaxi  # o setup-somara / setup-cabify
```
2. Subir el archivo `sessions/[plataforma]-cookies.json` al servidor Railway

## Variables de entorno (Railway)

| Variable | Descripción |
|---|---|
| `PORT` | Puerto (Railway lo asigna automáticamente) |
| `NODE_ENV` | `production` |

## Costos

- **Railway Hobby**: $5/mes (siempre encendido)
- **Netlify Free**: $0/mes (formulario estático)
- **Total**: ~$5/mes

## Contactos de cancelación

- Aló Taxi: 946 149 200
- Somara: 961 742 998
- Cabify: App Cabify para Empresas
