const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const COOKIES = path.join(__dirname, 'sessions', 'somara-cookies.json');
let ctx = null;

async function getCtx() {
  if (ctx) return ctx;
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  if (fs.existsSync(COOKIES)) await ctx.addCookies(JSON.parse(fs.readFileSync(COOKIES, 'utf8')));
  return ctx;
}

async function reservarSomara(datos) {
  const context = await getCtx();
  const page = await context.newPage();
  try {
    await page.goto('https://intranet.somaracorporativo.net/default/solicitar-servicio', { waitUntil: 'networkidle', timeout: 30000 });
    if (await page.locator('text=Iniciar Sesión').count() > 0) throw new Error('SESION_EXPIRADA_SOMARA');
    const ori = page.locator('input[placeholder*="ecogemos"]').first();
    await ori.fill(datos.recojo); await page.waitForTimeout(1200);
    const dest = page.locator('input[placeholder*="llevamos"]').first();
    await dest.click(); await dest.type(datos.destino, { delay: 50 }); await page.waitForTimeout(1200);
    const s = page.locator('li[class*="pac"]').first();
    if (await s.isVisible({ timeout: 2000 }).catch(() => false)) await s.click();
    const opTrigger = page.locator('p-dropdown[placeholder*="pci"] .p-dropdown-trigger').first();
    await opTrigger.click(); await page.waitForTimeout(300);
    await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter'); await page.waitForTimeout(500);
    await page.locator('input[placeholder="Teléfono"]').first().fill(datos.celular);
    await page.locator('textarea[placeholder*="ombre"]').first().fill(datos.nombre);
    const mt = page.locator('p-dropdown[placeholder*="otivo"] .p-dropdown-trigger').first();
    await mt.click(); await page.waitForTimeout(600);
    await page.evaluate((motivo) => {
      const panel = document.querySelector('.p-dropdown-panel');
      if (!panel) return;
      const t = Array.from(panel.querySelectorAll('li')).find(l => l.innerText?.includes(motivo));
      if (t) t.click();
    }, datos.motivo || 'COMISIONES PERIODISTICAS');
    if (datos.tipo === 'agendar' && datos.fecha) {
      await page.locator('input[type="date"]').first().fill(datos.fecha);
      await page.locator('input[type="time"]').first().fill(datos.hora || '');
    }
    await page.locator('button:has-text("Solicitar servicio")').first().click();
    await page.waitForTimeout(3000);
    const txt = await page.locator('.alert, .toast').first().textContent({ timeout: 5000 }).catch(() => '');
    const m = txt.match(/\d{4,}/);
    return { plataforma: 'Somara Corporativo', numero_reserva: m ? m[0] : 'Ver plataforma', pasajero: datos.nombre, celular: datos.celular, recojo: datos.recojo, destino: datos.destino, fecha_hora: datos.tipo === 'ahora' ? 'Inmediato' : `${datos.fecha} ${datos.hora}`, contacto_cancelacion: '961 742 998' };
  } finally { await page.close(); }
}
module.exports = { reservarSomara };
