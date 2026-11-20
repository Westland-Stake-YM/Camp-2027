/* ============================================================
   CAMP SETTINGS — edit these when links and details are ready.
   Leave a link as "" to show it as "coming soon / TBD".
   ============================================================ */
const CAMP = {
  start: '2027-07-27T07:00:00-04:00',
  links: {
    registrationForm: '',   // Google Form (public link for parents)
    permissionPdf: 'https://assets.churchofjesuschrist.org/ec/6a/ec6a32b2ded011eda8abeeeeac1eefc32321140e/pd60004035_000_interactive.pdf',
    mapGuidebook: 'https://www.amazon.com/dp/1957347015',
    // Leaders only — these open in Google and are protected by Google sharing:
    responsesSheet: 'https://docs.google.com/spreadsheets/d/1lFMrcqK5gZoSB7FvAg6ObuEcLEXEgM3c4PwF7X6qVuM/edit', // Google Sheet with registration responses
    formsFolder: 'https://drive.google.com/drive/folders/16rCdMlw1ITwHk2wNgAu39k_wekD0qdMm', // Drive folder with signed permission & medical forms
    volunteerSheet: '',     // Volunteer sign-ups (if used)
    campsiteForm: '',       // Crew Leader Campsite Cash Reimbursement Form (PDF)
    shoppingList: 'assets/docs/crew-menu-shopping-list.pdf', // Full menu & shopping list
  },
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- links from settings ---------- */
$$('[data-link]').forEach(a => {
  const url = CAMP.links[a.dataset.link];
  if (url) { a.href = url; if (/^https?:/.test(url)) { a.target = '_blank'; a.rel = 'noopener'; } }
  else {
    a.removeAttribute('href');
    a.setAttribute('aria-disabled', 'true');
    a.setAttribute('role', 'link');
    const lbl = a.querySelector('.lbl');
    if (lbl && a.dataset.pending) lbl.textContent = a.dataset.pending;
    if (!a.querySelector('.tbd')) a.insertAdjacentHTML('beforeend', ' <span class="tbd">TBD</span>');
  }
});

/* ---------- permission-form email (assembled here to keep it away from scrapers) ---------- */
const PF = ['rbutle50', 'gmail.com'];
$$('[data-email]').forEach(a => {
  const addr = PF.join('@');
  a.href = 'mailto:' + addr + '?subject=' + encodeURIComponent("YM Camp Permission Form – [son's name]");
  a.textContent = 'Ryan Butler (' + addr + ')';
});

/* ---------- inline the poster logo (so its font renders) ---------- */
$$('[data-poster]').forEach(async el => {
  try {
    const r = await fetch(el.dataset.poster);
    if (!r.ok) throw 0;
    el.innerHTML = await r.text();
  } catch { el.innerHTML = `<img src="${el.dataset.poster}" alt="Rejoice in Christ — Westland Stake YM Camp, Au Sable 2027">`; }
});

/* ---------- nav ---------- */
const nav = $('.nav');
const onScroll = () => nav && nav.classList.toggle('solid', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true }); onScroll();
const menuBtn = $('.menu-btn'), links = $('.nav-links');
if (menuBtn) {
  menuBtn.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  $$('a', links).forEach(a => a.addEventListener('click', () => { links.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false); }));
}

/* ---------- hero parallax ---------- */
const heroBg = $('.hero-bg');
if (heroBg && !reduceMotion) {
  addEventListener('scroll', () => {
    if (scrollY < innerHeight * 1.2) heroBg.style.transform = `translateY(${scrollY * 0.25}px) scale(1.05)`;
  }, { passive: true });
}

