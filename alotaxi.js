const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const COOKIES = path.join(__dirname, 'sessions', 'alotaxi-cookies.json');
const MOTIVO_STEPS = { 'COMISIONES PERIODISTICAS': 2, 'HORARIO LABORAL ENTRE LAS 12:00 AM - 06:00 AM': 3, 'INVITADOS PARA ENTREVISTAS': 4 };
let ctx = null;

async function getCtx() {
  if (ctx) return ctx;
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  if (fs.existsSync(COOKIES)) await ctx.addCookies(JSON.parse(fs.readFileSync(COOKIES, 'utf8')));
  return ctx;
}

async function reservarAloTaxi(datos) {
  const context = await getCtx();
  const page = await context.newPage();
  try {
    await page.goto('https://intranet.alotaxis.com/default/solicitar-servicio', { waitUntil: 'networkidle', timeout: 30000 });
    if (await page.locator('input[type="password"]').count() > 0) throw new Error('SESION_EXPIRADA_ALO_TAXI');
    await page.locator('a:has-text("Para visita"), button:has-text("Para visita")').first().click();
    await page.waitForTimeout(500);
    if (datos.tipo === 'agendar') {
      await page.locator('label:has-text("Reserva")').first().click();
      await page.locator('input[type="date"]').first().fill(datos.fecha || '');
      await page.locator('input[type="time"]').first().fill(datos.hora || '');
    }
    const ori = page.locator('input[placeholder*="artida"], input[placeholder*="ecojo"]').first();
    await ori.fill(datos.recojo); await page.waitForTimeout(1200);
    const s1 = page.locator('li[class*="item"], .pac-item').first();
    if (await s1.isVisible({ timeout: 2000 }).catch(() => false)) await s1.click();
    const dest = page.locator('input[placeholder*="estino"]').first();
    await dest.click(); await dest.type(datos.destino, { delay: 50 }); await page.waitForTimeout(1200);
    const s2 = page.locator('li[class*="item"], .pac-item').first();
    if (await s2.isVisible({ timeout: 2000 }).catch(() => false)) await s2.click();
    await page.locator('input[placeholder*="el"]').last().fill(datos.celular);
    await page.locator('input[placeholder*="ombre"]').last().fill(datos.nombre);
    const steps = MOTIVO_STEPS[datos.motivo] || 2;
    const mt = page.locator('[aria-label*="otivo"] .dropdown-toggle').first();
    await mt.click(); await page.waitForTimeout(200);
    for (let i = 0; i < steps; i++) { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(80); }
    await page.keyboard.press('Enter');
    await page.locator('button:has-text("Solicitar")').first().click();
    await page.waitForTimeout(3000);
    const txt = await page.locator('.alert, .toast, [class*="success"]').first().textContent({ timeout: 5000 }).catch(() => '');
    const m = txt.match(/\d{4,}/);
    return { plataforma: 'Aló Taxi', numero_reserva: m ? m[0] : 'Ver plataforma', pasajero: datos.nombre, celular: datos.celular, recojo: datos.recojo, destino: datos.destino, fecha_hora: datos.tipo === 'ahora' ? 'Inmediato' : `${datos.fecha} ${datos.hora}`, contacto_cancelacion: '946 149 200' };
  } finally { await page.close(); }
}
module.exports = { reservarAloTaxi };
