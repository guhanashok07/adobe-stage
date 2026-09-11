import React, { useEffect, useRef, useState } from 'react';

// The most recognisable control in any Adobe app: a numeric value rendered as
// blue text that you drag horizontally to change, or click to type into. Boxed
// spinner inputs are a web convention, not an Adobe one, so the properties
// panel uses this everywhere instead.
export default function ScrubValue({
  value, onCommit, suffix = '', min = -100000, max = 100000, step = 1, disabled,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const drag = useRef(null);
  const inputRef = useRef(null);

  // Re-sync during render rather than in an effect: while not editing, the
  // draft is derived state, and the canvas changes it under us constantly.
  const [synced, setSynced] = useState(value);
  if (!editing && value !== synced) {
    setSynced(value);
    setDraft(String(value));
  }

  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  // A drag that never moves is a click, which opens the text field instead.
  const onPointerDown = (e) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    drag.current = { startX: e.clientX, startValue: Number(value) || 0, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    if (!d.moved && Math.abs(dx) < 3) return;
    d.moved = true;
    const scale = e.shiftKey ? 10 : e.altKey ? 0.1 : 1;
    const next = Math.round(Math.min(max, Math.max(min, d.startValue + dx * step * scale)));
    if (next !== Number(value)) onCommit(next);
  };

  const onPointerUp = (e) => {
    const d = drag.current;
    drag.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    if (d && !d.moved) setEditing(true);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Enter') e.currentTarget.blur();
          if (e.key === 'Escape') { setDraft(String(value)); e.currentTarget.blur(); }
        }}
        onBlur={() => {
          const parsed = parseFloat(draft);
          if (!Number.isNaN(parsed) && parsed !== Number(value)) {
            onCommit(Math.round(Math.min(max, Math.max(min, parsed))));
          }
          setEditing(false);
        }}
        className="w-full bg-spectrum-900 border border-accent rounded-[2px] px-1 h-[18px] text-[11px] text-spectrum-50 outline-none tabular"
      />
    );
  }

  return (
    <span
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      title={disabled ? undefined : 'Drag to change, click to type'}
      className={`text-[11px] tabular select-none inline-block ${
        disabled
          ? 'text-spectrum-200 cursor-default'
          : 'text-accent-value cursor-ew-resize hover:brightness-125'
      }`}
      style={{ touchAction: 'none' }}
    >
      {value}{suffix && <span className="text-spectrum-100 ml-0.5">{suffix}</span>}
    </span>
  );
}
