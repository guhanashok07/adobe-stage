// AI Generation Service for Adobe Stage
// Supports:
// 1. Direct LLM generation using an optional user API key (OpenAI / Gemini format)
// 2. High-fidelity semantic rule-based generative synthesis fallback when no key is provided

export async function generateBlocksFromPrompt({ prompt, workspace, brand, apiKey, apiProvider = 'gemini' }) {
  // If user provided an API key, attempt live AI generation
  if (apiKey && apiKey.trim().length > 5) {
    try {
      if (apiProvider === 'gemini') {
        return await callGeminiAPI({ prompt, workspace, brand, apiKey });
      } else {
        return await callOpenAIAPI({ prompt, workspace, brand, apiKey });
      }
    } catch (err) {
      console.warn('Live API error, falling back to local deterministic synthesis engine:', err);
    }
  }

  // Deterministic Semantic Synthesizer (Works 100% offline / without keys)
  return synthesizeLayoutLocally({ prompt, workspace, brand });
}

// Local Semantic Engine with rich variety of layout structures
function synthesizeLayoutLocally({ prompt, workspace, brand }) {
  const lower = prompt.toLowerCase();
  const idPrefix = 'gen-' + Date.now().toString(36);

  if (workspace === 'Graphic Design') {
    if (lower.includes('sale') || lower.includes('discount') || lower.includes('black friday')) {
      return [
        {
          id: idPrefix + '-badge',
          type: 'badge',
          label: 'Promo Banner Tag',
          content: 'LIMITED TIME · 40% OFF',
          styles: {
            padding: 8,
            borderRadius: 9999,
            backgroundColor: brand.primary,
            textColor: '#FFFFFF',
            fontSize: 12,
            width: 'auto',
            borderWidth: 0,
            borderColor: 'transparent'
          }
        },
        {
          id: idPrefix + '-headline',
          type: 'text',
          label: 'Promo Headline',
          content: 'SEMI-ANNUAL CREATIVE SALE',
          subContent: 'Upgrade your design stack before midnight.',
          styles: {
            padding: 16,
            borderRadius: brand.radius,
            backgroundColor: 'transparent',
            textColor: '#FFFFFF',
            fontSize: 34,
            width: '100%',
            borderWidth: 0,
            borderColor: 'transparent'
          }
        },
        {
          id: idPrefix + '-btn',
          type: 'button',
          label: 'Redeem Offer',
          content: 'Claim Discount Now',
          styles: {
            padding: 14,
            borderRadius: brand.radius,
            backgroundColor: brand.secondary,
            textColor: '#0B0A1A',
            fontSize: 14,
            width: 'auto',
            borderWidth: 0,
            borderColor: 'transparent'
          }
        }
      ];
    }

    // Default Graphic Layout
    return [
      {
        id: idPrefix + '-headline',
        type: 'text',
        label: 'Main Headline',
        content: prompt.length > 5 ? prompt.toUpperCase() : 'NEXT-GENERATION DESIGN ENGINE',
        subContent: 'Created with Adobe Stage AI Co-pilot',
        styles: {
          padding: 20,
          borderRadius: brand.radius,
          backgroundColor: 'transparent',
          textColor: '#FFFFFF',
          fontSize: 32,
          width: '100%',
          borderWidth: 0,
          borderColor: 'transparent'
        }
      },
      {
        id: idPrefix + '-badge',
        type: 'badge',
        label: 'Status Tag',
        content: 'AI VERIFIED ASSET',
        styles: {
          padding: 8,
          borderRadius: 9999,
          backgroundColor: brand.primary,
          textColor: '#FFFFFF',
          fontSize: 11,
          width: 'auto',
          borderWidth: 0,
          borderColor: 'transparent'
        }
      },
      {
        id: idPrefix + '-btn',
        type: 'button',
        label: 'Action CTA',
        content: 'Explore Collection',
        styles: {
          padding: 12,
          borderRadius: brand.radius,
          backgroundColor: brand.secondary,
          textColor: '#FFFFFF',
          fontSize: 14,
          width: 'auto',
          borderWidth: 0,
          borderColor: 'transparent'
        }
      }
    ];
  }

  // UI/UX Workspace Generation
  if (lower.includes('pricing') || lower.includes('tier') || lower.includes('subscription')) {
    return [
      {
        id: idPrefix + '-tier-pro',
        type: 'card',
        label: 'Pro Subscription Card',
        content: '$29 / month',
        subContent: 'Full access to all generative vectors & cloud sync',
        badge: 'MOST POPULAR',
        styles: {
          padding: 24,
          borderRadius: brand.radius,
          backgroundColor: brand.primary,
          textColor: '#FFFFFF',
          fontSize: 26,
          width: '100%',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.2)'
        }
      },
      {
        id: idPrefix + '-pricing-btn',
        type: 'button',
        label: 'Upgrade Button',
        content: 'Start 14-Day Free Trial',
        styles: {
          padding: 12,
          borderRadius: brand.radius,
          backgroundColor: '#FFFFFF',
          textColor: brand.primary,
          fontSize: 14,
          width: 'auto',
          borderWidth: 0,
          borderColor: 'transparent'
        }
      },
      {
        id: idPrefix + '-metric-seats',
        type: 'metric',
        label: 'Active Team Members',
        content: '18 Seats in Use',
        subContent: '2 invitations pending',
        badge: 'Organization',
        styles: {
          padding: 16,
          borderRadius: brand.radius,
          backgroundColor: '#1E293B',
          textColor: '#94A3B8',
          fontSize: 18,
          width: '100%',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.06)'
        }
      }
    ];
  }

  if (lower.includes('analytics') || lower.includes('health') || lower.includes('stats') || lower.includes('crypto')) {
    return [
      {
        id: idPrefix + '-metric-1',
        type: 'card',
        label: 'Primary Analytics Card',
        content: '99.98% Uptime',
        subContent: 'All cluster nodes healthy in us-east-1',
        badge: 'Optimal',
        styles: {
          padding: 22,
          borderRadius: brand.radius,
          backgroundColor: brand.cardDark,
          textColor: '#10B981',
          fontSize: 26,
          width: '100%',
          borderWidth: 1,
          borderColor: 'rgba(16,185,129,0.3)'
        }
      },
      {
        id: idPrefix + '-metric-2',
        type: 'metric',
        label: 'Daily Active Requests',
        content: '1,420,890',
        subContent: '+23.4% vs last 7 days',
        badge: 'High Traffic',
        styles: {
          padding: 16,
          borderRadius: brand.radius,
          backgroundColor: '#1E293B',
          textColor: '#60A5FA',
          fontSize: 20,
          width: '100%',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)'
        }
      },
      {
        id: idPrefix + '-cta',
        type: 'button',
        label: 'Download Report',
        content: 'Export PDF Analytics',
        styles: {
          padding: 12,
          borderRadius: brand.radius,
          backgroundColor: brand.primary,
          textColor: '#FFFFFF',
          fontSize: 14,
          width: 'auto',
          borderWidth: 0,
          borderColor: 'transparent'
        }
      }
    ];
  }

  // General Dashboard generation
  return [
    {
      id: idPrefix + '-card-main',
      type: 'card',
      label: 'Generated Overview Card',
      content: prompt.length > 5 ? prompt : 'Operational Dashboard',
      subContent: 'Synthesized via Stage AI engine with direct slider controls',
      badge: 'Active State',
      styles: {
        padding: 24,
        borderRadius: brand.radius,
        backgroundColor: brand.primary,
        textColor: '#FFFFFF',
        fontSize: 24,
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)'
      }
    },
    {
      id: idPrefix + '-metric-speed',
      type: 'metric',
      label: 'Performance Metric',
      content: '142ms Latency',
      subContent: 'Global CDN distribution active',
      badge: 'Fast',
      styles: {
        padding: 16,
        borderRadius: brand.radius,
        backgroundColor: '#1E293B',
        textColor: '#38BDF8',
        fontSize: 18,
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)'
      }
    },
    {
      id: idPrefix + '-cta',
      type: 'button',
      label: 'Primary Action',
      content: 'Deploy Changes',
      styles: {
        padding: 12,
        borderRadius: brand.radius,
        backgroundColor: brand.secondary,
        textColor: '#0B0A1A',
        fontSize: 14,
        width: 'auto',
        borderWidth: 0,
        borderColor: 'transparent'
      }
    }
  ];
}

