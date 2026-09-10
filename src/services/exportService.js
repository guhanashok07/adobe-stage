// Export Service for Adobe Stage
// Generates clean, production-ready React + Tailwind component code from live canvas block state

export function exportToReactTailwind(blocks, workspace = 'UI/UX Design', brand = null) {
  const blocksCode = blocks.map(block => renderBlockToJSX(block)).join('\n\n      ');

  return `import React from 'react';

// Exported from Adobe Stage (Browser-Native AI Canvas)
// Workspace: ${workspace}
// Brand: ${brand ? brand.name : 'Default'}
export default function StageGeneratedComponent() {
  return (
    <div className="w-full max-w-4xl mx-auto p-8 font-sans ${workspace === 'Graphic Design' ? 'bg-[#0B0A1A] text-white' : 'bg-slate-900 text-slate-100'}">
      <div className="flex flex-col gap-5">
      ${blocksCode}
      </div>
    </div>
  );
}
`;
}

function renderBlockToJSX(block) {
  const { type, content, subContent, badge, styles } = block;
  const radius = styles.borderRadius || 12;
  const padding = styles.padding || 16;
  const bg = styles.backgroundColor || '#1E293B';
  const color = styles.textColor || '#FFFFFF';
  const fontSize = styles.fontSize || 16;

  if (type === 'card' || type === 'metric') {
    return `<div 
        className="transition-all hover:scale-[1.01]"
        style={{
          backgroundColor: '${bg}',
          color: '${color}',
          borderRadius: '${radius}px',
          padding: '${padding}px',
          border: '${styles.borderWidth ? `${styles.borderWidth}px solid ${styles.borderColor || 'rgba(255,255,255,0.1)'}` : 'none'}'
        }}
      >
        ${badge ? `<span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full mb-2 bg-white/10 uppercase tracking-wide">${badge}</span>` : ''}
        <div style={{ fontSize: '${fontSize}px', fontWeight: 700 }}>
          ${content || ''}
        </div>
        ${subContent ? `<p className="mt-1 text-xs opacity-80">${subContent}</p>` : ''}
      </div>`;
  }

  if (type === 'button') {
    return `<button 
        type="button"
        className="font-semibold transition-all hover:opacity-90 active:scale-95 flex items-center justify-center cursor-pointer"
        style={{
          backgroundColor: '${bg}',
          color: '${color}',
          borderRadius: '${radius}px',
          padding: '${padding}px 24px',
          fontSize: '${fontSize}px',
          width: '${styles.width || 'auto'}'
        }}
      >
        ${content || 'Click Action'}
      </button>`;
  }

  if (type === 'badge') {
    return `<span 
        className="inline-flex items-center font-bold uppercase tracking-wider"
        style={{
          backgroundColor: '${bg}',
          color: '${color}',
          borderRadius: '${radius}px',
          padding: '6px 14px',
          fontSize: '${fontSize}px'
        }}
      >
        ${content || 'Badge'}
      </span>`;
  }

  // Text block
  return `<div 
      style={{
        color: '${color}',
        borderRadius: '${radius}px',
        padding: '${padding}px',
        fontSize: '${fontSize}px',
        fontWeight: 800,
        lineHeight: 1.15
      }}
    >
      <h2>${content || ''}</h2>
      ${subContent ? `<p className="mt-2 text-sm font-normal opacity-80">${subContent}</p>` : ''}
    </div>`;
}
