import React from 'react';
import { Palette, Layers, Settings } from 'lucide-react';
import { LayerItem, SectionLabel } from './primitives';
import { elementsFor, labelOf, layoutFor, LAYOUTS } from '../state/document';

// The tree is derived from the active layout rather than hardcoded, so
// switching composition or regenerating never leaves it describing a screen
// that is no longer on the canvas.
const LAYER_TYPE = {
  stats: 'group', hero: 'group', card: 'group', chart: 'group',
  art: 'image', gdHeadline: 'text', gdShape: 'component',
};

function childrenOf(id, content) {
  switch (id) {
    case 'stats':
      return (content.stats || []).map((s) => ({ name: s.label, type: 'component' }));
    case 'hero':
      return [
        { name: content.statValue, type: 'text' },
        { name: `${content.ctaLabel} Button`, type: 'component' },
      ];
    case 'card':
      return (content.items || []).map((i) => ({ name: i.title, type: 'component' }));
    default:
      return [];
  }
}

export default function LayersPanel({ doc, workspace, selectedId, onSelect }) {
  const custom = doc.custom.filter((el) => el.ws === workspace);
  const boxes = elementsFor(doc, workspace);
  const isApp = workspace === 'UI/UX Design';
  const rootName = isApp ? `${LAYOUTS[layoutFor(doc, workspace)].name} Canvas` : 'Campaign Artboard';

  return (
    <div className="w-[248px] h-full flex flex-col">
      <div className="p-3 border-b border-spectrum-400 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <SectionLabel icon={<Palette size={11} />}>Active Brand</SectionLabel>
          <button className="p-1 rounded-[4px] text-spectrum-200/60 cursor-not-allowed" title="Brand settings (roadmap)">
            <Settings size={12} />
          </button>
        </div>
        <div className="bg-spectrum-800 border border-spectrum-400 rounded-[4px] p-2.5">
          <div className="text-[13px] font-medium text-spectrum-50 mb-2 truncate">
            {doc.content.appName || 'Untitled Brand'}
          </div>
          <div className="flex gap-1.5">
            {[`#${String(doc.content.accentHex || '1473E6').replace('#', '')}`, '#0F172A', '#10B981', '#FFFFFF'].map((hex, i) => (
              <div key={i} className="w-4 h-4 rounded-full ring-1 ring-black/30" style={{ background: hex }} />
            ))}
          </div>
          <div className="text-[10px] text-spectrum-200 mt-2">Source Sans 3 · Source Code Pro</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="mb-2">
          <SectionLabel icon={<Layers size={11} />}>Layers</SectionLabel>
        </div>

        <div className="space-y-0.5">
          <LayerItem name={rootName} type="frame" expanded>
            {isApp && <LayerItem name="App Sidebar Nav" type="group" />}
            {isApp && <LayerItem name="Top Search Header" type="group" />}
            {!isApp && <LayerItem name="Brand Lockup" type="image" />}

            {Object.keys(boxes).map((id) => {
              const kids = childrenOf(id, doc.content);
              return (
                <LayerItem
                  key={id}
                  name={labelOf(id, doc, workspace)}
                  type={LAYER_TYPE[id] || 'group'}
                  expanded={kids.length > 0}
                  selected={selectedId === id}
                  onClick={() => onSelect(id)}
                >
                  {kids.map((kid, i) => (
                    <LayerItem key={i} name={kid.name} type={kid.type} />
                  ))}
                </LayerItem>
              );
            })}

            {custom.map((el, i) => (
              <LayerItem
                key={el.id}
                name={`${el.type === 'text' ? 'Text' : 'Shape'} ${i + 1}`}
                type={el.type}
                selected={selectedId === el.id}
                onClick={() => onSelect(el.id)}
              />
            ))}

            <LayerItem name={isApp ? 'App Background' : 'Gradient Background'} type="image" />
          </LayerItem>
        </div>
      </div>
    </div>
  );
}
