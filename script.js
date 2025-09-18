// =================== Config & constantes ===================
const STORAGE_KEY = 'checklist_state_v5';
const SCHEMA_VERSION = 2; // versión de esquema nueva
const SHARE_PARAM = 's';   // query param para estado

// =================== Helpers DOM ===================
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

const areas = {
  prep:  $('#grid-prep'),
  cams:  $('#grid-cams'),
  audio: $('#grid-audio'),
  lights:$('#grid-lights'),
  file:  $('#grid-file'),
  set:   $('#grid-set'),
};

const progressEl = $('#prog');
const progLbl = $('#progLbl');
const progressLive = $('#progressLive');
const app = $('#app');
const presetHero = $('#presetHero');
const content = $('#content');

// =================== Estado ===================
/**
 * state: { version:number, preset:string, compact:boolean, checks: { [id]: boolean } }
 */
let ITEMS = {};
let PRESETS = {};
let SECTIONS = [];
let state = null;

// =================== Carga de JSON ===================
async function loadData(){
  try{
    const resp = await fetch('checklist.json');
    const data = await resp.json();
    SECTIONS = data.sections || [];
    PRESETS  = data.presets  || {};
    ITEMS    = {};
    for(const item of (data.items||[])) ITEMS[item.id] = item;

    // Inicializar estado
    state = safeLoad();
    renderAll();
  }catch(err){
    console.error("Error cargando checklist.json", err);
  }
}

// =================== Estado: load/save ===================
function safeLoad(){
  // 1) Importar desde URL ?s= (solo ahí respetamos el estado compartido)
  const urlState = getStateFromURL();
  if (urlState){
    persist(urlState, true);
    return urlState;
  }

  // 2) Sin estado en URL → arranca limpio (sin preset ni checks)
  const fresh = makeDefaultState();
  fresh.preset = ""; // nada seleccionado
  for (const id of Object.keys(fresh.checks)) {
    fresh.checks[id] = false;
  }
  return fresh;
}

function makeDefaultState(){
  const checks = {};
  Object.keys(ITEMS).forEach(id => checks[id] = false);
  return { version: SCHEMA_VERSION, preset: '', compact: false, checks };
}

function migrateIfNeeded(s){
  if (!s || typeof s !== 'object') return makeDefaultState();
  if (!s.checks) s.checks = {};
  for (const id of Object.keys(ITEMS)){
    if (typeof s.checks[id] !== 'boolean') s.checks[id] = false;
  }
  if (!s.preset) s.preset = '';
  if (typeof s.compact !== 'boolean') s.compact = false;
  s.version = SCHEMA_VERSION;
  return s;
}

let persistTimer = null;
function persist(next = state, immediate = false){
  const writer = () => {
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }catch{}
  };
  if (immediate){
    clearTimeout(persistTimer);
    writer();
  }else{
    clearTimeout(persistTimer);
    persistTimer = setTimeout(writer, 150);
  }
}

// =================== Render ===================
function renderAll(){
  if (!state || !state.preset){
    content.hidden = true;
    return;
  }
  content.hidden = false;

  // Limpiar grids
  for (const k of Object.keys(areas)) areas[k].innerHTML = '';

  const suggested = new Set(PRESETS[state.preset] || []);

  // Agrupar por categoría
  const byCat = {};
  for (const s of SECTIONS) byCat[s.id] = [];
  Object.values(ITEMS).forEach(it => {
    if (byCat[it.cat]) byCat[it.cat].push(it);
  });

  // Orden: sugeridos primero, luego alfabético
  for (const cat of Object.keys(byCat)){
    byCat[cat].sort((a,b)=>{
      const sa = suggested.has(a.id) ? 0 : 1;
      const sb = suggested.has(b.id) ? 0 : 1;
      return sa - sb || (a.order||0) - (b.order||0) || a.title.localeCompare(b.title, 'es');
    });

    const frag = document.createDocumentFragment();
    for (const it of byCat[cat]){
      frag.appendChild(renderCard(it, suggested.has(it.id), !!state.checks[it.id]));
    }
    areas[cat]?.appendChild(frag);
  }

  updateProgress();
  updateCriticalAlert();
}

