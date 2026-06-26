const express = require('express');
const cors = require('cors');
const { reservarAloTaxi } = require('./alotaxi');
const { reservarSomara } = require('./somara');
const { reservarCabify } = require('./cabify');
const { seleccionarPlataforma } = require('./selector');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.post('/reservar', async (req, res) => {
  const datos = req.body;
  console.log(`\n🚗 RESERVA: ${datos.nombre} → ${datos.destino}`);
  try {
    const plataforma = datos.plataforma || seleccionarPlataforma(datos);
    let resultado;
    if (plataforma === 'ALO_TAXI') resultado = await reservarAloTaxi(datos);
    else if (plataforma === 'SOMARA') resultado = await reservarSomara(datos);
    else resultado = await reservarCabify(datos);
    console.log(`✅ N° ${resultado.numero_reserva}`);
    res.json({ ok: true, ...resultado });
  } catch (error) {
    console.error(`❌ ${error.message}`);
    if (error.message.startsWith('SESION_EXPIRADA_')) {
      res.status(401).json({ ok: false, error: 'sesion_expirada', mensaje: 'Sesión expirada. Renueva cookies.' });
    } else {
      res.status(500).json({ ok: false, error: error.message });
    }
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`\n🟢 Movilidad RPP corriendo en :${PORT}\n`));
