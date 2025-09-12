// =================== Config & constantes ===================
const STORAGE_KEY = 'checklist_state_v4';
const SCHEMA_VERSION = 1; // para migraciones futuras
const SHARE_PARAM = 's';   // query param para estado

// =================== Datos ===================
/** Mapa id → metadata */
const ITEMS = {
  // PREPARACIÓN
  bat_all:   {id:'bat_all',   cat:'prep',  title:'Baterías cargadas (cámaras/móviles/mics)', emoji:'🔋', help:'Carga ≥ 80% y ten baterías/PowerBank de respaldo.', critical:true},
  space_all: {id:'space_all', cat:'prep',  title:'Espacio en memoria OK', emoji:'💾', help:'≥ 20 GB libres en SD/SSD/teléfono. Formatea tarjetas si ya hiciste backup.', critical:true},
  notifs:    {id:'notifs',    cat:'prep',  title:'Modo avión / notificaciones silenciadas', emoji:'📵', help:'Evita vibraciones, notifs o llamadas durante la toma.', critical:true},
  vestuario: {id:'vestuario', cat:'prep',  title:'Vestuario & apariencia listos', emoji:'🧥', help:'Sin logos no permitidos; peinado/maquillaje; brillos en piel controlados.', critical:true},
  plan:      {id:'plan',      cat:'prep',  title:'Guion/estructura a mano', emoji:'📄', help:'Puntos clave, orden de tomas, tiempos.', critical:true},

  // —— PREP específicos de Canto ——
  ext_ok:    {id:'ext_ok',    cat:'prep',  title:'Extensiones eléctricas listas y en buen estado', emoji:'🔌', help:'Alargues y regletas sin falsos contactos; cinta para fijar; tomas libres.'},
  cam_chg:   {id:'cam_chg',   cat:'prep',  title:'Cámara cargada (batería OK)', emoji:'📸', help:'Batería principal ≥ 80% y repuesto a mano.', critical:true},
  cam_space: {id:'cam_space', cat:'prep',  title:'Cámara con espacio / memoria vacía', emoji:'🧠', help:'Si está llena, copia material a PC/NAS y formatea la tarjeta.', critical:true},

  // —— NUEVO (prep global) ——
  av_test: { 
    id:'av_test', 
    cat:'prep',  
    title:'Prueba de audio y video realizada', 
    emoji:'🎧📹', 
    help:'Graba 10–15 s y revisa que se ve y se escucha bien antes de iniciar.', 
    critical:true 
  },

  // CÁMARAS
  lens:      {id:'lens',      cat:'cams',  title:'Limpieza de lente', emoji:'🧼', help:'Usa pañito de microfibra, nunca camiseta o papel.', critical:true},
  settings:  {id:'settings',  cat:'cams',  title:'FPS & resolución correctos', emoji:'🎞️', help:'Clases: 1080p/30fps · Danza: 1080p/60fps · Entrevistas: 4K/30fps si se puede.'},
  wb:        {id:'wb',        cat:'cams',  title:'Balance de blancos fijo', emoji:'⚪', help:'Evita que cambie durante la grabación. Usa carta gris o un preset.'},
  stabil:    {id:'stabil',    cat:'cams',  title:'Trípode / estabilización fija', emoji:'📷', help:'Nivelado, firme y sin vibraciones.', critical:true},
  framing:   {id:'framing',   cat:'cams',  title:'Encuadre & foco', emoji:'🖼️', help:'Cabezas sin cortar, foco manual si es posible, regla de tercios.'},

  // AUDIO
  mic:       {id:'mic',       cat:'audio', title:'Micrófono conectado y con batería', emoji:'🎤', help:'Lavalier o boom cargado. Si es inalámbrico, revisa el transmisor.', critical:true},
  room:      {id:'room',      cat:'audio', title:'Ruido ambiente controlado', emoji:'🤫', help:'Cierra puertas/ventanas, avisa “grabando”, apaga ventiladores ruidosos.', critical:true},

  // —— AUDIO específico de Canto ——
  mic_conn:  {id:'mic_conn',  cat:'audio', title:'Micrófonos (inalámbricos/alámbricos) cargados y conectados', emoji:'🎙️', help:'Emparejados/plug-in, prueba de voz y monitoreo activo.', critical:true},

  // LUCES
  lights_on: {id:'lights_on', cat:'lights',title:'Iluminación estable', emoji:'💡', help:'Evita parpadeos y mezcla de temperaturas de color.'},
  direction: {id:'direction', cat:'lights',title:'Dirección de luz definida', emoji:'🎯', help:'Principal, relleno y contra si aplica.'},

  // —— LUCES específicos de Canto ——
  amb_color: {id:'amb_color', cat:'lights',title:'Luces de ambiente a color encendidas y ajustadas', emoji:'🌈', help:'Configura los colores que se van a usar y fija intensidades.', critical:true},
  key_white: {id:'key_white', cat:'lights',title:'Luces blancas ajustadas al foco principal', emoji:'🔦', help:'Key orientada al/la cantante; relleno/contra balanceados.', critical:true},

  // ARCHIVO
  slate:     {id:'slate',     cat:'file',  title:'Identificador / claqueta', emoji:'🎬', help:'Proyecto, escena, toma, fecha. Haz foto inicial a hoja con datos.'},
  backup:    {id:'backup',    cat:'file',  title:'Plan de backup decidido', emoji:'☁️', help:'Copia al terminar en disco + nube (Drive/NAS).'},

  // SET
  bg:        {id:'bg',        cat:'set',   title:'Fondo limpio / sin distracciones', emoji:'🧱', help:'Sin ruido visual; elementos de marca si aplica.', critical:true},
  props:     {id:'props',     cat:'set',   title:'Utilería revisada', emoji:'🎭', help:'Instrumentos/materiales listos y repuestos a mano.'},
  safety:    {id:'safety',    cat:'set',   title:'Seguridad en piso / cables', emoji:'🦺', help:'Cables pegados, sin riesgos de tropiezo.'},

  // —— SET específicos de Canto ——
  decor:     {id:'decor',     cat:'set',   title:'Decoración lista según concepto', emoji:'🧩', help:'Elementos estéticos coherentes con la pieza y sin recargar.', critical:true},
  furniture: {id:'furniture', cat:'set',   title:'Mobiliario listo (mesas, sillas) si se requiere', emoji:'🪑', help:'Estables, sin ruidos; ubícalos fuera de paso.', critical:true},
  instruments:{id:'instruments',cat:'set',  title:'Instrumentos afinados y listos', emoji:'🎸', help:'Piano/guitarra/ukelele/etc. afinados y en su base.', critical:true},
};

