import React from 'react';
import { ArrowRight } from 'lucide-react';
import CanvasElement from '../CanvasElement';
import { Editable } from '../primitives';
import { Surface, AccentSurface, Muted, RowGlyph } from './surfaces';
import { rgba } from './color';

// Catalogue screen: wide promo banner, product grid, compact order list.
export default function CatalogLayout({ ctx }) {
  const { c, dark, accent, wireframe, block, stats, items, onContent, onItem, onStat } = ctx;
  const products = stats.length ? stats : [{ label: 'Featured', value: '—' }];

  return (
    <>
      <CanvasElement {...block('hero')} radius="rounded-[14px]">
        <AccentSurface
          accent={accent}
          fill={ctx.fills.hero}
          wireframe={wireframe}
          className="px-6 flex items-center justify-between text-white"
          style={ctx.size('hero')}
        >
          <div className="relative z-10 min-w-0 pr-4">
            <Editable
              value={c.statLabel}
              onCommit={(v) => onContent('statLabel', v)}
              className="text-[22px] font-bold tracking-[-0.025em] leading-tight"
            />
            <Editable
              value={c.statValue}
              onCommit={(v) => onContent('statValue', v)}
              className="text-[12px] mt-1.5"
              style={{ color: 'rgba(255,255,255,0.8)' }}
            />
          </div>
          <button
            className="relative z-10 h-9 px-4 rounded-[9px] text-[12px] font-semibold flex items-center gap-1.5 shrink-0 transition-colors duration-500"
            style={
              ctx.ctaStyle === 'black'
                ? { background: '#0B1220', color: '#fff' }
                : { background: '#fff', color: '#0F172A' }
            }
          >
            {c.ctaLabel} <ArrowRight size={13} />
          </button>
        </AccentSurface>
      </CanvasElement>

      <CanvasElement {...block('stats')} inset="-m-1.5" radius="rounded-[14px]">
        <div className="flex gap-3" style={{ width: ctx.size('stats').width }}>
          {products.map((product, i) => (
            <Surface key={i} dark={dark} fill={ctx.fills.stats} className="flex-1 p-2.5">
              <div
                className="h-[52px] rounded-[9px] mb-2.5 relative overflow-hidden"
                style={{
                  background: wireframe
                    ? '#CBD5E1'
                    : `linear-gradient(140deg, ${rgba(accent, dark ? 0.34 : 0.18)}, ${rgba(accent, dark ? 0.12 : 0.06)})`,
                }}
              >
                <div
                  className="absolute right-2 bottom-2 w-7 h-7 rounded-full"
                  style={{ background: rgba(accent, dark ? 0.5 : 0.3) }}
                />
              </div>
              <Editable
                value={product.label}
                onCommit={(v) => onStat(i, 'label', v)}
                className="text-[11px] font-semibold truncate"
                style={{ color: dark ? '#E2E8F0' : '#1E293B' }}
              />
              <Editable
                value={product.value}
                onCommit={(v) => onStat(i, 'value', v)}
                className="text-[11px] font-bold mt-0.5"
                style={{ color: accent }}
              />
            </Surface>
          ))}
        </div>
      </CanvasElement>

      <CanvasElement {...block('card')} radius="rounded-[14px]">
        <Surface dark={dark} fill={ctx.fills.card} className="px-4 py-2.5" style={ctx.size('card')}>
          <div className="flex items-baseline justify-between mb-2">
            <Editable
              value={c.activityTitle}
              onCommit={(v) => onContent('activityTitle', v)}
              className="text-[11px] font-semibold"
              style={{ color: dark ? '#CBD5E1' : '#334155' }}
            />
            <Muted dark={dark} className="text-[10px]">View all</Muted>
          </div>
          <div className="space-y-1.5">
            {items.slice(0, 2).map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <RowGlyph index={i} accent={accent} dark={dark}>
                    {String(item.title || '?').trim().charAt(0).toUpperCase()}
                  </RowGlyph>
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
                  className="text-[11px] font-semibold shrink-0"
                  style={{ color: dark ? '#E2E8F0' : '#1E293B' }}
                />
              </div>
            ))}
          </div>
        </Surface>
      </CanvasElement>
    </>
  );
}
