/* ── LANGUAGE ────────────────────────────
   EN / हिन्दी / اردو for the home-page bio. The highlighted words are
   the same live buttons (their hover and click handlers stay put); only
   their labels and the words around them change. Company and project
   names stay in English. Urdu flips only the text block to right-to-left,
   not the page. Fonts load the first time a script is picked.
   ──────────────────────────────────────── */

const LANG = {
    hi: {
        label: 'हिन्दी',
        name: 'ताहेर मोटीवाला',
        p1: 'फ़िलहाल {grubhub} में डिज़ाइन कर रहा हूँ। {brooklyn} में रहता हूँ।',
        p2: 'फ़ुर्सत में मुझे {paint}, {draw}, {photo}, {music}, {book}, और {tennis} पसंद है।',
        words: { grubhub: 'Grubhub', brooklyn: 'ब्रुकलिन, NY', paint: 'पेंटिंग करना', draw: 'ड्रॉइंग करना', photo: 'फ़ोटो खींचना', music: 'गाने सुनना', book: 'किताब पढ़ना', tennis: 'टेनिस खेलना' },
        email: 'ईमेल', linkedin: 'LinkedIn', previously: 'पहले',
    },
    ur: {
        label: 'اردو', rtl: true,
        name: 'طاہر موٹی والا',
        p1: 'فی الحال {grubhub} میں ڈیزائن کر رہا ہوں۔ {brooklyn} میں رہتا ہوں۔',
        p2: 'فرصت میں مجھے {paint}، {draw}، {photo}، {music}، {book}، اور {tennis} پسند ہے۔',
        words: { grubhub: 'Grubhub', brooklyn: 'بروکلین، NY', paint: 'پینٹنگ کرنا', draw: 'ڈرائنگ کرنا', photo: 'تصویر کھینچنا', music: 'موسیقی سننا', book: 'کتاب پڑھنا', tennis: 'ٹینس کھیلنا' },
        email: 'ای میل', linkedin: 'LinkedIn', previously: 'پہلے',
    },
};

const intro = $('.intro');
const [p1, p2] = $$('.intro > p');
const L = {
    h1: $('.intro h1'), p1, p2,
    email: $('.contact .ext:nth-child(1)'), linkedin: $('.contact .ext:nth-child(2)'),
    prev: $('.previously .label'),
};
// English as written in index.html, kept to switch back
const EN = {
    h1: L.h1.textContent, email: L.email.textContent, linkedin: L.linkedin.textContent, prev: L.prev.textContent,
    p1: [...p1.childNodes], p2: [...p2.childNodes],
    words: Object.fromEntries(links.map(b => [b.dataset.panel, b.textContent])),
};
const btn = k => links.find(b => b.dataset.panel === k);

let fontsLoaded = false;
function loadScriptFonts() {
    if (fontsLoaded) return;
    fontsLoaded = true;
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&family=Noto+Sans+Devanagari:wght@300;400;700&display=swap';
    document.head.append(l);
}

// "a {grubhub} b" → text, <button>, text — reusing the live buttons
function fill(p, template) {
    p.replaceChildren(...template.split(/(\{\w+\})/).filter(Boolean).map(part => {
        const m = part.match(/^\{(\w+)\}$/);
        return m ? btn(m[1]) : document.createTextNode(part);
    }));
}

function setLang(code) {
    const t = LANG[code];
    if (t) loadScriptFonts();
    intro.lang = t ? code : 'en';
    intro.dir = t?.rtl ? 'rtl' : 'ltr';
    L.prev.lang = intro.lang; L.prev.dir = intro.dir;
    L.h1.textContent = t ? t.name : EN.h1;
    L.email.textContent = t ? t.email : EN.email;
    L.linkedin.textContent = t ? t.linkedin : EN.linkedin;
    L.prev.textContent = t ? t.previously : EN.prev;
    links.forEach(b => { b.textContent = t ? t.words[b.dataset.panel] : EN.words[b.dataset.panel]; });
    if (t) { fill(p1, t.p1); fill(p2, t.p2); }
    else {
        // put each button back at the front of its nowrap span, then the original nodes
        for (const nodes of [EN.p1, EN.p2]) nodes.forEach(n => {
            if (n.classList?.contains('nw')) n.prepend(btn(n.dataset.k));
        });
        p1.replaceChildren(...EN.p1); p2.replaceChildren(...EN.p2);
    }
    $$('.lang button').forEach(b => {
        const on = (b.lang || 'en') === (t ? code : 'en');
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', on);
    });
    store.set('lang', t ? code : 'en');
}

// remember which button each nowrap span holds, so English can be rebuilt
$$('.intro .nw').forEach(s => { const b = $('.hl', s); if (b) s.dataset.k = b.dataset.panel; });
$$('.lang button').forEach(b => b.addEventListener('click', () => setLang(b.lang || 'en')));
if (LANG[store.get('lang')]) setLang(store.get('lang'));
