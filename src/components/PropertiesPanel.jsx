import React from 'react';
import {
  AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  AlignStartHorizontal, AlignCenterHorizontal, AlignEndHorizontal,
  Trash2, Sun, Moon,
} from 'lucide-react';
import { NumberInput, PanelSection, Divider } from './primitives';

const TABS = ['Design', 'Prototype', 'Inspect'];

export default function PropertiesPanel({
  doc, selectedId, label, geometry, fill, deletable,
  onAlign, onGeometry, onFillScrubStart, onFillChange, onFillCommit,
  onDelete, onTheme,
}) {
  const hasSelection = Boolean(selectedId);
  const hex = String(fill || '').replace('#', '');

  const alignBtn = (Icon, type, title) => (
    <button
      onClick={() => onAlign(type)}
      disabled={!hasSelection}
      title={title}
      className="h-7 w-7 grid place-items-center rounded-[4px] text-spectrum-100 hover:text-spectrum-50 hover:bg-spectrum-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
    >
      <Icon size={15} />
    </button>
  );

  return (
    <div className="w-[264px] h-full flex flex-col">
      <div className="flex border-b border-spectrum-400 shrink-0">
        {TABS.map((t) => (
          <button
            key={t}
            disabled={t !== 'Design'}
            title={t === 'Design' ? undefined : 'Roadmap'}
            className={`flex-1 h-9 text-[13px] font-medium transition-colors ${
              t === 'Design'
                ? 'text-spectrum-50 border-b-2 border-accent'
                : 'text-spectrum-200/70 cursor-not-allowed'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-spectrum-50 uppercase tracking-[0.08em] truncate">
            {label}
          </span>
          {deletable && (
            <button
              onClick={onDelete}
              title="Delete element (Del)"
              className="p-1 rounded-[4px] text-spectrum-100 hover:text-rose-400 hover:bg-spectrum-500 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>

        <PanelSection>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-0.5">
              {alignBtn(AlignStartVertical, 'left', 'Align left')}
              {alignBtn(AlignCenterVertical, 'center', 'Align horizontal centre')}
              {alignBtn(AlignEndVertical, 'right', 'Align right')}
            </div>
            <div className="w-px h-4 bg-spectrum-400" />
            <div className="flex items-center gap-0.5">
              {alignBtn(AlignStartHorizontal, 'top', 'Align top')}
              {alignBtn(AlignCenterHorizontal, 'middle', 'Align vertical centre')}
              {alignBtn(AlignEndHorizontal, 'bottom', 'Align bottom')}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <NumberInput label="X" value={geometry.x} disabled={!hasSelection} onCommit={(v) => onGeometry('x', v)} />
            <NumberInput label="Y" value={geometry.y} disabled={!hasSelection} onCommit={(v) => onGeometry('y', v)} />
            <NumberInput label="W" value={geometry.w} disabled={!hasSelection} onCommit={(v) => onGeometry('w', v)} />
            <NumberInput label="H" value={geometry.h} disabled={!hasSelection} onCommit={(v) => onGeometry('h', v)} />
          </div>
        </PanelSection>

        <Divider />

        <PanelSection title="Appearance">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onTheme('light')}
              className={`h-8 rounded-[4px] text-[12px] font-medium flex items-center justify-center gap-1.5 border transition-colors ${
                doc.theme === 'light'
                  ? 'bg-accent/15 border-accent text-accent-subtle'
                  : 'bg-spectrum-800 border-spectrum-400 text-spectrum-100 hover:border-spectrum-300'
              }`}
            >
              <Sun size={13} /> Light
            </button>
            <button
              onClick={() => onTheme('dark')}
              className={`h-8 rounded-[4px] text-[12px] font-medium flex items-center justify-center gap-1.5 border transition-colors ${
                doc.theme === 'dark'
                  ? 'bg-accent/15 border-accent text-accent-subtle'
                  : 'bg-spectrum-800 border-spectrum-400 text-spectrum-100 hover:border-spectrum-300'
              }`}
            >
              <Moon size={13} /> Dark
            </button>
          </div>
        </PanelSection>

        <Divider />

        <PanelSection title="Fill">
          <div className={`flex items-center gap-2 ${hasSelection ? '' : 'opacity-40 pointer-events-none'}`}>
            <label
              className="relative w-6 h-6 rounded-[4px] border border-spectrum-300 cursor-pointer overflow-hidden shrink-0"
              style={{ backgroundColor: `#${hex}` }}
              title="Pick fill colour"
              onMouseDown={onFillScrubStart}
            >
              <input
                type="color"
                value={`#${hex}`}
                onChange={(e) => onFillChange(e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              />
            </label>
            <input
              type="text"
              value={hex.toUpperCase()}
              onChange={(e) => onFillChange(e.target.value)}
              onBlur={onFillCommit}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter') e.currentTarget.blur();
              }}
              className="text-[12px] text-spectrum-50 font-mono bg-transparent outline-none w-[72px] border-b border-transparent focus:border-accent tabular"
            />
            <span className="text-[12px] text-spectrum-200 ml-auto tabular">100%</span>
          </div>
        </PanelSection>

        <Divider />

        <PanelSection
          title="Stroke"
          action={<span className="text-[10px] text-spectrum-200/70">Roadmap</span>}
        >
          <div className="h-7 rounded-[4px] border border-dashed border-spectrum-400 grid place-items-center text-[11px] text-spectrum-200/70">
            No stroke
          </div>
        </PanelSection>

        <PanelSection
          title="Effects"
          action={<span className="text-[10px] text-spectrum-200/70">Roadmap</span>}
        >
          <div className="h-7 rounded-[4px] border border-dashed border-spectrum-400 grid place-items-center text-[11px] text-spectrum-200/70">
            No effects
          </div>
        </PanelSection>
      </div>
    </div>
  );
}
