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
                    <div class="card-meta">
                        <div class="card-name"><img class="logo" src="${p.logo}" alt=""><span class="t">${p.title}</span></div>
                        <p class="d">${p.desc}</p>
                    </div>
                </a>
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
    updateScrolls();
    if (on) holdHover(hintFirst($('.card', panel)));
}

/* The cursor is usually already somewhere over the row when the projects
   open. Hover stays off until the phones have come in (and the first one
   has done its hint), then waits for the mouse to actually move. */
let holdTimer, holdId = 0;
function holdHover(hinted) {
    clearTimeout(holdTimer);
    const id = ++holdId; // a reopen starts a fresh hold
    document.body.classList.add('hover-hold');
    holdTimer = setTimeout(() => document.addEventListener('pointermove', () => {
        if (id === holdId) document.body.classList.remove('hover-hold');
    }, { once: true }), hinted ? 2800 : 700);
}

/* First time the projects open (once a visit), the first phone lifts
   and shows its name, so it's clear the phones lead somewhere. */
function hintFirst(card) {
    if (!card || store.sget('hinted')) return false;
    store.sset('hinted', '1');
    card.classList.add('hint');
    const done = e => {
        if (!e.animationName.includes('hint')) return; // the card's own entrance ends first
        card.classList.remove('hint');
        card.removeEventListener('animationend', done);
    };
    card.addEventListener('animationend', done);
    return true;
}

/* The row is a carousel only if the phones overflow at their minimum
   48px gap. Worked out from sizes, not scrollWidth, which also counts
   the hovered phone's push. */
function updateScrolls() {
    const row = $('.cards', panel);
    if (!row) return;
    const cs = getComputedStyle(row), n = row.children.length;
    const need = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)
        + n * $('.card-main', row).getBoundingClientRect().width + (n - 1) * 48;
    const scrolls = isExpanded() && need > row.clientWidth + 4; // a few px of rounding isn't worth a carousel
    row.classList.toggle('scrolls', scrolls);
    if (!scrolls) row.scrollLeft = 0;
}
new ResizeObserver(updateScrolls).observe(panel);
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
        if (isMobile()) { k === 'grubhub' ? openMProj() : showMobile(mKey === k ? null : k); return; }
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
    if (v && e.pointerType === 'mouse' && !document.body.classList.contains('hover-hold')) v.play().catch(() => {});
});
panel.addEventListener('pointerout', e => {
    const card = e.target.closest('.card');
    if (!card || card.contains(e.relatedTarget)) return;
    $('video', card)?.pause();
});

