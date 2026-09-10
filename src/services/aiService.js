// AI Service - Calls Gemini or OpenAI to interpret design prompts
// Falls back to deterministic demo responses when no API key is provided
//
// Model ids go stale fast. This prototype originally shipped
// gemini-2.0-flash and gpt-4o-mini; both were retired, and because a failed
// call falls back to demo mode, the symptom was "the prompt bar does
// nothing" rather than a visible error. The ids below are overridable from
// the Guide & key dialog so a retirement is a settings change, not a commit.
//   https://ai.google.dev/gemini-api/docs/models
//   https://developers.openai.com/api/docs/models

export const DEFAULT_MODELS = {
  gemini: 'gemini-2.5-flash',
  openai: 'gpt-5.6-luna',
};

const SYSTEM_PROMPT = `You are an AI design assistant inside "Adobe Stage", an AI-first design tool prototype.
The user is looking at a canvas. When they give a prompt, you decide what visual changes to make to create or adapt the prototype.

You MUST respond with ONLY a valid JSON object (no markdown formatting, no code fences, no extra text). The JSON schema:

{
  "theme": "light" | "dark" | null,
  "ctaStyle": "blue" | "black" | null,
  "gdStyle": "modern" | "cyberpunk" | null,
  "prototype": {
    "appName": "Short brand name (e.g. AcmeBank, SoundWave, FitTrack, OrbitCrypto)",
    "navItems": ["4 sidebar nav labels for THIS domain, one or two words each (e.g. Dashboard, Orders, Products, Customers)"],
    "searchPlaceholder": "Placeholder for the top search field, matching the domain (e.g. Search orders...)",
    "greeting": "Personalized headline (e.g. Welcome back, Alex or Today's Market Pulse)",
    "statLabel": "Key metric label (e.g. Total Balance, Listening Time, Calories Burned)",
    "statValue": "Key metric value (e.g. $24,500.00, 14.8 hrs, 2,340 kcal)",
    "ctaLabel": "Action button text (e.g. Transfer, Play Now, Log Workout, Swap)",
    "activityTitle": "Section title (e.g. Recent Activity, Top Tracks, Workout Log)",
    "stats": [ { "label": "Short KPI label", "value": "Short value" } ],
    "chart": { "title": "Chart title with a time frame", "series": [7 numbers between 5 and 100] },
    "items": [
      { "title": "Item 1 title", "sub": "Item 1 subtitle/date", "amount": "+/- metric or status" },
      { "title": "Item 2 title", "sub": "Item 2 subtitle/date", "amount": "+/- metric or status" }
    ],
    "gdBrand": "Brand for graphic design (e.g. ACME, CYBER, SOUND)",
    "gdHeadline": "Bold punchy graphic design headline (2-5 words, e.g. THE FUTURE OF DIGITAL BANKING.)"
  },
  "addElements": [],
  "message": "A concise 1-line note of what was created/updated"
}

Rules:
- Adapt the prototype fields to whatever domain the user asked for (fintech, music, crypto, ecommerce, health, social, etc.).
- navItems and searchPlaceholder MUST match the domain. A shopping app does not have a "Transfers" tab and does not "Search transactions". Getting this wrong makes the result look like a banking template with the words swapped.
- Set "theme" to "dark" or "light" if the domain or prompt calls for it.
- Set "gdStyle" to "cyberpunk" for tech/cyber/futuristic prompts, or "modern" otherwise.
- Keep text concise and realistic.
- "items" should hold 2 to 4 rows. "stats" should hold 0 to 3 KPI tiles. Vary these between domains: a dashboard that always has exactly two rows and three tiles looks templated.
- Set "chart" to null when a chart would not belong on this screen, otherwise give it a real title and 7 plausible values. The series is a shape, not exact data.`;

export async function generateWithAI(prompt, options = {}) {
  const { apiKey, provider } = options;

  if (!apiKey) {
    return fallbackGenerate(prompt);
  }

  try {
    return provider === 'gemini'
      ? await callGemini(prompt, apiKey, options)
      : await callOpenAI(prompt, apiKey, options);
  } catch (err) {
    console.error('AI API error, falling back to demo mode:', err);
    return {
      ...fallbackGenerate(prompt),
      error: true,
      message: `${err.message}. Showed a demo result instead.`
    };
  }
}

