import React from 'react';
import { Palette, Layers, Settings } from 'lucide-react';
import { LayerItem, SectionLabel } from './primitives';

export default function LayersPanel({ doc, workspace, selectedId, onSelect }) {
  const custom = doc.custom.filter((el) => el.ws === workspace);

  return (
    <div className="w-[248px] h-full flex flex-col">
      {/* Brand */}
      <div className="p-3 border-b border-spectrum-400 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <SectionLabel icon={<Palette size={11} />}>Active Brand</SectionLabel>
          <button
            className="p-1 rounded-[4px] text-spectrum-200/60 cursor-not-allowed"
            title="Brand settings (roadmap)"
          >
            <Settings size={12} />
          </button>
        </div>
        <div className="bg-spectrum-800 border border-spectrum-400 rounded-[4px] p-2.5">
          <div className="text-[13px] font-medium text-spectrum-50 mb-2">Acme Corp Global</div>
          <div className="flex gap-1.5">
            {['#0F172A', '#1473E6', '#10B981', '#FFFFFF'].map((hex) => (
              <div
                key={hex}
                className="w-4 h-4 rounded-full ring-1 ring-black/30"
                style={{ background: hex }}
              />
            ))}
          </div>
          <div className="text-[10px] text-spectrum-200 mt-2">Source Sans 3 · Source Code Pro</div>
        </div>
      </div>

      {/* Layers */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="mb-2">
          <SectionLabel icon={<Layers size={11} />}>Layers</SectionLabel>
        </div>

        <div className="space-y-0.5">
          {workspace === 'UI/UX Design' ? (
            <LayerItem name="App Dashboard Canvas" type="frame" expanded>
              <LayerItem name="App Sidebar Nav" type="group" />
              <LayerItem name="Top Search Header" type="group" />
              <LayerItem
                name="Balance Widget" type="group" expanded
                selected={selectedId === 'hero'} onClick={() => onSelect('hero')}
              >
                <LayerItem name="Balance Value" type="text" />
                <LayerItem name="Transfer Button" type="component" />
              </LayerItem>
              <LayerItem
                name="Transactions List" type="group" expanded
                selected={selectedId === 'card'} onClick={() => onSelect('card')}
              >
                {(doc.content.items || []).map((item, i) => (
                  <LayerItem key={i} name={item.title} type="component" />
                ))}
              </LayerItem>
              {custom.map((el, i) => (
                <LayerItem
                  key={el.id}
                  name={`${el.type === 'text' ? 'Text' : 'Shape'} ${i + 1}`}
                  type={el.type}
                  selected={selectedId === el.id}
                  onClick={() => onSelect(el.id)}
                />
              ))}
              <LayerItem name="Dashboard Background" type="image" />
            </LayerItem>
          ) : (
            <LayerItem name="Social Media Ad" type="frame" expanded>
              <LayerItem name="Brand Logo" type="image" />
              <LayerItem
                name="Main Headline" type="text"
                selected={selectedId === 'gdHeadline'} onClick={() => onSelect('gdHeadline')}
              />
              <LayerItem
                name="Abstract Shape" type="component"
                selected={selectedId === 'gdShape'} onClick={() => onSelect('gdShape')}
              />
              {custom.map((el, i) => (
                <LayerItem
                  key={el.id}
                  name={`${el.type === 'text' ? 'Text' : 'Shape'} ${i + 1}`}
                  type={el.type}
                  selected={selectedId === el.id}
                  onClick={() => onSelect(el.id)}
                />
              ))}
              <LayerItem name="Gradient Background" type="image" />
            </LayerItem>
          )}
        </div>
      </div>
    </div>
  );
}
