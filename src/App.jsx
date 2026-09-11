import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  MousePointer2, Type, Square, Layout, Image as ImageIcon, Folder,
  ChevronDown, Check, Play, Share2, Menu, PanelRight, Key,
  Undo2, Redo2, Maximize2, Presentation,
} from 'lucide-react';

import Onboarding, { STORAGE_KEY, API_KEY_STORAGE, API_PROVIDER_STORAGE, API_MODEL_STORAGE } from './components/Onboarding';
import { generateWithAI, DEFAULT_MODELS } from './services/aiService';
import AppShell from './components/artboards/AppShell';
import CampaignArtboard from './components/artboards/CampaignArtboard';
import LayersPanel from './components/LayersPanel';
import PropertiesPanel from './components/PropertiesPanel';
import AIPanel from './components/AIPanel';
import { ToolButton } from './components/primitives';
import GhostDemo, { DEMO_SEEN_KEY } from './components/GhostDemo';
import {
  ARTBOARDS, CANVAS_SCALE, LAYOUTS, LAYOUTS_FOR, DEFAULT_LAYOUT,
  initialHistory, historyReducer, layoutFor, elementsFor,
  baseOf, geometryOf, labelOf,
} from './state/document';

const WORKSPACES = ['UI/UX Design', 'Graphic Design'];
const HERO_SELECTION = { 'UI/UX Design': 'hero', 'Graphic Design': 'gdHeadline' };

