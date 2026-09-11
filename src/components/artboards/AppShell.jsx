import React from 'react';
import {
  Layout, CreditCard, ArrowRightLeft, PieChart, Search, Bell,
  ShoppingCart, Package, Music, Activity, Calendar, MessageSquare,
  Users, Heart, Settings, Compass, Briefcase, GraduationCap, Home, Building2,
} from 'lucide-react';
import { ARTBOARDS, layoutFor, elementsFor, labelOf } from '../../state/document';
import CanvasElement from '../CanvasElement';
import { Editable } from '../primitives';
import { rgba } from './color';
import DashboardLayout from './DashboardLayout';
import PlayerLayout from './PlayerLayout';
import CatalogLayout from './CatalogLayout';

// Nav labels are generated per domain, so the icon follows the word rather
// than sitting in a fixed slot.
const NAV_ICON_RULES = [
  [/cart|basket|bag|checkout/, ShoppingCart],
  [/order|package|shipment|deliver|product|inventory|catalog/, Package],
  [/music|song|track|library|radio|playlist|listen|album/, Music],
  [/workout|exercise|training|progress|today|health|activity/, Activity],
  [/calendar|schedule|booking|reservation|trip|itinerar/, Calendar],
  [/message|chat|inbox|feed|comment/, MessageSquare],
  [/people|customer|tenant|candidate|user|member|group|team|artist/, Users],
  [/saved|wishlist|favourite|favorite|like/, Heart],
  [/setting|config|admin|preference/, Settings],
  [/explore|discover|market|browse/, Compass],
  [/job|role|pipeline|career|hiring|interview/, Briefcase],
  [/course|assignment|grade|lesson|class|study/, GraduationCap],
  [/propert|listing|estate|house|rent|maintenance/, Building2],
  [/home|dashboard|overview|portfolio/, Home],
  [/card|wallet|payment|billing|invoice/, CreditCard],
  [/transfer|swap|exchange|send/, ArrowRightLeft],
  [/analytic|report|metric|insight|stat|alert|deploy|service/, PieChart],
];

const SLOT_DEFAULTS = [Layout, CreditCard, ArrowRightLeft, PieChart];

function navIcon(label, slot) {
  const rule = NAV_ICON_RULES.find(([re]) => re.test(String(label).toLowerCase()));
  return rule ? rule[1] : SLOT_DEFAULTS[slot % SLOT_DEFAULTS.length];
}

const LAYOUT_COMPONENTS = {
  dashboard: DashboardLayout,
  player: PlayerLayout,
  catalog: CatalogLayout,
};

