// 獨立網頁用的精簡執行環境：取代原 dashboard 的 dash 物件。
// 讀取 data/ 底下的 JSON、計算衍生資料、管理篩選狀態（寫進網址），並在狀態或寬度改變時重畫。
(function () {
  const DATASETS = ['categories', 'capabilities', 'memberships', 'processes', 'symptoms', 'master_roles', 'flows', 'compliance'];
  const DEFAULTS = { view: 'overlap', mode: 'cat', mech: false, linkby: 'all', proc: 'O2C' };
  const BOOL_KEYS = new Set(['mech']);
  const NUM_KEYS = new Set(['size']);

  const store = {};
  const calcs = {};
  const calcCache = {};
  const draws = new Map();
  const listeners = [];
  let status = 'loading';
  let message = '';
  let params = readParams();

  function readParams() {
    const out = { ...DEFAULTS };
    const q = new URLSearchParams(location.search);
    for (const [k, v] of q) {
      if (BOOL_KEYS.has(k)) out[k] = v === 'true';
      else if (NUM_KEYS.has(k)) out[k] = Number(v) || null;
      else out[k] = v;
    }
    return out;
  }

  function writeParams() {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v === null || v === undefined || v === '') continue;
      if (DEFAULTS[k] === v) continue;
      q.set(k, String(v));
    }
    const s = q.toString();
    history.replaceState(null, '', location.pathname + (s ? '?' + s : '') + location.hash);
  }

  function calcResult(id) {
    if (id in calcCache) return calcCache[id];
    const c = calcs[id];
    const args = c.inputs.map((i) => data(i).data);
    calcCache[id] = c.fn(...args);
    return calcCache[id];
  }

  function data(id) {
    if (status !== 'ok') return { status, data: [], message };
    if (id in store) return { status: 'ok', data: store[id] };
    if (id in calcs) {
      try {
        return { status: 'ok', data: calcResult(id) };
      } catch (e) {
        console.error(e);
        return { status: 'error', data: [], message: String(e) };
      }
    }
    return { status: 'missing', data: [] };
  }

  function isShown(el) {
    for (let n = el; n; n = n.parentElement) if (n.hidden) return false;
    return true;
  }

  let scheduled = false;
  function render() {
    scheduled = false;
    for (const fn of listeners) {
      try { fn(); } catch (e) { console.error(e); }
    }
    for (const [name, fn] of draws) {
      for (const el of document.querySelectorAll(`[data-draw="${name}"]`)) {
        if (!isShown(el)) continue;
        try { fn(el); } catch (e) { console.error(e); }
      }
    }
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(render);
  }

  window.dash = {
    colors: ['var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-4)', 'var(--series-5)', 'var(--series-6)', 'var(--series-7)', 'var(--series-8)'],
    data,
    calc(id, def) { calcs[id] = def; },
    loader() {},
    draw(name, fn) {
      if (typeof fn === 'function') draws.set(name, fn);
      schedule();
    },
    onData(fn) { listeners.push(fn); schedule(); },
    params() { return { ...params }; },
    setParams(patch) {
      params = { ...params, ...patch };
      writeParams();
      schedule();
    },
    resetParams() {
      params = { ...DEFAULTS };
      writeParams();
      schedule();
    },
    setLink(name) { history.replaceState(null, '', location.pathname + location.search + (name ? '#' + name : '')); },
    refresh() { schedule(); },
  };

  // 寬度改變時重畫
  let lastW = 0;
  new ResizeObserver((entries) => {
    const w = Math.round(entries[0].contentRect.width);
    if (w !== lastW) { lastW = w; schedule(); }
  }).observe(document.documentElement);

  Promise.all(DATASETS.map((id) => fetch(`data/${id}.json`).then((r) => {
    if (!r.ok) throw new Error(`${id}.json：HTTP ${r.status}`);
    return r.json();
  }).then((rows) => { store[id] = rows; })))
    .then(() => { status = 'ok'; schedule(); })
    .catch((e) => { status = 'error'; message = String(e); console.error(e); schedule(); });
})();
