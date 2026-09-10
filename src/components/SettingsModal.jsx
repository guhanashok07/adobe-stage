import React, { useState } from 'react';
import { X, Key, Shield, Sparkles, Check } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, apiKey, onSaveApiKey, apiProvider, onChangeProvider }) {
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [provider, setProvider] = useState(apiProvider || 'gemini');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(keyInput.trim());
    onChangeProvider(provider);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setKeyInput('');
    onSaveApiKey('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1C1C1F] border border-[#333338] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A2E]">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Key size={16} className="text-red-500" />
            <span>AI Model &amp; API Configuration</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-[#2A2A2E] transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2 text-xs text-red-200">
            <Shield size={16} className="shrink-0 text-red-400 mt-0.5" />
            <span>
              <strong>Private &amp; Client-Side Only:</strong> Your key is stored in your local browser memory and sent directly to the model endpoint. 3rd-party viewers cannot see or use your key.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Model Provider
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProvider('gemini')}
                className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition flex items-center justify-between ${
                  provider === 'gemini' 
                    ? 'bg-blue-600/20 border-blue-500 text-white' 
                    : 'bg-[#141416] border-[#2E2E33] text-zinc-400 hover:text-white'
                }`}
              >
                <span>Google Gemini</span>
                {provider === 'gemini' && <Check size={12} className="text-blue-400" />}
              </button>
              <button
                type="button"
                onClick={() => setProvider('openai')}
                className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition flex items-center justify-between ${
                  provider === 'openai' 
                    ? 'bg-emerald-600/20 border-emerald-500 text-white' 
                    : 'bg-[#141416] border-[#2E2E33] text-zinc-400 hover:text-white'
                }`}
              >
                <span>OpenAI</span>
                {provider === 'openai' && <Check size={12} className="text-emerald-400" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Optional API Key
            </label>
            <input 
              type="password"
              placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="w-full bg-[#121214] border border-[#2E2E33] rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono transition"
            />
            <p className="text-[11px] text-zinc-500 mt-1.5">
              Leave blank to use the built-in deterministic Stage synthesis engine (offline-ready for public viewers).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#141416] border-t border-[#2A2A2E]">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition"
          >
            Clear Key
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs text-zinc-300 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-md shadow-red-500/20"
            >
              {saved ? (
                <>
                  <Check size={14} /> Saved
                </>
              ) : (
                <>
                  <Sparkles size={14} /> Save Configuration
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
