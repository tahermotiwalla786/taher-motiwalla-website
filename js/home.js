/* ── HOME ─────────────────────────────────
   Hover a highlighted word → its panel floats in.
   Click → it stays. Click "projects" (or its panel) →
   the panel expands into the projects carousel.
   ──────────────────────────────────────── */

const panel = $('#panel');
const links = $$('.hl');
const canHover = matchMedia('(hover: hover)').matches;
const mobileMQ = matchMedia('(max-width: 900px)');
const isMobile = () => mobileMQ.matches;
const mdetail = $('#mdetail');
const previously = $('.previously');

let pinKey = null;     // panel that stays after a click
let hoverKey = null;   // panel shown while hovering
let shownKey = null;
let leaveTimer;
let switchTimer;     // pending swap to another word's panel (hover intent)
let bounced = false;

/* ── RENDERERS ── */
const VIEWS = {
    grubhub() {
        const cards = PROJECTS.map(p => `
            <div class="card" data-slug="${p.slug}">
                <a class="card-main" href="project.html?p=${p.slug}">
                    <div class="phone">${mediaHTML(p.cover, { autoplay: !canHover, placeholder: p.title + '<br>coming soon' })}</div>
                    <div class="card-meta"><img class="logo" src="${p.logo}" alt=""><span class="t">${p.title}</span></div>
                </a>
                <div class="card-acts">
                    <a class="act" href="project.html?p=${p.slug}" aria-label="Read the ${p.title} case study"><span class="i i-book"></span></a>
                    <button class="act" data-act="request" aria-label="Request details on ${p.title}"><span class="i i-chat"></span></button>
                </div>
            </div>`).join('');
        return `<div class="pv pv-work">
            <button class="pill top-pill" data-act="toggle-expand">
                <span class="pill-swap">
                    <span class="when-closed">see more <span class="i i-expand"></span></span>
                    <span class="when-open">return <span class="i i-return"></span></span>
                </span>
            </button>
            <div class="cards" style="--n:${PROJECTS.length}">${cards}</div>
        </div>`;
    },
    paint: () => imageView('paint'),
    draw: () => imageView('draw'),
    photo: () => imageView('photo'),
};

/* Each hover shows a different image: a shuffled deck per hobby, so
   every image comes up once before any repeats. A clicked (pinned)
   panel keeps the image it was showing. */
const decks = {}, picks = {};
function nextImage(key) {
    const all = HOBBIES[key].srcs;
    if (!decks[key]?.length) {
        decks[key] = [...all].sort(() => Math.random() - .5);
        if (all.length > 1 && decks[key][0] === picks[key]) decks[key].push(decks[key].shift()); // no repeat across decks
    }
    picks[key] = decks[key].shift();
    if (decks[key][0]) new Image().src = decks[key][0]; // warm the next one
    return picks[key];
}
function imageView(key) {
    const h = HOBBIES[key];
    const src = key === pinKey && picks[key] ? picks[key] : nextImage(key);
    return `<div class="pv pv-img"><img src="${src}" alt="${h.note}"></div>`;
}

/* ── SHOW / HIDE ── */
function render() {
    const key = hoverKey || pinKey;
    links.forEach(l => {
        l.classList.toggle('active', l.dataset.panel === key);
        l.classList.toggle('pinned', l.dataset.panel === pinKey);
        l.setAttribute('aria-expanded', l.dataset.panel === key);
    });
    panel.classList.toggle('pinned', !!pinKey && key === pinKey);
    if (!key) {
        panel.classList.remove('show');
        shownKey = null;
        return;
    }
    if (key !== shownKey) {
        panel.innerHTML = VIEWS[key]();
        shownKey = key;
    }
    panel.classList.add('show');
    if (key === 'grubhub' && !bounced && !document.body.classList.contains('expanded')) {
        bounced = true;
        panel.classList.remove('bounce'); void panel.offsetWidth; panel.classList.add('bounce');
    }
}
panel.addEventListener('animationend', () => panel.classList.remove('bounce'));

