import React, { useEffect, useRef, useState } from 'react';
import { MousePointer2 } from 'lucide-react';

// A silent, scripted walkthrough that runs on first load.
//
// The product argument is "prompt the first 90%, finish the last 10% by hand",
// and nobody reads a README to learn that. So the tool performs it: a ghost
// cursor selects the hero, drags it, retypes the headline, and undoes. Any
// interaction cancels it immediately, and it never leaves the document dirty.

export const DEMO_SEEN_KEY = 'adobe-stage-demo-seen';

const SCRIPT = [
  { at: 0, caption: 'Prompt gets you 90% of the way', to: [0.5, 0.9] },
  { at: 1500, caption: 'Then you finish it by hand', to: [0.42, 0.44], act: 'select' },
  { at: 3200, caption: 'Drag it', to: [0.5, 0.5], act: 'drag' },
  { at: 5000, caption: 'Retype it in place', to: [0.42, 0.42], act: 'type' },
  { at: 7000, caption: 'Undo anything', to: [0.68, 0.06], act: 'undo' },
  { at: 8600, caption: null, to: [0.5, 0.6] },
];

export default function GhostDemo({ onStep, onEnd }) {
  const [pos, setPos] = useState({ x: 0.5, y: 0.9 });
  const [caption, setCaption] = useState(SCRIPT[0].caption);
  const [pressed, setPressed] = useState(false);
  const timers = useRef([]);
  const ended = useRef(false);

  useEffect(() => {
    // Capture the array so cleanup clears the same timers the effect created.
    const pending = timers.current;

    const finish = () => {
      if (ended.current) return;
      ended.current = true;
      pending.forEach(clearTimeout);
      onEnd();
    };

    SCRIPT.forEach((step) => {
      pending.push(setTimeout(() => {
        setPos({ x: step.to[0], y: step.to[1] });
        setCaption(step.caption);
        setPressed(step.act === 'drag');
        if (step.act) onStep(step.act);
      }, step.at));
    });

    pending.push(setTimeout(finish, 9800));

    // Any real input hands control straight back to the user.
    const cancel = () => finish();
    window.addEventListener('pointerdown', cancel, { once: true });
    window.addEventListener('keydown', cancel, { once: true });
    window.addEventListener('wheel', cancel, { once: true });

    return () => {
      pending.forEach(clearTimeout);
      window.removeEventListener('pointerdown', cancel);
      window.removeEventListener('keydown', cancel);
      window.removeEventListener('wheel', cancel);
    };
  }, [onStep, onEnd]);

  return (
    <div className="absolute inset-0 z-[60] pointer-events-none">
      <div
        className="absolute transition-all duration-[1100ms] ease-in-out"
        style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%` }}
      >
        <MousePointer2
          size={22}
          className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]"
          fill="#fff"
          color="#0B1220"
          style={{ transform: pressed ? 'scale(0.85)' : 'scale(1)', transition: 'transform 160ms' }}
        />
        {pressed && (
          <span className="absolute -inset-3 rounded-full border-2 border-accent animate-ping" />
        )}
      </div>

      {caption && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <div className="px-4 h-9 rounded-full bg-spectrum-900/92 border border-spectrum-300 backdrop-blur-md flex items-center text-[13px] font-medium text-spectrum-50 shadow-modal whitespace-nowrap">
            {caption}
          </div>
        </div>
      )}

      <div className="absolute top-3 left-1/2 -translate-x-1/2">
        <div className="px-3 h-7 rounded-full bg-spectrum-900/80 border border-spectrum-400 flex items-center text-[11px] text-spectrum-100">
          Click anywhere to take over
        </div>
      </div>
    </div>
  );
}
