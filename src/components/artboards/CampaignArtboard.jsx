import React from 'react';
import CanvasElement from '../CanvasElement';
import { Editable } from '../primitives';
import { ARTBOARDS, layoutFor, elementsFor, labelOf, fitHeadline } from '../../state/document';
import { rgba, mixDown } from './color';

// The campaign surface, in two compositions: a type-led poster and a
// product-led ad. Both read from the same content as the app layouts, which is
// what makes "one prompt, two surfaces" true rather than decorative.
export default function CampaignArtboard({
  doc, selectedId, draggingId, wireframe,
  onSelect, onDragStart, onResizeStart, onContent,
}) {
  const board = ARTBOARDS['Graphic Design'];
  const layoutId = layoutFor(doc, 'Graphic Design');
  const isAd = layoutId === 'productAd';
  const boxes = elementsFor(doc, 'Graphic Design');

  const dark = doc.theme === 'dark';
  const cyber = doc.gdStyle === 'cyberpunk';
  const c = doc.content;
  const accent = wireframe ? '#64748B' : `#${String(c.accentHex || '1473E6').replace('#', '')}`;

  const headlineBox = doc.sizes.gdHeadline?.w ?? boxes.gdHeadline.w;
  const headlineSize = fitHeadline(c.gdHeadline, headlineBox, isAd ? 34 : 46);

  const ink = cyber ? '#E6F9FF' : dark ? '#FFFFFF' : '#0B1020';

  const block = (id) => ({
    id,
    label: labelOf(id, doc, 'Graphic Design'),
    selected: selectedId === id,
    dragging: draggingId === id,
    onSelect, onDragStart, onResizeStart,
    style: {
      left: boxes[id].x,
      top: boxes[id].y,
      transform: `translate(${doc.positions[id]?.x || 0}px, ${doc.positions[id]?.y || 0}px)`,
      zIndex: selectedId === id ? 10 : 2,
      opacity: (doc.opacity?.[id] ?? 100) / 100,
      width: doc.sizes[id]?.w ?? boxes[id].w,
    },
  });

  return (
    <div
      className="rounded-[8px] relative overflow-hidden transition-colors duration-500"
      style={{
        width: board.w,
        height: board.h,
        background: cyber
          ? '#07070E'
          : dark
            ? `linear-gradient(158deg, ${mixDown(accent, 0.72)} 0%, #0A0A14 100%)`
            : `linear-gradient(158deg, ${rgba(accent, 0.14)} 0%, #FAFAFC 62%)`,
        filter: wireframe ? 'grayscale(1) contrast(0.94)' : undefined,
        boxShadow: '0 24px 70px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07)',
      }}
    >
      {!wireframe && (
        <>
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 320, height: 320, right: -110, top: isAd ? -130 : -90,
              background: cyber ? rgba('FF2FB0', 0.5) : rgba(accent, dark ? 0.5 : 0.34),
              filter: 'blur(70px)',
            }}
          />
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 260, height: 260, left: -90, bottom: -80,
              background: cyber ? rgba('00E5FF', 0.42) : rgba(mixDown(accent, 0.2), dark ? 0.42 : 0.24),
              filter: 'blur(70px)',
            }}
          />
        </>
      )}

      {/* Brand lockup */}
      <div className="absolute top-7 left-10 flex items-center gap-2 z-10">
        <div
          className="w-4 h-4 rounded-[5px]"
          style={{ background: cyber ? '#5EF2FF' : dark ? '#FFFFFF' : accent }}
        />
        <Editable
          value={c.gdBrand}
          onCommit={(v) => onContent('gdBrand', v)}
          className={`text-[11px] font-bold tracking-[0.22em] ${cyber ? 'font-mono' : ''}`}
          style={{ color: ink }}
        />
      </div>

      {/* Product / abstract form */}
      <CanvasElement {...block('gdShape')} radius="rounded-[20px]">
        <div
          className="grid place-items-center transition-transform duration-500"
          style={{
            width: doc.sizes.gdShape?.w ?? boxes.gdShape.w,
            height: doc.sizes.gdShape?.h ?? boxes.gdShape.h,
            transform: isAd ? 'rotate(0deg)' : cyber ? 'rotate(45deg)' : 'rotate(10deg)',
            borderRadius: isAd ? 24 : cyber ? 0 : 28,
            background: doc.fills.gdShape
              ? `#${doc.fills.gdShape}`
              : `linear-gradient(150deg, ${rgba(accent, 0.95)}, ${mixDown(accent, 0.6)})`,
            boxShadow: `0 30px 60px -24px ${rgba(accent, 0.9)}`,
          }}
        >
          {!wireframe && (
            <div
              className="rounded-full"
              style={{
                width: '44%', height: '44%',
                background: 'radial-gradient(circle at 34% 30%, rgba(255,255,255,0.72), rgba(255,255,255,0.05) 68%)',
              }}
            />
          )}
        </div>
      </CanvasElement>

      {/* Headline */}
      <CanvasElement {...block('gdHeadline')} radius="rounded-[6px]">
        <div>
          <Editable
            as="h2"
            value={c.gdHeadline}
            onCommit={(v) => onContent('gdHeadline', v)}
            className={`headline-fit leading-[0.94] ${
              cyber ? 'font-mono font-bold tracking-[-0.03em]' : 'font-black tracking-[-0.03em]'
            }`}
            style={{
              fontSize: headlineSize,
              color: doc.fills.gdHeadline ? `#${doc.fills.gdHeadline}` : ink,
            }}
          />

          {/* The ad composition carries a price and a call to action. */}
          {isAd && (
            <div className="flex items-center gap-3 mt-4">
              <div
                className="h-9 px-4 rounded-full grid place-items-center text-[12px] font-semibold"
                style={{
                  background: doc.ctaStyle === 'black' ? '#0B1020' : accent,
                  color: '#fff',
                  boxShadow: `0 10px 24px -10px ${rgba(accent, 0.9)}`,
                }}
              >
                {c.ctaLabel}
              </div>
              <div className="text-[13px] font-bold" style={{ color: ink }}>
                {c.statValue}
              </div>
            </div>
          )}
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
                background: doc.fills[el.id] ? `#${doc.fills[el.id]}` : rgba(accent, 0.5),
              }}
            />
          ) : (
            <Editable
              value={el.text || 'Custom Text'}
              onCommit={(v) => onContent(`custom:${el.id}`, v)}
              className="text-[19px] font-bold whitespace-nowrap"
              style={{ color: doc.fills[el.id] ? `#${doc.fills[el.id]}` : ink }}
            />
          )}
        </CanvasElement>
      ))}
    </div>
  );
}
