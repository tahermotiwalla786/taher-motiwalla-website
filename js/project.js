/* ── PROJECT PAGE ─────────────────────────
   Scroll, ↑/↓ or the carets flip through pages.
   Likes are visual only for now. Questions open
   a pre-filled email to Taher.
   ──────────────────────────────────────── */

const params = new URLSearchParams(location.search);
let pIndex = Math.max(0, PROJECTS.findIndex(p => p.slug === params.get('p')));
let project = PROJECTS[pIndex];
let page = 0;
const likes = {};   // in-memory only

const el = {
    phones: $('#phones'), prev: $('#prev'), next: $('#next'), counter: $('#counter'),
    like: $('#like'), likes: $('#likes'), body: $('#sidebody'), title: $('#ptitle'), logo: $('#logo'),
    foot: $('#sidefoot'), ts: $('#ts'), input: $('#comment-input'),
    menu: $('#menu'), plist: $('#plist'), search: $('#psearch'),
};

/* ── RENDER ── */
function overviewHTML(o) {
    return `<div class="pg"><h2 class="sr-only">Overview</h2><div class="meta">
        <div><h3>Category</h3><div class="row">${o.category.map(c => `<span>${c}</span>`).join('')}</div></div>
        <div><h3>Duration</h3><div class="row">${o.duration}</div></div>
        <div><h3>Team</h3><div class="chips">${o.team.map(t => `<span class="chip${t.accent ? ' accent' : ''}">${t.label}</span>`).join('')}</div></div>
        <div><h3>Release</h3><div class="row">${o.release}</div></div>
        <div><h3>Impact</h3><div class="row">${o.impact}</div></div>
    </div></div>`;
}

function renderSide() {
    const pg = project.pages[page];
    const isOverview = pg.overview && project.overview;
    el.body.classList.toggle('centered', !isOverview);
    el.body.innerHTML = isOverview ? overviewHTML(project.overview)
        : `<div class="pg"><h2>${pg.title}</h2><p class="body">${pg.body || ''}</p></div>`;
    // mobile: ‹ n/7 › sits beside the title
    $('h2', el.body).insertAdjacentHTML('afterend', `<span class="mpager">
        <button data-go="-1" aria-label="Previous page" ${page === 0 ? 'disabled' : ''}><span class="i i-up rot-left"></span></button>
        <b>${page + 1}/${project.pages.length}</b>
        <button data-go="1" aria-label="Next page" ${page === project.pages.length - 1 ? 'disabled' : ''}><span class="i i-up rot-right"></span></button></span>`);
    const h2 = $('h2', el.body), pager = $('.mpager', el.body);
    const head = document.createElement('div'); head.className = 'pg-head';
    h2.before(head); head.append(h2, pager);
    el.counter.textContent = `${page + 1}/${project.pages.length}`;
    el.counter.classList.remove('tick'); void el.counter.offsetWidth; el.counter.classList.add('tick');
    el.prev.disabled = page === 0;
    el.next.disabled = page === project.pages.length - 1;
}

const ICON_PLAY = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/></svg>';
const ICON_PAUSE = '<svg viewBox="0 0 24 24" width="18" height="18"><rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor"/><rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor"/></svg>';

