// AI Service - Calls Gemini or OpenAI to interpret design prompts
// Falls back to deterministic demo responses when no API key is provided

const SYSTEM_PROMPT = `You are an AI design assistant inside "Adobe Stage", an AI-first design tool prototype.
The user is looking at a canvas. When they give a prompt, you decide what visual changes to make to create or adapt the prototype.

You MUST respond with ONLY a valid JSON object (no markdown formatting, no code fences, no extra text). The JSON schema:

{
  "theme": "light" | "dark" | null,
  "ctaStyle": "blue" | "black" | null,
  "gdStyle": "modern" | "cyberpunk" | null,
  "prototype": {
    "appName": "Short brand name (e.g. AcmeBank, SoundWave, FitTrack, OrbitCrypto)",
    "greeting": "Personalized headline (e.g. Welcome back, Alex or Today's Market Pulse)",
    "statLabel": "Key metric label (e.g. Total Balance, Listening Time, Calories Burned)",
    "statValue": "Key metric value (e.g. $24,500.00, 14.8 hrs, 2,340 kcal)",
    "ctaLabel": "Action button text (e.g. Transfer, Play Now, Log Workout, Swap)",
    "activityTitle": "Section title (e.g. Recent Activity, Top Tracks, Workout Log)",
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
- Set "theme" to "dark" or "light" if the domain or prompt calls for it.
- Set "gdStyle" to "cyberpunk" for tech/cyber/futuristic prompts, or "modern" otherwise.
- Keep text concise and realistic.`;

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
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

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
        maxOutputTokens: 400,
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
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildContext(prompt, options) }
      ],
      temperature: Math.min(1, (options.creativity ?? 30) / 100 + 0.15),
      max_tokens: 400,
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

  return {
    theme: parsed.theme || null,
    ctaStyle: parsed.ctaStyle || null,
    gdStyle: parsed.gdStyle || null,
    prototype: parsed.prototype || null,
    addElements: parsed.addElements || [],
    message: parsed.message || 'Changes applied.'
  };
}

