import React, { useState } from 'react';
import {
  AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  AlignStartHorizontal, AlignCenterHorizontal, AlignEndHorizontal,
  Trash2, ChevronDown, RotateCcw, Diamond, Sun, Moon,
} from 'lucide-react';
import ScrubValue from './ScrubValue';

const TABS = ['Design', 'Prototype', 'Inspect'];

// Adobe puts a disclosure triangle and a reset control on every property
// group, and a keyframe diamond at the end of every row. Those two details do
// most of the work of making a panel read as Adobe rather than as a web form.
function Group({ title, children, onReset, toggle, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-b border-spectrum-400/60">
      <div className="flex items-center h-8 px-2.5 gap-1.5">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 text-spectrum-50 hover:text-white transition-colors"
        >
          <ChevronDown size={12} className={`transition-transform ${open ? '' : '-rotate-90'}`} />
          <span className="text-[11px] font-semibold">{title}</span>
        </button>

        <div className="ml-auto flex items-center gap-1.5">
          {toggle}
          {onReset && (
            <button
              onClick={onReset}
              title={`Reset ${title.toLowerCase()}`}
              className="p-1 rounded-[2px] text-spectrum-100 hover:text-spectrum-50 hover:bg-spectrum-500 transition-colors"
            >
              <RotateCcw size={11} />
            </button>
          )}
        </div>
      </div>

      {open && <div className="pb-2.5">{children}</div>}
    </section>
  );
}

// label · control · keyframe stopwatch, on one 24px line.
function Row({ label, children, keyframe = true, disabled }) {
  return (
    <div className="flex items-center h-6 pl-5 pr-2 gap-2 min-w-0">
      <span className={`text-[11px] w-[58px] shrink-0 truncate ${disabled ? 'text-spectrum-200' : 'text-spectrum-100'}`}>
        {label}
      </span>
      <div className="flex-1 min-w-0 flex items-center gap-3">{children}</div>
      {keyframe && (
        <button
          title="Add keyframe (roadmap)"
          className="shrink-0 text-spectrum-200/70 hover:text-spectrum-100 transition-colors cursor-not-allowed"
        >
          <Diamond size={9} />
        </button>
      )}
    </div>
  );
}

function Slider({ value, onChange, min = 0, max = 100 }) {
  return (
    <div className="flex items-center gap-2.5 w-full">
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="spectrum-slider flex-1"
      />
      <span className="text-[11px] text-accent-value tabular w-6 text-right shrink-0">{value}</span>
    </div>
  );
}