function setExpanded(on) {
    if (on) { pinKey = 'grubhub'; hoverKey = null; render(); }
    document.body.classList.toggle('expanded', on);
    history.replaceState(null, '', on ? '#projects' : location.pathname);
}
const isExpanded = () => document.body.classList.contains('expanded');

/* ── HOVER ── */
links.forEach(l => {
    /* Hover intent: with nothing showing, a word opens its panel at once.
       With a panel already up, another word only takes over if the cursor
       rests on it, so crossing words on the way to the panel doesn't
       swap it (longer wait when the panel was clicked to stay). */
    l.addEventListener('pointerenter', e => {
        if (e.pointerType !== 'mouse' || isExpanded()) return;
        clearTimeout(leaveTimer);
        clearTimeout(switchTimer);
        const k = l.dataset.panel, showing = hoverKey || pinKey;
        const go = () => { hoverKey = k; render(); };
        if (!showing || showing === k) go();
        else switchTimer = setTimeout(go, pinKey ? 180 : 150); // crossing a word takes ~30–100ms
    });
    l.addEventListener('pointerleave', e => {
        if (e.pointerType !== 'mouse') return;
        clearTimeout(switchTimer);
        leaveTimer = setTimeout(() => { hoverKey = null; render(); }, 180);
    });
    l.addEventListener('focus', () => { if (!isExpanded() && !isMobile()) { hoverKey = l.dataset.panel; render(); } });
    l.addEventListener('blur', () => { hoverKey = null; render(); });
    l.addEventListener('click', e => {
        e.stopPropagation();
        const k = l.dataset.panel;
        if (isMobile()) { showMobile(mKey === k ? null : k); return; }
        if (k === 'grubhub') { setExpanded(true); return; }
        pinKey = pinKey === k ? null : k;
        hoverKey = canHover && pinKey === null ? null : hoverKey;
        if (pinKey === null) hoverKey = null;
        render();
    });
});
panel.addEventListener('pointerenter', () => { clearTimeout(leaveTimer); clearTimeout(switchTimer); });
panel.addEventListener('pointerleave', e => {
    if (e.pointerType !== 'mouse') return;
    leaveTimer = setTimeout(() => { hoverKey = null; render(); }, 180);
});

/* ── PANEL CLICKS ── */
panel.addEventListener('click', e => {
    e.stopPropagation();
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'toggle-expand') { setExpanded(!isExpanded()); return; }

    if (shownKey === 'grubhub') {
        if (!isExpanded()) { e.preventDefault(); setExpanded(true); return; }
        const card = e.target.closest('.card');
        if (act === 'request') { openRequest(PROJECTS.find(p => p.slug === card.dataset.slug)); return; }
        const link = e.target.closest('a');
        if (link) { e.preventDefault(); requireUnlock(() => location.href = link.href); }
        return;
    }
    // any other panel: a click pins it
    if (shownKey && !pinKey) { pinKey = shownKey; render(); }
});

// click on empty space lets go of a pinned panel
document.addEventListener('click', e => {
    if (e.target.closest('.overlay, .theme-toggle, .lang, a')) return;
    if (isExpanded()) return;
    if (pinKey) { pinKey = null; hoverKey = null; render(); }
});

/* project videos sit on their first frame until hovered */
panel.addEventListener('pointerover', e => {
    const v = e.target.closest('.card')?.querySelector('video');
    if (v && e.pointerType === 'mouse') v.play().catch(() => {});
});
panel.addEventListener('pointerout', e => {
    const card = e.target.closest('.card');
    if (!card || card.contains(e.relatedTarget)) return;
    $('video', card)?.pause();
});

/* ── REQUEST DETAILS ──
   No backend: Send opens a pre-filled email in the visitor's mail app. */
