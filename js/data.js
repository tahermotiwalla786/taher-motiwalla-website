/* ── CONTENT ─────────────────────────────────────────────
   All site copy and media lives here. To swap a video or
   image, change its path. `media: null` shows a placeholder.
   ──────────────────────────────────────────────────────── */

const PROJECTS = [
    {
        slug: 'drive-home-evolution',
        title: 'Drive home evolution',
        desc: 'Driver home rebuilt to be fluid', // six words or so: home cards, mobile list, project menu
        logo: 'assets/img/gh-logo.png',
        tags: ['motion', 'interaction', 'haptics'],
        cardTags: ['0→1', 'motion', 'haptics'],
        cover: { type: 'video', src: 'assets/video/dh-cover-loop.mp4' },
        overview: {
            category: ['motion', 'interaction', 'haptics'],
            duration: '1-2 months',
            team: [
                { label: '1 PD', accent: true },
                { label: '3 PM' }, { label: '8 FE' }, { label: '4 BE' },
                { label: '1 DS' }, { label: 'Marketing' }, { label: 'Legal' },
            ],
            release: 'q1 2026',
            impact: '$4.5M saved',
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
        desc: 'Right place, right time for drivers',
        logo: 'assets/img/gh-logo.png',
        tags: ['data viz', 'planning'],
        cardTags: ['0→1', 'data viz'],
        cover: { type: 'video', src: 'assets/video/bt-expand-block.mp4' },
        overview: {
            category: ['microinteractions', 'ui design', 'data viz'],
            duration: '3 weeks',
            team: [
                { label: '1 PD', accent: true },
                { label: '2 PM' }, { label: '3 FE' }, { label: '1 BE' },
                { label: '1 DS' }, { label: 'Marketing' }, { label: 'Legal' },
            ],
            release: 'q4 2026',
            impact: '$11.0M',
        },
        pages: [
            { title: 'Overview', overview: true,
              media: { type: 'video', src: 'assets/video/bt-schedule-home.mp4' } },
            { title: 'Overview',
              body: "Scheduling is how drivers plan their shifts. We redesigned it to add real utility, making it easier for drivers to plan and optimize their work week.",
              media: { type: 'video', src: 'assets/video/bt-schedule-home.mp4' } },
            { title: 'More informative blocks',
              body: "Blocks now show predicted earnings, staffing, hotspots, and mission windows, so drivers can tell at a glance which block is actually worth picking.",
              media: { type: 'video', src: 'assets/video/bt-expand-block.mp4' } },
            { title: 'Filter, optimize and alerts',
              body: "Sorting and filtering let drivers narrow blocks to their goals, and new mealtime alerts flag anything that could affect road conditions, demand, or earnings.",
              media: { type: 'video', src: 'assets/video/bt-block-filters.mp4' } },
            { title: 'Market Trends',
              body: "Drivers can explore regional demand by earnings, tips, orders, or dollars per mile, and see where hotspots cluster, so they can plan before a shift.",
              media: { type: 'video', src: 'assets/video/bt-market-trends.mp4' } },
        ],
    },
    {
        slug: 'drop-off-tasks',
        title: 'Drop off tasks',
        desc: 'Quick iterations to raise quality',
        logo: 'assets/img/gh-logo.png',
        tags: ['workflow', 'interaction'],
        cardTags: ['0→1', 'workflow'],
        cover: { type: 'video', src: 'assets/video/dt-overview.mp4' },
        overview: {
            category: ['rapid iteration', 'ui design', 'interaction'],
            duration: '6 releases, 1-2 weeks each',
            team: [
                { label: '1 PD', accent: true },
                { label: '1 PM' }, { label: '2 FE' }, { label: '1 BE' },
                { label: 'Marketing' }, { label: 'Legal' },
            ],
            release: 'q2 2024 – q3 2026',
            impact: '$42M saved',
        },
        pages: [
            { title: 'Overview', overview: true,
              media: { type: 'video', src: 'assets/video/dt-overview.mp4' } },
            { title: 'Overview',
              body: "As Grubhub shifted toward contact-free delivery and speeds increased, delivery quality slipped. A series of quick iterations to the drop off experience cut missed deliveries by 80%, saving $42 million.",
              media: { type: 'video', src: 'assets/video/dt-overview.mp4' } },
            { title: 'A new foundation',
              body: "We rebuilt the drop off details page with a clearer hierarchy for customer info, address, map, instructions, and order details, plus a dedicated section for drop off tasks, making the flow easier for drivers and easier for us to extend.",
              media: { type: 'video', src: 'assets/video/dt-home-details.mp4' } },
            { title: 'Drop off photos',
              body: "Our first fix was requiring a photo for contact-free deliveries. Over time we refined the guidance and flow to raise adoption and usefulness while keeping it quick for drivers.",
              media: { type: 'video', src: 'assets/video/dt-photos.mp4' } },
            { title: 'PIN codes',
              body: "PIN codes cut delivery fraud by making sure the right order reaches the right customer. We later improved guidance and opt-out flows and tied the feature closer to in-app messaging to drive adoption.",
              media: { type: 'video', src: 'assets/video/dt-pin-code.mp4' } },
        ],
    },
    {
        slug: 'shift-tracker',
        title: 'Shift tracker',
        desc: 'Drivers track their performance',
        logo: 'assets/img/gh-logo.png',
        tags: ['data viz', 'motion'],
        cardTags: ['data viz', 'motion'],
        cover: { type: 'video', src: 'assets/video/st-home-enter.mp4' },
        overview: {
            category: ['data viz', 'ui design', 'interaction'],
            duration: '1 month',
            team: [
                { label: '1 PD', accent: true },
                { label: '1 PM' }, { label: '2 FE' }, { label: '2 BE' },
                { label: '1 DS' }, { label: 'Marketing' }, { label: 'Legal' },
            ],
            release: 'q1 2025',
            impact: '$6M',
        },
        pages: [
            { title: 'Overview', overview: true,
              media: { type: 'video', src: 'assets/video/st-home-enter.mp4' } },
            { title: 'Overview',
              body: "We studied how gig workers track their shifts and earnings, then built drivers one place to see it all and understand what's working and what's not.",
              media: { type: 'video', src: 'assets/video/st-home-enter.mp4' } },
            { title: 'Earnings Time and Deliveries',
              body: "Drivers told us they judge earnings by the hours and deliveries it took to earn them, so we built the tracker around all three.",
              media: { type: 'video', src: 'assets/video/st-metric-filters.mp4' } },
            { title: 'Tap and scroll',
              body: "A breakdown view lets drivers tap into the details behind their earnings, and they can scroll back through previous weeks to see how they compare.",
              media: { type: 'video', src: 'assets/video/st-breakdown-scroll.mp4' } },
            { title: 'Stats and Insights',
              body: "We surfaced the stats drivers care about, the contextual metrics they told us mattered, and insights that make it all digestible and actionable.",
              media: { type: 'video', src: 'assets/video/st-analysis-card.mp4' } },
        ],
    },
];

/* Home-page hover panels. Paint, draw and photo show a random
   image from their list on each hover (web-sized JPGs; the HEIC
   originals stay local). Add a path here to add an image. */
const PAINTINGS = [
    'assets/hobbies/paintings/IMG_0608.jpg',
    'assets/hobbies/paintings/IMG_5532.jpg',
    'assets/hobbies/paintings/IMG_7021.jpg',
    'assets/hobbies/paintings/IMG_7054.jpg',
    'assets/hobbies/paintings/IMG_8333.jpg',
    'assets/hobbies/paintings/rose-painting.jpg',
];
const DRAWINGS = [
    'assets/hobbies/drawings/IMG_5110.jpg',
];
const PHOTOS = [
    'assets/hobbies/photos/IMG_0846.jpg',
    'assets/hobbies/photos/IMG_1209.jpg',
    'assets/hobbies/photos/IMG_1238.jpg',
    'assets/hobbies/photos/IMG_1798.jpg',
    'assets/hobbies/photos/IMG_6793.jpg',
    'assets/hobbies/photos/IMG_7079.jpg',
    'assets/hobbies/photos/IMG_8398.jpg',
    'assets/hobbies/photos/IMG_8505.jpg',
    'assets/hobbies/photos/IMG_8665.jpg',
    'assets/hobbies/photos/IMG_8711.jpg',
    'assets/hobbies/photos/IMG_8769.jpg',
    'assets/hobbies/photos/IMG_8817.jpg',
    'assets/hobbies/photos/IMG_8852.jpg',
    'assets/hobbies/photos/IMG_8895.jpg',
];

const HOBBIES = {
    /* caption = the header / subtitle shown under the card on mobile */
    paint:  { type: 'image', note: 'painting', caption: ['painting', 'acrylic on canvas'], srcs: PAINTINGS },
    draw:   { type: 'image', note: 'drawing',  caption: ['drawing', 'sketchbook'],        srcs: DRAWINGS },
    photo:  { type: 'image', note: 'photo',    caption: ['photo', 'shot on film'],        srcs: PHOTOS },
};

/* Home: "Or else..." steps through these, in order, one per click.
   Clicking the last one turns it into a player for SONG (Hindi and
   Urdu versions live in lang.js). */
const OR_ELSE = ['Or else...', 'buddy you don’t wanna find out', 'Grrrrrrrrrrr', 'jk hehe'];
const SONG = {
    title: 'Can We Talk', artist: 'Tevin Campbell',
    preview: 'https://p.scdn.co/mp3-preview/06750f88f19c0113787d2e6715484225e52d0a9e', // Spotify's 30s preview
    spotify: 'https://open.spotify.com/track/6a5jHgwqYMk9wlYJYfs3c9',
};

const LINKS = {
    email: 'mailto:tahermotiwalla@gmail.com',
    linkedin: 'https://www.linkedin.com/in/taher-luvai-motiwalla/',
    flyingFox: 'https://epiqsolutions.com/integrated-systems/flying-fox',
    sdge: 'https://madeintandem.com/case-studies/sdge-wildfire-safety-communications/',
    fep: 'https://www.fepblue.org/',
};