function fallbackGenerate(prompt) {
  const lower = prompt.toLowerCase();
  const result = {
    theme: null,
    ctaStyle: null,
    gdStyle: null,
    prototype: null,
    addElements: [],
    message: ''
  };

  // 1. Theme controls
  if (lower.includes('dark mode') || lower.includes('dark theme')) {
    result.theme = 'dark';
    result.message = 'Switched to dark mode.';
  } else if (lower.includes('light mode') || lower.includes('light theme')) {
    result.theme = 'light';
    result.message = 'Switched to light mode.';
  }

  // 2. Button styles
  if (lower.includes('black') || lower.includes('transfer button') || lower.includes('cta')) {
    result.ctaStyle = 'black';
    result.message = (result.message ? result.message + ' ' : '') + 'Button styled with contrast black.';
  }

  // 3. Graphic design styles
  if (lower.includes('cyberpunk') || lower.includes('neon') || lower.includes('matrix')) {
    result.gdStyle = 'cyberpunk';
    result.message = (result.message ? result.message + ' ' : '') + 'Applied cyberpunk neon aesthetic.';
  }

  // 4. Prototype archetypes for random prompts
  if (lower.includes('crypto') || lower.includes('bitcoin') || lower.includes('web3') || lower.includes('wallet')) {
    result.theme = 'dark';
    result.prototype = {
      appName: 'OrbitCrypto',
      greeting: 'Portfolio Overview',
      statLabel: 'Net Crypto Assets',
      statValue: '₿ 4.8250 BTC',
      ctaLabel: 'Swap Tokens',
      activityTitle: 'Live Orders',
      items: [
        { title: 'Ethereum (ETH)', sub: 'Staked via Lido', amount: '+3.4% 24h' },
        { title: 'Solana (SOL)', sub: 'Limit Order Executed', amount: '+$1,450.00' }
      ],
      gdBrand: 'ORBIT',
      gdHeadline: 'DECENTRALIZED LIQUIDITY AT SCALE.'
    };
    result.message = 'Generated OrbitCrypto decentralized asset dashboard.';
  } else if (lower.includes('music') || lower.includes('spotify') || lower.includes('sound') || lower.includes('song')) {
    result.theme = 'dark';
    result.prototype = {
      appName: 'SoundStage',
      greeting: 'Now Streaming',
      statLabel: 'Total Listening Time',
      statValue: '28.4 hrs this week',
      ctaLabel: 'Play Mix',
      activityTitle: 'Heavy Rotation',
      items: [
        { title: 'Midnight City (Remix)', sub: 'M83 • Electronic', amount: '▶ 1.2M' },
        { title: 'Starry Night', sub: 'Peggy Gou • House', amount: '▶ 850k' }
      ],
      gdBrand: 'SOUND',
      gdHeadline: 'HEAR THE NEXT WAVE IN HI-FI.'
    };
    result.message = 'Generated SoundStage audio streaming prototype.';
  } else if (lower.includes('fitness') || lower.includes('gym') || lower.includes('workout') || lower.includes('health')) {
    result.prototype = {
      appName: 'PulseFit',
      greeting: 'Morning Session, Alex',
      statLabel: 'Active Calories',
      statValue: '1,840 kcal',
      ctaLabel: 'Start Workout',
      activityTitle: 'Today’s Milestones',
      items: [
        { title: '5km Interval Run', sub: 'Pace: 4:45/km • Outdoors', amount: '320 kcal' },
        { title: 'Upper Body Hypertrophy', sub: 'Completed 5/5 sets', amount: '45 mins' }
      ],
      gdBrand: 'PULSE',
      gdHeadline: 'PEAK HUMAN PERFORMANCE.'
    };
    result.message = 'Generated PulseFit health & metrics tracking prototype.';
  } else if (lower.includes('ecommerce') || lower.includes('store') || lower.includes('shop') || lower.includes('cart')) {
    result.prototype = {
      appName: 'AuraMarket',
      greeting: 'Store Revenue Today',
      statLabel: 'Gross Merchandise Val',
      statValue: '$18,920.50',
      ctaLabel: 'View Orders',
      activityTitle: 'Recent Orders',
      items: [
        { title: 'Minimalist Wool Coat (M)', sub: 'Express Shipping • Tokyo', amount: '+$380' },
        { title: 'Mechanical Keyboard v2', sub: 'Order #4892 • Paid', amount: '+$210' }
      ],
      gdBrand: 'AURA',
      gdHeadline: 'CURATED LUXURY COMMERCE.'
    };
    result.message = 'Generated AuraMarket merchant dashboard prototype.';
  } else if (lower.includes('saas') || lower.includes('analytics') || lower.includes('cloud') || lower.includes('metrics')) {
    result.prototype = {
      appName: 'CloudMetrics',
      greeting: 'Production Cluster #04',
      statLabel: 'Monthly Recurring Rev',
      statValue: '$84,120 ARR',
      ctaLabel: 'Deploy v2.4',
      activityTitle: 'Recent Deployments',
      items: [
        { title: 'Auth-Service API', sub: 'Lat: 18ms • 99.99% uptime', amount: 'Passed' },
        { title: 'Vector Ingestion Pipeline', sub: 'Processed 2.4M chunks', amount: 'Healthy' }
      ],
      gdBrand: 'METRICS',
      gdHeadline: 'OBSERVABILITY FOR SCALE.'
    };
    result.message = 'Generated CloudMetrics infrastructure prototype.';
  } else if (!result.message) {
    // Generic fallback archetype for any other prompt
    result.prototype = {
      appName: 'StageApp',
      greeting: 'Prototype Preview',
      statLabel: 'Key Metric Output',
      statValue: '99.4% Complete',
      ctaLabel: 'Proceed',
      activityTitle: 'System Events',
      items: [
        { title: 'Generated from user prompt', sub: `Input: "${prompt.slice(0, 24)}"`, amount: 'Live' },
        { title: 'Direct manipulation ready', sub: 'Click, drag, resize, or inspect', amount: 'Ready' }
      ],
      gdBrand: 'STAGE',
      gdHeadline: prompt.length > 3 ? prompt.toUpperCase().slice(0, 32) : 'CREATIVE INTELLIGENCE UNLEASHED.'
    };
    result.message = `Generated custom prototype for "${prompt.slice(0, 30)}".`;
  }

  return result;
}
