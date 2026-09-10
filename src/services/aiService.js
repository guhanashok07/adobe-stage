// AI Service - Calls Gemini or OpenAI to interpret design prompts
// Falls back to deterministic demo responses when no API key is provided

const SYSTEM_PROMPT = `You are an AI design assistant inside "Adobe Stage", a design tool similar to Figma.
The user is looking at a canvas with design elements. When they type a prompt, you decide what visual changes to make.

You MUST respond with ONLY a valid JSON object (no markdown, no explanation). The JSON schema:

{
  "theme": "light" | "dark" | null,
  "ctaStyle": "blue" | "black" | null,
  "gdStyle": "modern" | "cyberpunk" | null,
  "addElements": [],
  "message": "short 1-line summary of what you changed"
}

Rules:
- Set "theme" to "dark" or "light" only if the user asks to change the overall color mode. Otherwise null.
- Set "ctaStyle" to "black" if the user wants a dark/black button. "blue" to reset. Otherwise null.
- Set "gdStyle" to "cyberpunk" if the user wants neon/cyber/futuristic style. "modern" for clean/minimal. Otherwise null.
- "addElements" is an array of {type: "shape"|"text"} for new elements the user requests. Usually empty.
- "message" is a short human-readable summary.
- Only set fields that are relevant. Use null for unchanged properties.
- If you aren't sure what to change, make your best guess and explain in "message".`;

export async function generateWithAI(prompt, { apiKey, provider, workspace, selectedElement }) {
  if (!apiKey) {
    return fallbackGenerate(prompt, workspace);
  }

  try {
    if (provider === 'gemini') {
      return await callGemini(prompt, apiKey, workspace, selectedElement);
    } else {
      return await callOpenAI(prompt, apiKey, workspace, selectedElement);
    }
  } catch (err) {
    console.error('AI API error, falling back to demo mode:', err);
    return {
      ...fallbackGenerate(prompt, workspace),
      message: `API error: ${err.message}. Used demo fallback instead.`
    };
  }
}

async function callGemini(prompt, apiKey, workspace, selectedElement) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `${SYSTEM_PROMPT}\n\nCurrent workspace: ${workspace}\nSelected element: ${selectedElement}\n\nUser prompt: "${prompt}"`
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 256,
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

async function callOpenAI(prompt, apiKey, workspace, selectedElement) {
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
        { role: 'user', content: `Current workspace: ${workspace}\nSelected element: ${selectedElement}\n\nUser prompt: "${prompt}"` }
      ],
      temperature: 0.3,
      max_tokens: 256,
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
    addElements: parsed.addElements || [],
    message: parsed.message || 'Changes applied.'
  };
}

function fallbackGenerate(prompt, workspace) {
  const lower = prompt.toLowerCase();
  const result = {
    theme: null,
    ctaStyle: null,
    gdStyle: null,
    addElements: [],
    message: ''
  };

  if (lower.includes('dark mode')) {
    result.theme = 'dark';
    result.message = 'Switched to dark mode.';
  } else if (lower.includes('light mode')) {
    result.theme = 'light';
    result.message = 'Switched to light mode.';
  }

  if (lower.includes('black') || lower.includes('transfer button')) {
    result.ctaStyle = 'black';
    result.message = (result.message ? result.message + ' ' : '') + 'Transfer button set to black.';
  }

  if (lower.includes('cyberpunk') || lower.includes('neon')) {
    result.gdStyle = 'cyberpunk';
    result.message = (result.message ? result.message + ' ' : '') + 'Applied cyberpunk style.';
  }

  if (!result.message) {
    result.message = 'Demo mode: Try "dark mode", "make transfer button black", or "cyberpunk style".';
  }

  return result;
}
