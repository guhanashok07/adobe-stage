// The editable document, the undo/redo history that wraps it, and the layout
// registry.
//
// The prototype used to have exactly one dashboard composition that every
// prompt reworded, which made "prompt an app and it designs it" read as a mail
// merge. There are now three UI compositions and two campaign compositions.
// They all render from the SAME content shape, so the model picks a layout and
// fills one schema rather than knowing about any of this.

export const CANVAS_SCALE = 0.85;

export const ARTBOARDS = {
  'UI/UX Design': { w: 860, h: 580, sidebar: 208, header: 64, pad: 28 },
  'Graphic Design': { w: 420, h: 525, sidebar: 0, header: 0, pad: 0 },
};

// --- layouts -------------------------------------------------------------
//
// Element boxes are true artboard-space coordinates, so the properties panel
// reports where a thing actually is.

export const LAYOUTS = {
  // Metric-led admin screen: KPI row, hero figure, list, trend chart.
  dashboard: {
    ws: 'UI/UX Design',
    name: 'Analytics Dashboard',
    elements: {
      stats: { label: 'Metric Row', x: 236, y: 146, w: 588, h: 56 },
      hero: { label: 'Primary Metric', x: 236, y: 236, w: 300, h: 190 },
      card: { label: 'Activity List', x: 568, y: 236, w: 256, h: 190 },
      chart: { label: 'Trend Chart', x: 236, y: 458, w: 588, h: 106 },
    },
  },

  // Media-led screen: large artwork, now-playing panel, queue.
  player: {
    ws: 'UI/UX Design',
    name: 'Media Player',
    elements: {
      art: { label: 'Artwork', x: 236, y: 146, w: 212, h: 212 },
      hero: { label: 'Now Playing', x: 468, y: 146, w: 356, h: 212 },
      card: { label: 'Up Next', x: 236, y: 390, w: 588, h: 174 },
    },
  },

  // Catalogue screen: promo banner, product grid, order list.
  catalog: {
    ws: 'UI/UX Design',
    name: 'Catalogue',
    elements: {
      hero: { label: 'Promo Banner', x: 236, y: 146, w: 588, h: 116 },
      stats: { label: 'Product Grid', x: 236, y: 294, w: 588, h: 132 },
      card: { label: 'Order List', x: 236, y: 458, w: 588, h: 106 },
    },
  },

  // Type-led social post.
  poster: {
    ws: 'Graphic Design',
    name: 'Type Poster',
    elements: {
      gdHeadline: { label: 'Headline', x: 40, y: 104, w: 336, h: 150 },
      gdShape: { label: 'Abstract Form', x: 104, y: 288, w: 200, h: 200 },
    },
  },

  // Product-led ad: object on top, copy and price beneath.
  productAd: {
    ws: 'Graphic Design',
    name: 'Product Ad',
    elements: {
      gdShape: { label: 'Product', x: 110, y: 76, w: 200, h: 200 },
      gdHeadline: { label: 'Headline', x: 40, y: 312, w: 336, h: 120 },
    },
  },
};

export const LAYOUTS_FOR = {
  'UI/UX Design': ['dashboard', 'player', 'catalog'],
  'Graphic Design': ['poster', 'productAd'],
};

export const DEFAULT_LAYOUT = { 'UI/UX Design': 'dashboard', 'Graphic Design': 'poster' };

export function layoutFor(doc, ws) {
  const id = doc.layout?.[ws];
  return LAYOUTS[id] && LAYOUTS[id].ws === ws ? id : DEFAULT_LAYOUT[ws];
}

export function elementsFor(doc, ws) {
  return LAYOUTS[layoutFor(doc, ws)].elements;
}

// Every element id used by any layout, for cheap membership tests.
export const ALL_ELEMENT_IDS = new Set(
  Object.values(LAYOUTS).flatMap((l) => Object.keys(l.elements)),
);

// --- initial document ----------------------------------------------------