function renderCard(it, isSuggested, isDone){
  const tpl = $('#card-tpl');
  const node = tpl.content.cloneNode(true);
  const card = node.querySelector('.card');
  card.dataset.id = it.id;

  const emojiEl = node.querySelector('.card-emoji');
  const titleEl = node.querySelector('.card-title');
  const helpEl = node.querySelector('.card-help');
  const badgesEl = node.querySelector('.badges');
  const criticalPill = node.querySelector('.pill-critical');
  const chk = node.querySelector('.bigchk');
  const tipBtn = node.querySelector('.tip-btn');
  const tooltip = node.querySelector('.tooltip');
  const tooltipInner = node.querySelector('.tooltip-inner');

  emojiEl.textContent = it.emoji;
  titleEl.textContent = it.title;
  helpEl.textContent = it.help || '';
  helpEl.id = `help-${it.id}`;

  if (it.critical) criticalPill.hidden = false;
  if (isSuggested){
    badgesEl.innerHTML = `<span class="pill">Sugerido (${labelForPreset(state.preset)})</span>`;
    card.classList.add('suggested');
  }

  chk.checked = isDone;
  if (isDone) card.classList.add('done');

  // Tooltip accesible
  const tipId = `tip-${it.id}`;
  tooltip.id = tipId;
  tipBtn.setAttribute('aria-controls', tipId);
  tipBtn.setAttribute('aria-expanded', 'false');

  tooltipInner.textContent = it.help || 'Sin notas adicionales.';

  return node;
}

function labelForPreset(value){
  const map = {
    general: 'General',
    entrevista: 'Entrevista',
    danza: 'Danza / Escénico',
    musica: 'Música',
    canto: 'Canto',
  };
  return map[value] || value;
}

// =================== Progreso & críticos ===================
function updateProgress(){
  const total = Object.keys(ITEMS).length;
  const done = Object.keys(state.checks).filter(id => state.checks[id]).length;
  const pct = total ? Math.round((done/total)*100) : 0;

  if (progressEl) progressEl.value = pct;
  if (progLbl) progLbl.textContent = `${pct}% listo · ${done} de ${total}`;
  if (progressLive) progressLive.textContent = `Progreso actualizado: ${done} de ${total} elementos, ${pct} por ciento.`;
}

function updateCriticalAlert(){
  const missingCritical = Object.values(ITEMS).filter(i => i.critical && !state.checks[i.id]);
  const alertBox = $('#criticalAlert');
  const alertList = $('#criticalList');
  if (!alertBox || !alertList) return;

  alertList.innerHTML = '';
  if (missingCritical.length){
    alertBox.classList.remove('ok');
    alertBox.querySelector('.alert-title').textContent = '⚠️ Elementos críticos sin marcar:';
    for (const it of missingCritical){
      const li = document.createElement('li');
      li.textContent = it.title;
      alertList.appendChild(li);
    }
  } else {
    alertBox.classList.add('ok');
    alertBox.querySelector('.alert-title').textContent = '✅ Elementos críticos listos. ¡Puedes grabar con tranquilidad!';
  }
}

// =================== Tooltips helpers ===================
function closeAllTooltips(exceptId = null){
  $$('.tooltip.show').forEach(t=>{
    if (exceptId && t.id === exceptId) return;
    t.classList.remove('show'); t.hidden = true;
    const btn = app.querySelector(`.tip-btn[aria-controls="${t.id}"]`);
    if (btn) btn.setAttribute('aria-expanded','false');
  });
}

document.addEventListener('click', (e)=>{
  const isTipOrBtn = e.target.closest('.tooltip, .tip-btn');
  if (!isTipOrBtn) closeAllTooltips();
});

document.addEventListener('keydown', (e)=>{
  if (e.key === 'Escape') closeAllTooltips();
});

