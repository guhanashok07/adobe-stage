import React, { useState } from 'react';
import {
  Sparkles, Eye, EyeOff, ArrowRight, ArrowLeft, Lock,
  MousePointer2, Type, SlidersHorizontal, Undo2, Layers, Palette,
} from 'lucide-react';

export const STORAGE_KEY = 'adobe-stage-onboarding-done';
export const API_KEY_STORAGE = 'adobe-stage-api-key';
export const API_PROVIDER_STORAGE = 'adobe-stage-api-provider';

// The guided demo. This is the product argument in four moves: prompt once,
// get both surfaces, then finish the last 10% by hand without re-prompting.
const WALKTHROUGH = [
  {
    n: 1,
    title: 'Prompt a concept',
    body: 'Type "a crypto wallet dashboard" into Stage AI and press Enter. The dashboard re-skins end to end: name, balance, transactions, call to action.',
    icon: <Sparkles size={14} />,
  },
  {
    n: 2,
    title: 'Check the second surface',
    body: 'The footer says Graphic Design updated. Click it. The same concept is already laid out as a social ad. One prompt, two surfaces, one brand.',
    icon: <Layers size={14} />,
  },
  {
    n: 3,
    title: 'Finish it by hand',
    body: 'Select the headline. Drag it, nudge with arrow keys, resize from a corner, retype it inline, or set an exact X/W and a fill colour in the properties panel. No re-prompting.',
    icon: <MousePointer2 size={14} />,
  },
  {
    n: 4,
    title: 'Change your mind freely',
    body: 'Cmd+Z steps back through every edit. Drop the fidelity slider under 35% to see the same layout as a wireframe.',
    icon: <Undo2 size={14} />,
  },
];

const CAPABILITIES = {
  live: [
    'Prompt-to-design across both workspaces',
    'Drag, corner-resize, and arrow-key nudge',
    'Inline text editing on the artboard',
    'X / Y / W / H, alignment, and fill controls',
    'Undo & redo across every edit',
    'Fidelity and creativity parameters',
    'Add and delete shapes and text',
    'Light / dark theme tokens',
  ],
  roadmap: [
    'Brand DNA library integration',
    'Multi-user collaboration',
    'Export to code and assets',
    'Creative Cloud Libraries',
    'Auto layout and prototyping',
  ],
};