// Live Gemini API client
async function callGeminiAPI({ prompt, workspace, brand, apiKey }) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;
  
  const systemPrompt = `You are the Adobe Stage generative design compiler. Given a user design request for a ${workspace}, return ONLY a valid JSON array of design block objects with schema: [{"id": "block-1", "type": "card"|"button"|"metric"|"badge"|"text", "label": "string", "content": "string", "subContent": "string", "badge": "string", "styles": {"padding": 20, "borderRadius": 12, "backgroundColor": "${brand.primary}", "textColor": "#FFFFFF", "fontSize": 20, "width": "100%", "borderWidth": 1, "borderColor": "rgba(255,255,255,0.1)"}}]. Return raw JSON only, no markdown.`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: `${systemPrompt}\n\nUser request: ${prompt}` }]
      }]
    })
  });

  const data = await response.json();
  const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const cleaned = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}

// Live OpenAI API client
async function callOpenAIAPI({ prompt, workspace, brand, apiKey }) {
  const endpoint = 'https://api.openai.com/v1/chat/completions';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are the Adobe Stage design compiler. Return ONLY a valid JSON array of design block objects with id, type (card, button, metric, badge, text), label, content, subContent, badge, and styles object (padding, borderRadius, backgroundColor, textColor, fontSize, width).`
        },
        { role: 'user', content: prompt }
      ]
    })
  });
  const data = await response.json();
  const textOutput = data?.choices?.[0]?.message?.content || '';
  const cleaned = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}
