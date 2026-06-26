// scripts/setup-alotaxi.js
// Ejecutar UNA vez en tu laptop para guardar la sesión de Aló Taxi
// Comando: npm run setup-alotaxi

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('\n🔐 SETUP ALÓ TAXI');
  console.log('─────────────────────────────────────────');
  console.log('1. Se abrirá Chrome con Aló Taxi');
  console.log('2. Ingresa con tu usuario y contraseña');
  console.log('3. Cuando estés dentro del sistema, cierra esta ventana');
  console.log('─────────────────────────────────────────\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  await page.goto('https://intranet.alotaxis.com');
  console.log('✅ Chrome abierto. Ingresa manualmente y cierra la ventana del navegador cuando termines.\n');

  try {
    await page.waitForEvent('close', { timeout: 300000 }); // 5 minutos máximo
  } catch (e) {}

  const cookies = await context.cookies();
  const storage = await context.storageState();

  const sessionDir = path.join(__dirname, '../sessions');
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir);

  fs.writeFileSync(
    path.join(sessionDir, 'alotaxi-cookies.json'),
    JSON.stringify(cookies, null, 2)
  );

  console.log('✅ Sesión de Aló Taxi guardada correctamente.');
  console.log('   Ya puedes deployar el servidor.\n');

  await browser.close();
  process.exit(0);
})();