/** Presets */
const PRESETS = {
  general:    [],
  // Quitamos 'levels' y 'filename'
  entrevista: ['stabil','mic','room','wb','slate'],
  danza:      ['settings','stabil','framing','lights_on','direction'],
  // Quitamos 'levels'
  musica:     ['mic','framing','props','room'],

  // —— NUEVO: Canto ——
  // Sugerimos lo esencial para una toma de canto con acompañamiento e imagen cuidada
  canto: [
    'ext_ok',
    'bg','decor',
    'amb_color','key_white',
    'cam_chg','cam_space',
    'mic','mic_conn','room',
    'av_test',   // ← NUEVO
    'stabil',
    'instruments','furniture',
    'backup'
  ],
};

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
const presetSel = $('#preset');
const presetChip = $('#presetChip');
const compactToggle = $('#compactToggle');

// =================== Estado ===================
/**
 * state: { version:number, preset:string, compact:boolean, checks: { [id]: boolean } }
 */
let state = safeLoad();

function safeLoad(){
  // 1) Intentar importar desde URL ?s=
  const urlState = getStateFromURL();
  if (urlState){
    // Si el query trae algo válido, úsalo como base y persiste
    persist(urlState, true);
    return urlState;
  }
  // 2) LocalStorage
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return makeDefaultState();
    const parsed = JSON.parse(raw);
    return migrateIfNeeded(parsed);
  }catch{
    return makeDefaultState();
  }
}

function makeDefaultState(){
  const checks = {};
  Object.keys(ITEMS).forEach(id => checks[id] = false);
  return { version: SCHEMA_VERSION, preset: 'general', compact: false, checks };
}

function migrateIfNeeded(s){
  // Esquema simple por ahora; si cambia, hacemos transformaciones aquí.
  if (!s || typeof s !== 'object') return makeDefaultState();
  if (!s.checks) s.checks = {};
  for (const id of Object.keys(ITEMS)){
    if (typeof s.checks[id] !== 'boolean') s.checks[id] = false;
  }
  if (!s.preset) s.preset = 'general';
  if (typeof s.compact !== 'boolean') s.compact = false;
  s.version = SCHEMA_VERSION;
  return s;
}

// Debounce persist
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
  // Toggle modo compacto
  document.body.classList.toggle('compact', !!state.compact);

  // Preset UI
  if (presetSel) presetSel.value = state.preset;
  if (presetChip) presetChip.textContent = `Preset: ${labelForPreset(state.preset)}`;

  // Limpiar grids
  for (const k of Object.keys(areas)) areas[k].innerHTML = '';

  const suggested = new Set(PRESETS[state.preset] || []);

  // Agrupar por categoría
  const byCat = {prep:[], cams:[], audio:[], lights:[], file:[], set:[]};
  Object.values(ITEMS).forEach(it => byCat[it.cat].push(it));

  // Orden: sugeridos primero, luego alfabético
  for (const cat of Object.keys(byCat)){
    byCat[cat].sort((a,b)=>{
      const sa = suggested.has(a.id) ? 0 : 1;
      const sb = suggested.has(b.id) ? 0 : 1;
      return sa - sb || a.title.localeCompare(b.title, 'es');
    });

    const frag = document.createDocumentFragment();
    for (const it of byCat[cat]){
      frag.appendChild(renderCard(it, suggested.has(it.id), !!state.checks[it.id]));
    }
    areas[cat].appendChild(frag);
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
  const pct = Math.round((done/total)*100);

  if (progressEl && Number(progressEl.max) !== 100) progressEl.max = 100;
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
  // Cerrar tooltips al hacer click fuera
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
    // Feedback visual breve
    card.classList.toggle('done', !!t.checked);
    if (t.checked){
      card.classList.add('just-checked');
      setTimeout(()=>card.classList.remove('just-checked'), 200);
    }
    persist();
    updateProgress();
    updateCriticalAlert();
  }

  // Toggle de modo compacto
  if (t.id === 'compactToggle'){
    state.compact = !!t.checked;
    document.body.classList.toggle('compact', state.compact);
    persist();
  }
});