/* ---------- reveal on scroll ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: 0.12 });
$$('.reveal').forEach(el => io.observe(el));

/* ---------- count-up numbers ---------- */
const countIO = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target, end = parseFloat(el.dataset.count), dec = (el.dataset.count.split('.')[1] || '').length;
  countIO.unobserve(el);
  if (reduceMotion) { el.textContent = end.toFixed(dec); return; }
  const t0 = performance.now(), dur = 1400;
  const tick = t => { const p = Math.min(1, (t - t0) / dur), v = end * (1 - Math.pow(1 - p, 3)); el.textContent = v.toFixed(dec); if (p < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}), { threshold: 0.5 });
$$('[data-count]').forEach(el => countIO.observe(el));

/* ---------- countdown ---------- */
const cd = $('#countdown');
if (cd) {
  const target = new Date(CAMP.start).getTime();
  const upd = () => {
    let s = Math.max(0, Math.floor((target - Date.now()) / 1000));
    const d = Math.floor(s / 86400); s %= 86400;
    const h = Math.floor(s / 3600); s %= 3600;
    const m = Math.floor(s / 60);
    cd.innerHTML = [[d, 'days'], [h, 'hours'], [m, 'min']].map(([n, l]) => `<div><b>${n}</b><span>${l}</span></div>`).join('');
  };
  upd(); setInterval(upd, 30000);
}

/* ---------- persistent checklists ---------- */
$$('[data-checklist]').forEach(list => {
  const key = 'ymcamp27:' + list.dataset.checklist;
  const saved = store.get(key, {});
  const boxes = $$('input[type=checkbox]', list);
  const bar = $(`[data-progress="${list.dataset.checklist}"]`);
  const count = $(`[data-progress-count="${list.dataset.checklist}"]`);
  const update = () => {
    const done = boxes.filter(b => b.checked).length;
    if (bar) bar.style.width = (100 * done / boxes.length) + '%';
    if (count) count.textContent = `${done} of ${boxes.length} packed`.replace('packed', list.dataset.word || 'packed');
  };
  boxes.forEach((b, i) => {
    const id = b.value || String(i);
    b.checked = !!saved[id];
    b.addEventListener('change', () => { saved[id] = b.checked; store.set(key, saved); update(); });
  });
  const reset = $(`[data-reset="${list.dataset.checklist}"]`);
  if (reset) reset.addEventListener('click', () => { boxes.forEach(b => b.checked = false); store.set(key, {}); update(); });
  update();
});
$$('[data-print]').forEach(b => b.addEventListener('click', () => print()));

/* ---------- subnav highlight (leaders) ---------- */
const sub = $$('.subnav a');
if (sub.length) {
  const secIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) sub.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-40% 0px -55% 0px' });
  sub.forEach(a => { const s = $(a.getAttribute('href')); if (s) secIO.observe(s); });
}

/* ============================================================
   RIVER MAP
   ============================================================ */