function makeSlot(pg) {
    const s = document.createElement('div');
    s.className = 'slot';
    s.innerHTML = `<div class="phone">${mediaHTML(pg.media)}</div>`;
    const v = $('video', s);
    if (v) {
        s.insertAdjacentHTML('beforeend', `
            <button class="pp" aria-label="Pause">${ICON_PAUSE}</button>
            <div class="scrubber" role="slider" tabindex="-1" aria-label="Scrub video" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                <div class="track"><i class="fill"></i></div>
                <div class="thumb"><span class="tip">00:00</span></div>
            </div>`);
        $('.phone', s).append($('.pp', s));
        const bar = $('.scrubber', s);
        const setPos = p => {
            s.style.setProperty('--p', p);
            bar.setAttribute('aria-valuenow', Math.round(p * 100));
            $('.tip', s).textContent = fmt(p * (v.duration || 0));
        };
        v.addEventListener('timeupdate', () => {
            if (bar.classList.contains('dragging')) return;
            setPos(v.duration ? v.currentTime / v.duration : 0);
            if (s === currentSlot()) el.ts.textContent = fmt(v.currentTime);
        });
        v.addEventListener('play', () => syncPP(v));
        v.addEventListener('pause', () => syncPP(v));

        // drag anywhere on the bar; the comment timestamp follows
        const seek = e => {
            const r = $('.track', s).getBoundingClientRect();
            const p = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
            setPos(p);
            if (v.duration) v.currentTime = p * v.duration;
            el.ts.textContent = fmt(p * (v.duration || 0));
        };
        let wasPlaying = false;
        bar.addEventListener('pointerdown', e => {
            bar.setPointerCapture(e.pointerId);
            bar.classList.add('dragging');
            wasPlaying = !v.paused;
            v.pause();
            seek(e);
        });
        bar.addEventListener('pointermove', e => { if (bar.classList.contains('dragging')) seek(e); });
        const end = () => {
            if (!bar.classList.contains('dragging')) return;
            bar.classList.remove('dragging');
            el.ts.classList.remove('bump'); void el.ts.offsetWidth; el.ts.classList.add('bump');
            if (wasPlaying && !el.foot.classList.contains('commenting')) v.play().catch(() => {});
        };
        bar.addEventListener('pointerup', end);
        bar.addEventListener('pointercancel', end);
        bar.addEventListener('keydown', e => {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
            e.preventDefault(); e.stopPropagation();
            v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + (e.key === 'ArrowLeft' ? -1 : 1)));
        });

        v.addEventListener('click', () => { if (!revealScrub(s)) togglePlay(v); });
        $('.pp', s).addEventListener('click', e => { e.stopPropagation(); revealScrub(s); togglePlay(v); });
    }
    return s;
}
const currentSlot = () => el.phones.lastElementChild;
const fmt = t => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

/* First tap on a video lifts the phone and brings in the scrubber
   and play/pause button (Figma: "Drive Home Evolution 4/4").
   Returns true if this tap did the reveal. */
function revealScrub(s) {
    if (s.classList.contains('scrub-on')) return false;
    s.classList.add('scrub-on');
    $('.scrubber', s).tabIndex = 0;
    return true;
}
/* Clicking the picture around the phone undoes the reveal:
   the phone settles back down and the scrubber slides away. */
function hideScrub(s) {
    if (!s?.classList.contains('scrub-on')) return;
    s.classList.remove('scrub-on');
    $('.scrubber', s).tabIndex = -1;
}
$('.stage-media').addEventListener('click', e => {
    if (e.target.closest('.phone, .scrubber, .backbtn') || el.foot.classList.contains('commenting')) return;
    hideScrub(currentSlot());
});
function syncPP(v) {
    const pp = $('.pp', v.closest('.slot'));
    pp.innerHTML = v.paused ? ICON_PLAY : ICON_PAUSE;
    pp.setAttribute('aria-label', v.paused ? 'Play' : 'Pause');
}
function togglePlay(v, play = v.paused) {
    play ? v.play().catch(() => {}) : v.pause();
}

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
function renderPhone(dir) {
    const old = currentSlot();
    const s = makeSlot(project.pages[page]);
    el.phones.append(s);
    el.ts.textContent = '00:00';
    if (!old || reduce) { old?.remove(); return; }
    const d = 60 * dir;
    const opts = { duration: 550, easing: 'cubic-bezier(.2,.8,.2,1)' };
    // desktop flips vertically (scroll); mobile slides sideways (swipe)
    const at = off => matchMedia('(max-width: 900px)').matches
        ? `translateX(${off}px)` : `translateY(${off}px)`;
    old.animate([{ transform: 'none', opacity: 1 }, { transform: `${at(-d)} scale(.94)`, opacity: 0 }], opts)
        .finished.catch(() => {}).then(() => old.remove());
    setTimeout(() => old.remove(), opts.duration + 100); // in case the animation never finishes (background tab)
    s.animate([{ transform: `${at(d)} scale(.94)`, opacity: 0 }, { transform: 'none', opacity: 1 }], opts);
}

function renderProject() {
    document.title = `${project.title} — Taher Motiwalla`;
    el.title.textContent = project.title;
    $('#mptitle').textContent = project.title;
    el.logo.src = project.logo;
    renderLikes();
    renderSide();
}