export default function Onboarding({ onComplete, hasKey }) {
  const [step, setStep] = useState(0);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) || '');
  const [provider, setProvider] = useState(() => localStorage.getItem(API_PROVIDER_STORAGE) || 'gemini');
  const [showKey, setShowKey] = useState(false);

  const finish = (key) => {
    const trimmed = (key ?? apiKey).trim();
    if (trimmed) {
      localStorage.setItem(API_KEY_STORAGE, trimmed);
      localStorage.setItem(API_PROVIDER_STORAGE, provider);
    } else {
      localStorage.removeItem(API_KEY_STORAGE);
    }
    localStorage.setItem(STORAGE_KEY, 'true');
    onComplete({ apiKey: trimmed, provider });
  };

  const steps = [
    {
      title: 'Adobe Stage',
      body: (
        <div className="space-y-4">
          <p className="text-[13px] leading-relaxed text-spectrum-100">
            Generative design tools hit a <span className="text-spectrum-50 font-semibold">prompt wall</span>: you get
            90% of a layout in seconds, then spend an hour re-prompting to move one button 12 pixels.
          </p>
          <p className="text-[13px] leading-relaxed text-spectrum-100">
            Stage splits the job. <span className="text-spectrum-50 font-semibold">Prompt the first 90%</span> in plain
            English, then <span className="text-spectrum-50 font-semibold">finish the last 10% by hand</span>: drag,
            resize, retype, recolour, on a browser-native canvas.
          </p>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="rounded-[4px] border border-spectrum-400 bg-spectrum-800 p-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-400 mb-2">
                Functional now
              </div>
              <ul className="space-y-1.5">
                {CAPABILITIES.live.map((c) => (
                  <li key={c} className="text-[11px] text-spectrum-100 leading-snug">· {c}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-[4px] border border-spectrum-400 bg-spectrum-800 p-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-spectrum-200 mb-2">
                Shown as roadmap
              </div>
              <ul className="space-y-1.5">
                {CAPABILITIES.roadmap.map((c) => (
                  <li key={c} className="text-[11px] text-spectrum-200/80 leading-snug">· {c}</li>
                ))}
              </ul>
              <p className="text-[10px] text-spectrum-200/70 mt-3 leading-snug">
                Greyed-out controls in the UI are deliberate. They mark where the product goes next.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Try this in about 60 seconds',
      body: (
        <div className="space-y-2.5">
          {WALKTHROUGH.map((s) => (
            <div key={s.n} className="flex gap-3 rounded-[4px] border border-spectrum-400 bg-spectrum-800 p-3">
              <div className="w-6 h-6 shrink-0 rounded-full bg-accent grid place-items-center text-[11px] font-bold text-white">
                {s.n}
              </div>
              <div className="min-w-0">
                <div className="text-[12px] font-semibold text-spectrum-50 flex items-center gap-1.5 mb-0.5">
                  <span className="text-accent-subtle">{s.icon}</span>
                  {s.title}
                </div>
                <p className="text-[12px] text-spectrum-100 leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[11px] text-spectrum-200">
            <span className="flex items-center gap-1.5"><Type size={11} /> Click text to edit</span>
            <span className="flex items-center gap-1.5"><MousePointer2 size={11} /> Arrows nudge · ⇧ for 10px</span>
            <span className="flex items-center gap-1.5"><Undo2 size={11} /> ⌘Z undo · ⇧⌘Z redo</span>
            <span className="flex items-center gap-1.5"><SlidersHorizontal size={11} /> Esc deselects</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Connect an AI model (optional)',
      body: (
        <div className="space-y-4">
          <p className="text-[13px] leading-relaxed text-spectrum-100">
            Paste your own key for real generated responses to any prompt. Without one, Stage runs in demo
            mode and answers a fixed set of prompts from built-in archetypes, which is enough to walk the whole demo above.
          </p>

          <div className="grid grid-cols-2 gap-2">
            {[['gemini', 'Google Gemini'], ['openai', 'OpenAI']].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setProvider(id)}
                className={`h-9 rounded-[4px] text-[13px] font-medium border transition-colors ${
                  provider === id
                    ? 'bg-accent/15 border-accent text-accent-subtle'
                    : 'bg-spectrum-800 border-spectrum-400 text-spectrum-100 hover:border-spectrum-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-spectrum-800 border border-spectrum-400 rounded-[4px] px-3 h-10 focus-within:border-accent transition-colors">
            <Lock size={13} className="text-spectrum-200 shrink-0" />
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') finish(); }}
              placeholder={provider === 'gemini' ? 'AIza…' : 'sk-…'}
              className="flex-1 bg-transparent text-[13px] text-spectrum-50 placeholder-spectrum-200/60 outline-none font-mono"
            />
            <button
              onClick={() => setShowKey((v) => !v)}
              className="text-spectrum-200 hover:text-spectrum-50 transition-colors"
              title={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          <p className="text-[11px] text-spectrum-200 leading-relaxed">
            The key is kept in this browser's local storage and sent only to the provider's own API endpoint.
            It never reaches a Stage server, because there isn't one. Clear the field and continue to remove it.
          </p>
        </div>
      ),
    },
  ];

  const last = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm grid place-items-center p-6">
      <div className="w-full max-w-[620px] bg-spectrum-700 border border-spectrum-300 rounded-[8px] shadow-modal overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-spectrum-400">
          <div className="flex items-center gap-2.5 mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
              <path fill="#EB1000" d="M15.1 2H22V22L15.1 2ZM8.9 2H2V22L8.9 2ZM12 9.4L17.6 22H13.8L12 17.5L8.5 22H5.4L12 9.4Z" />
            </svg>
            <h2 className="text-[17px] font-semibold text-spectrum-50 tracking-[-0.01em]">{steps[step].title}</h2>
          </div>
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-0.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-accent' : 'bg-spectrum-400'}`}
              />
            ))}
          </div>
        </div>

        <div className="px-6 py-5 max-h-[62vh] overflow-y-auto">{steps[step].body}</div>

        <div className="px-6 py-3.5 border-t border-spectrum-400 bg-spectrum-800 flex items-center justify-between">
          <button
            onClick={() => finish(hasKey ? undefined : '')}
            className="text-[12px] text-spectrum-200 hover:text-spectrum-50 transition-colors"
          >
            Skip
          </button>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1.5 h-8 px-3 rounded-[4px] text-[13px] font-medium text-spectrum-100 hover:bg-spectrum-500 hover:text-spectrum-50 transition-colors"
              >
                <ArrowLeft size={13} /> Back
              </button>
            )}
            <button
              onClick={() => (last ? finish() : setStep((s) => s + 1))}
              className="flex items-center gap-1.5 h-8 px-4 rounded-[4px] bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold transition-colors"
            >
              {last ? (<><Palette size={13} /> Start designing</>) : (<>Next <ArrowRight size={13} /></>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