// =================== Delegación de eventos (app) ===================
app.addEventListener('change', (e)=>{
  const t = e.target;

  // Checkboxes dentro de tarjetas
  if (t.classList.contains('bigchk')){
    const card = t.closest('.card');
    if (!card) return;
    const id = card.dataset.id;
    state.checks[id] = !!t.checked;
    card.classList.toggle('done', !!t.checked);
    if (t.checked){
      card.classList.add('just-checked');
      setTimeout(()=>card.classList.remove('just-checked'), 200);
    }
    persist();
    updateProgress();
    updateCriticalAlert();
  }
});

// Tooltips
app.addEventListener('click', (e)=>{
  const btn = e.target.closest('.tip-btn');
  if (!btn) return;
  const tipId = btn.getAttribute('aria-controls');
  const tip = tipId && document.getElementById(tipId);
  if (!tip) return;

  const nowOpen = tip.hidden;
  closeAllTooltips(tipId);
  tip.hidden = !nowOpen;
  tip.classList.toggle('show', nowOpen);
  btn.setAttribute('aria-expanded', String(nowOpen));
  if (nowOpen) {
    tip.setAttribute('tabindex','-1');
    tip.focus({preventScroll:true});
  }
});

// =================== Controles globales ===================
function applyPresetChange(newPreset){
  let clone = makeDefaultState();
  clone.preset = newPreset;
  state = clone;
  persist();
  renderAll();
}

if (presetHero){
  presetHero.value = state?.preset || '';
  presetHero.addEventListener('change', ()=>{
    applyPresetChange(presetHero.value);
  });
}

// Acordeones
document.addEventListener('click', (e)=>{
  const btn = e.target.closest('[data-acc-btn]');
  if (!btn) return;
  const panelId = btn.getAttribute('aria-controls');
  const panel = panelId && document.getElementById(panelId);
  if (!panel) return;

  const expanded = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', String(!expanded));
  btn.textContent = expanded ? 'Expandir' : 'Contraer';
  if (expanded){
    panel.setAttribute('hidden','');
  }else{
    panel.removeAttribute('hidden');
  }
});

// =================== URL state ===================
function encodeState(s){
  const ids = Object.keys(ITEMS);
  const bits = ids.map(id => s.checks[id] ? '1' : '0').join('');
  const payload = JSON.stringify({p:s.preset, c:s.compact?1:0, k:bits});
  return btoa(unescape(encodeURIComponent(payload))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}

function decodeState(str){
  try{
    const pad = str.length % 4 ? ('===='.slice(str.length % 4)) : '';
    const b64 = str.replace(/-/g,'+').replace(/_/g,'/') + pad;
    const json = decodeURIComponent(escape(atob(b64)));
    const obj = JSON.parse(json);
    const ids = Object.keys(ITEMS);
    const checks = {};
    const bits = String(obj.k || '');
    ids.forEach((id, idx)=> checks[id] = bits[idx] === '1');
    return migrateIfNeeded({
      version: SCHEMA_VERSION,
      preset: obj.p || '',
      compact: !!obj.c,
      checks
    });
  }catch{
    return null;
  }
}

function withStateInURL(s){
  const u = new URL(location.href);
  u.searchParams.set(SHARE_PARAM, encodeState(s));
  return u.toString();
}

function getStateFromURL(){
  const u = new URL(location.href);
  const enc = u.searchParams.get(SHARE_PARAM);
  if (!enc) return null;
  const decoded = decodeState(enc);
  u.searchParams.delete(SHARE_PARAM);
  history.replaceState(null,'',u.toString());
  return decoded;
}

// =================== Sync entre pestañas ===================
window.addEventListener('storage', (e)=>{
  if (e.key === STORAGE_KEY && e.newValue){
    try{
      const incoming = JSON.parse(e.newValue);
      state = migrateIfNeeded(incoming);
      renderAll();
    }catch{}
  }
});

// =================== Init ===================
loadData();
