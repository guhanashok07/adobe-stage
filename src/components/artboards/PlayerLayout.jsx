import React from 'react';
import { Play, SkipBack, SkipForward, Shuffle, Heart } from 'lucide-react';
import CanvasElement from '../CanvasElement';
import { Editable } from '../primitives';
import { Surface, Muted, RowGlyph } from './surfaces';
import { rgba, mixDown } from './color';

// Media-led screen: large artwork, now-playing panel with transport, queue.
export default function PlayerLayout({ ctx }) {
  const { c, dark, accent, wireframe, block, items, onContent, onItem } = ctx;

  return (
    <>
      <CanvasElement {...block('art')} radius="rounded-[16px]">
        <div
          className="rounded-[16px] overflow-hidden relative grid place-items-center"
          style={{
            ...ctx.size('art'),
            background: ctx.fills.art
              ? `#${ctx.fills.art}`
              : wireframe
                ? '#94A3B8'
                : `linear-gradient(150deg, ${accent} 0%, ${mixDown(accent, 0.55)} 100%)`,
            boxShadow: `0 18px 40px -16px ${rgba(accent, 0.7)}`,
          }}
        >
          {!wireframe && (
            <>
              <div
                className="absolute inset-0"
                style={{ background: 'radial-gradient(circle at 30% 22%, rgba(255,255,255,0.34), transparent 58%)' }}
              />
              <div
                className="w-[42%] h-[42%] rounded-full border-[10px]"
                style={{ borderColor: 'rgba(255,255,255,0.22)' }}
              />
            </>
          )}
        </div>
      </CanvasElement>

      <CanvasElement {...block('hero')} radius="rounded-[16px]">
        <div className="flex flex-col justify-between" style={ctx.size('hero')}>
          <div>
            <Muted dark={dark} className="text-[10px] font-semibold uppercase tracking-[0.14em]">
              Now playing
            </Muted>
            <Editable
              value={c.statLabel}
              onCommit={(v) => onContent('statLabel', v)}
              className="text-[30px] font-bold tracking-[-0.03em] leading-[1.05] mt-2"
              style={{ color: dark ? '#F8FAFC' : '#0F172A' }}
            />
            <Editable
              value={c.statValue}
              onCommit={(v) => onContent('statValue', v)}
              className="text-[13px] font-medium mt-1.5"
              style={{ color: dark ? '#94A3B8' : '#64748B' }}
            />
          </div>

          {/* Scrubber */}
          <div>
            <div className="h-1 rounded-full w-full" style={{ background: rgba(accent, dark ? 0.24 : 0.16) }}>
              <div className="h-1 rounded-full" style={{ width: '38%', background: accent }} />
            </div>
            <div className="flex justify-between mt-1.5">
              <Muted dark={dark} className="text-[9px] tabular">1:24</Muted>
              <Muted dark={dark} className="text-[9px] tabular">3:47</Muted>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="h-11 px-5 rounded-full text-[13px] font-semibold flex items-center gap-2 transition-colors duration-500"
              style={
                ctx.ctaStyle === 'black'
                  ? { background: '#0B1220', color: '#fff' }
                  : { background: accent, color: '#fff', boxShadow: `0 8px 20px -8px ${rgba(accent, 0.8)}` }
              }
            >
              <Play size={14} fill="currentColor" /> {c.ctaLabel}
            </button>
            {[SkipBack, SkipForward, Shuffle, Heart].map((Icon, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full grid place-items-center"
                style={{
                  background: dark ? 'rgba(148,163,184,0.12)' : 'rgba(15,23,42,0.05)',
                  color: dark ? '#94A3B8' : '#64748B',
                }}
              >
                <Icon size={13} />
              </div>
            ))}
          </div>
        </div>
      </CanvasElement>

      <CanvasElement {...block('card')} radius="rounded-[14px]">
        <Surface dark={dark} fill={ctx.fills.card} className="px-4 py-3" style={ctx.size('card')}>
          <Editable
            value={c.activityTitle}
            onCommit={(v) => onContent('activityTitle', v)}
            className="text-[11px] font-semibold mb-2.5"
            style={{ color: dark ? '#CBD5E1' : '#334155' }}
          />
          <div className="space-y-1">
            {items.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 rounded-[9px] px-2 py-1.5"
                style={{ background: i === 0 ? rgba(accent, dark ? 0.16 : 0.08) : 'transparent' }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <RowGlyph index={i} accent={accent} dark={dark}>{i + 1}</RowGlyph>
                  <div className="min-w-0">
                    <Editable
                      value={item.title}
                      onCommit={(v) => onItem(i, 'title', v)}
                      className="text-[11px] font-semibold truncate"
                      style={{ color: dark ? '#E2E8F0' : '#1E293B' }}
                    />
                    <Editable
                      value={item.sub}
                      onCommit={(v) => onItem(i, 'sub', v)}
                      className="text-[10px] truncate"
                      style={{ color: dark ? '#7A8CA6' : '#94A3B8' }}
                    />
                  </div>
                </div>
                <Editable
                  value={item.amount}
                  onCommit={(v) => onItem(i, 'amount', v)}
                  className="text-[10px] font-medium shrink-0 tabular"
                  style={{ color: dark ? '#7A8CA6' : '#94A3B8' }}
                />
              </div>
            ))}
          </div>
        </Surface>
      </CanvasElement>
    </>
  );
}
