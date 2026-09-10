import React from 'react';
import {
  Layout, CreditCard, ArrowRightLeft, PieChart, Search, Bell,
  ShoppingCart, Package, Music, Activity, Calendar, MessageSquare,
  Users, Heart, Settings, Compass, Briefcase, GraduationCap, Home, Building2,
} from 'lucide-react';
import CanvasElement from './CanvasElement';
import { Editable } from './primitives';
import { ELEMENTS, ARTBOARDS } from '../state/document';

// Nav labels are generated per domain, so the icon has to follow the word
// rather than sit in a fixed slot. Falls back to the slot's default.
const NAV_ICON_RULES = [
  [/cart|basket|bag|checkout/, ShoppingCart],
  [/order|package|shipment|deliver|product|inventory/, Package],
  [/music|song|track|library|radio|playlist|listen/, Music],
  [/workout|exercise|training|progress|activity|today|health/, Activity],
  [/calendar|schedule|booking|reservation|plan|trip|itinerar/, Calendar],
  [/message|chat|inbox|feed|comment/, MessageSquare],
  [/people|customer|tenant|candidate|user|member|group|team/, Users],
  [/saved|wishlist|favourite|favorite|like/, Heart],
  [/setting|config|admin|preference/, Settings],
  [/explore|discover|market|browse|search/, Compass],
  [/job|role|pipeline|career|hiring|interview/, Briefcase],
  [/course|assignment|grade|lesson|class|study/, GraduationCap],
  [/propert|listing|estate|house|rent|maintenance/, Building2],
  [/home|dashboard|overview|portfolio|feed/, Home],
  [/card|wallet|payment|billing/, CreditCard],
  [/transfer|swap|exchange|send/, ArrowRightLeft],
  [/analytic|report|metric|insight|stat|alert|deploy|service/, PieChart],
];

const SLOT_DEFAULTS = [Layout, CreditCard, ArrowRightLeft, PieChart];

function navIcon(label, slot) {
  const lower = String(label).toLowerCase();
  const rule = NAV_ICON_RULES.find(([re]) => re.test(lower));
  return rule ? rule[1] : SLOT_DEFAULTS[slot % SLOT_DEFAULTS.length];
}

