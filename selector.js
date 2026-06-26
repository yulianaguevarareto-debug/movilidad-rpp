const SOMARA = ['barranco','brena','jesus maria','la victoria','lima','cercado','lince','magdalena','miraflores','pueblo libre','san isidro','san miguel','surquillo'];
const norm = s => (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const inSomara = a => SOMARA.some(d => norm(a).includes(d));
function seleccionarPlataforma(datos) {
  if (datos.tipo === 'ahora') return 'CABIFY';
  if (inSomara(datos.destino) || inSomara(datos.recojo)) return 'SOMARA';
  return 'ALO_TAXI';
}
module.exports = { seleccionarPlataforma };
