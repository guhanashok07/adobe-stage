import React, { useState } from 'react';
import { ChevronDown, Layout, Folder, Type, Image as ImageIcon, Layers, Square } from 'lucide-react';

export function ToolButton({ icon, active, title, onClick, disabled }) {
  return (
    <button
      title={title}
      onClick={disabled ? undefined : onClick}
      className={`h-8 w-8 grid place-items-center rounded-[4px] transition-colors ${
        disabled
          ? 'text-spectrum-200/60 cursor-not-allowed'
          : active
            ? 'bg-accent text-white'
            : 'text-spectrum-100 hover:text-spectrum-50 hover:bg-spectrum-500'
      }`}
    >
      {icon}
    </button>
  );
}

const LAYER_ICONS = {
  frame: <Layout size={12} />,
  group: <Folder size={12} />,
  text: <Type size={12} />,
  image: <ImageIcon size={12} />,
  component: <Layers size={12} />,
  shape: <Square size={12} />,
};

export function LayerItem({ name, type, selected, expanded, onClick, children }) {
  return (
    <div>
      <div
        onClick={onClick}
        className={`flex items-center gap-1.5 px-2 h-7 rounded-[4px] transition-colors ${
          onClick ? 'cursor-pointer' : 'cursor-default'
        } ${selected ? 'bg-accent/15 text-accent-subtle' : 'text-spectrum-100 hover:bg-spectrum-600'}`}
      >
        <span className="w-3 flex justify-center text-spectrum-200">
          {(type === 'frame' || type === 'group') && (
            <ChevronDown size={12} className={`transition-transform ${expanded ? '' : '-rotate-90'}`} />
          )}
        </span>
        <span className={selected ? 'text-accent-subtle' : 'text-spectrum-200'}>
          {LAYER_ICONS[type] || LAYER_ICONS.shape}
        </span>
        <span className="text-xs truncate">{name}</span>
      </div>
      {expanded && children && (
        <div className="ml-[18px] border-l border-spectrum-400 pl-1 mt-0.5">{children}</div>
      )}
    </div>
  );
}

// Commits on blur or Enter rather than on every keystroke, so typing "240"
// is one undo step instead of three.
export function NumberInput({ label, value, onCommit, disabled }) {
  const [prevValue, setPrevValue] = useState(value);
  const [draft, setDraft] = useState(String(value ?? ''));

  if (value !== prevValue) {
    setPrevValue(value);
    setDraft(String(value ?? ''));
  }

  const commit = () => {
    const parsed = parseInt(draft, 10);
    if (Number.isNaN(parsed)) { setDraft(String(value ?? '')); return; }
    if (parsed !== value) onCommit(parsed);
  };

  return (
    <div
      className={`flex items-center h-7 bg-spectrum-800 border border-spectrum-400 rounded-[4px] transition-colors overflow-hidden ${
        disabled ? 'opacity-50' : 'hover:border-spectrum-300 focus-within:border-accent'
      }`}
    >
      <span className="text-[11px] text-spectrum-200 w-6 shrink-0 text-center select-none">{label}</span>
      <input
        type="number"
        disabled={disabled}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.currentTarget.blur(); }
          if (e.key === 'Escape') { setDraft(String(value ?? '')); e.currentTarget.blur(); }
          e.stopPropagation(); // don't let arrow keys nudge the canvas selection
        }}
        className="bg-transparent w-full text-xs text-spectrum-50 outline-none pr-1.5 tabular [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
  );
}

export function PanelSection({ title, action, children }) {
  return (
    <section>
      {title && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-spectrum-50 tracking-wide">{title}</span>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export const Divider = () => <div className="h-px w-full bg-spectrum-400" />;

export const SectionLabel = ({ icon, children }) => (
  <span className="text-[10px] font-semibold text-spectrum-200 uppercase tracking-[0.08em] flex items-center gap-1.5">
    {icon} {children}
  </span>
);

// Inline canvas text editing. Commits on blur; Escape reverts, Enter confirms.
export function Editable({ as = 'div', value, onCommit, className = '', style }) {
  return React.createElement(
    as,
    {
      contentEditable: true,
      suppressContentEditableWarning: true,
      spellCheck: false,
      className: `outline-none cursor-text ${className}`,
      style,
      onKeyDown: (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); }
        if (e.key === 'Escape') { e.currentTarget.innerText = value; e.currentTarget.blur(); }
      },
      onBlur: (e) => {
        const next = e.target.innerText.trim();
        if (next && next !== value) onCommit(next);
        else e.target.innerText = value;
      },
    },
    value
  );
}