export default function App() {
  const [history, dispatch] = useReducer(historyReducer, initialHistory);
  const doc = history.present;

  const [workspace, setWorkspace] = useState('UI/UX Design');
  const [workspaceMenu, setWorkspaceMenu] = useState(false);
  const [selectedId, setSelectedId] = useState('hero');

  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [aiOpen, setAiOpen] = useState(true);
  const [focusedPanel, setFocusedPanel] = useState('canvas');

  const [fidelity, setFidelity] = useState(80);
  const [creativity, setCreativity] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [messageIsError, setMessageIsError] = useState(false);
  const [crossSurface, setCrossSurface] = useState(false);

  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem(STORAGE_KEY));
  const [ghost, setGhost] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) || '');
  const [provider, setProvider] = useState(() => localStorage.getItem(API_PROVIDER_STORAGE) || 'gemini');
  const [model, setModel] = useState(() => localStorage.getItem(API_MODEL_STORAGE) || '');

  // Live pointer gesture (drag or corner resize). Held in a ref so mousemove
  // never re-renders on its own.
  const gesture = useRef(null);
  const [draggingId, setDraggingId] = useState(null);

  // Zoom is derived from the space the canvas actually has. A hardcoded scale
  // clipped the artboard whenever the window was short or the AI panel open.
  const viewportRef = useRef(null);
  const [scale, setScale] = useState(CANVAS_SCALE);
  // The mousemove handler needs the current scale without re-subscribing, so
  // the fit effect writes it to a ref alongside the state.
  const scaleRef = useRef(CANVAS_SCALE);

  const wireframe = fidelity < 35;
  const otherWorkspace = workspace === 'UI/UX Design' ? 'Graphic Design' : 'UI/UX Design';

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;

    const board = ARTBOARDS[workspace];
    const fit = () => {
      const { width, height } = node.getBoundingClientRect();
      if (!width || !height) return;
      const next = Math.max(0.25, Number(Math.min(1, (width - 48) / board.w, (height - 40) / board.h).toFixed(3)));
      scaleRef.current = next;
      setScale(next);
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(node);
    return () => observer.disconnect();
  }, [workspace, aiOpen]);

  useEffect(() => {
    if (showOnboarding) return;
    if (localStorage.getItem(DEMO_SEEN_KEY)) return;
    const t = setTimeout(() => setGhost(true), 700);
    return () => clearTimeout(t);
  }, [showOnboarding]);

  const commit = useCallback((updater) => dispatch({ type: 'commit', updater }), []);
  const amend = useCallback((updater) => dispatch({ type: 'amend', updater }), []);
  const begin = useCallback(() => dispatch({ type: 'begin' }), []);

  // --- selection -----------------------------------------------------------

  const select = useCallback((id) => setSelectedId(id), []);

  const switchWorkspace = useCallback((ws) => {
    setWorkspace(ws);
    setSelectedId(HERO_SELECTION[ws]);
    setWorkspaceMenu(false);
    setCrossSurface(false);
  }, []);

  // Keep the selection on the surface you are actually looking at.
  // A selection only survives if the active layout actually contains it.
  const visibleSelection = useMemo(() => {
    if (!selectedId) return null;
    if (elementsFor(doc, workspace)[selectedId]) return selectedId;
    const el = doc.custom.find((e) => e.id === selectedId);
    return el && el.ws === workspace ? selectedId : null;
  }, [selectedId, workspace, doc]);

  const geometry = visibleSelection
    ? geometryOf(visibleSelection, doc, workspace)
    : { x: 0, y: 0, w: 0, h: 0 };

  const accentHex = String(doc.content.accentHex || '1473E6').replace('#', '');

  const defaultFill = (id) => {
    const dark = doc.theme === 'dark';
    switch (id) {
      case 'hero':
      case 'art':
      case 'gdShape':
        return accentHex;
      case 'card':
      case 'chart':
      case 'stats':
        return dark ? '182234' : 'FFFFFF';
      case 'gdHeadline':
        return dark ? 'FFFFFF' : '0B1020';
      default:
        return dark ? '334155' : 'E2E8F0';
    }
  };

  const activeFill = visibleSelection
    ? (doc.fills[visibleSelection] || defaultFill(visibleSelection))
    : '000000';

  // --- pointer gestures ----------------------------------------------------

  const startDrag = useCallback((id) => {
    begin();
    setDraggingId(id);
    gesture.current = { id, kind: 'drag' };
  }, [begin]);

  const startResize = useCallback((id, corner) => {
    begin();
    gesture.current = { id, kind: 'resize', corner };
  }, [begin]);

  const onMouseMove = (e) => {
    const g = gesture.current;
    if (!g) return;

    const dx = e.movementX / scaleRef.current;
    const dy = e.movementY / scaleRef.current;

    if (g.kind === 'drag') {
      amend((d) => ({
        ...d,
        positions: {
          ...d.positions,
          [g.id]: {
            x: (d.positions[g.id]?.x || 0) + dx,
            y: (d.positions[g.id]?.y || 0) + dy,
          },
        },
      }));
      return;
    }

    amend((d) => {
      const base = baseOf(g.id, d, workspace);
      let w = d.sizes[g.id]?.w ?? base.w;
      let h = d.sizes[g.id]?.h ?? base.h;
      let shiftX = 0;
      let shiftY = 0;

      if (g.corner.includes('e')) w += dx;
      if (g.corner.includes('w')) { w -= dx; shiftX = dx; }
      if (g.corner.includes('s')) h += dy;
      if (g.corner.includes('n')) { h -= dy; shiftY = dy; }

      // Clamping must not drag the opposite edge along with it.
      if (w < 48) { w = 48; shiftX = 0; }
      if (h < 40) { h = 40; shiftY = 0; }

      return {
        ...d,
        sizes: { ...d.sizes, [g.id]: { w, h } },
        positions: {
          ...d.positions,
          [g.id]: {
            x: (d.positions[g.id]?.x || 0) + shiftX,
            y: (d.positions[g.id]?.y || 0) + shiftY,
          },
        },
      };
    });
  };

  const endGesture = () => {
    setDraggingId(null);
    gesture.current = null;
  };

  // --- property edits ------------------------------------------------------

  const setGeometry = (prop, value) => {
    if (!visibleSelection) return;
    const id = visibleSelection;
    const base = baseOf(id, doc, workspace);

    if (prop === 'x' || prop === 'y') {
      commit((d) => ({
        ...d,
        positions: {
          ...d.positions,
          [id]: { ...(d.positions[id] || { x: 0, y: 0 }), [prop]: value - base[prop] },
        },
      }));
    } else {
      commit((d) => ({
        ...d,
        sizes: {
          ...d.sizes,
          [id]: {
            w: d.sizes[id]?.w ?? base.w,
            h: d.sizes[id]?.h ?? base.h,
            [prop]: Math.max(prop === 'w' ? 48 : 40, value),
          },
        },
      }));
    }
  };

  const align = (type) => {
    if (!visibleSelection) return;
    const id = visibleSelection;
    const board = ARTBOARDS[workspace];
    const base = baseOf(id, doc, workspace);
    const g = geometryOf(id, doc, workspace);

    // Align to the same content box the layouts lay out against, otherwise
    // aligning an already-flush block shifts it by the difference.
    const inset = board.pad || 32;
    const padLeft = board.sidebar + inset;
    const padTop = board.header + inset;
    const padRight = board.w - inset - g.w;
    const padBottom = board.h - inset - g.h;

    const targets = {
      left: ['x', padLeft],
      center: ['x', Math.round(board.sidebar + (board.w - board.sidebar - g.w) / 2)],
      right: ['x', padRight],
      top: ['y', padTop],
      middle: ['y', Math.round(padTop + (padBottom - padTop) / 2)],
      bottom: ['y', padBottom],
    };

    const [axis, value] = targets[type];
    commit((d) => ({
      ...d,
      positions: {
        ...d.positions,
        [id]: { ...(d.positions[id] || { x: 0, y: 0 }), [axis]: value - base[axis] },
      },
    }));
  };

  const applyFill = (raw, mode) => {
    if (!visibleSelection) return;
    const hex = raw.replace('#', '').slice(0, 6);
    const updater = (d) => ({ ...d, fills: { ...d.fills, [visibleSelection]: hex } });
    (mode === 'commit' ? commit : amend)(updater);
  };

  const setContent = (field, value) => {
    if (field.startsWith('custom:')) {
      const id = field.slice('custom:'.length);
      commit((d) => ({
        ...d,
        custom: d.custom.map((e) => (e.id === id ? { ...e, text: value } : e)),
      }));
      return;
    }
    commit((d) => ({ ...d, content: { ...d.content, [field]: value } }));
  };

  const setItem = (index, field, value) => {
    commit((d) => ({
      ...d,
      content: {
        ...d.content,
        items: d.content.items.map((it, i) => (i === index ? { ...it, [field]: value } : it)),
      },
    }));
  };

  const setStat = (index, field, value) => {
    commit((d) => ({
      ...d,
      content: {
        ...d.content,
        stats: (d.content.stats || []).map((st, i) => (i === index ? { ...st, [field]: value } : st)),
      },
    }));
  };

  const setChartTitle = (value) => {
    commit((d) => (d.content.chart
      ? { ...d, content: { ...d.content, chart: { ...d.content.chart, title: value } } }
      : d));
  };

  const setLayout = (id) => commit((d) => (
    d.layout[workspace] === id ? d : { ...d, layout: { ...d.layout, [workspace]: id } }
  ));

  const setOpacity = (value) => {
    if (!visibleSelection) return;
    commit((d) => ({ ...d, opacity: { ...d.opacity, [visibleSelection]: value } }));
  };

  // Clears drag, resize and nudge on the selection, matching the reset control
  // Adobe puts on every property group.
  const resetTransform = () => {
    if (!visibleSelection) return;
    commit((d) => {
      const positions = { ...d.positions };
      const sizes = { ...d.sizes };
      delete positions[visibleSelection];
      delete sizes[visibleSelection];
      return { ...d, positions, sizes };
    });
  };

  const setTheme = (theme) => commit((d) => (d.theme === theme ? d : { ...d, theme }));

  const addElement = (type) => {
    const id = `el-${Date.now()}`;
    commit((d) => ({
      ...d,
      custom: [...d.custom, { id, type, ws: workspace, text: 'Custom Text' }],
      positions: { ...d.positions, [id]: { x: 0, y: 0 } },
      sizes: type === 'shape' ? { ...d.sizes, [id]: { w: 96, h: 96 } } : d.sizes,
    }));
    setSelectedId(id);
  };

  const deleteSelection = useCallback(() => {
    const id = selectedId;
    if (!id || elementsFor(doc, workspace)[id]) return; // layout blocks are not deletable
    commit((d) => ({ ...d, custom: d.custom.filter((e) => e.id !== id) }));
    setSelectedId(HERO_SELECTION[workspace]);
  }, [selectedId, workspace, commit, doc]);

  // --- generation ----------------------------------------------------------

  // Input comes only from the suggestion chips now, so there is no composer
  // state to fall back to.
  const generate = async (text) => {
    const input = String(text || '').trim();
    if (!input || isGenerating) return;

    setIsGenerating(true);
    setMessage('');
    setMessageIsError(false);
    setCrossSurface(false);

    try {
      const result = await generateWithAI(input, {
        apiKey, provider, model, workspace,
        selectedElement: labelOf(visibleSelection, doc, workspace),
        fidelity, creativity,
      });

      commit((d) => {
        const next = { ...d };
        if (result.theme) next.theme = result.theme;
        if (result.ctaStyle) next.ctaStyle = result.ctaStyle;
        if (result.gdStyle) next.gdStyle = result.gdStyle;
        if (result.layout && LAYOUTS[result.layout]) {
          next.layout = { ...d.layout, 'UI/UX Design': result.layout };
        }
        if (result.gdLayout && LAYOUTS[result.gdLayout]) {
          next.layout = { ...next.layout, 'Graphic Design': result.gdLayout };
        }
        if (result.prototype) {
          const { items, ...rest } = result.prototype;
          next.content = {
            ...d.content,
            ...rest,
            items: items?.length ? items : d.content.items,
          };
          // A regenerated concept starts from a clean layout.
          next.positions = {};
          next.sizes = {};
          next.fills = {};
          next.opacity = {};
        }
        return next;
      });

      // A full concept rewrites both surfaces, so tell the user the surface
      // they are not looking at also changed.
      setCrossSurface(Boolean(result.prototype));
      setMessageIsError(Boolean(result.error));
      setMessage(result.message || 'Applied.');
    } catch (err) {
      setMessageIsError(true);
      setMessage(`Generation failed: ${err.message}`);
    }

    setIsGenerating(false);
  };

  // --- keyboard ------------------------------------------------------------

  useEffect(() => {
    const onKey = (e) => {
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        dispatch({ type: e.shiftKey ? 'redo' : 'undo' });
        return;
      }

      const target = e.target;
      if (typeof target?.closest === 'function'
        && target.closest('input, textarea, [contenteditable="true"]')) return;

      if (e.key === 'Escape') { setSelectedId(null); return; }

      if ((e.key === 'Delete' || e.key === 'Backspace') && visibleSelection) {
        e.preventDefault();
        deleteSelection();
        return;
      }

      const nudge = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (nudge && visibleSelection) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        commit((d) => ({
          ...d,
          positions: {
            ...d.positions,
            [visibleSelection]: {
              x: (d.positions[visibleSelection]?.x || 0) + nudge[0] * step,
              y: (d.positions[visibleSelection]?.y || 0) + nudge[1] * step,
            },
          },
        }));
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visibleSelection, deleteSelection, commit]);

  // The ghost demo performs the product argument rather than describing it.
  // Every step is a real document mutation, so what the viewer sees is the
  // actual tool working, and the final undo leaves the document untouched.
  const ghostSteps = useRef(0);

  const runGhostStep = useCallback((act) => {
    if (act === 'select') {
      setSelectedId('hero');
    } else if (act === 'drag') {
      ghostSteps.current += 1;
      commit((d) => ({
        ...d,
        positions: { ...d.positions, hero: { x: 26, y: 14 } },
      }));
    } else if (act === 'type') {
      ghostSteps.current += 1;
      commit((d) => ({
        ...d,
        content: { ...d.content, statLabel: 'Edited by hand' },
      }));
    } else if (act === 'undo') {
      for (let i = 0; i < ghostSteps.current; i += 1) dispatch({ type: 'undo' });
      ghostSteps.current = 0;
    }
  }, [commit]);

  const endGhost = useCallback(() => {
    // Roll back anything the demo did but did not get to undo itself.
    for (let i = 0; i < ghostSteps.current; i += 1) dispatch({ type: 'undo' });
    ghostSteps.current = 0;
    localStorage.setItem(DEMO_SEEN_KEY, 'true');
    setGhost(false);
    setSelectedId(null);
  }, []);

  // Document name tracks the generated concept.
  const docName = `${(doc.content.appName || 'Untitled').replace(/\s+/g, '')}_${
    workspace === 'UI/UX Design' ? 'Dashboard' : 'Campaign'
  }`;

  const artboardProps = {
    doc,
    selectedId: visibleSelection,
    draggingId,
    wireframe,
    onSelect: select,
    onDragStart: startDrag,
    onResizeStart: startResize,
    onContent: setContent,
    onItem: setItem,
    onStat: setStat,
    onChartTitle: setChartTitle,
  };

  return (
    <div
      className="flex flex-col h-screen w-full bg-spectrum-800 text-spectrum-50 font-sans overflow-hidden"
      onMouseMove={onMouseMove}
      onMouseUp={endGesture}
      onMouseLeave={endGesture}
    >
      {showOnboarding && (
        <Onboarding
          hasKey={Boolean(apiKey)}
          onComplete={({ apiKey: key, provider: p, model: m }) => {
            setShowOnboarding(false);
            setApiKey(key);
            setProvider(p);
            setModel(m);
          }}
        />
      )}

      {/* ---------------------------------------------------------------- Top bar */}
      <header className="h-11 border-b border-spectrum-400 bg-spectrum-800 flex items-center justify-between px-2.5 shrink-0 relative z-40">
        <div className="flex items-center gap-1.5">
          <ToolButton
            icon={<Menu size={16} />}
            active={leftOpen}
            title="Toggle layers panel"
            onClick={() => setLeftOpen((v) => !v)}
          />

          <div className="flex items-center gap-2 px-2">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path fill="#EB1000" d="M15.1 2H22V22L15.1 2ZM8.9 2H2V22L8.9 2ZM12 9.4L17.6 22H13.8L12 17.5L8.5 22H5.4L12 9.4Z" />
            </svg>
            <span className="font-semibold text-[13px] tracking-[-0.01em]">Stage</span>
          </div>

          <div className="h-4 w-px bg-spectrum-400 mx-1" />

          <div className="relative">
            <button
              onClick={() => setWorkspaceMenu((v) => !v)}
              className={`flex items-center gap-1.5 h-8 px-2.5 rounded-[4px] text-[13px] font-medium transition-colors ${
                workspaceMenu ? 'bg-spectrum-500 text-spectrum-50' : 'text-spectrum-100 hover:bg-spectrum-500 hover:text-spectrum-50'
              }`}
            >
              {workspace}
              <ChevronDown size={13} className={`transition-transform ${workspaceMenu ? 'rotate-180' : ''}`} />
            </button>

            {workspaceMenu && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-spectrum-700 border border-spectrum-300 rounded-[4px] shadow-modal py-1 z-50">
                {WORKSPACES.map((ws) => (
                  <button
                    key={ws}
                    onClick={() => switchWorkspace(ws)}
                    className="w-full text-left px-3 h-8 text-[13px] text-spectrum-50 hover:bg-spectrum-500 flex items-center justify-between transition-colors"
                  >
                    {ws} {workspace === ws && <Check size={14} className="text-accent-subtle" />}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Centred document title, Premiere style, with an edited marker. */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none">
          <span className="text-[13px] text-spectrum-50">{docName}</span>
          {history.past.length > 0 && (
            <span className="text-[13px] text-spectrum-200">· Edited</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <ToolButton
            icon={<Undo2 size={15} />}
            title="Undo (⌘Z)"
            disabled={!history.past.length}
            onClick={() => dispatch({ type: 'undo' })}
          />
          <ToolButton
            icon={<Redo2 size={15} />}
            title="Redo (⇧⌘Z)"
            disabled={!history.future.length}
            onClick={() => dispatch({ type: 'redo' })}
          />

          <div className="h-4 w-px bg-spectrum-400 mx-1" />

          <div className="flex -space-x-1.5 mr-1">
            <div className="w-6 h-6 rounded-full bg-accent ring-2 ring-spectrum-800 grid place-items-center text-[10px] font-semibold text-white">JD</div>
            <div className="w-6 h-6 rounded-full bg-emerald-600 ring-2 ring-spectrum-800 grid place-items-center text-[10px] font-semibold text-white">AL</div>
          </div>

          <a
            href="/deck.html"
            target="_blank"
            rel="noreferrer"
            title="Open the launch deck"
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-[4px] bg-spectrum-600 hover:bg-spectrum-500 border border-spectrum-400 text-[12px] font-medium text-spectrum-50 transition-colors"
          >
            <Presentation size={12} className="text-spectrum-100" />
            Deck
          </a>

          <button
            onClick={() => setShowOnboarding(true)}
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-[4px] bg-spectrum-600 hover:bg-spectrum-500 border border-spectrum-400 text-[12px] font-medium text-spectrum-50 transition-colors"
            title="How to use Stage, and AI key settings"
          >
            <Key size={12} className={apiKey ? 'text-emerald-400' : 'text-amber-400'} />
            Guide &amp; key
          </button>

          <ToolButton icon={<Play size={15} />} title="Present (roadmap)" disabled />

          <button
            title="Share (roadmap)"
            disabled
            className="flex items-center gap-1.5 h-8 px-3 rounded-[4px] bg-accent/40 text-white/60 text-[13px] font-medium cursor-not-allowed"
          >
            <Share2 size={13} /> Share
          </button>

          <div className="h-4 w-px bg-spectrum-400 mx-1" />

          <ToolButton
            icon={<PanelRight size={16} />}
            active={rightOpen}
            title="Toggle properties panel"
            onClick={() => setRightOpen((v) => !v)}
          />
        </div>
      </header>

      {/* --------------------------------------------------------------- Toolbar */}
      <div className="h-10 border-b border-spectrum-400 bg-spectrum-800 flex items-center justify-center gap-1 shrink-0 relative z-30">
        <ToolButton icon={<MousePointer2 size={15} />} active title="Select (V)" />
        <ToolButton icon={<Square size={15} />} title="Add shape" onClick={() => addElement('shape')} />
        <ToolButton icon={<Type size={15} />} title="Add text" onClick={() => addElement('text')} />
        <div className="w-px h-4 bg-spectrum-400 mx-1.5" />
        <div className="flex items-center gap-1 ml-1">
          {LAYOUTS_FOR[workspace].map((id) => (
            <button
              key={id}
              onClick={() => setLayout(id)}
              title={`${LAYOUTS[id].name} composition`}
              className={`h-8 px-2.5 rounded-[4px] text-[12px] font-medium transition-colors ${
                layoutFor(doc, workspace) === id
                  ? 'bg-accent text-white'
                  : 'text-spectrum-100 hover:text-spectrum-50 hover:bg-spectrum-500'
              }`}
            >
              {LAYOUTS[id].name}
            </button>
          ))}
        </div>
        <ToolButton icon={<ImageIcon size={15} />} title="Place image (roadmap)" disabled />
        <ToolButton icon={<Folder size={15} />} title="Creative Cloud Libraries (roadmap)" disabled />
      </div>

      {/* ------------------------------------------------------------ Workspace */}
      <div className="flex-1 flex overflow-hidden gap-px bg-spectrum-900">
        <aside
          onMouseDown={() => setFocusedPanel('layers')}
          className={`shrink-0 overflow-hidden transition-[width] duration-200 relative ${
            leftOpen ? 'w-[248px]' : 'w-0'
          }`}
        >
          {focusedPanel === 'layers' && (
            <div className="absolute inset-0 border border-accent pointer-events-none z-30" />
          )}
          <LayersPanel doc={doc} workspace={workspace} selectedId={visibleSelection} onSelect={select} />
        </aside>

        {/* The AI panel is docked below the artboard rather than floating over
            it. Overlaying meant the panel covered the lower third of the
            design you were editing. */}
        <main
          onMouseDown={() => setFocusedPanel('canvas')}
          className="flex-1 bg-spectrum-900 relative overflow-hidden flex flex-col"
          style={{ backgroundImage: 'radial-gradient(#2A2A2A 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        >
          <div className="absolute top-3 right-3 flex items-center h-8 bg-spectrum-700 border border-spectrum-400 rounded-[4px] shadow-panel z-20 overflow-hidden">
            <span className="px-3 text-[12px] font-medium text-spectrum-100 tabular border-r border-spectrum-400 leading-8">
              {Math.round(scale * 100)}%
            </span>
            <span className="w-8 h-8 grid place-items-center text-spectrum-100" title="Zoom follows the window size">
              <Maximize2 size={13} />
            </span>
          </div>

          {wireframe && (
            <div className="absolute top-3 left-3 h-8 px-3 flex items-center rounded-[4px] bg-spectrum-700 border border-spectrum-400 text-[11px] font-medium text-spectrum-100 shadow-panel z-20">
              Wireframe fidelity. Raise the slider for a high-fi render
            </div>
          )}

          <div
            ref={viewportRef}
            className="flex-1 min-h-0 grid place-items-center overflow-hidden"
            onMouseDown={() => setSelectedId(null)}
          >
            <div
              style={{ transform: `scale(${scale})` }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {workspace === 'UI/UX Design'
                ? <AppShell {...artboardProps} />
                : <CampaignArtboard {...artboardProps} />}
            </div>
          </div>

          {ghost && <GhostDemo onStep={runGhostStep} onEnd={endGhost} />}

          <div className="shrink-0 flex justify-center px-4 pb-4">
            <AIPanel
              open={aiOpen}
              onOpen={() => setAiOpen(true)}
              onClose={() => setAiOpen(false)}
              onGenerate={generate}
              isGenerating={isGenerating}
              fidelity={fidelity}
              setFidelity={setFidelity}
              creativity={creativity}
              setCreativity={setCreativity}
              workspace={workspace}
              otherWorkspace={otherWorkspace}
              onSwitchWorkspace={() => switchWorkspace(otherWorkspace)}
              message={message}
              messageIsError={messageIsError}
              crossSurface={crossSurface}
              connected={Boolean(apiKey)}
              providerName={model || DEFAULT_MODELS[provider]}
              selectionLabel={visibleSelection ? labelOf(visibleSelection, doc, workspace) : 'no selection'}
            />
          </div>
        </main>

        <aside
          onMouseDown={() => setFocusedPanel('properties')}
          className={`shrink-0 overflow-hidden transition-[width] duration-200 relative ${
            rightOpen ? 'w-[264px]' : 'w-0'
          }`}
        >
          {focusedPanel === 'properties' && (
            <div className="absolute inset-0 border border-accent pointer-events-none z-30" />
          )}
          <PropertiesPanel
            doc={doc}
            selectedId={visibleSelection}
            label={visibleSelection ? labelOf(visibleSelection, doc, workspace) : 'No selection'}
            geometry={geometry}
            fill={activeFill}
            deletable={Boolean(visibleSelection) && !elementsFor(doc, workspace)[visibleSelection]}
            onAlign={align}
            onGeometry={setGeometry}
            onFillScrubStart={begin}
            onFillChange={(v) => applyFill(v, 'amend')}
            onFillCommit={() => applyFill(activeFill, 'commit')}
            onDelete={deleteSelection}
            onTheme={setTheme}
            opacity={visibleSelection ? (doc.opacity?.[visibleSelection] ?? 100) : 100}
            onOpacity={setOpacity}
            onResetTransform={resetTransform}
          />
        </aside>
      </div>
    </div>
  );
}
