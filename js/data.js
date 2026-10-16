/* ── CONTENT ─────────────────────────────────────────────
   All site copy and media lives here. To swap a video or
   image, change its path. `media: null` shows a placeholder.
   ──────────────────────────────────────────────────────── */

const PROJECTS = [
    {
        slug: 'drive-home-evolution',
        title: 'Drive home evolution',
        logo: 'assets/img/gh-logo.png',
        tags: ['motion', 'interaction', 'haptics'],
        cardTags: ['0→1', 'motion', 'haptics'],
        cover: { type: 'video', src: 'assets/video/toggle-on.mp4' },
        overview: {
            category: ['motion', 'interaction', 'haptics'],
            duration: '1-2 months',
            team: [
                { label: '1 PD', accent: true },
                { label: '3 PM' }, { label: '8 FE' }, { label: '4 BE' },
                { label: '1 DS' }, { label: 'Marketing' }, { label: 'Legal' },
            ],
            release: 'q1 2026',
            impact: '$4.5m saved',
        },
        pages: [
            { title: 'Overview', overview: true,
              media: { type: 'video', src: 'assets/video/toggle-on.mp4' } },
            { title: 'Overview',
              body: "I redesigned Grubhub's driver home screen around one adaptive bottom sheet that surfaces what matters most, from bonus missions to peak times, plus a more interactive map that shows drivers where to go.",
              media: { type: 'video', src: 'assets/video/map-zones.mp4' } },
            { title: 'Toggle on and off',
              body: 'We made going online feel exciting with haptics, and added friction to going offline, which drivers did too easily, plus a new option to pause instead.',
              media: { type: 'video', src: ['assets/video/toggle-on.mp4', 'assets/video/toggle-off.mp4'] } },
            { title: 'Restrictions',
              body: "When a market is oversupplied, we explain why drivers can't go online yet and when to try again, turning a hard no into a clear, respectful next step.",
              media: { type: 'video', src: 'assets/video/restriction.mp4' } },
            { title: 'Best times to work',
              body: 'A glanceable peak-times chart in the bottom sheet shows when demand is highest, so drivers can plan shifts before they ever go online.',
              media: { type: 'image', src: 'assets/img/best-times.png' } },
            { title: 'Mission prominence',
              body: 'Missions moved from buried below the fold to the bottom sheet, with progress shown at a glance so drivers can track bonuses as they work.',
              media: null },
            { title: 'Hotspots & Boost zones',
              body: 'Hotspots and boost zones became tappable map layers with clear color and hierarchy, showing wait times and offer value without cluttering the map.',
              media: { type: 'video', src: 'assets/video/map-zones.mp4' } },
        ],
    },
    {
        slug: 'best-times-to-work',
        title: 'Best times to work',
        logo: 'assets/img/gh-logo.png',
        tags: ['data viz', 'planning'],
        cardTags: ['0→1', 'data viz'],
        cover: { type: 'image', src: 'assets/img/best-times.png' },
        pages: [{ title: 'Coming soon', body: 'Case study copy and media on the way.', media: { type: 'image', src: 'assets/img/best-times.png' } }],
    },
    {
        slug: 'drop-off-tasks',
        title: 'Drop off tasks',
        logo: 'assets/img/gh-logo.png',
        tags: ['workflow', 'interaction'],
        cardTags: ['0→1', 'workflow'],
        cover: null,
        pages: [{ title: 'Coming soon', body: 'Case study copy and media on the way.', media: null }],
    },
    {
        slug: 'earnings-tracker',
        title: 'Earnings tracker',
        logo: 'assets/img/gh-logo.png',
        tags: ['data viz', 'motion'],
        cardTags: ['data viz', 'motion'],
        cover: null,
        pages: [{ title: 'Coming soon', body: 'Case study copy and media on the way.', media: null }],
    },
];

/* Home-page hover panels. Drop files into assets/hobbies/
   with these names and they'll show up automatically. */
const HOBBIES = {
    paint:  { type: 'image', src: 'assets/hobbies/paint.jpg',  note: 'painting goes here' },
    draw:   { type: 'image', src: 'assets/hobbies/draw.jpg',   note: 'drawing goes here' },
    photo:  { type: 'image', src: 'assets/hobbies/photo.jpg',  note: 'photo goes here' },
    music:  { type: 'music', song: 'Pain', artist: '2Pac', length: 271 },
    book:   { type: 'book',  title: 'The Savage Detectives', author: 'Roberto Bolaño', note: 'reading rn' },
    tennis: { type: 'tennis' },
    brooklyn: { type: 'map' },
};

const LINKS = {
    email: 'mailto:tahermotiwalla@gmail.com',
    linkedin: 'https://www.linkedin.com/in/taher-luvai-motiwalla/',
    flyingFox: 'https://epiqsolutions.com/integrated-systems/flying-fox',
    sdge: 'https://madeintandem.com/case-studies/sdge-wildfire-safety-communications/',
    fep: 'https://www.fepblue.org/',
};
