import React from 'react';
import { rgba, mixDown } from './color';

// Shared visual primitives for the generated artboards. Keeping the surface
// treatment in one place is what stops three layouts drifting into three
// different-looking products.

// A plain content surface. One border, one soft shadow, one radius.
export function Surface({ dark, fill, className = '', style, children }) {
  return (
    <div
      className={`rounded-[14px] border overflow-hidden ${className}`}
      style={{
        background: fill ? `#${fill}` : dark ? '#182234' : '#FFFFFF',
        borderColor: dark ? 'rgba(148,163,184,0.16)' : 'rgba(15,23,42,0.08)',
        boxShadow: dark
          ? '0 1px 2px rgba(0,0,0,0.4)'
          : '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -12px rgba(15,23,42,0.14)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// The one saturated surface on a screen. Restraint here is most of why a
// layout reads as designed rather than assembled.
export function AccentSurface({ accent, fill, wireframe, className = '', style, children }) {
  return (
    <div
      className={`rounded-[14px] overflow-hidden relative ${className}`}
      style={{
        background: fill
          ? `#${fill}`
          : wireframe
            ? '#64748B'
            : `linear-gradient(145deg, ${accent} 0%, ${mixDown(accent, 0.42)} 100%)`,
        boxShadow: `0 10px 30px -10px ${rgba(accent, 0.55)}`,
        ...style,
      }}
    >
      {!wireframe && (
        <div
          className="absolute -right-16 -top-16 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.14)', filter: 'blur(28px)' }}
        />
      )}
      {children}
    </div>
  );
}

export function SectionTitle({ dark, children, className = '' }) {
  return (
    <div
      className={`text-[11px] font-semibold tracking-[0.02em] ${className}`}
      style={{ color: dark ? '#CBD5E1' : '#334155' }}
    >
      {children}
    </div>
  );
}

export function Muted({ dark, children, className = '', style }) {
  return (
    <div
      className={className}
      style={{ color: dark ? '#7A8CA6' : '#8A97A8', ...style }}
    >
      {children}
    </div>
  );
}

// A small bar chart. Deliberately unlabelled: it reads as a shape, which is
// what a design mock needs, and avoids inventing precise-looking data.
export function Bars({ series, accent, dark, wireframe, height }) {
  const max = Math.max(...series, 1);
  return (
    <div className="flex items-end gap-[5px] w-full" style={{ height }}>
      {series.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-[3px] transition-all duration-500"
          style={{
            height: `${Math.max(8, (v / max) * 100)}%`,
            background: wireframe
              ? '#94A3B8'
              : i === series.length - 1
                ? accent
                : rgba(accent, dark ? 0.4 : 0.22),
          }}
        />
      ))}
    </div>
  );
}

// Avatar-ish leading glyph for list rows, tinted from the accent so rows do
// not all carry the same red/green pill.
export function RowGlyph({ index, accent, dark, children }) {
  const tints = [0.16, 0.26, 0.36, 0.2];
  return (
    <div
      className="w-8 h-8 rounded-[10px] grid place-items-center shrink-0 text-[11px] font-semibold"
      style={{
        background: rgba(accent, tints[index % tints.length] * (dark ? 1.5 : 1)),
        color: dark ? '#E2E8F0' : mixDown(accent, 0.3),
      }}
    >
      {children}
    </div>
  );
}
