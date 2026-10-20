/* ── HOME ─────────────────────────────────
   Hover a highlighted word → its panel floats in.
   Click → it stays. Click Grubhub (or its panel) →
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
    brooklyn: () => `<div class="pv pv-note"><span>stylized map of brooklyn</span><span class="sub">pins of places i've been to lately, coming soon</span></div>`,
    paint: () => imageView(HOBBIES.paint),
    draw: () => imageView(HOBBIES.draw),
    photo: () => imageView(HOBBIES.photo),
    music: () => {
        const m = HOBBIES.music;
        return `<div class="pv"><div class="player">
            <div class="art"></div>
            <div><div class="song">${m.song}<span class="eq"><i></i><i></i><i></i></span></div><div class="artist">${m.artist}</div></div>
            <div class="bar"><i></i></div>
            <div class="times"><span class="cur">0:00</span><span>${Math.floor(m.length / 60)}:${String(m.length % 60).padStart(2, '0')}</span></div>
            <div class="ctrl"><button aria-label="Previous" data-act="rew">⏮</button><button class="play" aria-label="Play" data-act="play">▶</button><button aria-label="Next" data-act="rew">⏭</button></div>
        </div></div>`;
    },
    book: () => {
        const b = HOBBIES.book;
        return `<div class="pv"><div class="book-wrap">
            <div class="book"><span class="bt">${b.title}</span><span class="stripe"></span><span class="ba">${b.author}</span></div>
            <p class="book-cap">${b.note}<br><span class="sub">${b.title.toLowerCase()} · ${b.author.toLowerCase()}</span></p>
        </div></div>`;
    },
    tennis: () => `<div class="pv pv-tennis"><canvas></canvas><p class="pv-note">${canHover ? 'move your mouse' : 'drag'} to play</p></div>`,
};

function imageView(h) {
    return `<div class="pv pv-img"><img src="${h.src}" alt="${h.note}" onerror="this.parentNode.outerHTML='<div class=&quot;pv pv-note&quot;><span>${h.note}</span><span class=&quot;sub&quot;>add ${h.src}</span></div>'"></div>`;
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
    panel.classList.toggle('bare', key === 'music' || key === 'book'); // no brown card behind these
    if (!key) {
        panel.classList.remove('show');
        shownKey = null;
        return;
    }
    if (key !== shownKey) {
        panel.innerHTML = VIEWS[key]();
        shownKey = key;
        if (key === 'tennis') startTennis($('canvas', panel));
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
    l.addEventListener('pointerenter', e => {
        if (e.pointerType !== 'mouse' || isExpanded()) return;
        clearTimeout(leaveTimer);
        hoverKey = l.dataset.panel;
        render();
    });
    l.addEventListener('pointerleave', e => {
        if (e.pointerType !== 'mouse') return;
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
panel.addEventListener('pointerenter', () => clearTimeout(leaveTimer));
panel.addEventListener('pointerleave', e => {
    if (e.pointerType !== 'mouse') return;
    leaveTimer = setTimeout(() => { hoverKey = null; render(); }, 180);
});

/* ── PANEL CLICKS ── */
panel.addEventListener('click', e => {
    e.stopPropagation();
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'toggle-expand') { setExpanded(!isExpanded()); return; }
    if (act === 'play') { togglePlayer(); return; }
    if (act === 'rew') { playerPos = 0; tickPlayer(); return; }

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

$$('.lang [data-soon]').forEach(b => b.addEventListener('click', () => toast(`${b.lang === 'hi' ? 'हिन्दी' : 'اردو'} coming soon`)));

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

/* ── MUSIC (visual only for now) ── */
let playerTimer = null, playerPos = 0;
const SONG_LEN = HOBBIES.music.length;
function tickPlayer(root = playerRoot) {
    const p = $('.player', root);
    if (!p) { clearInterval(playerTimer); playerTimer = null; return; }
    $('.bar i', p).style.width = (playerPos / SONG_LEN * 100) + '%';
    $('.cur', p).textContent = `${Math.floor(playerPos / 60)}:${String(Math.floor(playerPos % 60)).padStart(2, '0')}`;
}
let playerRoot = panel;
function togglePlayer(root = panel) {
    playerRoot = root;
    const p = $('.player', root);
    const on = !p.classList.contains('playing');
    p.classList.toggle('playing', on);
    $('.play', p).textContent = on ? '❚❚' : '▶';
    clearInterval(playerTimer);
    if (on) playerTimer = setInterval(() => { playerPos = (playerPos + 1) % SONG_LEN; tickPlayer(root); }, 1000);
}

/* ── TENNIS (atari-style pong) ── */
function startTennis(cv) {
    const ctx = cv.getContext('2d');
    const S = { w: 0, h: 0, ball: null, l: 0, r: 0, ls: 0, rs: 0, mouse: null };
    const fit = () => {
        const dpr = devicePixelRatio || 1, b = cv.getBoundingClientRect();
        S.w = b.width; S.h = b.height;
        cv.width = b.width * dpr; cv.height = b.height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        S.l = S.r = S.h / 2;
    };
    const serve = dir => { S.ball = { x: S.w / 2, y: S.h / 2, vx: 5 * dir, vy: (Math.random() * 4 - 2) }; };
    fit(); serve(1);
    const ro = new ResizeObserver(fit); ro.observe(cv);
    cv.addEventListener('pointermove', e => { const b = cv.getBoundingClientRect(); S.mouse = e.clientY - b.top; });
    cv.addEventListener('pointerleave', () => { S.mouse = null; });
    cv.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') S.mouse = null; });

    const PW = 10, PH = () => S.h * 0.14, PX = 40;
    (function loop() {
        if (!cv.isConnected) { ro.disconnect(); return; }
        const fg = getComputedStyle(document.documentElement).getPropertyValue('--fg').trim();
        const b = S.ball, ph = PH();
        b.x += b.vx; b.y += b.vy;
        if (b.y < 6 || b.y > S.h - 6) b.vy *= -1;
        S.l += (b.y - S.l) * 0.085;
        S.r = S.mouse != null ? S.mouse : S.r + (b.y - S.r) * 0.08;
        const hit = (py, px) => Math.abs(b.y - py) < ph / 2 + 6 && Math.abs(b.x - px) < PW;
        if (b.vx < 0 && hit(S.l, PX)) { b.vx = Math.min(-b.vx * 1.04, 12); b.vy += (b.y - S.l) * 0.08; }
        if (b.vx > 0 && hit(S.r, S.w - PX)) { b.vx = -Math.min(b.vx * 1.04, 12); b.vy += (b.y - S.r) * 0.08; }
        if (b.x < 0) { S.rs++; serve(1); }
        if (b.x > S.w) { S.ls++; serve(-1); }

        ctx.clearRect(0, 0, S.w, S.h);
        ctx.fillStyle = fg;
        for (let y = 12; y < S.h; y += 28) ctx.fillRect(S.w / 2 - 2, y, 4, 14);
        ctx.fillRect(PX - PW / 2, S.l - ph / 2, PW, ph);
        ctx.fillRect(S.w - PX - PW / 2, S.r - ph / 2, PW, ph);
        ctx.fillRect(b.x - 6, b.y - 6, 12, 12);
        ctx.font = '700 40px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(String(S.ls).padStart(2, '0'), S.w / 2 - 70, 80);
        ctx.fillText(String(S.rs).padStart(2, '0'), S.w / 2 + 70, 80);
        requestAnimationFrame(loop);
    })();
}

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
        : `<div class="mbox${k === 'music' || k === 'book' ? ' bare' : ''} mbox-${k}">${VIEWS[k]()}</div>
           <div class="mcap"><div class="txt"><b>${h.caption[0]}</b><span>${h.caption[1]}</span></div></div>`;
    mdetail.innerHTML = `<button class="pill mret" data-act="mreturn"><span class="i i-return"></span>return</button>${body}`;
    previously.hidden = true;
    mdetail.hidden = false;
    mdetail.classList.remove('m-in'); void mdetail.offsetWidth; mdetail.classList.add('m-in');
    if (k === 'tennis') startTennis($('canvas', mdetail));
    mdetail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
mdetail.addEventListener('click', e => {
    e.stopPropagation();
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'mreturn') { showMobile(null); return; }
    if (act === 'play') { togglePlayer(mdetail); return; }
    if (act === 'rew') { playerPos = 0; tickPlayer(mdetail); return; }
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