/* horizontal scroll with a normal mouse wheel */
panel.addEventListener('wheel', e => {
    const row = e.target.closest('.cards');
    if (!row?.classList.contains('scrolls') || !isExpanded() || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault();
    row.scrollBy({ left: e.deltaY * 1.2 });
}, { passive: false });


/* ── SHORTCUTS ── */
function scrollCards(dir) {
    const row = $('.cards', panel);
    if (!row?.classList.contains('scrolls')) return;
    const step = $('.card-main', row).offsetWidth + 48;
    row.scrollBy({ left: dir * step, behavior: 'smooth' });
}
shortcut(['P'], 'projects', () => setExpanded(!isExpanded()));
shortcut(['←', '→'], 'scroll projects', e => { if (!isExpanded()) setExpanded(true); else scrollCards(e.key === 'ArrowLeft' ? -1 : 1); });
shortcut(['Esc'], 'close / back', () => {
    if (mproj?.classList.contains('open')) closeMProj();
    else if (isExpanded()) setExpanded(false);
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
   Tapping a hobby word swaps "previously" for a return pill + card +
   caption. Tapping "projects" opens them on their own page (an
   overlay), as a grid of phones or a list with names. */
let mKey = null;
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
    mdetail.innerHTML = `<button class="pill mret" data-act="mreturn"><span class="i i-return"></span>return</button>
        <div class="mbox mbox-${k}">${VIEWS[k]()}</div>`;
    previously.hidden = true;
    mdetail.hidden = false;
    mdetail.classList.remove('m-in'); void mdetail.offsetWidth; mdetail.classList.add('m-in');
    mdetail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
mdetail.addEventListener('click', e => {
    e.stopPropagation();
    if (e.target.closest('[data-act="mreturn"]')) showMobile(null);
});

const ICON_GRID = '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="2.5" width="6" height="6" rx="1.5"/><rect x="11.5" y="2.5" width="6" height="6" rx="1.5"/><rect x="2.5" y="11.5" width="6" height="6" rx="1.5"/><rect x="11.5" y="11.5" width="6" height="6" rx="1.5"/></g></svg>';
const ICON_LIST = '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="3" width="15" height="5.5" rx="1.5"/><rect x="2.5" y="11.5" width="15" height="5.5" rx="1.5"/></g></svg>';

let mproj = null;
// while the projects page is open the theme toggle lives in it, so it scrolls away
const themeBtn = $('.theme-toggle'), themeHome = document.createComment('theme-toggle');
themeBtn.after(themeHome);
function buildMProj() {
    mproj = document.createElement('div');
    mproj.className = 'mproj';
    mproj.setAttribute('role', 'dialog');
    mproj.setAttribute('aria-label', 'Projects');
    mproj.innerHTML = `<div class="mproj-bar">
            <button class="pill mret" data-act="mclose"><span class="i i-return"></span>return</button>
            <div class="vtoggle" role="radiogroup" aria-label="Layout">
                <button role="radio" data-view="grid" aria-label="Grid">${ICON_GRID}</button>
                <button role="radio" data-view="list" aria-label="List">${ICON_LIST}</button>
            </div>
        </div>
        <div class="mgrid">${PROJECTS.map((p, i) => `
            <a class="mcard" href="project.html?p=${p.slug}" style="--i:${i}">
                <div class="phone">${mediaHTML(p.cover, { placeholder: p.title + '<br>coming soon' })}</div>
                <div class="mcap proj"><img class="logo" src="${p.logo}" alt=""><div class="txt"><b>${p.title}</b><span>${p.desc}</span></div></div>
            </a>`).join('')}</div>`;
    mproj.addEventListener('click', e => {
        const act = e.target.closest('[data-act]')?.dataset.act;
        if (act === 'mclose') { closeMProj(); return; }
        const v = e.target.closest('[data-view]')?.dataset.view;
        if (v) { setMView(v, true); return; }
        const card = e.target.closest('.mcard');
        if (card) { e.preventDefault(); requireUnlock(() => location.href = card.href); }
    });
    $('.home-grid').append(mproj);
    setMView(store.get('mlayout') || 'list'); // rows first; new key so earlier grid picks don't stick
}
function setMView(v, animate) {
    const apply = () => {
        mproj.dataset.view = v;
        $$('[data-view]', mproj).forEach(b => b.setAttribute('aria-checked', b.dataset.view === v));
    };
    store.set('mlayout', v);
    // phones glide to their new spots where the browser can do it
    if (animate && document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(apply);
    else apply();
}
function openMProj(instant) {
    if (!mproj) buildMProj();
    showMobile(null);
    mproj.classList.toggle('instant', !!instant);
    mproj.scrollTop = 0;
    mproj.classList.add('open');
    mproj.prepend(themeBtn);
    document.body.classList.add('mproj-open');
    history.replaceState(null, '', '#projects');
    hintFirst($('.mcard', mproj));
}
function closeMProj() {
    if (!mproj) return;
    mproj.classList.remove('open', 'instant');
    themeHome.before(themeBtn);
    document.body.classList.remove('mproj-open');
    history.replaceState(null, '', location.pathname);
}
// rotating to desktop width: drop the mobile state
mobileMQ.addEventListener('change', () => { if (!isMobile()) { showMobile(null); closeMProj(); } });

/* deep link from project pages: index.html#projects */
if (location.hash === '#projects' && isMobile()) {
    openMProj(true);
} else if (location.hash === '#projects') {
    document.documentElement.classList.add('no-anim');
    setExpanded(true);
    requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.remove('no-anim')));
}

/* ── OR ELSE ──
   Each click shows the next line of OR_ELSE (in the bio's language).
   Clicking the last one turns the words into a player: the song starts
   muted, its underline fills as it plays, and a tap unmutes it. */
const oe = $('#orelse');
let oeStep = 0;
const oeLines = () => LANG[$('.intro').lang]?.orelse || OR_ELSE; // LANG: lang.js
function renderOrElse() {
    if (oe.isConnected) oe.textContent = oeLines()[oeStep];
}
oe.addEventListener('click', e => {
    e.stopPropagation();
    if (oeStep < OR_ELSE.length - 1) {
        oeStep++;
        renderOrElse();
        oe.classList.remove('swap'); void oe.offsetWidth; oe.classList.add('swap');
        return;
    }
    playSong();
});

const ICON_MUTED = '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M3 7.5h3l4-3.5v12l-4-3.5H3z" fill="currentColor"/><path d="m13 7.5 5 5m0-5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
const ICON_SOUND = '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M3 7.5h3l4-3.5v12l-4-3.5H3z" fill="currentColor"/><path d="M13 7a4 4 0 0 1 0 6m2.5-8.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
const ICON_AGAIN = '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M4.5 10a5.5 5.5 0 1 0 1.8-4.1M4.5 3.5v3h3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function playSong() {
    const box = oe.parentElement;
    box.innerHTML = `<div class="oe-player">
        <button class="oe-mute" aria-label="Unmute">${ICON_MUTED}</button>
        <span class="oe-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        <span class="oe-t">${SONG.title} <span class="oe-a">${SONG.artist}</span></span>
        <audio src="${SONG.preview}" muted playsinline preload="auto"></audio>
    </div>`;
    const pl = $('.oe-player', box), a = $('audio', pl), btn = $('.oe-mute', pl);
    const sync = () => {
        const ended = a.ended, muted = a.muted || a.paused;
        pl.classList.toggle('live', !muted && !ended);
        btn.innerHTML = ended ? ICON_AGAIN : muted ? ICON_MUTED : ICON_SOUND;
        btn.setAttribute('aria-label', ended ? 'Play again' : muted ? 'Unmute' : 'Mute');
    };
    a.muted = true; // the attribute alone doesn't stick in every browser
    a.play().catch(() => {});
    a.addEventListener('timeupdate', () => pl.style.setProperty('--p', a.duration ? a.currentTime / a.duration : 0));
    ['play', 'pause', 'ended', 'volumechange'].forEach(ev => a.addEventListener(ev, sync));
    // the preview can disappear from Spotify's servers: fall back to their player
    a.addEventListener('error', () => {
        box.innerHTML = `<iframe class="oe-embed" title="${SONG.title} by ${SONG.artist} on Spotify" src="${SONG.spotify.replace('/track/', '/embed/track/')}?theme=0" height="80" allow="autoplay; clipboard-write; encrypted-media" loading="lazy"></iframe>`;
    });
    btn.addEventListener('click', e => {
        e.stopPropagation();
        if (a.ended) { a.currentTime = 0; a.muted = false; a.play().catch(() => {}); return; }
        if (a.paused) { a.muted = false; a.play().catch(() => {}); return; }
        a.muted = !a.muted;
    });
    sync();
    btn.focus();
}
