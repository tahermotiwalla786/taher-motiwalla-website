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
    $('meta[name="theme-color"]')?.setAttribute('content', t === 'light' ? '#f9e9df' : '#0b0500'); // Safari tints its toolbars with this
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
            <div><span><span class="kbd">⌘</span><span class="kbd">?</span></span><span>show shortcuts</span></div>
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
    if (e.key === '?') { showShortcuts(); return; }
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

function showShortcuts() {
    if (typeof toggleShortcuts === 'function') { toggleShortcuts(); return; } // project page: popover
    const o = $('#shortcuts') || buildShortcutSheet();
    o.classList.contains('open') ? closeOverlay(o) : openOverlay(o);
}
/* Tapping ⌘ on its own also shows them. ⌘ with anything else
   (⌘C, ⌘-click, ⌘-tab away) is left alone. */
let cmdAlone = false;
document.addEventListener('keydown', e => { cmdAlone = e.key === 'Meta' && !e.repeat; });
document.addEventListener('keyup', e => {
    const tap = e.key === 'Meta' && cmdAlone;
    cmdAlone = false;
    if (tap && !e.target.closest?.('input, textarea, [contenteditable]') && !$('#gate.open')) showShortcuts();
});
document.addEventListener('pointerdown', () => { cmdAlone = false; });
document.addEventListener('wheel', () => { cmdAlone = false; }, { passive: true }); // ⌘-scroll zooms
window.addEventListener('blur', () => { cmdAlone = false; });

/* ── PASSWORD GATE ──
   Same password + session flag as the previous site. The arrow (or
   Enter) checks the password; Request access opens a pre-filled email.
   Either one, on success: a press, a little chime, and a check. */
const GATE_PW = 'pixel';
function isUnlocked() { return store.sget('pw_ok') === '1'; }

// two soft sine notes, made on the spot (no sound file to load)
let audioCtx;
function chime() {
    try {
        audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
        const t = audioCtx.currentTime;
        [[880, 0], [1318.5, .09]].forEach(([f, d]) => {
            const o = audioCtx.createOscillator(), g = audioCtx.createGain();
            o.type = 'sine'; o.frequency.value = f;
            g.gain.setValueAtTime(0, t + d);
            g.gain.linearRampToValueAtTime(.12, t + d + .01);
            g.gain.exponentialRampToValueAtTime(.0001, t + d + .35);
            o.connect(g).connect(audioCtx.destination);
            o.start(t + d); o.stop(t + d + .4);
        });
    } catch {}
}
function succeed(btn, then) {
    btn.classList.add('press');
    setTimeout(() => { btn.classList.remove('press'); btn.classList.add('done'); chime(); }, 120);
    setTimeout(then, 650);
}

function requireUnlock(onOk) {
    if (isUnlocked()) { onOk(); return; }
    let o = $('#gate');
    if (!o) {
        o = document.createElement('div');
        o.className = 'overlay'; o.id = 'gate'; o.setAttribute('aria-hidden', 'true');
        o.innerHTML = `<div class="sheet gate-sheet" role="dialog" aria-label="Password required">
            <div class="gate-head"><p>This work is protected for now.</p><button data-close aria-label="Close"><span class="i i-close"></span></button></div>
            <form class="gate-row">
                <input type="password" placeholder="Enter password" autocomplete="off" spellcheck="false" aria-label="Password">
                <button class="gate-go" type="submit" aria-label="Enter"><span class="i i-up-arrow"></span></button>
            </form>
            <button class="gate-req" type="button"><span>Request access</span><span class="gate-go" aria-hidden="true"><span class="i i-send"></span></span></button>
        </div>`;
        document.body.append(o);
    }
    const form = $('form', o), inp = $('input', o), go = $('.gate-go', form);
    const req = $('.gate-req', o), reqGo = $('.gate-go', req);
    [go, reqGo].forEach(b => b.classList.remove('done', 'press'));
    form.onsubmit = e => {
        e.preventDefault();
        if (go.classList.contains('done')) return;
        if (inp.value.trim().toLowerCase() === GATE_PW) {
            store.sset('pw_ok', '1');
            form.classList.remove('error');
            succeed(go, () => { closeOverlay(o); onOk(); });
        } else {
            form.classList.remove('error'); void form.offsetWidth; form.classList.add('error');
            inp.value = '';
        }
    };
    req.onclick = () => {
        if (reqGo.classList.contains('done')) return;
        succeed(reqGo, () => {
            location.href = `mailto:tahermotiwalla@gmail.com?subject=${encodeURIComponent('Portfolio access request')}&body=${encodeURIComponent('Hi Taher, could I get the password to see your work?')}`;
            setTimeout(() => reqGo.classList.remove('done'), 1500);
        });
    };
    inp.oninput = () => form.classList.remove('error');
    form.classList.remove('error');
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