// The application chrome is constant, because real apps have a constant
// shell. What changes between generations is the composition inside it.
export default function AppShell({
  doc, selectedId, draggingId, wireframe,
  onSelect, onDragStart, onResizeStart, onContent, onItem, onStat, onChartTitle,
}) {
  const board = ARTBOARDS['UI/UX Design'];
  const layoutId = layoutFor(doc, 'UI/UX Design');
  const Composition = LAYOUT_COMPONENTS[layoutId] || DashboardLayout;
  const boxes = elementsFor(doc, 'UI/UX Design');

  const dark = doc.theme === 'dark';
  const c = doc.content;
  const accent = wireframe ? '#64748B' : `#${String(c.accentHex || '1473E6').replace('#', '')}`;
  const navItems = (c.navItems?.length ? c.navItems : ['Overview', 'Items', 'Activity', 'Reports']).slice(0, 4);

  const ctx = {
    c, dark, accent, wireframe,
    ctaStyle: doc.ctaStyle,
    fills: doc.fills,
    stats: Array.isArray(c.stats) ? c.stats : [],
    chart: c.chart && Array.isArray(c.chart.series) ? c.chart : null,
    items: Array.isArray(c.items) ? c.items : [],
    onContent, onItem, onStat, onChartTitle,

    // Props every block on every layout needs, so a layout file stays about
    // composition rather than plumbing.
    block: (id) => {
      const el = boxes[id];
      return {
        id,
        label: labelOf(id, doc, 'UI/UX Design'),
        selected: selectedId === id,
        dragging: draggingId === id,
        onSelect, onDragStart, onResizeStart,
        style: {
          left: el.x - board.sidebar,
          top: el.y - board.header,
          transform: `translate(${doc.positions[id]?.x || 0}px, ${doc.positions[id]?.y || 0}px)`,
          zIndex: selectedId === id ? 10 : 1,
          opacity: (doc.opacity?.[id] ?? 100) / 100,
          width: doc.sizes[id]?.w ?? el.w,
        },
      };
    },
    size: (id) => ({
      width: doc.sizes[id]?.w ?? boxes[id].w,
      height: doc.sizes[id]?.h ?? boxes[id].h,
    }),
  };

  return (
    <div
      className="rounded-[8px] relative overflow-hidden flex transition-colors duration-500"
      style={{
        width: board.w,
        height: board.h,
        background: dark ? '#0B1220' : '#F6F8FB',
        filter: wireframe ? 'grayscale(1) contrast(0.94)' : undefined,
        boxShadow: '0 24px 70px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07)',
      }}
    >
      {/* Sidebar */}
      <div
        className="flex flex-col px-4 py-5 shrink-0 transition-colors duration-500"
        style={{
          width: board.sidebar,
          background: dark ? '#0E1729' : '#FFFFFF',
          borderRight: `1px solid ${dark ? 'rgba(148,163,184,0.12)' : 'rgba(15,23,42,0.07)'}`,
        }}
      >
        <div className="flex items-center gap-2.5 mb-7 px-1">
          <div
            className="w-7 h-7 rounded-[9px] grid place-items-center text-white text-[13px] font-bold"
            style={{ background: accent }}
          >
            {String(c.appName || 'S').trim().charAt(0).toUpperCase()}
          </div>
          <span
            className="font-bold text-[15px] tracking-[-0.01em] truncate"
            style={{ color: dark ? '#F8FAFC' : '#0F172A' }}
          >
            {c.appName}
          </span>
        </div>

        <div className="space-y-0.5">
          {navItems.map((label, i) => {
            const Icon = navIcon(label, i);
            const active = i === 0;
            return (
              <div
                key={`${label}-${i}`}
                className="flex items-center gap-2.5 px-2.5 h-9 rounded-[9px] text-[12.5px] font-medium transition-colors"
                style={{
                  background: active ? rgba(accent, dark ? 0.18 : 0.1) : 'transparent',
                  color: active ? accent : dark ? '#8496AE' : '#64748B',
                }}
              >
                <Icon size={15} /> <span className="truncate">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div
          className="flex items-center justify-between px-6 shrink-0 transition-colors duration-500"
          style={{
            height: board.header,
            borderBottom: `1px solid ${dark ? 'rgba(148,163,184,0.1)' : 'rgba(15,23,42,0.06)'}`,
          }}
        >
          <div
            className="flex items-center gap-2 px-3 h-8 rounded-[9px] min-w-[190px]"
            style={{ background: dark ? 'rgba(148,163,184,0.1)' : 'rgba(15,23,42,0.045)' }}
          >
            <Search size={13} style={{ color: dark ? '#7A8CA6' : '#94A3B8' }} />
            <span className="text-[11px] truncate" style={{ color: dark ? '#7A8CA6' : '#94A3B8' }}>
              {c.searchPlaceholder || 'Search…'}
            </span>
          </div>
          <div className="flex items-center gap-3.5">
            <Bell size={16} style={{ color: dark ? '#7A8CA6' : '#94A3B8' }} />
            <div
              className="w-8 h-8 rounded-full"
              style={{ background: `linear-gradient(140deg, ${accent}, ${rgba(accent, 0.45)})` }}
            />
          </div>
        </div>

        <div className="flex-1 relative" style={{ padding: board.pad }}>
          <div
            className="text-[19px] font-bold tracking-[-0.02em]"
            style={{ color: dark ? '#F8FAFC' : '#0F172A' }}
          >
            {c.greeting}
          </div>

          <Composition ctx={ctx} />

          {/* User-added elements sit above the generated composition. */}
          {doc.custom.filter((el) => el.ws === 'UI/UX Design').map((el) => (
            <CanvasElement
              key={el.id}
              id={el.id}
              label={el.type === 'text' ? 'Custom Text' : 'Custom Shape'}
              selected={selectedId === el.id}
              dragging={draggingId === el.id}
              resizable={el.type === 'shape'}
              inset="-m-1"
              radius="rounded-[6px]"
              onSelect={onSelect}
              onDragStart={onDragStart}
              onResizeStart={onResizeStart}
              style={{
                left: 120, top: 120,
                transform: `translate(${doc.positions[el.id]?.x || 0}px, ${doc.positions[el.id]?.y || 0}px)`,
                zIndex: selectedId === el.id ? 20 : 5,
              }}
            >
              {el.type === 'shape' ? (
                <div
                  className="rounded-[10px]"
                  style={{
                    width: doc.sizes[el.id]?.w || 96,
                    height: doc.sizes[el.id]?.h || 96,
                    background: doc.fills[el.id] ? `#${doc.fills[el.id]}` : rgba(accent, dark ? 0.4 : 0.22),
                  }}
                />
              ) : (
                <Editable
                  value={el.text || 'Custom Text'}
                  onCommit={(v) => onContent(`custom:${el.id}`, v)}
                  className="text-[19px] font-bold whitespace-nowrap"
                  style={{ color: doc.fills[el.id] ? `#${doc.fills[el.id]}` : dark ? '#F8FAFC' : '#0F172A' }}
                />
              )}
            </CanvasElement>
          ))}
        </div>
      </div>
    </div>
  );
}
