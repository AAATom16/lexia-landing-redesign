/* ============================================
   LEXIA - SVG Icon Library (Phosphor-style)
   Stroke-based, 24x24, 1.5px stroke, rounded
   Použití: <i class="icon" data-icon="shield"></i>
   ============================================ */

const LEXIA_ICONS = {
  // Pojistné pilíře / produkty
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>',
  car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17h14M5 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm14 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/><path d="M3 17v-5l2-5h14l2 5v5M7 12h10"/></svg>',
  briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/></svg>',
  house: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9Z"/></svg>',
  scales: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M5 21h14M6 7l-3 7a3 3 0 0 0 6 0L6 7Zm12 0-3 7a3 3 0 0 0 6 0l-3-7ZM6 7l6-2 6 2"/></svg>',
  construction: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20M4 20V8l8-5 8 5v12M10 20v-6h4v6M9 8h6"/></svg>',
  building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/></svg>',
  tree: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-7M9 15c-3 0-5-2-5-5 0-1 .5-2 1-2.5C5 6 6 5 8 5c1 0 2 .5 2 .5S11 3 12 3s2 2.5 2 2.5S15 5 16 5c2 0 3 1 3 2.5.5.5 1 1.5 1 2.5 0 3-2 5-5 5H9Z"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="7" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M14 17.5c.5-1.5 1.7-2.5 3-2.5 2.2 0 4 1.8 4 4"/></svg>',
  bank: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10l9-6 9 6M5 10v9M19 10v9M9 10v9M15 10v9M3 21h18M3 10h18"/></svg>',
  school: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5ZM6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5M22 10v6"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L7.9 9.8a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2.1Z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z"/></svg>',
  location: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  emergency: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="m12 2 3.1 6.3 6.9 1L17 14.1l1.2 6.9L12 17.8l-6.2 3.2L7 14.1 2 9.3l6.9-1L12 2Z"/></svg>',
  star_outline: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 3.1 6.3 6.9 1L17 14.1l1.2 6.9L12 17.8l-6.2 3.2L7 14.1 2 9.3l6.9-1L12 2Z"/></svg>',
  clipboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"/></svg>',
  gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8M12 8v13"/><path d="M12 8S10.5 3.5 8 3.5A2.25 2.25 0 0 0 8 8h4Zm0 0s1.5-4.5 4-4.5A2.25 2.25 0 0 1 16 8h-4Z"/></svg>',

  // Sada pro sekci „Proč spolupracovat s Lexií" a „Podpora a vzdělávání"
  medal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3.2 12 9.8M15 3.2 12 9.8"/><circle cx="12" cy="15.6" r="5.8"/><path d="M10.8 13.5 12 12.4v6.4M10.4 18.8h3.2" stroke-width="1.3"/></svg>',
  stopwatch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="14.6" cy="13.4" r="6.6"/><path d="M14.6 9.8v3.6l2.5 1.5"/><path d="M12.6 3.6h4M14.6 3.6v3.2M19.6 8l1.4-1.4"/><path d="M2.6 9.4h4.6M1.4 13h4M3.4 16.6h3.4"/></svg>',
  coins: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="9.8" cy="9.8" r="5.6"/><circle cx="14.4" cy="14.4" r="5.6" fill="var(--white,#fff)"/><path d="M11.6 15.8 15.8 11.6M13.2 17.6l4.4-4.4M15.6 18.4l2.6-2.6"/></svg>',
  mouse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="6.6" y="7.4" width="10.8" height="14.2" rx="5.4"/><path d="M12 10.4v2.6M6.8 12.6h10.4"/><path d="M12 7.4V4.9c0-1 .8-1.8 1.8-1.8h2.6"/></svg>',
  hand_person: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12.6" cy="5.4" r="2.4"/><path d="M9.4 12.2a3.2 3.2 0 0 1 6.4 0"/><path d="M2.6 15.2c1.8 0 3 .7 4.2 1.6 1.1.9 2.2 1.5 3.7 1.5h6a1.5 1.5 0 0 0 0-3h-3.3"/><path d="M16.7 18.2c2.3-.5 4.2-1.7 5.7-3.4"/></svg>',
  lightbulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.2v2.1M5.6 4.9l1.5 1.5M18.4 4.9l-1.5 1.5M3 11.3h2.1M18.9 11.3H21M5.9 17.6l1.5-1.5M18.1 17.6l-1.5-1.5"/><path d="M12 6.4a5 5 0 0 0-3 9c.6.5.9 1.1.9 1.8h4.2c0-.7.3-1.3.9-1.8a5 5 0 0 0-3-9Z"/><path d="M10.1 19h3.8M10.8 21.2h2.4"/></svg>',
  marketing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4.5h9.5v7H7l-3 2.5v-2.5H3Z"/><path d="M6.6 7.1c.5-.6 1.4-.5 1.8.2.4-.7 1.3-.8 1.8-.2.5.6.2 1.4-1.8 2.6-2-1.2-2.3-2-1.8-2.6Z"/><path d="M11.5 12.5H21v7h-1v2.5l-3-2.5h-5.5Z"/><path d="M14.6 14.6l-.6 3.2M17 14.6l-.6 3.2M13.6 15.6h3.9M13.2 17.2h3.9"/></svg>',
  chat_bubbles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h10v6.5H7L4 13v-2.5H3Z"/><path d="M8.5 13h12.5v7H19v2.5L16 20H8.5Z"/><path d="M11 15.4h7.2M11 17.6h5"/></svg>',
  elearning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12.5" rx="1.6"/><path d="M12 16.5v2.6M8.6 21h6.8M10.4 19.1h3.2l1.8 1.9H8.6Z"/><path d="m11.2 8.1 3.6 3.1-1.7.2-.7 1.6Z" fill="currentColor"/></svg>',
  document_check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 3.5H15L19.5 8v11a1.5 1.5 0 0 1-1.5 1.5h-8.5A1.5 1.5 0 0 1 8 19V5a1.5 1.5 0 0 1 1.5-1.5Z"/><path d="M15 3.5V8h4.5"/><circle cx="7.6" cy="14.6" r="3.9" fill="var(--white,#fff)"/><path d="m5.9 14.7 1.3 1.3 2.3-2.7"/></svg>',
  coins_percent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="8.4" cy="12" r="5.2"/><path d="m6.7 13.6 3.4-3.4M7 10.4h.01M9.8 13.4h.01"/><path d="M13.5 7.2c3.1.1 5.5 1.2 5.5 2.6 0 1.4-2.6 2.6-5.8 2.6"/><path d="M19 9.8v4.4c0 1.4-2.6 2.6-5.8 2.6-.6 0-1.2 0-1.7-.1"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-11"/></svg>',
  check_circle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>',
  trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6a6 6 0 0 1-12 0ZM6 5H3v3a3 3 0 0 0 3 3M18 5h3v3a3 3 0 0 1-3 3M9 21h6M12 17v4"/></svg>',
  handshake: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m11 17 2 2 5-5M3 8l3-3 5 4M21 8l-3-3-3 2M3 8v4l5 4M21 8v4l-5 4"/></svg>',
  graduation: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5ZM6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/></svg>',
  road: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 3-3 18M18 3l3 18M9 5h.01M9 10h.01M9 15h.01M9 20h.01M15 5h.01M15 10h.01M15 15h.01M15 20h.01"/></svg>',
  monitor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 22h8M12 18v4"/></svg>',
  arrow_right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18M7 16V9M12 16V5M17 16v-5"/></svg>',
  lifebuoy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><line x1="14.47" y1="9.53" x2="18.36" y2="5.64"/><line x1="9.53" y1="9.53" x2="5.64" y2="5.64"/><line x1="14.47" y1="14.47" x2="18.36" y2="18.36"/><line x1="9.53" y1="14.47" x2="5.64" y2="18.36"/></svg>',
  umbrella: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v1.5M3 12a9 9 0 0 1 18 0Z"/><path d="M12 12v6.5a2.5 2.5 0 0 1-5 0"/></svg>',
  document: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"/><path d="M14 2v6h6M9 13h6M9 17h6"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
  arrow_down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>',
  sparkle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 1.9 4.6L19 9.5l-4.6 1.9L12 16l-2.4-4.6L5 9.5l5.1-1.9L12 3ZM18 14v3M20 15.5h-3M5 18v2M6 19H4"/></svg>',
  play_circle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5-6-3.5Z" fill="currentColor"/></svg>',
  // Produktové ikony v linkovém stylu značky Lexia (tenká linka 1.3, oblé konce,
  // bez výplně — jako piktogramy v assets/obrazky/Group-*.png).
  lx_ridic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 15.2v-2.4c0-.5.3-.9.8-1l2.3-.6 2-2.9c.4-.6 1-.9 1.7-.9h4.9c.7 0 1.3.3 1.7.8l2.3 3 2 .6c.5.1.8.6.8 1.1v2.3"/><path d="M3 15.4h2.1M9.2 15.4h5.7M19 15.4h2"/><circle cx="7.2" cy="15.6" r="2"/><circle cx="16.9" cy="15.6" r="2"/><path d="M8.3 11.5h7.5M12 8v3.5"/></svg>',
  lx_jednotlivec: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7.6" r="3.2"/><path d="M5.5 19.6c0-3.3 2.9-5.9 6.5-5.9s6.5 2.6 6.5 5.9"/></svg>',
  lx_domacnost: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M3.2 11.2 11.3 4.5c.4-.4 1-.4 1.4 0l8.1 6.7"/><path d="M5.4 12.6v6.3c0 .6.5 1.1 1.1 1.1h11c.6 0 1.1-.5 1.1-1.1v-6.3"/><path d="M9.9 20v-4c0-.4.3-.8.8-.8h2.6c.4 0 .8.4.8.8v4"/></svg>',
  lx_balicek: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.1 4.9 5.9v6.2c0 4.5 3 7.6 7.1 9 4.1-1.4 7.1-4.5 7.1-9V5.9L12 3.1Z"/><path d="m9.3 12.1 1.9 1.9 3.5-3.6"/></svg>',
  lx_garance: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12.2a9 8.5 0 0 1 18 0c-1.5-1.2-3-1.2-4.5 0-1.5-1.2-3-1.2-4.5 0-1.5-1.2-3-1.2-4.5 0-1.5-1.2-3-1.2-4.5 0Z"/><path d="M12 3.7V2.4"/><path d="M12 12.2v5.6c0 1.3-1 2.3-2.2 2.3s-2.2-1-2.2-2.3"/></svg>',
  lx_individual: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M3.4 7h9.8M17.2 7h3.4M3.4 12h3.9M11.3 12h9.3M3.4 17h10.8M18.4 17h2.2"/><circle cx="15.2" cy="7" r="1.9"/><circle cx="9.3" cy="12" r="1.9"/><circle cx="16.3" cy="17" r="1.9"/></svg>',
  question_mark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5"/><circle cx="12" cy="16.5" r="0.6" fill="currentColor" stroke="none"/></svg>',
};

// Auto-replace all <i data-icon="..."> elements with SVG on DOM load
function injectIcons() {
  document.querySelectorAll('[data-icon]').forEach(el => {
    const iconName = el.dataset.icon;
    const svg = LEXIA_ICONS[iconName];
    if (svg && !el.querySelector('svg')) {
      el.innerHTML = svg;
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectIcons);
} else {
  injectIcons();
}