export default function PropertiesPanel({
  doc, selectedId, label, geometry, fill, deletable, opacity,
  onAlign, onGeometry, onFillScrubStart, onFillChange, onFillCommit,
  onDelete, onTheme, onOpacity, onResetTransform,
}) {
  const has = Boolean(selectedId);
  const hex = String(fill || '').replace('#', '');

  const alignBtn = (Icon, type, title) => (
    <button
      onClick={() => onAlign(type)}
      disabled={!has}
      title={title}
      className="h-6 w-6 grid place-items-center rounded-[2px] text-spectrum-100 hover:text-spectrum-50 hover:bg-spectrum-500 disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
    >
      <Icon size={13} />
    </button>
  );

  return (
    <div className="w-[264px] h-full flex flex-col bg-spectrum-700">
      {/* Panel tab bar */}
      <div className="flex items-end h-8 bg-spectrum-600 px-1 gap-0.5 shrink-0">
        {TABS.map((t) => (
          <button
            key={t}
            disabled={t !== 'Design'}
            title={t === 'Design' ? undefined : 'Roadmap'}
            className={`h-[26px] px-2.5 text-[11px] rounded-t-[3px] transition-colors ${
              t === 'Design'
                ? 'bg-spectrum-700 text-spectrum-50'
                : 'text-spectrum-200 cursor-not-allowed hover:text-spectrum-100'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Selection header */}
      <div className="flex items-center h-7 px-2.5 gap-2 border-b border-spectrum-400/60 shrink-0">
        <span className="text-[11px] font-semibold text-spectrum-50 truncate">
          {label}
        </span>
        {deletable && (
          <button
            onClick={onDelete}
            title="Delete (Del)"
            className="ml-auto p-1 rounded-[2px] text-spectrum-100 hover:text-rose-400 hover:bg-spectrum-500 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <Group title="Transform" onReset={has ? onResetTransform : undefined}>
          <div className="flex items-center justify-between px-2.5 pb-2 pt-0.5">
            <div className="flex items-center gap-0.5">
              {alignBtn(AlignStartVertical, 'left', 'Align left')}
              {alignBtn(AlignCenterVertical, 'center', 'Align horizontal centre')}
              {alignBtn(AlignEndVertical, 'right', 'Align right')}
            </div>
            <div className="w-px h-3.5 bg-spectrum-400" />
            <div className="flex items-center gap-0.5">
              {alignBtn(AlignStartHorizontal, 'top', 'Align top')}
              {alignBtn(AlignCenterHorizontal, 'middle', 'Align vertical centre')}
              {alignBtn(AlignEndHorizontal, 'bottom', 'Align bottom')}
            </div>
          </div>

          <Row label="Position" disabled={!has}>
            <ScrubValue value={geometry.x} suffix="X" disabled={!has} onCommit={(v) => onGeometry('x', v)} />
            <ScrubValue value={geometry.y} suffix="Y" disabled={!has} onCommit={(v) => onGeometry('y', v)} />
          </Row>
          <Row label="Size" disabled={!has}>
            <ScrubValue value={geometry.w} suffix="W" disabled={!has} onCommit={(v) => onGeometry('w', v)} />
            <ScrubValue value={geometry.h} suffix="H" disabled={!has} onCommit={(v) => onGeometry('h', v)} />
          </Row>
          <Row label="Opacity" disabled={!has}>
            <Slider value={opacity} onChange={onOpacity} />
          </Row>
        </Group>

        <Group title="Appearance">
          <Row label="Theme" keyframe={false}>
            <div className="flex gap-1 w-full">
              {[['light', 'Light', Sun], ['dark', 'Dark', Moon]].map(([id, text, Icon]) => (
                <button
                  key={id}
                  onClick={() => onTheme(id)}
                  className={`flex-1 h-[22px] rounded-[2px] text-[11px] flex items-center justify-center gap-1.5 border transition-colors ${
                    doc.theme === id
                      ? 'bg-accent border-accent text-white'
                      : 'bg-spectrum-600 border-spectrum-400 text-spectrum-100 hover:border-spectrum-300'
                  }`}
                >
                  <Icon size={11} /> {text}
                </button>
              ))}
            </div>
          </Row>
        </Group>

        <Group title="Fill">
          <Row label="Colour" disabled={!has}>
            <div className={`flex items-center gap-2 w-full ${has ? '' : 'opacity-40 pointer-events-none'}`}>
              <label
                className="relative w-[18px] h-[18px] rounded-[2px] border border-spectrum-300 cursor-pointer overflow-hidden shrink-0"
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
                onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') e.currentTarget.blur(); }}
                className="text-[11px] text-accent-value font-mono bg-transparent outline-none w-[64px] border-b border-transparent focus:border-accent tabular"
              />
            </div>
          </Row>
        </Group>

        <Group title="Stroke" defaultOpen={false}>
          <div className="px-5 pb-1">
            <div className="h-[22px] rounded-[2px] border border-dashed border-spectrum-400 grid place-items-center text-[10px] text-spectrum-200">
              Roadmap
            </div>
          </div>
        </Group>

        <Group title="Effects" defaultOpen={false}>
          <div className="px-5 pb-1">
            <div className="h-[22px] rounded-[2px] border border-dashed border-spectrum-400 grid place-items-center text-[10px] text-spectrum-200">
              Roadmap
            </div>
          </div>
        </Group>
      </div>
    </div>
  );
}