// The fintech dashboard surface. Every visible string comes from doc.content,
// so one prompt re-skins the whole screen and every string stays hand-editable.
export default function UIUXArtboard({
  doc, selectedId, draggingId, wireframe,
  onSelect, onDragStart, onResizeStart, onContent, onItem, onStat, onChartTitle,
}) {
  const dark = doc.theme === 'dark';
  const { content: c } = doc;
  const stats = Array.isArray(c.stats) ? c.stats : [];
  const chart = c.chart && Array.isArray(c.chart.series) ? c.chart : null;

  const board = ARTBOARDS['UI/UX Design'];
  // Absolute children are positioned from the content div's padding edge, so
  // only the sidebar and header offsets are subtracted. Subtracting the
  // padding as well shifted every block up and left by 32px.
  const place = (id) => ({
    left: ELEMENTS[id].x - board.sidebar,
    top: ELEMENTS[id].y - board.header,
    transform: `translate(${doc.positions[id]?.x || 0}px, ${doc.positions[id]?.y || 0}px)`,
    zIndex: selectedId === id ? 10 : 1,
  });

  const sizeOf = (id, w, h) => ({
    width: doc.sizes[id]?.w ? `${doc.sizes[id].w}px` : `${w}px`,
    height: doc.sizes[id]?.h ? `${doc.sizes[id].h}px` : (h ? `${h}px` : undefined),
  });

  const navItems = (c.navItems?.length ? c.navItems : ['Dashboard', 'Cards', 'Transfers', 'Analytics']).slice(0, 4);

  const navItem = (Icon, label, active) => (
    <div
      key={label}
      className={`flex items-center gap-3 px-3 h-9 rounded-[6px] text-[13px] font-medium transition-colors ${
        active
          ? dark ? 'bg-accent/20 text-accent-subtle' : 'bg-accent/10 text-accent'
          : dark ? 'text-slate-400' : 'text-slate-500'
      }`}
    >
      <Icon size={16} /> {label}
    </div>
  );

  return (
    <div
      className={`w-[800px] h-[560px] rounded-[6px] relative overflow-hidden flex transition-colors duration-500 ${
        dark ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'
      }`}
      style={{
        filter: wireframe ? 'grayscale(1) contrast(0.92)' : undefined,
        boxShadow: '0 12px 48px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06)',
      }}
    >
      {/* App sidebar */}
      <div className={`w-[200px] border-r flex flex-col p-5 transition-colors duration-500 ${
        dark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'
      }`}>
        <div className="flex items-center gap-2 mb-8">
          <div className={`w-6 h-6 rounded-[6px] ${wireframe ? 'bg-slate-400' : 'bg-accent'}`} />
          <Editable
            value={c.appName}
            onCommit={(v) => onContent('appName', v)}
            className={`font-bold text-[17px] ${dark ? 'text-white' : 'text-slate-900'}`}
          />
        </div>

        <div className="space-y-0.5">
          {navItems.map((label, i) => navItem(navIcon(label, i), label, i === 0))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col relative">
        <div className={`h-16 border-b flex items-center justify-between px-8 transition-colors duration-500 ${
          dark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div className={`flex items-center gap-2 px-3 h-8 rounded-[6px] ${
            dark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
          }`}>
            <Search size={14} />
            <span className="text-[11px] truncate max-w-[150px]">{c.searchPlaceholder || 'Search…'}</span>
          </div>
          <div className="flex items-center gap-4">
            <Bell size={17} className={dark ? 'text-slate-400' : 'text-slate-400'} />
            <div className={`w-8 h-8 rounded-full ${wireframe ? 'bg-slate-300' : 'bg-gradient-to-tr from-violet-500 to-accent'}`} />
          </div>
        </div>

        <div className="flex-1 p-8 relative">
          <Editable
            as="h1"
            value={c.greeting}
            onCommit={(v) => onContent('greeting', v)}
            className={`text-[22px] font-bold tracking-[-0.01em] ${dark ? 'text-white' : 'text-slate-900'}`}
          />

          {/* Generated KPI row. Present only when the concept has stats,
              which is one of the things that makes layouts differ. */}
          {stats.length > 0 && (
            <CanvasElement
              id="stats"
              label="Metric Row"
              selected={selectedId === 'stats'}
              dragging={draggingId === 'stats'}
              inset="-m-1.5"
              radius="rounded-[10px]"
              onSelect={onSelect}
              onDragStart={onDragStart}
              onResizeStart={onResizeStart}
              style={{ ...place('stats'), width: doc.sizes.stats?.w ?? 552 }}
            >
              <div className="flex gap-3">
                {stats.map((stat, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-[10px] border px-3.5 py-2.5 transition-colors duration-500 ${
                      dark ? 'bg-slate-800/70 border-slate-700' : 'bg-white border-slate-200'
                    }`}
                    style={{ backgroundColor: doc.fills.stats ? `#${doc.fills.stats}` : undefined }}
                  >
                    <Editable
                      value={stat.label}
                      onCommit={(v) => onStat(i, 'label', v)}
                      className={`text-[10px] font-medium truncate ${dark ? 'text-slate-400' : 'text-slate-500'}`}
                    />
                    <Editable
                      value={stat.value}
                      onCommit={(v) => onStat(i, 'value', v)}
                      className={`text-[15px] font-bold tracking-[-0.01em] truncate ${dark ? 'text-white' : 'text-slate-900'}`}
                    />
                  </div>
                ))}
              </div>
            </CanvasElement>
          )}

          {/* Balance widget */}
          <CanvasElement
            id="hero"
            label={c.statLabel || 'Balance Widget'}
            selected={selectedId === 'hero'}
            dragging={draggingId === 'hero'}
            radius="rounded-2xl"
            onSelect={onSelect}
            onDragStart={onDragStart}
            onResizeStart={onResizeStart}
            style={place('hero')}
          >
            <div
              className={`p-6 rounded-2xl text-white overflow-hidden relative transition-colors duration-500 ${
                doc.fills.hero || wireframe ? '' : dark
                  ? 'bg-gradient-to-br from-blue-800 to-indigo-900'
                  : 'bg-gradient-to-br from-accent to-blue-800'
              }`}
              style={{
                ...sizeOf('hero', 280, null),
                backgroundColor: doc.fills.hero ? `#${doc.fills.hero}` : (wireframe ? '#64748B' : undefined),
                boxShadow: '0 10px 30px rgba(15,23,42,0.28)',
              }}
            >
              {!wireframe && (
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              )}
              <Editable
                value={c.statLabel}
                onCommit={(v) => onContent('statLabel', v)}
                className="text-blue-100 text-[13px] font-medium mb-1 relative z-10"
              />
              <Editable
                value={c.statValue}
                onCommit={(v) => onContent('statValue', v)}
                className="text-[28px] font-bold tracking-[-0.02em] mb-6 relative z-10"
              />
              <div className="flex gap-3 relative z-10 pointer-events-none">
                <button className={`flex-1 h-9 rounded-[8px] font-semibold text-[13px] transition-colors duration-500 ${
                  doc.ctaStyle === 'black' ? 'bg-black text-white' : 'bg-white text-blue-900'
                }`}>
                  {c.ctaLabel}
                </button>
                <button className="w-9 h-9 grid place-items-center rounded-[8px] bg-white/20 text-white">
                  <ArrowRightLeft size={16} />
                </button>
              </div>
            </div>
          </CanvasElement>

          {/* Transactions list */}
          <CanvasElement
            id="card"
            label={c.activityTitle || 'Transactions List'}
            selected={selectedId === 'card'}
            dragging={draggingId === 'card'}
            radius="rounded-xl"
            onSelect={onSelect}
            onDragStart={onDragStart}
            onResizeStart={onResizeStart}
            style={place('card')}
          >
            <div
              className={`p-5 rounded-xl border transition-colors duration-500 overflow-hidden ${
                dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              }`}
              style={{
                ...sizeOf('card', 240, null),
                backgroundColor: doc.fills.card ? `#${doc.fills.card}` : undefined,
                boxShadow: dark ? 'none' : '0 1px 3px rgba(15,23,42,0.08)',
              }}
            >
              <Editable
                value={c.activityTitle}
                onCommit={(v) => onContent('activityTitle', v)}
                className={`font-bold mb-4 text-[13px] ${dark ? 'text-slate-200' : 'text-slate-800'}`}
              />
              <div className="space-y-4">
                {(c.items || []).map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-full grid place-items-center shrink-0 ${
                        i % 2 === 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {i % 2 === 0 ? <CreditCard size={14} /> : <PieChart size={14} />}
                      </div>
                      <div className="min-w-0">
                        <Editable
                          value={item.title}
                          onCommit={(v) => onItem(i, 'title', v)}
                          className={`text-[11px] font-semibold truncate ${dark ? 'text-slate-200' : 'text-slate-800'}`}
                        />
                        <Editable
                          value={item.sub}
                          onCommit={(v) => onItem(i, 'sub', v)}
                          className={`text-[10px] truncate ${dark ? 'text-slate-500' : 'text-slate-400'}`}
                        />
                      </div>
                    </div>
                    <Editable
                      value={item.amount}
                      onCommit={(v) => onItem(i, 'amount', v)}
                      className={`text-[11px] font-semibold shrink-0 ${
                        String(item.amount).trim().startsWith('-')
                          ? dark ? 'text-slate-200' : 'text-slate-800'
                          : 'text-emerald-500'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CanvasElement>

          {/* Generated trend chart. Null when the concept does not warrant one. */}
          {chart && (
            <CanvasElement
              id="chart"
              label={chart.title}
              selected={selectedId === 'chart'}
              dragging={draggingId === 'chart'}
              radius="rounded-xl"
              onSelect={onSelect}
              onDragStart={onDragStart}
              onResizeStart={onResizeStart}
              style={{ ...place('chart'), width: doc.sizes.chart?.w ?? 552 }}
            >
              <div
                className={`rounded-xl border px-4 py-3 transition-colors duration-500 ${
                  dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                }`}
                style={{
                  height: doc.sizes.chart?.h ?? 106,
                  backgroundColor: doc.fills.chart ? `#${doc.fills.chart}` : undefined,
                  boxShadow: dark ? 'none' : '0 1px 3px rgba(15,23,42,0.08)',
                }}
              >
                <Editable
                  value={chart.title}
                  onCommit={(v) => onChartTitle(v)}
                  className={`text-[11px] font-semibold mb-2 ${dark ? 'text-slate-200' : 'text-slate-700'}`}
                />
                <div className="flex items-end gap-1.5 h-[50px]">
                  {chart.series.map((value, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-[3px] transition-all duration-500 ${
                        wireframe ? 'bg-slate-400'
                          : i === chart.series.length - 1
                            ? 'bg-accent'
                            : dark ? 'bg-accent/45' : 'bg-accent/25'
                      }`}
                      style={{ height: `${Math.max(6, value)}%` }}
                    />
                  ))}
                </div>
              </div>
            </CanvasElement>
          )}

          {/* User-added elements */}
          {doc.custom.filter((el) => el.ws === 'UI/UX Design').map((el) => (
            <CanvasElement
              key={el.id}
              id={el.id}
              label={el.type === 'text' ? 'Custom Text' : 'Custom Shape'}
              selected={selectedId === el.id}
              dragging={draggingId === el.id}
              resizable={el.type === 'shape'}
              inset="-m-1"
              radius="rounded-[4px]"
              onSelect={onSelect}
              onDragStart={onDragStart}
              onResizeStart={onResizeStart}
              style={{
                left: 100, top: 100,
                transform: `translate(${doc.positions[el.id]?.x || 0}px, ${doc.positions[el.id]?.y || 0}px)`,
                zIndex: selectedId === el.id ? 20 : 5,
              }}
            >
              {el.type === 'shape' ? (
                <div
                  className={`rounded-[8px] border border-white/10 ${dark ? 'bg-slate-700' : 'bg-slate-200'}`}
                  style={{
                    width: doc.sizes[el.id]?.w || 96,
                    height: doc.sizes[el.id]?.h || 96,
                    backgroundColor: doc.fills[el.id] ? `#${doc.fills[el.id]}` : undefined,
                  }}
                />
              ) : (
                <Editable
                  value={el.text || 'Custom Text'}
                  onCommit={(v) => onContent(`custom:${el.id}`, v)}
                  className={`text-xl font-bold whitespace-nowrap ${dark ? 'text-white' : 'text-slate-800'}`}
                  style={{ color: doc.fills[el.id] ? `#${doc.fills[el.id]}` : undefined }}
                />
              )}
            </CanvasElement>
          ))}
        </div>
      </div>
    </div>
  );
}