function openRequest(p) {
    let o = $('#request');
    if (!o) {
        o = document.createElement('div');
        o.className = 'overlay'; o.id = 'request'; o.setAttribute('aria-hidden', 'true');
        o.innerHTML = `<div class="sheet" role="dialog" aria-label="Request details">
            <div class="sheet-head">Request <button data-close aria-label="Close"><span class="i i-close"></span></button></div>
            <form class="req">
                <p class="req-for"></p>
                <label>name<input name="name" autocomplete="name" required></label>
                <label>email<input name="email" type="email" autocomplete="email" required></label>
                <label>note<textarea name="note" rows="4" placeholder="what would you like to know?"></textarea></label>
                <button class="pill send" type="submit">send</button>
            </form></div>`;
        document.body.append(o);
    }
    const form = $('form', o);
    $('.req-for', o).textContent = `more details and the full case study for ${p.title.toLowerCase()}. send opens your email app.`;
    form.onsubmit = e => {
        e.preventDefault();
        const f = new FormData(form);
        const body = `${f.get('note') || 'I\'d love to see the full case study.'}\n\n${f.get('name')}\n${f.get('email')}`;
        location.href = `${LINKS.email}?subject=${encodeURIComponent('Case study request: ' + p.title)}&body=${encodeURIComponent(body)}`;
        closeOverlay(o);
        toast('opening your email app');
    };
    openOverlay(o);
}