// Tooltips (abrir/cerrar con foco o click)
app.addEventListener('click', (e)=>{
  const btn = e.target.closest('.tip-btn');
  if (!btn) return;
  const tipId = btn.getAttribute('aria-controls');
  const tip = tipId && document.getElementById(tipId);
  if (!tip) return;

  const nowOpen = tip.hidden; // si estaba oculto, lo abrimos
  closeAllTooltips(tipId);
  tip.hidden = !nowOpen;
  tip.classList.toggle('show', nowOpen);
  btn.setAttribute('aria-expanded', String(nowOpen));
  if (nowOpen) {
    // mover foco al tooltip para accesibilidad
    tip.setAttribute('tabindex','-1');
    tip.focus({preventScroll:true});
  }
});

// =================== Controles globales ===================
// Reset
$('#btnReset')?.addEventListener('click', ()=>{
  if (!confirm('¿Borrar todas las marcas?')) return;
  for (const id of Object.keys(state.checks)) state.checks[id] = false;
  persist();
  renderAll();
});

// Compartir estado (texto + URL con estado)
$('#btnShare')?.addEventListener('click', async ()=>{
  const doneList = Object.values(ITEMS).filter(i=>state.checks[i.id]).map(i=>`✔ ${i.title}`).join('\n');
  const todoList = Object.values(ITEMS).filter(i=>!state.checks[i.id]).map(i=>`• ${i.title}`).join('\n');
  const stamp = new Date().toLocaleString();
  const txt = `Checklist Musicala — ${stamp}\nPreset: ${labelForPreset(state.preset)}\n\nListo:\n${doneList || '—'}\n\nPendiente:\n${todoList || '—'}`;

  // URL con estado
  const shareURL = withStateInURL(state);

  try{
    if (navigator.share){
      await navigator.share({title:'Checklist Musicala', text: txt, url: shareURL});
    }else{
      await navigator.clipboard.writeText(`${txt}\n\n${shareURL}`);
      alert('Estado copiado al portapapeles ✅');
    }
  }catch{
    // Fallback simple
    const ta = document.createElement('textarea');
    ta.value = `${txt}\n\n${shareURL}`;
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); ta.remove();
    alert('Estado copiado al portapapapeles ✅');
  }
});

// Preset selector
if (presetSel){
  presetSel.value = state.preset;
  presetSel.addEventListener('change', ()=>{
    const newPreset = presetSel.value;
    // Confirmar si marcar sugeridos
    const base = PRESETS[newPreset] || [];
    let clone = structuredClone(state);
    clone.preset = newPreset;

    if (base.length){
      const apply = confirm(`Preset “${labelForPreset(newPreset)}” seleccionado.\n\n¿Marcar como LISTOS los elementos base del preset?`);
      if (apply){
        for (const id of base) clone.checks[id] = true;
      }
    }

    state = clone;
    persist();
    renderAll();
  });
}

// Compact toggle init
if (compactToggle){
  compactToggle.checked = !!state.compact;
  document.body.classList.toggle('compact', state.compact);
}

// Acordeones (delegación)
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

// =================== URL state (codificación/decodificación) ===================
function encodeState(s){
  // Estado mínimo para compartir: {p: preset, c: compact, k: "bits" }
  const ids = Object.keys(ITEMS);
  const bits = ids.map(id => s.checks[id] ? '1' : '0').join('');
  const payload = JSON.stringify({p:s.preset, c:s.compact?1:0, k:bits});
  // Base64 URL-safe
  return btoa(unescape(encodeURIComponent(payload))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}

function decodeState(str){
  try{
    const pad = str.length % 4 ? ('===='.slice(str.length % 4)) : '';
    const b64 = str.replace(/-/g,'+').replace(/_/g,'/') + pad;
    const json = decodeURIComponent(escape(atob(b64)));
    const obj = JSON.parse(json);
    if (!obj || typeof obj !== 'object') return null;
    // reconstruir state completo
    const ids = Object.keys(ITEMS);
    const checks = {};
    const bits = String(obj.k || '');
    ids.forEach((id, idx)=> checks[id] = bits[idx] === '1');
    return migrateIfNeeded({
      version: SCHEMA_VERSION,
      preset: obj.p || 'general',
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
  // Limpiar el query param para no reimportar al recargar
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

// =================== Mount porcentaje (texto adicional) ===================
(function mountPercent(){
  if (!$('#percentTop')){
    const p = document.createElement('div');
    p.className = 'percent';
    p.id = 'percentTop';
    const container = document.querySelector('.progress');
    if (container) container.insertBefore(p, container.firstChild);
  }
})();

// =================== Init ===================
renderAll();