// The context block is identical for both providers.
function buildContext(prompt, { workspace, selectedElement, fidelity = 80, creativity = 30 }) {
  return [
    `Current workspace: ${workspace}`,
    `Selected element: ${selectedElement}`,
    `Fidelity: ${fidelity}/100 (low = wireframe, plain language, muted; high = polished, specific, production-ready copy)`,
    `Creativity: ${creativity}/100 (low = stay literal and on-brand; high = take an unexpected angle)`,
    '',
    `User prompt: "${prompt}"`
  ].join('\n');
}

async function callGemini(prompt, apiKey, options) {
  const model = options.model?.trim() || DEFAULT_MODELS.gemini;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `${SYSTEM_PROMPT}\n\n${buildContext(prompt, options)}`
        }]
      }],
      generationConfig: {
        temperature: Math.min(1, (options.creativity ?? 30) / 100 + 0.15),
        maxOutputTokens: 1024,
        responseMimeType: "application/json"
      }
    })
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Gemini API ${res.status}: ${errorBody.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');

  return parseAIResponse(text);
}

async function callOpenAI(prompt, apiKey, options) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: options.model?.trim() || DEFAULT_MODELS.openai,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildContext(prompt, options) }
      ],
      temperature: Math.min(1, (options.creativity ?? 30) / 100 + 0.15),
      max_completion_tokens: 1024,
      response_format: { type: 'json_object' }
    })
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`OpenAI API ${res.status}: ${errorBody.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from OpenAI');

  return parseAIResponse(text);
}

function parseAIResponse(text) {
  // Strip markdown code fences if present
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  const parsed = JSON.parse(cleaned);

  if (parsed.prototype) {
    const proto = parsed.prototype;

    const nav = proto.navItems;
    proto.navItems = Array.isArray(nav) && nav.length ? nav.slice(0, 4).map(String) : undefined;

    proto.stats = Array.isArray(proto.stats)
      ? proto.stats
          .filter((s) => s && (s.label || s.value))
          .slice(0, 3)
          .map((s) => ({ label: String(s.label ?? ''), value: String(s.value ?? '') }))
      : undefined;

    // A chart needs a usable series; anything else is dropped rather than
    // rendered as an empty box.
    const series = proto.chart?.series;
    proto.chart = Array.isArray(series) && series.length >= 3
      ? {
          title: String(proto.chart.title || 'Trend'),
          series: series.slice(0, 12).map((n) => Math.max(4, Math.min(100, Number(n) || 0))),
        }
      : null;

    if (Array.isArray(proto.items)) proto.items = proto.items.slice(0, 4);
  }

  return {
    theme: parsed.theme || null,
    ctaStyle: parsed.ctaStyle || null,
    gdStyle: parsed.gdStyle || null,
    prototype: parsed.prototype || null,
    addElements: parsed.addElements || [],
    message: parsed.message || 'Changes applied.'
  };
}


// --- demo mode -----------------------------------------------------------
//
// Without an API key Stage still has to answer any prompt convincingly, so
// this is a small deterministic generator rather than a lookup table. It
// scores the prompt against a domain taxonomy, and when nothing matches it
// builds an archetype out of the user's own words instead of falling back to
// placeholder copy like "StageApp / Key Metric Output".

const DOMAINS = [
  {
    id: 'crypto',
    keywords: ['crypto', 'bitcoin', 'btc', 'ethereum', 'web3', 'wallet', 'defi', 'token', 'blockchain', 'nft'],
    theme: 'dark', gdStyle: 'cyberpunk',
    data: {
      appName: 'OrbitCrypto', 
      navItems: ['Portfolio', 'Markets', 'Swap', 'Activity'],
      searchPlaceholder: 'Search assets…',
      greeting: 'Portfolio Overview',
      statLabel: 'Net Crypto Assets', statValue: '₿ 4.8250 BTC',
      ctaLabel: 'Swap Tokens', activityTitle: 'Live Orders',
      items: [
        { title: 'Ethereum (ETH)', sub: 'Staked via Lido', amount: '+3.4% 24h' },
        { title: 'Solana (SOL)', sub: 'Limit order executed', amount: '+$1,450.00' },
      ],
      stats: [{ label: '24h Volume', value: '$1.2M' }, { label: 'Staked', value: '62%' }, { label: 'Positions', value: '14' }],
      chart: { title: 'Portfolio Value, 7 Days', series: [48, 62, 44, 78, 71, 95, 83] },
      gdBrand: 'ORBIT', gdHeadline: 'DECENTRALIZED LIQUIDITY AT SCALE.',
    },
  },
  {
    id: 'music',
    keywords: ['music', 'spotify', 'song', 'audio', 'podcast', 'streaming', 'playlist', 'radio', 'album'],
    theme: 'dark', gdStyle: 'modern',
    data: {
      appName: 'SoundStage', 
      navItems: ['Home', 'Library', 'Discover', 'Radio'],
      searchPlaceholder: 'Search songs, artists…',
      greeting: 'Now Streaming',
      statLabel: 'Listening This Week', statValue: '28.4 hrs',
      ctaLabel: 'Play Mix', activityTitle: 'Heavy Rotation',
      items: [
        { title: 'Midnight City (Remix)', sub: 'M83 · Electronic', amount: '1.2M plays' },
        { title: 'Starry Night', sub: 'Peggy Gou · House', amount: '850k plays' },
      ],
      stats: [{ label: 'Tracks', value: '1,204' }, { label: 'Artists', value: '318' }],
      chart: { title: 'Listening Hours, This Week', series: [22, 41, 35, 58, 47, 88, 64] },
      gdBrand: 'SOUND', gdHeadline: 'HEAR THE NEXT WAVE.',
    },
  },
  {
    id: 'fitness',
    keywords: ['fitness', 'gym', 'workout', 'health', 'running', 'training', 'exercise', 'yoga', 'wellness', 'steps'],
    theme: 'light', gdStyle: 'modern',
    data: {
      appName: 'PulseFit', 
      navItems: ['Today', 'Workouts', 'Progress', 'Plans'],
      searchPlaceholder: 'Search exercises…',
      greeting: 'Morning Session, Alex',
      statLabel: 'Active Calories', statValue: '1,840 kcal',
      ctaLabel: 'Start Workout', activityTitle: "Today's Milestones",
      items: [
        { title: '5km Interval Run', sub: 'Pace 4:45/km · Outdoors', amount: '320 kcal' },
        { title: 'Upper Body Strength', sub: 'Completed 5 of 5 sets', amount: '45 mins' },
      ],
      stats: [{ label: 'Steps', value: '12,480' }, { label: 'Streak', value: '9 days' }, { label: 'Resting HR', value: '54 bpm' }],
      chart: { title: 'Active Minutes, Last 7 Days', series: [35, 52, 28, 64, 71, 45, 88] },
      gdBrand: 'PULSE', gdHeadline: 'PEAK HUMAN PERFORMANCE.',
    },
  },
  {
    id: 'commerce',
    keywords: ['ecommerce', 'commerce', 'store', 'shop', 'shopping', 'cart', 'retail', 'marketplace', 'seller', 'merchant', 'order'],
    theme: 'light', gdStyle: 'modern',
    data: {
      appName: 'AuraMarket', 
      navItems: ['Dashboard', 'Orders', 'Products', 'Customers'],
      searchPlaceholder: 'Search orders…',
      greeting: 'Store Revenue Today',
      statLabel: 'Gross Merchandise Value', statValue: '$18,920.50',
      ctaLabel: 'View Orders', activityTitle: 'Recent Orders',
      items: [
        { title: 'Minimalist Wool Coat', sub: 'Express shipping · Tokyo', amount: '+$380' },
        { title: 'Mechanical Keyboard v2', sub: 'Order #4892 · Paid', amount: '+$210' },
      ],
      stats: [{ label: 'Orders', value: '312' }, { label: 'Avg Basket', value: '$61' }, { label: 'Refunds', value: '1.4%' }],
      chart: { title: 'Revenue, Last 7 Days', series: [44, 61, 52, 78, 66, 91, 74] },
      gdBrand: 'AURA', gdHeadline: 'CURATED LUXURY COMMERCE.',
    },
  },
  {
    id: 'saas',
    keywords: ['saas', 'analytics', 'cloud', 'metrics', 'devops', 'infrastructure', 'api', 'monitoring', 'platform', 'b2b'],
    theme: 'dark', gdStyle: 'modern',
    data: {
      appName: 'CloudMetrics', 
      navItems: ['Overview', 'Services', 'Deploys', 'Alerts'],
      searchPlaceholder: 'Search services…',
      greeting: 'Production Cluster 04',
      statLabel: 'Monthly Recurring Revenue', statValue: '$84,120',
      ctaLabel: 'Deploy v2.4', activityTitle: 'Recent Deployments',
      items: [
        { title: 'Auth Service API', sub: '18ms latency · 99.99% uptime', amount: 'Passed' },
        { title: 'Ingestion Pipeline', sub: 'Processed 2.4M records', amount: 'Healthy' },
      ],
      stats: [{ label: 'Uptime', value: '99.99%' }, { label: 'p95', value: '142ms' }, { label: 'Errors', value: '0.02%' }],
      chart: { title: 'Requests per Minute', series: [58, 64, 49, 72, 81, 68, 77] },
      gdBrand: 'METRICS', gdHeadline: 'OBSERVABILITY THAT SCALES.',
    },
  },
  {
    id: 'banking',
    keywords: ['bank', 'banking', 'fintech', 'finance', 'payment', 'invoice', 'budget', 'savings', 'lending', 'card'],
    theme: 'light', gdStyle: 'modern',
    data: {
      appName: 'AcmeBank', 
      navItems: ['Dashboard', 'Cards', 'Transfers', 'Analytics'],
      searchPlaceholder: 'Search transactions…',
      greeting: 'Welcome back, Alex',
      statLabel: 'Total Balance', statValue: '$24,500.00',
      ctaLabel: 'Transfer', activityTitle: 'Recent Activity',
      items: [
        { title: 'Apple Store', sub: 'Today, 2:45 PM', amount: '-$999' },
        { title: 'Upwork Inc.', sub: 'Yesterday', amount: '+$2,400' },
      ],
      stats: [{ label: 'Income', value: '$8,240' }, { label: 'Spending', value: '$3,110' }, { label: 'Saved', value: '38%' }],
      chart: { title: 'Cash Flow, Last 7 Days', series: [42, 58, 35, 71, 64, 88, 52] },
      gdBrand: 'ACME', gdHeadline: 'THE FUTURE OF DIGITAL BANKING.',
    },
  },
  {
    id: 'travel',
    keywords: ['travel', 'flight', 'hotel', 'trip', 'booking', 'airline', 'holiday', 'vacation', 'itinerary', 'tourism'],
    theme: 'light', gdStyle: 'modern',
    data: {
      appName: 'Wayfare', 
      navItems: ['Trips', 'Explore', 'Bookings', 'Saved'],
      searchPlaceholder: 'Search destinations…',
      greeting: 'Your Next Trip',
      statLabel: 'Trip Budget Remaining', statValue: '$1,240.00',
      ctaLabel: 'Book Flight', activityTitle: 'Upcoming Itinerary',
      items: [
        { title: 'Lisbon → Reykjavík', sub: 'TAP 1042 · Seat 14A', amount: '12 Mar' },
        { title: 'Sandhotel, Reykjavík', sub: '3 nights · Breakfast', amount: '+$412' },
      ],
      stats: [{ label: 'Trips', value: '4 booked' }, { label: 'Miles', value: '18,420' }],
      chart: { title: 'Spend by Trip', series: [30, 72, 45, 61, 88, 39, 54] },
      gdBrand: 'WAYFARE', gdHeadline: 'GO SOMEWHERE THAT CHANGES YOU.',
    },
  },
  {
    id: 'food',
    keywords: ['food', 'restaurant', 'delivery', 'recipe', 'meal', 'kitchen', 'grocery', 'cafe', 'menu', 'dining'],
    theme: 'light', gdStyle: 'modern',
    data: {
      appName: 'Fork&Field', 
      navItems: ['Kitchen', 'Orders', 'Menu', 'Reservations'],
      searchPlaceholder: 'Search dishes…',
      greeting: 'Kitchen Dashboard',
      statLabel: 'Orders Today', statValue: '312 covers',
      ctaLabel: 'Start Order', activityTitle: 'Live Tickets',
      items: [
        { title: 'Table 12 · Tasting Menu', sub: 'Fired 4 min ago', amount: 'On pass' },
        { title: 'Delivery · Ramen x2', sub: 'Courier assigned', amount: '+$38' },
      ],
      stats: [{ label: 'Avg Ticket', value: '$48' }, { label: 'Wait', value: '11 min' }, { label: 'Covers', value: '312' }],
      chart: { title: 'Covers by Service, This Week', series: [40, 55, 62, 71, 94, 88, 47] },
      gdBrand: 'FORK', gdHeadline: 'EAT LIKE YOU MEAN IT.',
    },
  },
  {
    id: 'education',
    keywords: ['education', 'learning', 'course', 'student', 'school', 'university', 'teaching', 'study', 'tutor', 'lesson'],
    theme: 'light', gdStyle: 'modern',
    data: {
      appName: 'Lumen', 
      navItems: ['Dashboard', 'Courses', 'Assignments', 'Grades'],
      searchPlaceholder: 'Search courses…',
      greeting: 'Welcome back, Priya',
      statLabel: 'Course Progress', statValue: '68% complete',
      ctaLabel: 'Resume Lesson', activityTitle: 'This Week',
      items: [
        { title: 'Statistics · Module 4', sub: 'Due Friday', amount: '2 hrs left' },
        { title: 'Peer Review Submitted', sub: 'Design Thinking', amount: 'Graded' },
      ],
      stats: [{ label: 'Modules', value: '12 of 18' }, { label: 'Avg Grade', value: 'A-' }],
      chart: { title: 'Study Hours, Last 7 Days', series: [25, 48, 31, 66, 52, 40, 73] },
      gdBrand: 'LUMEN', gdHeadline: 'LEARN THE THING THAT COMPOUNDS.',
    },
  },
  {
    id: 'social',
    keywords: ['social', 'community', 'chat', 'messaging', 'feed', 'network', 'forum', 'creator', 'follower'],
    theme: 'dark', gdStyle: 'modern',
    data: {
      appName: 'Commons', 
      navItems: ['Feed', 'Messages', 'Groups', 'Profile'],
      searchPlaceholder: 'Search people…',
      greeting: 'Your Circle Today',
      statLabel: 'Reach This Week', statValue: '48.2k people',
      ctaLabel: 'New Post', activityTitle: 'Recent Activity',
      items: [
        { title: 'Ravi replied to your thread', sub: '18 min ago', amount: '24 likes' },
        { title: 'Design Weekly · New drop', sub: 'From a group you follow', amount: 'Unread' },
      ],
      stats: [{ label: 'Followers', value: '12.4k' }, { label: 'Engagement', value: '6.8%' }, { label: 'Posts', value: '48' }],
      chart: { title: 'Reach, Last 7 Days', series: [52, 38, 64, 71, 59, 86, 92] },
      gdBrand: 'COMMONS', gdHeadline: 'BUILT BY THE PEOPLE IN IT.',
    },
  },
  {
    id: 'realestate',
    keywords: ['real estate', 'property', 'rent', 'rental', 'housing', 'apartment', 'mortgage', 'landlord', 'listing'],
    theme: 'light', gdStyle: 'modern',
    data: {
      appName: 'Keystone', 
      navItems: ['Portfolio', 'Listings', 'Tenants', 'Maintenance'],
      searchPlaceholder: 'Search properties…',
      greeting: 'Portfolio Overview',
      statLabel: 'Monthly Rent Roll', statValue: '$42,800',
      ctaLabel: 'Add Listing', activityTitle: 'Recent Activity',
      items: [
        { title: '14 Alder Street, Unit 3B', sub: 'Lease signed · 12 months', amount: '+$2,150' },
        { title: 'Maintenance · Boiler', sub: 'Contractor scheduled', amount: '-$480' },
      ],
      stats: [{ label: 'Occupancy', value: '94%' }, { label: 'Units', value: '38' }, { label: 'Arrears', value: '$2,100' }],
      chart: { title: 'Rent Collected, Last 6 Months', series: [78, 82, 74, 88, 91, 86, 90] },
      gdBrand: 'KEYSTONE', gdHeadline: 'EVERY DOOR, ACCOUNTED FOR.',
    },
  },
  {
    id: 'jobs',
    keywords: ['job', 'jobs', 'hiring', 'recruiting', 'recruitment', 'career', 'applicant', 'candidate', 'resume', 'ats'],
    theme: 'light', gdStyle: 'modern',
    data: {
      appName: 'Shortlist', 
      navItems: ['Pipeline', 'Roles', 'Candidates', 'Interviews'],
      searchPlaceholder: 'Search candidates…',
      greeting: 'Pipeline Overview',
      statLabel: 'Active Candidates', statValue: '148 in pipeline',
      ctaLabel: 'Post a Role', activityTitle: 'Needs Your Review',
      items: [
        { title: 'Senior PM · Final round', sub: 'Panel feedback complete', amount: 'Decide' },
        { title: 'Design Intern · Screen', sub: '12 new applications', amount: 'New' },
      ],
      stats: [{ label: 'Open Roles', value: '11' }, { label: 'Time to Hire', value: '24 days' }, { label: 'Offer Rate', value: '68%' }],
      chart: { title: 'Applications, Last 7 Days', series: [34, 58, 47, 72, 64, 51, 80] },
      gdBrand: 'SHORTLIST', gdHeadline: 'HIRE THE ONE, NOT THE HUNDRED.',
    },
  },
];

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'for', 'with', 'of', 'and', 'to', 'in', 'on', 'my', 'me', 'that', 'this',
  'app', 'application', 'dashboard', 'page', 'screen', 'design', 'designs', 'ui', 'ux', 'site',
  'website', 'make', 'create', 'build', 'generate', 'show', 'give', 'simple', 'modern', 'clean',
  'nice', 'good', 'new', 'some', 'like', 'it', 'is', 'be', 'please', 'landing', 'mobile', 'web',
]);

// Words that describe a change to the current design, or name a part of it,
// rather than naming a new thing to generate.
const ADJUSTMENT_WORDS = new Set([
  // styling
  'dark', 'light', 'mode', 'theme', 'black', 'blue', 'white', 'colour', 'color',
  'cyberpunk', 'neon', 'matrix', 'futuristic', 'synthwave', 'minimal', 'clean',
  'corporate', 'editorial', 'style', 'styling', 'brighter', 'darker',
  // parts of the existing template
  'button', 'cta', 'transfer', 'headline', 'shape', 'widget', 'card', 'text',
  'background', 'label', 'title', 'canvas', 'artboard',
]);

const TITLE_MINOR = new Set(['for', 'and', 'the', 'of', 'a', 'an', 'to', 'in', 'on', 'with']);

function significantWords(prompt) {
  return String(prompt)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);

function titleCase(words) {
  return words
    .map((w, i) => (i > 0 && TITLE_MINOR.has(w) ? w : cap(w)))
    .join(' ');
}

// Scoring is weighted by position, not keyword length. In "a recipe app for
// students" the subject is recipes, and a naive length score picks education
// because "student" is one character longer than "recipe".
function matchDomain(prompt) {
  const lower = String(prompt).toLowerCase();
  const words = significantWords(prompt);

  let best = null;
  let bestScore = 0;

  for (const domain of DOMAINS) {
    let score = 0;

    for (const keyword of domain.keywords) {
      // Multi-word keywords ("real estate") only ever match the raw string.
      if (keyword.includes(' ')) {
        if (lower.includes(keyword)) score += 6;
        continue;
      }

      // Tolerate simple plurals only. A loose prefix test matches "care"
      // against "career", which is how a plant care app became an ATS.
      const at = words.findIndex((w) => (
        w === keyword || w === `${keyword}s` || w === `${keyword}es` || `${w}s` === keyword
      ));
      if (at === -1) continue;

      // Earlier words carry the subject of the prompt.
      score += Math.max(1, 6 - at);
    }

    if (score > bestScore) { best = domain; bestScore = score; }
  }

  return bestScore >= 3 ? best : null;
}

// Build a believable archetype out of whatever the user actually typed.
function deriveFromPrompt(prompt) {
  const words = significantWords(prompt);

  if (!words.length) return null;

  const subject = titleCase(words.slice(0, 3));
  const brandWords = words.slice(0, 2).map(cap);
  const appName = brandWords.join('').slice(0, 16) || 'Stage';

  const noun = cap(words[0]);

  // Vary the shape from the prompt itself, so two different unknown prompts
  // do not produce byte-identical layouts.
  const spread = words.join('').length;
  const statCount = spread % 3 === 0 ? 3 : (spread % 3) + 1;
  const series = Array.from({ length: 7 }, (_, i) => 25 + ((spread * (i + 3) * 7) % 70));

  return {
    appName,
    navItems: ['Overview', `${noun}s`, 'Activity', 'Settings'],
    searchPlaceholder: `Search ${words[0]}s…`,
    greeting: `${titleCase(words.slice(0, 2))} Overview`,
    statLabel: 'Active This Month',
    statValue: '2,480 users',
    ctaLabel: `New ${noun}`,
    activityTitle: 'Recent Activity',
    items: [
      { title: `${noun} created`, sub: 'Today, 9:12 AM', amount: '+18%' },
      { title: `${subject} review`, sub: 'Awaiting approval', amount: 'Pending' },
    ],
    stats: [
      { label: 'Active', value: `${240 + (spread % 700)}` },
      { label: 'This Week', value: `+${8 + (spread % 40)}%` },
      { label: `Open ${noun}s`, value: `${3 + (spread % 24)}` },
    ].slice(0, statCount),
    chart: { title: `${titleCase(words.slice(0, 2))}, Last 7 Days`, series },
    gdBrand: (words[0] || 'stage').toUpperCase().slice(0, 10),
    gdHeadline: `${subject.toUpperCase()}, DONE PROPERLY.`,
  };
}

function fallbackGenerate(prompt) {
  const lower = String(prompt).toLowerCase();
  const result = { theme: null, ctaStyle: null, gdStyle: null, prototype: null, addElements: [], message: '' };
  const notes = [];

  // 1. Targeted style commands. These adjust the current design rather than
  //    replacing it, so they must not trigger a full regeneration.
  if (/\bdark\b/.test(lower)) { result.theme = 'dark'; notes.push('Switched to dark mode.'); }
  else if (/\blight\b/.test(lower)) { result.theme = 'light'; notes.push('Switched to light mode.'); }

  if (/\bblack\b/.test(lower) && /\b(button|cta)\b/.test(lower)) {
    result.ctaStyle = 'black';
    notes.push('Call to action set to contrast black.');
  } else if (/\bblue\b/.test(lower) && /\b(button|cta)\b/.test(lower)) {
    result.ctaStyle = 'blue';
    notes.push('Call to action set to brand blue.');
  }

  if (/cyberpunk|neon|matrix|futuristic|synthwave/.test(lower)) {
    result.gdStyle = 'cyberpunk';
    notes.push('Applied the cyberpunk treatment.');
  } else if (/minimal|clean|corporate|editorial/.test(lower)) {
    result.gdStyle = 'modern';
    notes.push('Applied the modern treatment.');
  }

  // Distinguish "adjust what is on screen" from "make me something new".
  // Counting words does not work: "make the transfer button black" has three
  // significant words but introduces no new subject. Instead, subtract the
  // vocabulary of styling and of the template's own elements, and see whether
  // anything is left over.
  const residual = significantWords(prompt).filter((w) => !ADJUSTMENT_WORDS.has(w));
  if (notes.length > 0 && residual.length === 0) {
    result.message = notes.join(' ');
    return result;
  }

  // 2. A known domain gives a hand-written archetype.
  const domain = matchDomain(prompt);
  if (domain) {
    result.prototype = { ...domain.data, items: domain.data.items.map((i) => ({ ...i })) };
    if (!result.theme) result.theme = domain.theme;
    if (!result.gdStyle) result.gdStyle = domain.gdStyle;
    result.message = [`Generated a ${domain.id} concept: ${domain.data.appName}.`, ...notes].join(' ');
    return result;
  }

  // 3. Anything else is built from the user's own words.
  const derived = deriveFromPrompt(prompt);
  if (derived) {
    result.prototype = derived;
    result.message = [
      `Generated "${derived.appName}" from your prompt. Demo mode approximates unknown domains, so add an API key for a real design.`,
      ...notes,
    ].join(' ');
    return result;
  }

  result.message = notes.join(' ') || 'Nothing to change. Try describing an app or a campaign.';
  return result;
}
