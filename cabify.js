const express = require('express');
const cors = require('cors');
const { reservarAloTaxi } = require('./platforms/alotaxi');
const { reservarSomara } = require('./platforms/somara');
const { reservarCabify } = require('./platforms/cabify');
const { seleccionarPlataforma } = require('./utils/selector');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static('public'));

// ─── Endpoint principal ─────────────────────────────────────────────────────
app.post('/reservar', async (req, res) => {
  const datos = req.body;

  console.log(`\n🚗 NUEVA RESERVA: ${datos.nombre} → ${datos.destino} [${datos.tipo}]`);

  try {
    const plataforma = datos.plataforma || seleccionarPlataforma(datos);
    console.log(`   Plataforma: ${plataforma}`);

    let resultado;

    switch (plataforma) {
      case 'ALO_TAXI':
        resultado = await reservarAloTaxi(datos);
        break;
      case 'SOMARA':
        resultado = await reservarSomara(datos);
        break;
      case 'CABIFY':
        resultado = await reservarCabify(datos);
        break;
      default:
        throw new Error('Plataforma no reconocida: ' + plataforma);
    }

    console.log(`✅ Reserva confirmada: N° ${resultado.numero_reserva}`);
    res.json({ ok: true, ...resultado });

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);

    if (error.message.startsWith('SESION_EXPIRADA_')) {
      const plataforma = error.message.replace('SESION_EXPIRADA_', '');
      res.status(401).json({
        ok: false,
        error: 'sesion_expirada',
        plataforma,
        mensaje: `La sesión de ${plataforma} expiró. Corre: npm run setup-${plataforma.toLowerCase()}`
      });
    } else {
      res.status(500).json({
        ok: false,
        error: error.message,
        mensaje: 'Error al ejecutar la reserva. Intenta de nuevo.'
      });
    }
  }
});

// ─── Health check ─────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Inicio ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🟢 Servidor Movilidad RPP corriendo en puerto ${PORT}`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`\n   Sesiones activas:`);
  ['alotaxi', 'somara', 'cabify'].forEach(p => {
    const fs = require('fs');
    const exists = fs.existsSync(`./sessions/${p}-cookies.json`);
    console.log(`   ${exists ? '✅' : '❌'} ${p}`);
  });
  console.log('');
});
