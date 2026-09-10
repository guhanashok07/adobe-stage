import React from 'react';
import CanvasElement from './CanvasElement';
import { Editable } from './primitives';
import { fitHeadline } from '../state/document';

// The graphic-design surface: a 4:5 social ad built from the same doc.content
// the dashboard uses, which is what makes "one prompt, two surfaces" true
// rather than decorative.
export default function GraphicArtboard({
  doc, selectedId, draggingId, wireframe,
  onSelect, onDragStart, onResizeStart, onContent,
}) {
  const dark = doc.theme === 'dark';
  const cyber = doc.gdStyle === 'cyberpunk';
  const { content: c } = doc;

  const headlineBox = doc.sizes.gdHeadline?.w ?? 320;
  const headlineSize = fitHeadline(c.gdHeadline, headlineBox);

  return (
    <div
      className={`w-[400px] h-[500px] rounded-[6px] relative overflow-hidden transition-colors duration-500 ${
        dark ? 'bg-[#12101F]' : 'bg-[#F2F0FA]'
      }`}
      style={{
        filter: wireframe ? 'grayscale(1) contrast(0.92)' : undefined,
        boxShadow: '0 12px 48px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06)',
      }}
    >
      {/* Ambient background wash */}
      {!wireframe && (
        <>
          <div className={`absolute -right-24 -top-24 w-80 h-80 rounded-full blur-3xl transition-colors duration-500 ${
            cyber ? 'bg-fuchsia-600/35' : dark ? 'bg-violet-600/30' : 'bg-violet-300/50'
          }`} />
          <div className={`absolute -left-24 -bottom-24 w-72 h-72 rounded-full blur-3xl transition-colors duration-500 ${
            cyber ? 'bg-cyan-500/30' : dark ? 'bg-blue-600/30' : 'bg-blue-300/45'
          }`} />
        </>
      )}

      {/* Brand lockup */}
      <div className="absolute top-6 left-6 flex items-center gap-2 z-10">
        <div className={`w-5 h-5 rounded-[4px] transition-colors duration-500 ${
          cyber ? 'bg-cyan-300' : dark ? 'bg-white' : 'bg-violet-700'
        }`} />
        <Editable
          value={c.gdBrand}
          onCommit={(v) => onContent('gdBrand', v)}
          className={`font-bold text-[13px] tracking-[0.14em] ${
            cyber ? 'text-cyan-200 font-mono' : dark ? 'text-white' : 'text-violet-950'
          }`}
        />
      </div>

      {/* Headline */}
      <CanvasElement
        id="gdHeadline"
        label="Main Headline"
        selected={selectedId === 'gdHeadline'}
        dragging={draggingId === 'gdHeadline'}
        radius="rounded-[4px]"
        onSelect={onSelect}
        onDragStart={onDragStart}
        onResizeStart={onResizeStart}
        style={{
          left: 40, top: 96,
          width: `${headlineBox}px`,
          transform: `translate(${doc.positions.gdHeadline?.x || 0}px, ${doc.positions.gdHeadline?.y || 0}px)`,
          zIndex: selectedId === 'gdHeadline' ? 10 : 2,
        }}
      >
        <Editable
          as="h2"
          value={c.gdHeadline}
          onCommit={(v) => onContent('gdHeadline', v)}
          className={`headline-fit leading-[0.95] ${
            cyber
              ? 'font-mono font-bold tracking-[-0.03em]'
              : 'font-black tracking-[-0.025em]'
          } ${
            doc.fills.gdHeadline
              ? ''
              : cyber
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-400'
                : dark ? 'text-white' : 'text-violet-950'
          }`}
          style={{
            fontSize: `${headlineSize}px`,
            color: doc.fills.gdHeadline ? `#${doc.fills.gdHeadline}` : undefined,
          }}
        />
      </CanvasElement>

      {/* Abstract shape */}
      <CanvasElement
        id="gdShape"
        label="Abstract Shape"
        selected={selectedId === 'gdShape'}
        dragging={draggingId === 'gdShape'}
        radius="rounded-2xl"
        onSelect={onSelect}
        onDragStart={onDragStart}
        onResizeStart={onResizeStart}
        style={{
          left: 96, top: 256,
          width: doc.sizes.gdShape?.w ?? 192,
          height: doc.sizes.gdShape?.h ?? 192,
          transform: `translate(${doc.positions.gdShape?.x || 0}px, ${doc.positions.gdShape?.y || 0}px)`,
          zIndex: selectedId === 'gdShape' ? 10 : 2,
        }}
      >
        <div
          className={`w-full h-full rounded-2xl border grid place-items-center transition-transform duration-500 pointer-events-none ${
            cyber ? 'bg-black/45 border-cyan-400/50 rotate-45' : 'rotate-12 border-white/25'
          } ${dark && !cyber ? 'bg-white/10' : !dark && !cyber ? 'bg-white/45' : ''}`}
          style={{
            backgroundColor: doc.fills.gdShape ? `#${doc.fills.gdShape}33` : undefined,
            borderColor: doc.fills.gdShape ? `#${doc.fills.gdShape}` : undefined,
            backdropFilter: wireframe ? undefined : 'blur(10px)',
          }}
        >
          <div
            className={`w-1/2 h-1/2 transition-colors duration-500 ${
              cyber
                ? 'bg-gradient-to-tr from-cyan-300 to-fuchsia-500 rotate-45'
                : 'rounded-full bg-gradient-to-tr from-blue-400 to-violet-400'
            }`}
            style={{
              background: doc.fills.gdShape
                ? `radial-gradient(circle, #${doc.fills.gdShape}, transparent 72%)`
                : undefined,
            }}
          />
        </div>
      </CanvasElement>

      {/* User-added elements */}
      {doc.custom.filter((el) => el.ws === 'Graphic Design').map((el) => (
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
              className={`rounded-[8px] border border-white/20 ${dark ? 'bg-violet-500/45' : 'bg-white/60'}`}
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
              className={`text-xl font-bold whitespace-nowrap ${dark ? 'text-white' : 'text-violet-950'}`}
              style={{ color: doc.fills[el.id] ? `#${doc.fills[el.id]}` : undefined }}
            />
          )}
        </CanvasElement>
      ))}
    </div>
  );
}