const STOPS = [
  { id: 'grayling', name: 'Grayling', mile: 122.5, kind: 'launch', label: 'Launch', pos: 'above', anchor: 'start', dx: -14 },
  { id: 'keystone', name: 'Keystone Landing', mile: 115, kind: 'camp', label: 'Camp · Tue', pos: 'below', anchor: 'middle', dx: -10 },
  { id: 'stevens', name: 'Stevens Bridge', mile: 111.5, kind: 'lunch', label: 'Lunch · Wed', pos: 'above', anchor: 'start', dx: 6 },
  { id: 'rainbow', name: 'Rainbow Bend', mile: 100.5, kind: 'camp', label: 'Camp · Wed', pos: 'above', anchor: 'middle', dx: 0 },
  { id: 'luzerne', name: 'Luzerne Park', mile: 88.5, kind: 'lunch', label: 'Lunch · Thu', pos: 'below', anchor: 'middle', dx: 0 },
  { id: 'mio', name: 'Mio Pond Campground', mile: 78, kind: 'camp', label: 'Camp · Thu', pos: 'above', anchor: 'end', dx: -4 },
  { id: 'meadow', name: 'Meadow Springs', mile: 72, kind: 'camp', label: 'Lunch + Camp · Fri', pos: 'below', anchor: 'middle', dx: -10 },
  { id: 'mckinley', name: 'McKinley Landing', mile: 62, kind: 'launch', label: 'Takeout · Sat', pos: 'above', anchor: 'end', dx: 16, lift: 28 },
];
const DAYS = [
  { key: 'tue', tab: 'Tue · Jul 27', title: 'Tuesday, July 27', from: 122.5, to: 115, miles: '7.5', route: 'Grayling → Keystone Landing',
    stops: ['grayling', 'keystone'],
    river: 'Swift and narrow, with lots of overhanging trees, deadfall and obstacles. The current is fast, so there\'s little reaction time — this is where everyone learns to steer quickly.',
    sched: [['7:00 AM', 'Meet at ward buildings, load vehicles'], ['7:30 AM', 'Leave for Grayling (about 3 hours)'], ['10:30 AM', 'Arrive Grayling; check in with outfitter'], ['11:30 AM', 'Sack lunch from home'], ['12:30 PM', 'Launch at Grayling (mile 122.5)', 1], ['~2:00 PM', 'Arrive Keystone Landing; set up camp', 1], ['5:30 PM', 'Dinner: roasted hot dogs'], ['7:00 PM', 'Evening devotional / kickoff'], ['7:30 PM', "Campfire, s'mores, get-to-know-you"], ['10:00 PM', 'Lights out']] },
  { key: 'wed', tab: 'Wed · Jul 28', title: 'Wednesday, July 28', from: 115, to: 100.5, miles: '14.5', route: 'Keystone → Stevens Bridge → Rainbow Bend',
    stops: ['keystone', 'stevens', 'rainbow'],
    river: 'More of the same — still swift, but the river starts getting wider each day. A short morning to Stevens Bridge for lunch, then a long afternoon to Rainbow Bend.',
    sched: [['7:00 AM', 'Wake up'], ['7:30 AM', 'Devotional'], ['8:00 AM', 'Breakfast'], ['9:00 AM', 'Break camp'], ['10:30 AM', 'Launch (3.5 mi)', 1], ['~11:15 AM', 'Stevens Bridge Landing — lunch', 1], ['12:30 PM', 'Launch (11 mi)'], ['~2:45 PM', 'Arrive Rainbow Bend; set up camp', 1], ['5:30 PM', 'Dinner: mac & cheese'], ['7:00 PM', 'Evening devotional & activity'], ['10:00 PM', 'Lights out']] },
  { key: 'thu', tab: 'Thu · Jul 29', title: 'Thursday, July 29', from: 100.5, to: 78, miles: '22.5', route: 'Rainbow Bend → Luzerne Park → Mio Pond', badge: 'Longest day',
    stops: ['rainbow', 'luzerne', 'mio'],
    river: 'The big one. The river widens in the afternoon, and the last several miles are Mio Pond — lake paddling with no current. It takes real endurance. Pizza at the end!',
    sched: [['7:00 AM', 'Wake up — pack tents and gear first'], ['7:30 AM', 'Devotional'], ['8:00 AM', 'Quick breakfast; finish loading'], ['9:00 AM', 'Launch early (12 mi)', 1], ['~11:30 AM', 'Luzerne Park — lunch', 1], ['12:30 PM', 'Launch (river, then flat Mio Pond)'], ['~3:45 PM', 'Arrive Mio Pond Campground', 1], ['5:30 PM', 'Dinner: pizza from Mio'], ['7:00 PM', 'Evening devotional'], ['10:00 PM', 'Lights out']] },
  { key: 'fri', tab: 'Fri · Jul 30', title: 'Friday, July 30', from: 78, to: 72, miles: '6', route: 'Mio Pond → portage Mio Dam → Meadow Springs',
    stops: ['mio', 'meadow'],
    river: 'Portage around Mio Dam (a fun part of the trip). Below the dam the river is shallower and the current picks up. Short day — then an open afternoon in the river, devotionals and the testimony meeting. No water at Meadow Springs, so we fill up at Mio.',
    sched: [['7:00 AM', 'Wake up'], ['7:30 AM', 'Devotional'], ['8:00 AM', 'Breakfast; fill water jugs'], ['9:00 AM', 'Break camp'], ['10:00 AM', 'Launch; portage around Mio Dam', 1], ['~11:45 AM', 'Arrive Meadow Springs; set up camp', 1], ['12:00 PM', 'Lunch'], ['1:00 PM', 'Open afternoon: river play, relaxing, crew activities', 1], ['5:30 PM', 'Dinner: beef stew & mashed potatoes'], ['7:00 PM', 'Testimony meeting', 1], ['8:00 PM', 'Closing campfire']] },
  { key: 'sat', tab: 'Sat · Jul 31', title: 'Saturday, July 31', from: 72, to: 62, miles: '10', route: 'Meadow Springs → McKinley Landing → home',
    stops: ['meadow', 'mckinley'],
    river: 'Peaceful paddling through the national forest to McKinley Landing — a great way to finish. The outfitter shuttles everyone back to the vehicles in Grayling, and we head home.',
    sched: [['7:00 AM', 'Wake up'], ['7:30 AM', 'Devotional'], ['8:00 AM', 'Breakfast (leftovers)'], ['10:00 AM', 'Launch (10 mi)'], ['~12:00 PM', 'Off the river at McKinley Landing', 1], ['~12:15 PM', 'Outfitter shuttle back to Grayling'], ['~1:45 PM', 'Head home — fast food stop on the way'], ['~5:00 PM', 'Home! Crew leaders text parents an ETA', 1]] },
];

