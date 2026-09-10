import React, { useState } from 'react';
import { Sparkles, Key, Eye, EyeOff, ArrowRight, Check, Lock, Zap, MousePointer2, Type, Square, Palette } from 'lucide-react';

const STORAGE_KEY = 'adobe-stage-onboarding-done';
const API_KEY_STORAGE = 'adobe-stage-api-key';
const API_PROVIDER_STORAGE = 'adobe-stage-api-provider';

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) || '');
  const [provider, setProvider] = useState(() => localStorage.getItem(API_PROVIDER_STORAGE) || 'gemini');
  const [showKey, setShowKey] = useState(false);

  const handleFinish = () => {
    if (apiKey.trim()) {
      localStorage.setItem(API_KEY_STORAGE, apiKey.trim());
      localStorage.setItem(API_PROVIDER_STORAGE, provider);
    }
    localStorage.setItem(STORAGE_KEY, 'true');
    onComplete({ apiKey: apiKey.trim(), provider });
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    onComplete({ apiKey: '', provider });
  };

  // Step content
  const steps = [
    // Step 0: Welcome
    {
      title: 'Welcome to Adobe Stage',
      content: (
        <div className="space-y-5">
          <p className="text-gray-300 text-sm leading-relaxed">
            A browser-native, AI-first design tool prototype. Stage lets you generate UI and graphic design layouts from text prompts, then refine them with direct manipulation — drag, resize, edit text, adjust properties.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            This is a proof-of-concept built for a Product Marketing course at Carnegie Mellon. Some features are fully functional, others are shown as roadmap items.
          </p>
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">What you can do right now</div>
            <div className="space-y-2.5">
              <FeatureRow icon={<Sparkles size={14} />} text="Type a prompt to generate or modify designs" status="live" />
              <FeatureRow icon={<MousePointer2 size={14} />} text="Drag and resize elements on the canvas" status="live" />
              <FeatureRow icon={<Type size={14} />} text="Double-click any text to edit it inline" status="live" />
              <FeatureRow icon={<Square size={14} />} text="Add shapes and text blocks from the toolbar" status="live" />
              <FeatureRow icon={<Palette size={14} />} text="Switch between UI/UX and Graphic Design workspaces" status="live" />
            </div>
          </div>
        </div>
      )
    },
    // Step 1: Feature map
    {
      title: 'Feature Overview',
      content: (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            Features marked as roadmap are visible in the UI but not yet wired up. They show where the product is headed.
          </p>
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4 space-y-4">
            <div>
              <div className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                Functional
              </div>
              <div className="space-y-1.5 text-sm text-gray-300">
                <div>• AI prompt generation (with API key)</div>
                <div>• Dark / Light mode switching</div>
                <div>• Element drag, resize, and selection</div>
                <div>• Inline text editing on canvas</div>
                <div>• Workspace switching (UI/UX ↔ Graphic Design)</div>
                <div>• Fidelity & Creativity parameter sliders</div>
                <div>• Layer panel with element selection</div>
              </div>
            </div>
            <div className="h-px bg-[#333]"></div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                Roadmap (shown but greyed out)
              </div>
              <div className="space-y-1.5 text-sm text-gray-500">
                <div>• Brand DNA library integration</div>
                <div>• Multi-user collaboration (avatar indicators)</div>
                <div>• Export to code / assets</div>
                <div>• Creative Cloud Libraries</div>
                <div>• Advanced property inspector (stroke, effects)</div>
                <div>• Present / Share functionality</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    // Step 2: API Key
    {
      title: 'Connect an AI Model (Optional)',
      content: (
        <div className="space-y-5">
          <p className="text-gray-300 text-sm leading-relaxed">
            To get real AI-generated design responses, paste your own API key below. Without a key, the tool falls back to built-in demo responses.
          </p>
          <p className="text-gray-500 text-xs leading-relaxed">
            Your key is stored only in this browser's local storage. It is never sent to any server other than the AI provider's API endpoint.
          </p>

          {/* Provider selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setProvider('gemini')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                provider === 'gemini'
                  ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                  : 'bg-[#1a1a1a] border-[#333] text-gray-400 hover:border-[#555]'
              }`}
            >
              Google Gemini
            </button>
            <button
              onClick={() => setProvider('openai')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                provider === 'openai'
                  ? 'bg-green-600/20 border-green-500 text-green-400'
                  : 'bg-[#1a1a1a] border-[#333] text-gray-400 hover:border-[#555]'
              }`}
            >
              OpenAI
            </button>
          </div>

          {/* Key input */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <Key size={16} />
            </div>
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={provider === 'gemini' ? 'AIza...' : 'sk-...'}
              className="w-full bg-[#111] border border-[#444] rounded-lg pl-10 pr-12 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono transition-colors"
              spellCheck={false}
              autoComplete="off"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-3 flex items-start gap-2.5">
            <Lock size={14} className="text-gray-500 mt-0.5 shrink-0" />
            <div className="text-xs text-gray-500 leading-relaxed">
              No key? No problem. You can still explore the full UI. The AI prompt bar will use deterministic demo responses (dark mode, cyberpunk style, button color changes).
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStep = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#222] border border-[#444] rounded-2xl w-[520px] max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#333]">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Sparkles size={16} className="text-white" />
            </div>
            <h2 className="text-lg font-bold text-white">{currentStep.title}</h2>
          </div>
          {/* Step dots */}
          <div className="flex gap-1.5 mt-3">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i === step ? 'w-8 bg-purple-500' : i < step ? 'w-4 bg-purple-500/50' : 'w-4 bg-[#444]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {currentStep.content}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#333] flex justify-between items-center">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Skip intro
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-[#333] transition-colors"
              >
                Back
              </button>
            )}
            {isLast ? (
              <button
                onClick={handleFinish}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white transition-colors shadow-md"
              >
                <Zap size={14} /> Get Started
              </button>
            ) : (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-[#333] hover:bg-[#444] text-white transition-colors"
              >
                Next <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureRow = ({ icon, text, status }) => (
  <div className="flex items-center gap-2.5">
    <div className={`w-5 h-5 rounded flex items-center justify-center ${status === 'live' ? 'text-green-400' : 'text-gray-600'}`}>
      {icon}
    </div>
    <span className={`text-sm ${status === 'live' ? 'text-gray-300' : 'text-gray-600'}`}>{text}</span>
    {status === 'live' && <Check size={12} className="text-green-400 ml-auto" />}
  </div>
);

export default Onboarding;
export { API_KEY_STORAGE, API_PROVIDER_STORAGE, STORAGE_KEY };