/* ── NAVIGATION ── */
let lastFlip = 0;
function go(delta) {
    const n = page + delta;
    if (n < 0 || n >= project.pages.length) return;
    page = n;
    lastFlip = performance.now();
    renderSide();
    renderPhone(delta);
    closeComment();
}
el.prev.addEventListener('click', () => go(-1));
el.body.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) go(+b.dataset.go); });
el.next.addEventListener('click', () => go(1));

function switchProject(i, dir = 1) {
    pIndex = (i + PROJECTS.length) % PROJECTS.length;
    project = PROJECTS[pIndex];
    page = 0;
    history.replaceState(null, '', `?p=${project.slug}`);
    renderProject();
    renderPhone(dir);
    closeComment();
}

// wheel / trackpad: one flip per gesture
let wheelAcc = 0, wheelTimer;
$('.proj').addEventListener('wheel', e => {
    if (e.target.closest('.side-body') && el.body.scrollHeight > el.body.clientHeight) return;
    e.preventDefault();
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { wheelAcc = 0; }, 160);
    if (performance.now() - lastFlip < 650) return;
    wheelAcc += e.deltaY;
    if (Math.abs(wheelAcc) > 40) { go(Math.sign(wheelAcc)); wheelAcc = 0; }
}, { passive: false });

// touch: vertical swipe on the stage
// touch: swipe sideways (or up/down) anywhere outside the scrubber to flip pages
let touch = null;
$('.proj').addEventListener('touchstart', e => {
    if (e.target.closest('.scrubber, input, button')) { touch = null; return; }
    touch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}, { passive: true });
$('.proj').addEventListener('touchend', e => {
    if (!touch) return;
    const dx = touch.x - e.changedTouches[0].clientX, dy = touch.y - e.changedTouches[0].clientY;
    touch = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 40) return;
    go(Math.sign(Math.abs(dx) > Math.abs(dy) ? dx : dy));
});

/* ── LIKES (placeholder) ── */
function renderLikes() {
    const n = likes[project.slug] || 0;
    $$('.like').forEach(b => {
        $('.count', b).textContent = String(n).padStart(2, '0');
        b.setAttribute('aria-pressed', n > 0);
    });
}
function toggleLike() {
    const on = !(likes[project.slug] > 0);
    likes[project.slug] = on ? 1 : 0;
    renderLikes();
    $$('.like').forEach(b => { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); });
    if (on && !reduce) $$('.like').forEach(b => { if (b.offsetParent) burst(b); });
}
function burst(btn) {
    const h = $('.heart', btn);
    for (let i = 0; i < 8; i++) {
        const dot = document.createElement('span');
        dot.className = 'burst';
        h.append(dot);
        const a = i / 8 * Math.PI * 2;
        dot.animate([{ transform: 'translate(-50%,-50%)', opacity: 1 },
                     { transform: `translate(calc(-50% + ${Math.cos(a) * 26}px), calc(-50% + ${Math.sin(a) * 26}px)) scale(.4)`, opacity: 0 }],
                    { duration: 500, easing: 'cubic-bezier(.2,.8,.2,1)' }).finished.then(() => dot.remove());
    }
}
$$('.like').forEach(b => b.addEventListener('click', toggleLike));

/* ── ASK A QUESTION ──
   Same look as the old comment box. Send opens the visitor's email app
   with the project, page and video time already filled in. */
function openComment() {
    el.foot.classList.add('commenting');
    const v = $('video', currentSlot());
    if (v) { revealScrub(currentSlot()); togglePlay(v, false); el.ts.textContent = fmt(v.currentTime); }
    setTimeout(() => el.input.focus(), 30);
}
function closeComment() { el.foot.classList.remove('commenting'); el.input.value = ''; }
$('#comment-open').addEventListener('click', openComment);
$('#comment-cancel').addEventListener('click', closeComment);
$('#comment').addEventListener('submit', e => {
    e.preventDefault();
    if (!el.input.value.trim()) { el.input.focus(); return; }
    const pg = project.pages[page];
    const subject = `Question: ${project.title} — ${pg.title} @ ${el.ts.textContent}`;
    location.href = `${LINKS.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(el.input.value.trim())}`;
    closeComment();
    toast('opening your email app');
});
el.input.addEventListener('keydown', e => { if (e.key === 'Escape') closeComment(); });

