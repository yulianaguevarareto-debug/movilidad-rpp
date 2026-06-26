const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const COOKIES = path.join(__dirname, 'sessions', 'cabify-cookies.json');
let ctx = null;

async function getCtx() {
  if (ctx) return ctx;
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  if (fs.existsSync(COOKIES)) await ctx.addCookies(JSON.parse(fs.readFileSync(COOKIES, 'utf8')));
  return ctx;
}

async function reservarCabify(datos) {
  const context = await getCtx();
  const page = await context.newPage();
  try {
    await page.goto('https://cabify.com/app/order-new', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    const close = page.locator('button:has-text("No, gracias")').first();
    if (await close.isVisible({ timeout: 2000 }).catch(() => false)) await close.click();
    await page.locator('text=Para un invitado').first().click();
    await page.locator('input[placeholder*="pasajero"]').first().fill(datos.nombre);
    await page.locator('input[type="tel"]').first().fill(datos.celular);
    const ori = page.locator('input[aria-label*="rigen"], input[placeholder*="rigen"]').first();
    await ori.click(); await ori.type(datos.recojo, { delay: 50 }); await page.waitForTimeout(1500);
    const s1 = page.locator('[class*="suggestion"], [role="option"]').first();
    if (await s1.isVisible({ timeout: 2000 }).catch(() => false)) await s1.click();
    const dest = page.locator('input[aria-label*="estino"], input[placeholder*="estino"]').first();
    await dest.click(); await dest.type(datos.destino, { delay: 50 }); await page.waitForTimeout(1500);
    const s2 = page.locator('[class*="suggestion"], [role="option"]').first();
    if (await s2.isVisible({ timeout: 2000 }).catch(() => false)) await s2.click();
    await page.waitForTimeout(1000);
    const btn = page.locator('button:has-text("Pedir un viaje")').first();
    await btn.waitFor({ state: 'visible', timeout: 5000 });
    await btn.click(); await page.waitForTimeout(4000);
    return { plataforma: 'Cabify para Empresas', numero_reserva: 'Ver app Cabify', pasajero: datos.nombre, celular: datos.celular, recojo: datos.recojo, destino: datos.destino, fecha_hora: 'Inmediato', contacto_cancelacion: 'App Cabify' };
  } finally { await page.close(); }
}
module.exports = { reservarCabify };
