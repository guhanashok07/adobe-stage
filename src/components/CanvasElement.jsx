import React from 'react';

// Shared selection chrome for everything on the canvas.
//
// Previously each of the six selectable things on the two artboards carried its
// own copy-pasted outline + handle markup, which is why only custom shapes ever
// got a working resize handle. One component means every element gets the same
// selection frame, the same four live corner handles, and the same label chip.

const CORNERS = [
  { key: 'nw', cls: '-top-1 -left-1', cursor: 'nwse-resize' },
  { key: 'ne', cls: '-top-1 -right-1', cursor: 'nesw-resize' },
  { key: 'sw', cls: '-bottom-1 -left-1', cursor: 'nesw-resize' },
  { key: 'se', cls: '-bottom-1 -right-1', cursor: 'nwse-resize' },
];

export default function CanvasElement({
  id,
  label,
  selected,
  dragging,
  resizable = true,
  inset = '-m-2',
  radius = 'rounded-lg',
  style,
  className = '',
  onSelect,
  onDragStart,
  onResizeStart,
  children,
}) {
  return (
    <div
      className={`absolute group ${dragging ? 'cursor-grabbing' : 'cursor-grab'} ${className}`}
      style={style}
      onClick={(e) => { e.stopPropagation(); onSelect(id); }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onSelect(id);
        // Let text editing take the gesture instead of starting a drag.
        if (e.target.closest('[contenteditable="true"]')) return;
        if (e.target.closest('[data-resize-handle]')) return;
        onDragStart(id);
      }}
    >
      {/* Selection outline sits outside the element box so it never covers content. */}
      <div
        className={`absolute inset-0 border pointer-events-none ${inset} ${radius} transition-colors duration-150 ${
          selected ? 'border-accent' : 'border-transparent group-hover:border-accent/40'
        }`}
      >
        {selected && (
          <>
            <div className="absolute -top-[22px] left-0 bg-accent text-white text-[10px] font-semibold leading-none px-1.5 py-1 rounded-[2px] whitespace-nowrap shadow-panel">
              {label}
            </div>

            {resizable && CORNERS.map(({ key, cls, cursor }) => (
              <div
                key={key}
                data-resize-handle={key}
                onMouseDown={(e) => { e.stopPropagation(); onResizeStart(id, key); }}
                style={{ cursor }}
                className={`absolute ${cls} w-2 h-2 bg-white border border-accent rounded-[1px] pointer-events-auto shadow-[0_0_0_1px_rgba(0,0,0,0.25)]`}
              />
            ))}
          </>
        )}
      </div>

      {children}
    </div>
  );
}