/* horizontal scroll with a normal mouse wheel */
panel.addEventListener('wheel', e => {
    const row = e.target.closest('.cards');
    if (!row || !isExpanded() || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault();
    row.scrollBy({ left: e.deltaY * 1.2 });
}, { passive: false });


/* ── SHORTCUTS ── */
function scrollCards(dir) {
    const row = $('.cards', panel);
    if (!row) return;
    const step = $('.card-main', row).offsetWidth + 48;
    row.scrollBy({ left: dir * step, behavior: 'smooth' });
}
shortcut(['P'], 'projects', () => setExpanded(!isExpanded()));
shortcut(['←', '→'], 'scroll projects', e => { if (!isExpanded()) setExpanded(true); else scrollCards(e.key === 'ArrowLeft' ? -1 : 1); });
shortcut(['Esc'], 'close / back', () => {
    if (isExpanded()) setExpanded(false);
    else { pinKey = null; hoverKey = null; render(); }
});

/* ── BROOKLYN CLOCK ──
   Brooklyn's time, ticking, and whichever comes next of sunrise or
   sunset (24-hour, Brooklyn time). Sun times use NOAA's sunrise
   equation, so nothing is fetched. */
const NYC = { lat: 40.6782, lon: -73.9442, tz: 'America/New_York' };
const fmtClock = new Intl.DateTimeFormat('en-GB', { timeZone: NYC.tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZoneName: 'short' }); // zone reads GMT-4 (GMT-5 in winter)
const fmtHM = new Intl.DateTimeFormat('en-GB', { timeZone: NYC.tz, hour: '2-digit', minute: '2-digit', hour12: false });

// sunrise + sunset (Date objects) for the UTC day containing `d`
function sunTimes(d) {
    const rad = Math.PI / 180;
    const day = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 864e5 + 2440587.5; // Julian day, 0h UTC
    const n = Math.ceil(day - 2451545.0 + .0008) - NYC.lon / 360; // mean solar noon (east-positive longitude)
    const M = (357.5291 + .98560028 * n) % 360;
    const C = 1.9148 * Math.sin(M * rad) + .02 * Math.sin(2 * M * rad) + .0003 * Math.sin(3 * M * rad);
    const L = (M + C + 180 + 102.9372) % 360;
    const transit = 2451545.0 + n + .0053 * Math.sin(M * rad) - .0069 * Math.sin(2 * L * rad);
    const dec = Math.asin(Math.sin(L * rad) * Math.sin(23.4397 * rad));
    const cosH = (Math.sin(-.833 * rad) - Math.sin(NYC.lat * rad) * Math.sin(dec)) / (Math.cos(NYC.lat * rad) * Math.cos(dec));
    const H = Math.acos(cosH) / rad;
    const toDate = jd => new Date((jd - 2440587.5) * 864e5);
    return { rise: toDate(transit - H / 360), set: toDate(transit + H / 360) };
}
function nextSun(now) {
    for (let i = 0; i < 3; i++) {
        const t = sunTimes(new Date(now.getTime() + i * 864e5));
        const ev = [['sunrise', t.rise], ['sunset', t.set]].sort((a, b) => a[1] - b[1]).find(([, at]) => at > now);
        if (ev) return ev;
    }
}
const clockEl = $('.clock'), sunEl = $('.sun-next');
function tick() {
    const now = new Date();
    const parts = fmtClock.formatToParts(now);
    const v = type => parts.find(p => p.type === type)?.value;
    clockEl.textContent = `${v('hour')}:${v('minute')}:${v('second')} ${v('timeZoneName')}`;
    clockEl.dateTime = now.toISOString();
    const [kind, at] = nextSun(now);
    $('time', sunEl).textContent = fmtHM.format(at);
    sunEl.title = sunEl.ariaLabel = `next ${kind}: ${fmtHM.format(at)}`;
    sunEl.dataset.kind = kind;
}
tick();
setTimeout(() => { tick(); setInterval(tick, 1000); }, 1000 - Date.now() % 1000); // on the second

/* ── MOBILE ──────────────────────────────
   Tapping a highlighted word swaps "previously" for a
   return pill + card + caption. Grubhub lists the projects. */
let mKey = null;
function mobileWork() {
    return `<div class="mcards">${PROJECTS.map((p, i) => `
        <a class="mcard" href="project.html?p=${p.slug}" style="--i:${i}">
            <div class="mbox"><div class="phone">${mediaHTML(p.cover, { placeholder: p.title + '<br>coming soon' })}</div></div>
            <div class="mcap proj"><img class="logo" src="${p.logo}" alt=""><div class="txt"><b>${p.title}</b></div></div>
        </a>`).join('')}</div>`;
}
function showMobile(k) {
    mKey = k;
    links.forEach(l => l.classList.toggle('active', l.dataset.panel === k));
    if (!k) {
        mdetail.hidden = true;
        mdetail.innerHTML = '';
        previously.hidden = false;
        previously.classList.remove('m-in'); void previously.offsetWidth; previously.classList.add('m-in');
        return;
    }
    const h = HOBBIES[k];
    const body = k === 'grubhub' ? mobileWork()
        : `<div class="mbox mbox-${k}">${VIEWS[k]()}</div>
           <div class="mcap"><div class="txt"><b>${h.caption[0]}</b><span>${h.caption[1]}</span></div></div>`;
    mdetail.innerHTML = `<button class="pill mret" data-act="mreturn"><span class="i i-return"></span>return</button>${body}`;
    previously.hidden = true;
    mdetail.hidden = false;
    mdetail.classList.remove('m-in'); void mdetail.offsetWidth; mdetail.classList.add('m-in');
    mdetail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
mdetail.addEventListener('click', e => {
    e.stopPropagation();
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'mreturn') { showMobile(null); return; }
    const card = e.target.closest('.mcard');
    if (card) { e.preventDefault(); requireUnlock(() => location.href = card.href); }
});
// rotating to desktop width: drop the mobile state
mobileMQ.addEventListener('change', () => { if (!isMobile()) showMobile(null); });

/* deep link from project pages: index.html#projects */
if (location.hash === '#projects' && isMobile()) {
    showMobile('grubhub');
} else if (location.hash === '#projects') {
    document.documentElement.classList.add('no-anim');
    setExpanded(true);
    requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.remove('no-anim')));
}