export const INITIAL_DOC = {
  theme: 'light',
  ctaStyle: 'blue',
  gdStyle: 'modern',
  layout: { 'UI/UX Design': 'dashboard', 'Graphic Design': 'poster' },
  content: {
    appName: 'Northwind',
    navItems: ['Overview', 'Payments', 'Invoices', 'Reports'],
    searchPlaceholder: 'Search payments…',
    greeting: 'Good morning, Alex',
    statLabel: 'Net Revenue',
    statValue: '$284,120',
    statDelta: '+12.4% vs last month',
    ctaLabel: 'Create Invoice',
    activityTitle: 'Recent Payments',
    items: [
      { title: 'Halden & Co.', sub: 'Invoice #2041 · Paid', amount: '+$18,400' },
      { title: 'Meridian Studio', sub: 'Invoice #2038 · Paid', amount: '+$7,250' },
      { title: 'Aperture Labs', sub: 'Invoice #2035 · Overdue', amount: '-$2,100' },
    ],
    stats: [
      { label: 'Collected', value: '$92,410' },
      { label: 'Outstanding', value: '$14,820' },
      { label: 'Avg Days to Pay', value: '11' },
    ],
    chart: { title: 'Revenue, Last 7 Days', series: [38, 54, 46, 72, 61, 88, 79] },
    gdBrand: 'NORTHWIND',
    gdHeadline: 'MONEY THAT MOVES AT THE SPEED OF WORK.',
  },
  positions: {},
  sizes: {},
  fills: {},
  opacity: {},
  custom: [],
};

// --- history -------------------------------------------------------------

const LIMIT = 60;

export const initialHistory = { past: [], present: INITIAL_DOC, future: [] };

export function historyReducer(state, action) {
  const { past, present, future } = state;

  switch (action.type) {
    // Snapshot before a continuous gesture, so the whole drag undoes as one.
    case 'begin':
      return { past: [...past, present].slice(-LIMIT), present, future: [] };

    // Update without touching history, during a gesture that called 'begin'.
    case 'amend': {
      const next = action.updater(present);
      return next === present ? state : { ...state, present: next };
    }

    case 'commit': {
      const next = action.updater(present);
      if (next === present) return state;
      return { past: [...past, present].slice(-LIMIT), present: next, future: [] };
    }

    case 'undo': {
      if (!past.length) return state;
      return {
        past: past.slice(0, -1),
        present: past[past.length - 1],
        future: [present, ...future].slice(0, LIMIT),
      };
    }

    case 'redo': {
      if (!future.length) return state;
      return {
        past: [...past, present].slice(-LIMIT),
        present: future[0],
        future: future.slice(1),
      };
    }

    default:
      return state;
  }
}

// --- geometry ------------------------------------------------------------

export function baseOf(id, doc, ws) {
  const el = elementsFor(doc, ws)[id];
  if (el) return el;
  const custom = doc.custom.find((e) => e.id === id);
  return {
    x: 120, y: 120,
    w: custom?.type === 'shape' ? 96 : 160,
    h: custom?.type === 'shape' ? 96 : 40,
  };
}

export function geometryOf(id, doc, ws) {
  const base = baseOf(id, doc, ws);
  const pos = doc.positions[id] || { x: 0, y: 0 };
  const size = doc.sizes[id];
  return {
    x: Math.round(base.x + pos.x),
    y: Math.round(base.y + pos.y),
    w: Math.round(size?.w ?? base.w),
    h: Math.round(size?.h ?? base.h),
  };
}

// Prefer the generated name over the layout's generic one, so selecting the
// hero card on a shop reads "Total Sales", not "Primary Metric".
export function labelOf(id, doc, ws) {
  const c = doc?.content || {};
  const el = elementsFor(doc, ws)[id];

  if (id === 'hero') return c.statLabel || el?.label || 'Hero';
  if (id === 'card') return c.activityTitle || el?.label || 'List';
  if (id === 'chart') return c.chart?.title || el?.label || 'Chart';
  if (el) return el.label;

  const custom = doc.custom.find((e) => e.id === id);
  if (!custom) return 'No selection';
  return custom.type === 'text' ? 'Custom Text' : 'Custom Shape';
}

// Scale a headline so its longest word always fits its box, rather than
// breaking mid-syllable ("DECENTRALIZ / ED").
export function fitHeadline(text, boxWidth, max = 46) {
  const words = String(text || 'HEADLINE').split(/\s+/).filter(Boolean);
  const longest = words.reduce((m, w) => Math.max(m, w.length), 1);
  const total = String(text || '').length;

  const byLongestWord = boxWidth / (longest * 0.58);
  const byTotalLength = max * Math.sqrt(20 / Math.max(total, 10));

  return Math.round(Math.max(16, Math.min(max, Math.min(byLongestWord, byTotalLength))));
}