/* ── PROJECT MENU + SEARCH ── */
function searchText(p) {
    return [p.title, ...p.tags, ...p.pages.map(pg => `${pg.title} ${pg.body || ''}`)].join(' ').toLowerCase();
}
function renderMenu(q = '') {
    q = q.trim().toLowerCase();
    const items = PROJECTS.map((p, i) => ({ p, i })).filter(({ p }) => !q || searchText(p).includes(q));
    el.plist.innerHTML = items.length ? items.map(({ p, i }) => `
        <a class="prow${i === pIndex ? ' on' : ''}" href="?p=${p.slug}" data-i="${i}">
            <img class="logo" src="${p.logo}" alt="">
            <div><div class="pt">${p.title}</div><div class="tags">${p.tags.map(t => `<span>${t}</span>`).join('')}</div></div>
        </a>`).join('') : `<p class="empty">nothing matches “${q}”</p>`;
}
function openMenu() { el.search.value = ''; renderMenu(); openOverlay(el.menu); }
$('#projmenu').addEventListener('click', openMenu);
$('#mpill').addEventListener('click', openMenu);
el.search.addEventListener('input', () => renderMenu(el.search.value));
el.search.addEventListener('keydown', e => {
    if (e.key === 'Enter') { const first = $('.prow', el.plist); if (first) first.click(); }
});
el.plist.addEventListener('click', e => {
    const row = e.target.closest('.prow');
    if (!row) return;
    e.preventDefault();
    closeOverlay(el.menu);
    const i = +row.dataset.i;
    if (i !== pIndex) switchProject(i, i > pIndex ? 1 : -1);
});

/* ── SHORTCUTS ── */
shortcut(['↑', '↓'], 'flip pages', e => go(e.key === 'ArrowUp' ? -1 : 1));
shortcut(['←', '→'], 'previous / next project', e => switchProject(pIndex + (e.key === 'ArrowLeft' ? -1 : 1), e.key === 'ArrowLeft' ? -1 : 1));
shortcut(['Space'], 'play / pause video', () => { const v = $('video', currentSlot()); if (v) { revealScrub(currentSlot()); togglePlay(v); } });
shortcut(['L'], 'like', toggleLike);
shortcut(['Q'], 'ask a question', openComment);
shortcut(['M'], 'projects menu', openMenu);
shortcut(['/'], 'search projects', () => { openMenu(); setTimeout(() => el.search.focus(), 60); });
shortcut(['Esc'], 'back to projects', () => {
    if (!scPop.hidden) { toggleShortcuts(false); return; }
    if (el.foot.classList.contains('commenting')) { closeComment(); return; }
    location.href = 'index.html#projects';
});
KEYMAP.space = ' ';

/* shortcuts popover (common.js sends ? here too) */
const scPop = $('#sc-pop'), scBtn = $('#sc-btn');
function toggleShortcuts(open = scPop.hidden) {
    if (open) $('#sc-list').innerHTML = [...SHORTCUTS, { keys: ['?'], label: 'show shortcuts' }].map(s =>
        `<div><span>${s.keys.map(k => `<span class="kbd">${k}</span>`).join('')}</span><span>${s.label}</span></div>`).join('');
    scPop.hidden = !open;
    scBtn.setAttribute('aria-expanded', open);
}
scBtn.addEventListener('click', e => { e.stopPropagation(); toggleShortcuts(); });
$('#sc-close').addEventListener('click', () => toggleShortcuts(false));
document.addEventListener('click', e => { if (!scPop.hidden && !e.target.closest('.sc-wrap')) toggleShortcuts(false); });

/* ── START (behind the password gate) ── */
function start() {
    document.body.classList.remove('locked');
    renderProject();
    renderPhone(0);
}
requireUnlock(start);
// closing the gate without the password goes home
$('#gate')?.addEventListener('click', e => {
    if ((e.target.closest('[data-close]') || e.target.id === 'gate') && !isUnlocked()) location.href = 'index.html';
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !isUnlocked()) location.href = 'index.html';
});
