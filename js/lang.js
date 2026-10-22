/* ── LANGUAGE ────────────────────────────
   EN / हिन्दी / اردو for the home-page bio. The highlighted words and the
   Grubhub link are the same live elements (their hover and click handlers
   stay put); only their labels and the words around them change. Company and project
   names stay in English. Urdu flips only the text block to right-to-left,
   not the page. Fonts load the first time a script is picked.
   ──────────────────────────────────────── */

const LANG = {
    hi: {
        label: 'हिन्दी',
        name: 'ताहेर मोटीवाला',
        p: [
            'मैं एक प्रोडक्ट डिज़ाइनर हूँ और फ़िलहाल {gh} में काम कर रहा हूँ।',
            'मेरा प्रोफ़ेशनल काम आप {grubhub} में देख सकते हैं।',
            'या फिर मेरी खींची कुछ {photo} देख सकते हैं, जिनसे मुझे {draw} के लिए कुछ मिल जाता है, और कभी-कभी तो मैं उन्हें {paint} की कोशिश भी करता हूँ।',
        ],
        words: { grubhub: 'प्रोजेक्ट्स', photo: 'तस्वीरें', draw: 'ड्रॉ करने', paint: 'पेंट करने' },
        email: 'ईमेल', linkedin: 'LinkedIn', previously: 'पहले',
        residing: 'ब्रुकलिन, NY में रहता हूँ।',
    },
    ur: {
        label: 'اردو', rtl: true,
        name: 'طاہر موٹی والا',
        p: [
            'میں ایک پروڈکٹ ڈیزائنر ہوں اور فی الحال {gh} میں کام کر رہا ہوں۔',
            'میرا پیشہ ورانہ کام آپ {grubhub} میں دیکھ سکتے ہیں۔',
            'یا پھر میری کھینچی ہوئی کچھ {photo} دیکھ لیں، جن سے مجھے {draw} کے لیے کچھ مل جاتا ہے، اور کبھی کبھی تو میں انہیں {paint} کی کوشش بھی کرتا ہوں۔',
        ],
        words: { grubhub: 'پروجیکٹس', photo: 'تصویریں', draw: 'ڈرا کرنے', paint: 'پینٹ کرنے' },
        email: 'ای میل', linkedin: 'LinkedIn', previously: 'پہلے',
        residing: 'بروکلین، NY میں رہتا ہوں۔',
    },
};

const intro = $('.intro');
const paras = $$('.intro > p');
const gh = $('.intro > p .ext'); // Grubhub ↗ stays a link in every language
const L = {
    h1: $('.intro h1'),
    email: $('.contact .ext:nth-child(1)'), linkedin: $('.contact .ext:nth-child(2)'),
    prev: $('.previously .label'), residing: $('.residing'),
};
// English as written in index.html, kept to switch back
const EN = {
    h1: L.h1.textContent, email: L.email.textContent, linkedin: L.linkedin.textContent,
    prev: L.prev.textContent, residing: L.residing.textContent,
    p: paras.map(p => [...p.childNodes]),
    words: Object.fromEntries(links.map(b => [b.dataset.panel, b.textContent])),
};
const tokenEl = k => k === 'gh' ? gh : links.find(b => b.dataset.panel === k);

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
        return m ? tokenEl(m[1]) : document.createTextNode(part);
    }));
}

function setLang(code) {
    const t = LANG[code];
    if (t) loadScriptFonts();
    const lang = t ? code : 'en', dir = t?.rtl ? 'rtl' : 'ltr';
    for (const el of [intro, L.prev, L.residing]) { el.lang = lang; el.dir = dir; }
    for (const k of ['h1', 'email', 'linkedin', 'prev', 'residing']) {
        const key = { h1: 'name', prev: 'previously' }[k] || k;
        L[k].textContent = t ? t[key] : EN[k];
    }
    links.forEach(b => { b.textContent = t ? t.words[b.dataset.panel] : EN.words[b.dataset.panel]; });
    if (t) paras.forEach((p, i) => fill(p, t.p[i]));
    else {
        // put each button back at the front of its nowrap span, then the original nodes
        EN.p.forEach(nodes => nodes.forEach(n => {
            if (n.classList?.contains('nw')) n.prepend(tokenEl(n.dataset.k));
        }));
        paras.forEach((p, i) => p.replaceChildren(...EN.p[i]));
    }
    $$('.lang button').forEach(b => {
        const on = (b.lang || 'en') === lang;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', on);
    });
    store.set('lang', lang);
}

// remember which button each nowrap span holds, so English can be rebuilt
$$('.intro .nw').forEach(s => { const b = $('.hl', s); if (b) s.dataset.k = b.dataset.panel; });
$$('.lang button').forEach(b => b.addEventListener('click', () => setLang(b.lang || 'en')));
if (LANG[store.get('lang')]) setLang(store.get('lang'));
