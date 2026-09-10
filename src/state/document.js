// The editable document: everything a user can change on the canvas, plus the
// undo/redo history that wraps it. Keeping all mutable design state in one
// object is what makes Cmd+Z a three-line reducer case instead of a rewrite.

export const ARTBOARDS = {
  'UI/UX Design': { w: 800, h: 500, sidebar: 200 },
  'Graphic Design': { w: 400, h: 500, sidebar: 0 },
};

export const CANVAS_SCALE = 0.85;

// Static metadata for the four primary elements. `x`/`y`/`w`/`h` are the
// artboard-space coordinates the properties panel reports before any user
// transform is applied.
export const ELEMENTS = {
  hero: {
    label: 'Balance Widget', ws: 'UI/UX Design',
    x: 232, y: 112, w: 280, h: 190,
  },
  card: {
    label: 'Transactions List', ws: 'UI/UX Design',
    x: 544, y: 112, w: 240, h: 320,
  },
  gdHeadline: {
    label: 'Main Headline', ws: 'Graphic Design',
    x: 40, y: 96, w: 320, h: 150,
  },
  gdShape: {
    label: 'Abstract Shape', ws: 'Graphic Design',
    x: 96, y: 256, w: 192, h: 192,
  },
};

export const INITIAL_DOC = {
  theme: 'light',
  ctaStyle: 'blue',
  gdStyle: 'modern',
  content: {
    appName: 'AcmeBank',
    greeting: 'Welcome back, Alex',
    statLabel: 'Total Balance',
    statValue: '$24,500.00',
    ctaLabel: 'Transfer',
    activityTitle: 'Recent Activity',
    items: [
      { title: 'Apple Store', sub: 'Today, 2:45 PM', amount: '-$999' },
      { title: 'Upwork Inc.', sub: 'Yesterday', amount: '+$2,400' },
    ],
    gdBrand: 'ACME',
    gdHeadline: 'THE FUTURE OF DIGITAL BANKING.',
  },
  positions: { hero: { x: 0, y: 0 }, card: { x: 0, y: 0 }, gdHeadline: { x: 0, y: 0 }, gdShape: { x: 0, y: 0 } },
  sizes: {},
  fills: {},
  custom: [],
};

const LIMIT = 60;

export const initialHistory = { past: [], present: INITIAL_DOC, future: [] };

export function historyReducer(state, action) {
  const { past, present, future } = state;

  switch (action.type) {
    // Snapshot the current document before a continuous gesture (drag, resize,
    // colour scrub) begins, so the whole gesture undoes as one step.
    case 'begin':
      return { past: [...past, present].slice(-LIMIT), present, future: [] };

    // Update the document without touching history — used during a gesture
    // that has already called 'begin'.
    case 'amend': {
      const next = action.updater(present);
      return next === present ? state : { ...state, present: next };
    }

    // A discrete change that is its own undo step.
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

// --- geometry helpers ----------------------------------------------------

export function baseOf(id, doc) {
  if (ELEMENTS[id]) return ELEMENTS[id];
  const el = doc.custom.find((e) => e.id === id);
  return { x: 100, y: 100, w: el?.type === 'shape' ? 96 : 160, h: el?.type === 'shape' ? 96 : 40 };
}

export function geometryOf(id, doc) {
  const base = baseOf(id, doc);
  const pos = doc.positions[id] || { x: 0, y: 0 };
  const size = doc.sizes[id];
  return {
    x: Math.round(base.x + pos.x),
    y: Math.round(base.y + pos.y),
    w: Math.round(size?.w ?? base.w),
    h: Math.round(size?.h ?? base.h),
  };
}

export function labelOf(id, doc) {
  if (ELEMENTS[id]) return ELEMENTS[id].label;
  const el = doc.custom.find((e) => e.id === id);
  if (!el) return 'No selection';
  return el.type === 'text' ? 'Custom Text' : 'Custom Shape';
}

// Scale a headline so its longest word always fits the text box. Without this
// the graphic-design surface breaks words mid-syllable ("DECENTRALIZ / ED").
export function fitHeadline(text, boxWidth) {
  const words = String(text || 'HEADLINE').split(/\s+/).filter(Boolean);
  const longest = words.reduce((m, w) => Math.max(m, w.length), 1);
  const total = String(text || '').length;

  const byLongestWord = boxWidth / (longest * 0.58);
  const byTotalLength = 46 * Math.sqrt(20 / Math.max(total, 10));

  return Math.round(Math.max(18, Math.min(46, Math.min(byLongestWord, byTotalLength))));
}
