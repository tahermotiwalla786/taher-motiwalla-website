/* ── SHARED: theme, shortcuts, toast, password gate ── */

const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
    sget(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
    sset(k, v) { try { sessionStorage.setItem(k, v); } catch {} },
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ── THEME ── */
function setTheme(t) {
    document.documentElement.dataset.theme = t;
    store.set('theme', t);
    $$('.theme-toggle').forEach(b => b.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'));
}
function toggleTheme() {
    const btns = $$('.theme-toggle');
    btns.forEach(b => b.classList.add('spin'));
    setTimeout(() => {
        setTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light');
        btns.forEach(b => b.classList.remove('spin'));
    }, 160);
}
setTheme(store.get('theme') || 'dark');
document.addEventListener('click', e => { if (e.target.closest('.theme-toggle')) toggleTheme(); });

/* ── TOAST ── */
let toastTimer;
function toast(msg) {
    let t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.append(t); }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ── OVERLAYS ── */
function openOverlay(el) { el.classList.add('open'); el.setAttribute('aria-hidden', 'false'); setTimeout(() => ($('input', el) || $('button', el))?.focus(), 50); }
function closeOverlay(el) { el.classList.remove('open'); el.setAttribute('aria-hidden', 'true'); }
function anyOverlayOpen() { return $('.overlay.open'); }
document.addEventListener('click', e => {
    if (e.target.classList.contains('overlay')) closeOverlay(e.target);
    const c = e.target.closest('[data-close]');
    if (c) closeOverlay(c.closest('.overlay'));
});

/* ── KEYBOARD SHORTCUTS ──
   Each page registers its own; ? lists them all. */
const SHORTCUTS = [];
function shortcut(keys, label, fn) { SHORTCUTS.push({ keys, label, fn }); }

function buildShortcutSheet() {
    const o = document.createElement('div');
    o.className = 'overlay'; o.id = 'shortcuts'; o.setAttribute('aria-hidden', 'true');
    o.innerHTML = `<div class="sheet" role="dialog" aria-label="Keyboard shortcuts">
        <div class="sheet-head">Shortcuts <button data-close aria-label="Close"><span class="i i-close"></span></button></div>
        <div class="shortcut-list">${SHORTCUTS.map(s =>
            `<div><span>${s.keys.map(k => `<span class="kbd">${k}</span>`).join('')}</span><span>${s.label}</span></div>`).join('')}
            <div><span><span class="kbd">?</span></span><span>show shortcuts</span></div>
        </div></div>`;
    document.body.append(o);
    return o;
}

const KEYMAP = { '↑': 'ArrowUp', '↓': 'ArrowDown', '←': 'ArrowLeft', '→': 'ArrowRight', 'esc': 'Escape' };
document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const typing = !!e.target.closest?.('input, textarea, [contenteditable]');
    if (e.key === 'Escape') {
        const o = anyOverlayOpen();
        if (o) { closeOverlay(o); return; }
        if (typing) { e.target.blur(); }
    }
    if (typing) return;
    if (e.key === '?' && typeof toggleShortcuts === 'function') { toggleShortcuts(); return; } // project page: popover
    if (e.key === '?') {
        const o = $('#shortcuts') || buildShortcutSheet();
        o.classList.contains('open') ? closeOverlay(o) : openOverlay(o);
        return;
    }
    if (anyOverlayOpen() && e.key !== 'Escape') return;
    for (const s of SHORTCUTS) {
        if (s.keys.some(k => (KEYMAP[k.toLowerCase()] || k.toLowerCase()) === (e.key.length === 1 ? e.key.toLowerCase() : e.key))) {
            e.preventDefault();
            s.fn(e);
            return;
        }
    }
});
shortcut(['D'], 'dark / light mode', toggleTheme);

/* ── PASSWORD GATE ──
   Same password + session flag as the previous site. */
const GATE_PW = 'pixel';
function isUnlocked() { return store.sget('pw_ok') === '1'; }
function requireUnlock(onOk) {
    if (isUnlocked()) { onOk(); return; }
    let o = $('#gate');
    if (!o) {
        o = document.createElement('div');
        o.className = 'overlay'; o.id = 'gate'; o.setAttribute('aria-hidden', 'true');
        o.innerHTML = `<div class="sheet" role="dialog" aria-label="Password required">
            <div class="sheet-head">Password <button data-close aria-label="Close"><span class="i i-close"></span></button></div>
            <form class="gate">
                <p>The work is password protected for now.</p>
                <div class="gate-row"><input type="password" placeholder="enter password" autocomplete="off" spellcheck="false" aria-label="Password"><button type="submit">Enter</button></div>
            </form></div>`;
        document.body.append(o);
    }
    const form = $('form', o), row = $('.gate-row', o), inp = $('input', o);
    form.onsubmit = e => {
        e.preventDefault();
        if (inp.value.trim().toLowerCase() === GATE_PW) {
            store.sset('pw_ok', '1');
            closeOverlay(o);
            onOk();
        } else {
            row.classList.remove('error'); void row.offsetWidth; row.classList.add('error');
            inp.value = '';
        }
    };
    inp.value = '';
    openOverlay(o);
}

/* ── MEDIA ── */
function mediaHTML(m, { autoplay = true, placeholder = 'video coming soon' } = {}) {
    if (!m) return `<div class="phone-ph">${placeholder}</div>`;
    if (m.type === 'image') return `<img src="${m.src}" alt="" loading="lazy">`;
    const srcs = [].concat(m.src);
    return `<video src="${srcs[0]}" data-playlist="${srcs.join('|')}" muted playsinline preload="${autoplay ? 'metadata' : 'auto'}" ${autoplay ? 'autoplay' : ''} ${srcs.length > 1 ? '' : 'loop'}></video>`;
}
/* Videos with several sources play one after another, then loop. */
document.addEventListener('ended', e => {
    const v = e.target;
    if (!(v instanceof HTMLVideoElement) || !v.dataset.playlist) return;
    const list = v.dataset.playlist.split('|');
    if (list.length < 2) return;
    const i = (list.indexOf(v.getAttribute('src')) + 1) % list.length;
    v.src = list[i]; v.play().catch(() => {});
}, true);