const map = $('#riverMap');
if (map) {
  const path = $('#riverPath', map), seg = $('#riverSeg', map), pond = $('#riverPond', map);
  const L = path.getTotalLength();
  const TOP = 122.5, SPAN = 60.5;
  const at = mile => (TOP - mile) / SPAN * L;
  const ns = 'http://www.w3.org/2000/svg';
  // Mio Pond: roughly the last 5 miles before the dam (~mile 83 → 78)
  pond.setAttribute('stroke-dasharray', `0 ${at(83)} ${at(77.6) - at(83)} ${L}`);
  // flow animation path
  // stops
  const g = $('#stops', map);
  STOPS.forEach(s => {
    const p = path.getPointAtLength(at(s.mile));
    const el = document.createElementNS(ns, 'g');
    el.setAttribute('class', `stop ${s.kind}`);
    el.dataset.id = s.id;
    const up = s.pos === 'above', x = p.x + s.dx;
    const lift = s.lift || 0;
    const ny = up ? p.y - 44 - lift : p.y + 46, my = up ? p.y - 26 - lift : p.y + 64;
    el.innerHTML = `<circle cx="${p.x}" cy="${p.y}" r="${s.kind === 'camp' ? 10 : 8}"/>
      <text x="${x}" y="${ny}" text-anchor="${s.anchor}">${s.name}</text>
      <text class="mm" x="${x}" y="${my}" text-anchor="${s.anchor}">MILE ${s.mile} · ${s.label.toUpperCase()}</text>`;
    g.appendChild(el);
  });
  // dam marker
  const dp = path.getPointAtLength(at(77.4));
  $('#dam', map).setAttribute('transform', `translate(${dp.x} ${dp.y})`);

  const canoe = $('#canoe', map);
  const tabs = $$('.day-tab');
  const detail = $('#dayDetail');
  const show = (i, focus) => {
    const d = DAYS[i];
    tabs.forEach((t, j) => { t.setAttribute('aria-selected', j === i); t.tabIndex = j === i ? 0 : -1; });
    if (focus) tabs[i].focus();
    const a = at(d.from), b = at(d.to);
    seg.setAttribute('stroke-dasharray', `0 ${a} ${b - a} ${L}`);
    const p = path.getPointAtLength(b), p0 = path.getPointAtLength(Math.max(0, b - 4));
    const ang = Math.atan2(p.y - p0.y, p.x - p0.x) * 180 / Math.PI;
    canoe.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${ang})`);
    const sc = $('#mapScroll');
    if (sc && sc.scrollWidth > sc.clientWidth + 4) {
      const mid = path.getPointAtLength((a + b) / 2).x;
      const k = map.getBoundingClientRect().width / 1060;
      sc.scrollTo({ left: (mid + 30) * k - sc.clientWidth / 2, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    $$('.stop', map).forEach(s => s.classList.toggle('dim', !d.stops.includes(s.dataset.id)));
    detail.innerHTML = `
      <div>
        <h3>${d.title}${d.badge ? ` <span class="tbd" style="background:var(--rust);border:0;color:#fff">${d.badge}</span>` : ''}</h3>
        <div class="route">${d.route}</div>
        <div class="miles"><b>${d.miles}</b> miles on the water</div>
        <p>${d.river}</p>
      </div>
      <div>
        <ol class="sched">${d.sched.map(([t, s, h]) => `<li class="${h ? 'hl' : ''}"><time>${t}</time><span>${s}</span></li>`).join('')}</ol>
        <p class="note-small">Times are a draft plan and may shift with the river and the outfitter.</p>
      </div>`;
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => show(i));
    t.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') show((i + 1) % DAYS.length, true);
      if (e.key === 'ArrowLeft') show((i + DAYS.length - 1) % DAYS.length, true);
    });
  });
  show(0);
  // draw-in animation for the river on first view
  if (!reduceMotion) {
    const water = $$('.water,.bank', map);
    water.forEach(w => { w.style.strokeDasharray = L; w.style.strokeDashoffset = L; });
    new IntersectionObserver((es, o) => es.forEach(e => {
      if (!e.isIntersecting) return;
      water.forEach(w => { w.style.transition = 'stroke-dashoffset 2.2s cubic-bezier(.6,.05,.2,1)'; w.style.strokeDashoffset = 0; });
      o.disconnect();
    }), { threshold: 0.3 }).observe(map);
  }
}

/* ============================================================
   CREW CASH & SUPPLY CALCULATOR (leaders)
   ============================================================ */
const calc = $('#calc');
if (calc) {
  const range = $('#crewSize'), big = $('#crewBig');
  const set = (id, v) => { const el = $('#' + id); if (el) el.textContent = v; };
  const run = () => {
    const n = +range.value;
    big.textContent = n;
    store.set('ymcamp27:crewSize', n);
    const sites = Math.ceil(n / 8), camp = sites * 20 * 4;
    const pizzas = Math.ceil(n / 2);
    set('o-sites', sites); set('o-camp', '$' + camp);
    set('o-bills', `${camp / 20} × $20 bills`);
    set('o-pizza', `${pizzas} pizzas`); set('o-pizza-cash', `$${pizzas * 10}–$${pizzas * 15}`);
    set('o-total', `$${camp + pizzas * 10}–$${camp + pizzas * 15}`);
    set('o-bags', n * 10); set('o-water', n + ' gal');
    set('o-jugs', `about ${Math.ceil(n / 5)} five-gallon jugs`);
    set('o-sand', n * 6); set('o-dogs', n * 3);
    set('o-mac', Math.ceil(n * 2 / 3)); set('o-stew', Math.ceil(n * 3 / 4));
    $$('#cashTable tr[data-max]').forEach(tr => tr.classList.toggle('match', n <= +tr.dataset.max && n > +tr.dataset.max - 8));
  };
  range.value = store.get('ymcamp27:crewSize', 16);
  range.addEventListener('input', run);
  $$('[data-step]').forEach(b => b.addEventListener('click', () => { range.value = Math.min(+range.max, Math.max(+range.min, +range.value + +b.dataset.step)); run(); }));
  run();
}
