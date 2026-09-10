import React from 'react';
import { Menu } from 'lucide-react';
import { LayerItem } from './primitives';
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
    <div className="w-[248px] h-full flex flex-col bg-spectrum-700">
      {/* Adobe groups panels under tabs with a burger menu, rather than
          stacking labelled sections down a sidebar. */}
      <div className="flex items-end h-8 bg-spectrum-600 px-1 gap-0.5 shrink-0">
        {['Layers', 'Brand', 'Assets'].map((t) => (
          <button
            key={t}
            disabled={t !== 'Layers'}
            title={t === 'Layers' ? undefined : 'Roadmap'}
            className={`h-[26px] px-2.5 text-[11px] rounded-t-[3px] transition-colors ${
              t === 'Layers'
                ? 'bg-spectrum-700 text-spectrum-50'
                : 'text-spectrum-200 cursor-not-allowed hover:text-spectrum-100'
            }`}
          >
            {t}
          </button>
        ))}
        <button className="ml-auto mb-1 p-1 text-spectrum-100 hover:text-spectrum-50 transition-colors" title="Panel menu">
          <Menu size={12} />
        </button>
      </div>

      <div className="flex items-center gap-2 h-8 px-2.5 border-b border-spectrum-400/60 shrink-0">
        <div
          className="w-3.5 h-3.5 rounded-[3px] shrink-0 ring-1 ring-black/40"
          style={{ background: `#${String(doc.content.accentHex || '1473E6').replace('#', '')}` }}
        />
        <span className="text-[11px] text-spectrum-50 truncate">{doc.content.appName || 'Untitled'}</span>
        <span className="ml-auto text-[10px] text-spectrum-200 shrink-0">Source Sans 3</span>
      </div>

      <div className="flex-1 overflow-y-auto py-1.5 px-1.5">
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
