import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import CanvasElement from '../CanvasElement';
import { Editable } from '../primitives';
import { Surface, AccentSurface, SectionTitle, Muted, Bars, RowGlyph } from './surfaces';

// Metric-led admin screen: KPI row, hero figure, activity list, trend chart.
export default function DashboardLayout({ ctx }) {
  const { c, dark, accent, wireframe, block, stats, chart, items, onContent, onItem, onStat } = ctx;

  return (
    <>
      {stats.length > 0 && (
        <CanvasElement {...block('stats')} inset="-m-1.5" radius="rounded-[14px]">
          <div className="flex gap-3">
            {stats.map((stat, i) => (
              <Surface key={i} dark={dark} fill={ctx.fills.stats} className="flex-1 px-3.5 py-2.5">
                <Editable
                  value={stat.label}
                  onCommit={(v) => onStat(i, 'label', v)}
                  className="text-[10px] font-medium truncate"
                  style={{ color: dark ? '#7A8CA6' : '#8A97A8' }}
                />
                <Editable
                  value={stat.value}
                  onCommit={(v) => onStat(i, 'value', v)}
                  className="text-[16px] font-bold tracking-[-0.015em] truncate mt-0.5"
                  style={{ color: dark ? '#F1F5F9' : '#0F172A' }}
                />
              </Surface>
            ))}
          </div>
        </CanvasElement>
      )}

      <CanvasElement {...block('hero')} radius="rounded-[14px]">
        <AccentSurface
          accent={accent}
          fill={ctx.fills.hero}
          wireframe={wireframe}
          className="p-5 flex flex-col justify-between text-white"
          style={ctx.size('hero')}
        >
          <div className="relative z-10">
            <Editable
              value={c.statLabel}
              onCommit={(v) => onContent('statLabel', v)}
              className="text-[12px] font-medium"
              style={{ color: 'rgba(255,255,255,0.78)' }}
            />
            <Editable
              value={c.statValue}
              onCommit={(v) => onContent('statValue', v)}
              className="text-[32px] font-bold tracking-[-0.03em] leading-none mt-1.5"
            />
            {c.statDelta && (
              <div className="flex items-center gap-1 mt-2 text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
                <ArrowUpRight size={12} />
                <Editable value={c.statDelta} onCommit={(v) => onContent('statDelta', v)} />
              </div>
            )}
          </div>

          <button
            className="relative z-10 h-9 rounded-[9px] text-[13px] font-semibold transition-colors duration-500 w-full"
            style={
              ctx.ctaStyle === 'black'
                ? { background: '#0B1220', color: '#fff' }
                : { background: '#fff', color: '#0F172A' }
            }
          >
            {c.ctaLabel}
          </button>
        </AccentSurface>
      </CanvasElement>

      <CanvasElement {...block('card')} radius="rounded-[14px]">
        <Surface dark={dark} fill={ctx.fills.card} className="p-4" style={ctx.size('card')}>
          <Editable
            value={c.activityTitle}
            onCommit={(v) => onContent('activityTitle', v)}
            className="text-[11px] font-semibold mb-3"
            style={{ color: dark ? '#CBD5E1' : '#334155' }}
          />
          <div className="space-y-2.5">
            {items.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
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
                  style={{
                    color: String(item.amount).trim().startsWith('-')
                      ? (dark ? '#E2E8F0' : '#1E293B')
                      : '#10B981',
                  }}
                />
              </div>
            ))}
          </div>
        </Surface>
      </CanvasElement>

      {chart && (
        <CanvasElement {...block('chart')} radius="rounded-[14px]">
          <Surface dark={dark} fill={ctx.fills.chart} className="px-4 py-3" style={ctx.size('chart')}>
            <div className="flex items-baseline justify-between mb-2.5">
              <Editable
                value={chart.title}
                onCommit={ctx.onChartTitle}
                className="text-[11px] font-semibold"
                style={{ color: dark ? '#CBD5E1' : '#334155' }}
              />
              <Muted dark={dark} className="text-[10px]">Last 7</Muted>
            </div>
            <Bars series={chart.series} accent={accent} dark={dark} wireframe={wireframe} height={46} />
          </Surface>
        </CanvasElement>
      )}
    </>
  );
}
