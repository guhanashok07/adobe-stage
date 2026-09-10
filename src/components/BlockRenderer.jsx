import React from 'react';

export default function BlockRenderer({
  block,
  isSelected,
  onSelect,
  onUpdateContent,
  activeWorkspace,
  brand
}) {
  const { id, type, content, subContent, badge, styles } = block;

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(id);
  };

  const handleContentBlur = (e) => {
    onUpdateContent(id, e.currentTarget.innerText);
  };

  // Border & selection halo
  const selectionClass = isSelected
    ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/10'
    : 'hover:ring-1 hover:ring-blue-400/50 cursor-pointer';

  if (type === 'button') {
    return (
      <div 
        onClick={handleClick}
        className={`relative inline-block transition-all group ${selectionClass}`}
        style={{
          borderRadius: `${styles.borderRadius ?? 8}px`,
          width: styles.width || 'auto'
        }}
      >
        {isSelected && (
          <div className="absolute -top-5 left-0 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded shadow-sm z-30 whitespace-nowrap uppercase tracking-wider font-mono">
            {block.label || 'Button'}
          </div>
        )}
        <button
          type="button"
          className="font-semibold text-center select-none w-full transition-all"
          style={{
            backgroundColor: styles.backgroundColor || brand.primary,
            color: styles.textColor || '#FFFFFF',
            borderRadius: `${styles.borderRadius ?? 8}px`,
            padding: `${styles.padding || 12}px 24px`,
            fontSize: `${styles.fontSize || 14}px`,
            border: styles.borderWidth ? `${styles.borderWidth}px solid ${styles.borderColor || 'transparent'}` : 'none'
          }}
        >
          <span 
            contentEditable
            suppressContentEditableWarning
            onBlur={handleContentBlur}
            onClick={(e) => e.stopPropagation()}
            className="outline-none cursor-text"
          >
            {content || 'Primary CTA'}
          </span>
        </button>
      </div>
    );
  }

  if (type === 'badge') {
    return (
      <div 
        onClick={handleClick}
        className={`relative inline-block transition-all ${selectionClass}`}
        style={{ borderRadius: `${styles.borderRadius ?? 9999}px` }}
      >
        {isSelected && (
          <div className="absolute -top-5 left-0 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded shadow-sm z-30 whitespace-nowrap uppercase tracking-wider font-mono">
            Badge Tag
          </div>
        )}
        <span
          className="inline-flex items-center font-bold tracking-wider uppercase select-none"
          style={{
            backgroundColor: styles.backgroundColor || brand.primary,
            color: styles.textColor || '#FFFFFF',
            borderRadius: `${styles.borderRadius ?? 9999}px`,
            padding: `${styles.padding || 6}px 14px`,
            fontSize: `${styles.fontSize || 11}px`
          }}
        >
          <span 
            contentEditable
            suppressContentEditableWarning
            onBlur={handleContentBlur}
            onClick={(e) => e.stopPropagation()}
            className="outline-none cursor-text"
          >
            {content || 'Badge'}
          </span>
        </span>
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div 
        onClick={handleClick}
        className={`relative p-2 rounded transition-all ${selectionClass}`}
        style={{
          borderRadius: `${styles.borderRadius ?? 8}px`,
          backgroundColor: styles.backgroundColor || 'transparent'
        }}
      >
        {isSelected && (
          <div className="absolute -top-5 left-0 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded shadow-sm z-30 whitespace-nowrap uppercase tracking-wider font-mono">
            Headline Text
          </div>
        )}
        <div
          style={{
            color: styles.textColor || '#FFFFFF',
            fontSize: `${styles.fontSize || 28}px`,
            fontWeight: 800,
            lineHeight: 1.15
          }}
        >
          <div 
            contentEditable
            suppressContentEditableWarning
            onBlur={handleContentBlur}
            onClick={(e) => e.stopPropagation()}
            className="outline-none cursor-text"
          >
            {content || 'Headline Content'}
          </div>
        </div>
        {subContent && (
          <p 
            className="mt-2 text-xs opacity-75 font-normal outline-none cursor-text"
            contentEditable
            suppressContentEditableWarning
            onClick={(e) => e.stopPropagation()}
          >
            {subContent}
          </p>
        )}
      </div>
    );
  }

  // Card or Metric Block
  return (
    <div
      onClick={handleClick}
      className={`relative transition-all ${selectionClass}`}
      style={{
        backgroundColor: styles.backgroundColor || '#1E293B',
        color: styles.textColor || '#FFFFFF',
        borderRadius: `${styles.borderRadius ?? 12}px`,
        padding: `${styles.padding || 20}px`,
        border: styles.borderWidth ? `${styles.borderWidth}px solid ${styles.borderColor || 'rgba(255,255,255,0.08)'}` : 'none',
        width: styles.width || '100%'
      }}
    >
      {isSelected && (
        <div className="absolute -top-5 left-0 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded shadow-sm z-30 whitespace-nowrap uppercase tracking-wider font-mono">
          {block.label || 'Interactive Card'}
        </div>
      )}

      {badge && (
        <div className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full mb-2 bg-white/10 tracking-wide uppercase">
          {badge}
        </div>
      )}

      <div 
        style={{ fontSize: `${styles.fontSize || 22}px`, fontWeight: 700 }}
        className="outline-none cursor-text"
        contentEditable
        suppressContentEditableWarning
        onBlur={handleContentBlur}
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </div>

      {subContent && (
        <div 
          className="text-xs opacity-75 mt-1 font-normal outline-none cursor-text"
          contentEditable
          suppressContentEditableWarning
          onClick={(e) => e.stopPropagation()}
        >
          {subContent}
        </div>
      )}
    </div>
  );
}
