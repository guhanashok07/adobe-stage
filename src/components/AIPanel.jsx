import React, { useState } from 'react';
import { Sparkles, Minus, SlidersHorizontal, ArrowRight, CornerDownLeft, Loader2, Lock, ChevronDown } from 'lucide-react';

// Free typing is deliberately closed off, so these are the entire input
// surface. They are chosen to cover all three app compositions and both
// campaign compositions, plus the adjust-without-regenerating case.
const SUGGESTIONS = {
  'UI/UX Design': [
    'A music streaming app',
    'An online shopping app',
    'A payments dashboard',
    'A fitness tracking app',
    'A crypto wallet',
    'Make it dark mode',
    'Make the button black',
  ],
  'Graphic Design': [
    'A music festival campaign',
    'An ecommerce product ad',
    'A crypto launch poster',
    'A travel brand campaign',
    'Make it cyberpunk style',
    'Make it dark mode',
  ],
};

export default function AIPanel({
  open, onOpen, onClose,
  onGenerate, isGenerating,
  fidelity, setFidelity, creativity, setCreativity,
  workspace, otherWorkspace, onSwitchWorkspace,
  message, messageIsError, crossSurface, connected, providerName, selectionLabel,
}) {
  // Collapsed by default: on a 1280x720 laptop this block was costing the
  // artboard about 20 points of zoom.
  const [paramsOpen, setParamsOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={onOpen}
        className="flex items-center gap-2 h-10 px-4 rounded-full bg-spectrum-700 border border-spectrum-300 text-spectrum-50 text-[13px] font-medium shadow-float hover:bg-spectrum-600 transition-colors"
      >
        <Sparkles size={15} className="text-accent-subtle" />
        Stage AI
      </button>
    );
  }

  return (
    <div className="w-[540px] bg-spectrum-700/95 backdrop-blur-xl border border-spectrum-300 rounded-[8px] shadow-modal overflow-hidden">
      {/* Generation progress rail */}
      <div className="h-0.5 bg-transparent overflow-hidden">
        {isGenerating && <div className="h-full w-1/3 bg-accent animate-[loading_1.1s_ease-in-out_infinite]" />}
      </div>

      <div className="flex items-center justify-between px-3.5 h-9 border-b border-spectrum-400">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-accent-subtle" />
          <span className="text-[13px] font-semibold text-spectrum-50">Stage AI</span>
          <span className="text-[11px] text-spectrum-200">· {selectionLabel}</span>
        </div>
        <button
          onClick={onClose}
          title="Minimise"
          className="p-1 rounded-[4px] text-spectrum-100 hover:bg-spectrum-500 transition-colors"
        >
          <Minus size={15} />
        </button>
      </div>

      <div className="p-3 space-y-2.5">
        <div className="relative">
          <div
            aria-disabled="true"
            title="Free-form prompting is disabled in this prototype"
            className="w-full h-[52px] bg-spectrum-900 border border-spectrum-400 rounded-[4px] px-3 pr-11 flex items-center text-[13px] text-spectrum-200 cursor-not-allowed select-none"
          >
            <Lock size={12} className="mr-2 shrink-0" />
            <span className="truncate">
              Free-form prompting is off. Pick a starting point below.
            </span>
          </div>
          <div className="absolute top-2.5 right-2.5 h-7 w-7 grid place-items-center rounded-[4px] bg-spectrum-500 text-spectrum-200">
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <CornerDownLeft size={14} />}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {SUGGESTIONS[workspace].map((s) => (
            <button
              key={s}
              onClick={() => onGenerate(s)}
              disabled={isGenerating}
              className="h-7 px-3 rounded-full bg-spectrum-600 border border-spectrum-400 text-spectrum-100 hover:text-spectrum-50 hover:border-accent hover:bg-spectrum-500 text-[11px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="bg-spectrum-800 rounded-[4px] border border-spectrum-400">
          <button
            onClick={() => setParamsOpen((v) => !v)}
            className="w-full h-8 px-3 flex items-center gap-1.5 text-spectrum-100 hover:text-spectrum-50 transition-colors"
          >
            <ChevronDown size={11} className={`transition-transform ${paramsOpen ? '' : '-rotate-90'}`} />
            <SlidersHorizontal size={11} />
            <span className="text-[11px] font-medium">Parameters</span>
            <span className="ml-auto text-[10px] text-spectrum-200 tabular">
              {fidelity}% fidelity · {creativity}% creative
            </span>
          </button>

          {paramsOpen && (
            <div className="flex items-center gap-5 px-3 pb-3">
              <div className="flex-1">
                <div className="flex justify-between text-[10px] text-spectrum-200 mb-1">
                  <span>Wireframe</span>
                  <span>High-fi</span>
                </div>
                <input
                  type="range" min="0" max="100" value={fidelity}
                  onChange={(e) => setFidelity(Number(e.target.value))}
                  className="spectrum-slider w-full"
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-[10px] text-spectrum-200 mb-1">
                  <span>On-brand</span>
                  <span>Exploratory</span>
                </div>
                <input
                  type="range" min="0" max="100" value={creativity}
                  onChange={(e) => setCreativity(Number(e.target.value))}
                  className="spectrum-slider w-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-3.5 h-9 bg-spectrum-800 border-t border-spectrum-400 flex items-center justify-between gap-3 text-[11px]">
        <div className="flex items-center gap-2 min-w-0">
          {message && (
            <span
              title={message}
              className={`truncate ${messageIsError ? 'text-amber-400' : 'text-spectrum-100'}`}
            >
              {messageIsError ? '⚠ ' : ''}{message}
            </span>
          )}
          {crossSurface && (
            <button
              onClick={onSwitchWorkspace}
              className="shrink-0 flex items-center gap-1 h-6 px-2 rounded-full bg-accent/15 border border-accent/50 text-accent-subtle hover:bg-accent/25 font-medium transition-colors"
            >
              {otherWorkspace} updated <ArrowRight size={11} />
            </button>
          )}
        </div>
        <span className="flex items-center gap-1.5 shrink-0 text-spectrum-200">
          <span className={`w-1.5 h-1.5 rounded-full ${connected && !messageIsError ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          {!connected ? 'Demo mode' : messageIsError ? `${providerName} failing` : `${providerName} connected`}
        </span>
      </div>
    </div>
  );
}
