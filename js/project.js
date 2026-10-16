/* ── PROJECT PAGE ─────────────────────────
   Scroll, ↑/↓ or the carets flip through pages.
   Likes and comments are visual only for now —
   nothing is stored.
   ──────────────────────────────────────── */

const params = new URLSearchParams(location.search);
let pIndex = Math.max(0, PROJECTS.findIndex(p => p.slug === params.get('p')));
let project = PROJECTS[pIndex];
let page = 0;
const likes = {};   // in-memory only

const el = {
    phones: $('#phones'), prev: $('#prev'), next: $('#next'), counter: $('#counter'),
    like: $('#like'), likes: $('#likes'), body: $('#sidebody'), title: $('#ptitle'), logo: $('#logo'),
    foot: $('#sidefoot'), ts: $('#ts'), input: $('#comment-input'), hint: $('#hint'),
    menu: $('#menu'), plist: $('#plist'), search: $('#psearch'),
};

/* ── RENDER ── */
function overviewHTML(o) {
    return `<div class="pg"><h2>Overview</h2><div class="meta">
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
    el.counter.textContent = `${page + 1}/${project.pages.length}`;
    el.counter.classList.remove('tick'); void el.counter.offsetWidth; el.counter.classList.add('tick');
    el.prev.disabled = page === 0;
    el.next.disabled = page === project.pages.length - 1;
}

function makeSlot(pg) {
    const s = document.createElement('div');
    s.className = 'slot';
    s.innerHTML = `<div class="phone">${mediaHTML(pg.media)}<span class="playflash"></span></div>`;
    const v = $('video', s);
    if (v) {
        const scrub = document.createElement('input');
        Object.assign(scrub, { type: 'range', min: 0, max: 1000, value: 0, className: 'scrub' });
        scrub.setAttribute('aria-label', 'Scrub video');
        $('.phone', s).append(scrub);
        v.addEventListener('timeupdate', () => {
            if (scrub.matches(':active')) return;
            const p = v.duration ? v.currentTime / v.duration : 0;
            scrub.value = p * 1000; scrub.style.setProperty('--p', p * 100 + '%');
            if (s === currentSlot()) el.ts.textContent = fmt(v.currentTime);
        });
        scrub.addEventListener('input', () => {
            if (v.duration) v.currentTime = scrub.value / 1000 * v.duration;
            scrub.style.setProperty('--p', scrub.value / 10 + '%');
        });
        v.addEventListener('click', () => togglePlay(v));
    }
    return s;
}
const currentSlot = () => el.phones.lastElementChild;
const fmt = t => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

function togglePlay(v) {
    const ph = v.closest('.phone'), fl = $('.playflash', ph);
    v.paused ? v.play().catch(() => {}) : v.pause();
    ph.classList.toggle('paused', v.paused);
    fl.textContent = v.paused ? '❚❚' : '▶';
    fl.classList.remove('go'); void fl.offsetWidth; fl.classList.add('go');
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
    old.animate([{ transform: 'translate(-50%,-50%)', opacity: 1 }, { transform: `translate(-50%, calc(-50% - ${d}px)) scale(.94)`, opacity: 0 }], opts)
        .finished.catch(() => {}).then(() => old.remove());
    setTimeout(() => old.remove(), opts.duration + 100); // in case the animation never finishes (background tab)
    s.animate([{ transform: `translate(-50%, calc(-50% + ${d}px)) scale(.94)`, opacity: 0 }, { transform: 'translate(-50%,-50%)', opacity: 1 }], opts);
}

function renderProject() {
    document.title = `${project.title} — Taher Motiwalla`;
    el.title.textContent = project.title;
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
    el.hint.classList.add('gone');
    closeComment();
}
el.prev.addEventListener('click', () => go(-1));
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
let touchY = null;
$('.stage-media').addEventListener('touchstart', e => { touchY = e.touches[0].clientY; }, { passive: true });
$('.stage-media').addEventListener('touchend', e => {
    if (touchY == null) return;
    const dy = touchY - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 40) go(Math.sign(dy));
    touchY = null;
});

/* ── LIKES (placeholder) ── */
function renderLikes() {
    const n = likes[project.slug] || 0;
    el.likes.textContent = String(n).padStart(2, '0');
    el.like.setAttribute('aria-pressed', n > 0);
}
function toggleLike() {
    const on = !(likes[project.slug] > 0);
    likes[project.slug] = on ? 1 : 0;
    renderLikes();
    el.like.classList.remove('pop'); void el.like.offsetWidth; el.like.classList.add('pop');
    if (on && !reduce) burst();
}
function burst() {
    const h = $('.heart', el.like);
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
el.like.addEventListener('click', toggleLike);

/* ── COMMENTS (placeholder) ── */
function openComment() {
    el.foot.classList.add('commenting');
    const v = $('video', currentSlot());
    if (v) el.ts.textContent = fmt(v.currentTime);
    setTimeout(() => el.input.focus(), 30);
}
function closeComment() { el.foot.classList.remove('commenting'); el.input.value = ''; }
$('#comment-open').addEventListener('click', openComment);
$('#comment-cancel').addEventListener('click', closeComment);
$('#comment').addEventListener('submit', e => {
    e.preventDefault();
    if (!el.input.value.trim()) { el.input.focus(); return; }
    closeComment();
    toast('thanks! comments are a preview — not saved yet');
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
shortcut(['Space'], 'play / pause video', () => { const v = $('video', currentSlot()); if (v) togglePlay(v); });
shortcut(['L'], 'like', toggleLike);
shortcut(['C'], 'leave a comment', openComment);
shortcut(['M'], 'projects menu', openMenu);
shortcut(['/'], 'search projects', () => { openMenu(); setTimeout(() => el.search.focus(), 60); });
shortcut(['Esc'], 'back to projects', () => {
    if (el.foot.classList.contains('commenting')) { closeComment(); return; }
    location.href = 'index.html#projects';
});
KEYMAP.space = ' ';

/* ── START (behind the password gate) ── */
function start() {
    document.body.classList.remove('locked');
    renderProject();
    renderPhone(0);
    setTimeout(() => el.hint.classList.add('gone'), 8000);
}
requireUnlock(start);
// closing the gate without the password goes home
$('#gate')?.addEventListener('click', e => {
    if ((e.target.closest('[data-close]') || e.target.id === 'gate') && !isUnlocked()) location.href = 'index.html';
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !isUnlocked()) location.href = 'index.html';
});
