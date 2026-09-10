import React, { useState, useEffect } from 'react';
import { 
  MousePointer2, Type, Square, Layout, Sparkles, 
  ChevronDown, Play, Share, Layers, Palette, 
  Folder, Settings, Menu, AlignLeft, AlignCenter, AlignRight,
  Maximize, SlidersHorizontal, Image as ImageIcon,
  Wand2, CornerUpLeft, Check, PanelRight,
  Minus, CreditCard, ArrowRightLeft, PieChart, Search, Bell,
  Code2, Key, HelpCircle, Plus, Trash2
} from 'lucide-react';

import { BRAND_PRESETS, INITIAL_UI_BLOCKS, INITIAL_GRAPHIC_BLOCKS } from './data/templates';
import { generateBlocksFromPrompt } from './services/aiService';
import BlockRenderer from './components/BlockRenderer';
import SettingsModal from './components/SettingsModal';
import ExportModal from './components/ExportModal';

const App = () => {
  // Navigation & Workspace
  const [activeWorkspace, setActiveWorkspace] = useState('UI/UX Design');
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showBrandMenu, setShowBrandMenu] = useState(false);
  const [selectedBrandKey, setSelectedBrandKey] = useState('acme');
  const brand = BRAND_PRESETS[selectedBrandKey] || BRAND_PRESETS.acme;

  // Sidebar Panels
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [showAIPanel, setShowAIPanel] = useState(true);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // API Key & Provider (stored in localStorage for persistence)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('stage_ai_api_key') || '');
  const [apiProvider, setApiProvider] = useState(() => localStorage.getItem('stage_ai_provider') || 'gemini');

  // Canvas State & Blocks
  const [uiBlocks, setUiBlocks] = useState(INITIAL_UI_BLOCKS);
  const [graphicBlocks, setGraphicBlocks] = useState(INITIAL_GRAPHIC_BLOCKS);
  const activeBlocks = activeWorkspace === 'UI/UX Design' ? uiBlocks : graphicBlocks;
  const setActiveBlocks = activeWorkspace === 'UI/UX Design' ? setUiBlocks : setGraphicBlocks;

  const [selectedBlockId, setSelectedBlockId] = useState(activeBlocks[0]?.id || null);
  const selectedBlock = activeBlocks.find(b => b.id === selectedBlockId) || activeBlocks[0];

  // AI Prompt State
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [fidelity, setFidelity] = useState(85);
  const [creativity, setCreativity] = useState(30);

  // Canvas Theme
  const [canvasTheme, setCanvasTheme] = useState('dark');

  // Save API key changes
  const handleSaveApiKey = (newKey) => {
    setApiKey(newKey);
    if (newKey) {
      localStorage.setItem('stage_ai_api_key', newKey);
    } else {
      localStorage.removeItem('stage_ai_api_key');
    }
  };

  const handleChangeProvider = (newProvider) => {
    setApiProvider(newProvider);
    localStorage.setItem('stage_ai_provider', newProvider);
  };

  // Sync selected block when workspace switches
  useEffect(() => {
    const currentList = activeWorkspace === 'UI/UX Design' ? uiBlocks : graphicBlocks;
    if (currentList.length > 0) {
      setSelectedBlockId(currentList[0].id);
    } else {
      setSelectedBlockId(null);
    }
  }, [activeWorkspace]);

  // Update a style property of the selected block directly
  const updateSelectedStyle = (prop, value) => {
    if (!selectedBlock) return;
    setActiveBlocks(prev => prev.map(b => {
      if (b.id === selectedBlock.id) {
        return {
          ...b,
          styles: {
            ...b.styles,
            [prop]: value
          }
        };
      }
      return b;
    }));
  };

  // Update content of a block directly
  const updateBlockContent = (id, newContent) => {
    setActiveBlocks(prev => prev.map(b => b.id === id ? { ...b, content: newContent } : b));
  };

  // Add new block
  const handleAddBlock = (type) => {
    const newId = `custom-${Date.now().toString(36)}`;
    const newBlock = {
      id: newId,
      type: type,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      content: type === 'button' ? 'Action Button' : type === 'badge' ? 'FEATURED' : 'Editable Block Content',
      subContent: type === 'card' ? 'Adjust padding, radius, and colors with sliders' : '',
      styles: {
        padding: type === 'button' ? 12 : 20,
        borderRadius: brand.radius,
        backgroundColor: type === 'button' ? brand.primary : brand.cardDark,
        textColor: '#FFFFFF',
        fontSize: type === 'button' ? 14 : 20,
        width: type === 'button' ? 'auto' : '100%',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)'
      }
    };
    setActiveBlocks(prev => [...prev, newBlock]);
    setSelectedBlockId(newId);
  };

  // Delete selected block
  const handleDeleteBlock = (id) => {
    setActiveBlocks(prev => {
      const filtered = prev.filter(b => b.id !== id);
      if (selectedBlockId === id) {
        setSelectedBlockId(filtered[0]?.id || null);
      }
      return filtered;
    });
  };

  // AI Generation trigger
  const handleGenerate = async (customPrompt = prompt) => {
    const textToRun = customPrompt || prompt;
    if (!textToRun || !textToRun.trim()) return;

    setIsGenerating(true);
    try {
      const generated = await generateBlocksFromPrompt({
        prompt: textToRun,
        workspace: activeWorkspace,
        brand,
        apiKey,
        apiProvider
      });

      if (Array.isArray(generated) && generated.length > 0) {
        setActiveBlocks(generated);
        setSelectedBlockId(generated[0].id);
      }
      setPrompt('');
    } catch (err) {
      console.error('Generation failure:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#141416] text-[#D4D4D8] font-sans overflow-hidden selection:bg-red-500/30">
      
      {/* Top Navigation Bar */}
      <header className="h-12 border-b border-[#27272A] bg-[#1A1A1E] flex items-center justify-between px-3 shrink-0 relative z-40">
        <div className="flex items-center gap-3">
          {/* Left Panel Toggle */}
          <button 
            onClick={() => setLeftPanelOpen(!leftPanelOpen)}
            className={`p-1.5 rounded transition ${leftPanelOpen ? 'bg-[#2A2A2E] text-white' : 'hover:bg-[#2A2A2E] text-zinc-400'}`}
            title="Toggle Left Sidebar"
          >
            <Menu size={16} />
          </button>
          
          {/* Adobe Stage Logo */}
          <div className="flex items-center gap-2 px-2 py-1 rounded">
            <div className="w-5 h-5 rounded bg-red-600 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                <path d="M15.1 2H22V22L15.1 2ZM8.9 2H2V22L8.9 2ZM12 9.4L17.6 22H13.8L12 17.5L8.5 22H5.4L12 9.4Z"/>
              </svg>
            </div>
            <span className="font-bold text-sm text-white tracking-tight">Stage</span>
            <span className="text-[10px] font-mono font-semibold bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded">MVP</span>
          </div>

          <div className="h-4 w-px bg-[#333338] mx-1"></div>

          {/* Interactive Workspace Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-[#242428] hover:bg-[#2E2E33] text-zinc-200 border border-[#333338] transition"
            >
              {activeWorkspace} <ChevronDown size={12} className={`text-zinc-400 transition-transform ${showWorkspaceMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {showWorkspaceMenu && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-[#1E1E22] border border-[#333338] rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95">
                <button 
                  onClick={() => { setActiveWorkspace('UI/UX Design'); setShowWorkspaceMenu(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-zinc-200 hover:bg-[#2A2A2E] flex items-center justify-between"
                >
                  <span>UI/UX Design</span>
                  {activeWorkspace === 'UI/UX Design' && <Check size={12} className="text-red-500" />}
                </button>
                <button 
                  onClick={() => { setActiveWorkspace('Graphic Design'); setShowWorkspaceMenu(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-zinc-200 hover:bg-[#2A2A2E] flex items-center justify-between"
                >
                  <span>Graphic Design</span>
                  {activeWorkspace === 'Graphic Design' && <Check size={12} className="text-red-500" />}
                </button>
              </div>
            )}
          </div>

          {/* Project Title */}
          <div className="hidden md:flex items-center gap-2 text-xs text-zinc-400">
            <span>Fintech_Dashboard_v2</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#27272A] text-zinc-400 font-mono">Live Sync</span>
          </div>
        </div>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-2">
          {/* Functional: AI Model & API Key Settings */}
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-[#242428] hover:bg-[#2E2E33] border border-[#333338] text-zinc-300 hover:text-white transition"
            title="Configure AI API Key"
          >
            <Key size={13} className={apiKey ? "text-emerald-400" : "text-zinc-400"} />
            <span className="hidden sm:inline">AI Settings</span>
            {apiKey && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
          </button>

          {/* Functional: Export Code */}
          <button 
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm"
            title="Export React Code"
          >
            <Code2 size={13} />
            <span>Export Code</span>
          </button>

          <div className="h-4 w-px bg-[#333338] mx-1"></div>

          {/* Non-functional placeholder: Multi-user avatars (Greyed out for MVP roadmap) */}
          <div className="flex -space-x-1.5 opacity-40 cursor-not-allowed" title="Multiplayer Live Sync (Roadmap Y2)">
            <div className="w-6 h-6 rounded-full bg-zinc-700 border-2 border-[#1A1A1E] flex items-center justify-center text-[10px] text-zinc-300">JD</div>
            <div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-[#1A1A1E] flex items-center justify-center text-[10px] text-zinc-400">AL</div>
          </div>

          {/* Non-functional placeholder: Present & Share (Greyed out) */}
          <button className="p-1.5 text-zinc-600 cursor-not-allowed" title="Presentation Mode (Roadmap)" disabled>
            <Play size={14} />
          </button>

          {/* Right Panel Toggle */}
          <button 
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className={`p-1.5 rounded transition ${rightPanelOpen ? 'bg-[#2A2A2E] text-white' : 'hover:bg-[#2A2A2E] text-zinc-400'}`}
            title="Toggle Right Properties"
          >
            <PanelRight size={16} />
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="h-9 border-b border-[#27272A] bg-[#18181B] flex items-center justify-between px-4 shrink-0 relative z-30">
        <div className="flex items-center gap-1">
          {/* Functional Block Adders */}
          <button 
            onClick={() => handleAddBlock('card')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded hover:bg-[#27272A] text-zinc-300 transition"
            title="Add Card Block"
          >
            <Square size={13} /> Card
          </button>
          <button 
            onClick={() => handleAddBlock('button')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded hover:bg-[#27272A] text-zinc-300 transition"
            title="Add Button Block"
          >
            <Sparkles size={13} /> Button
          </button>
          <button 
            onClick={() => handleAddBlock('text')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded hover:bg-[#27272A] text-zinc-300 transition"
            title="Add Text Block"
          >
            <Type size={13} /> Text
          </button>

          <div className="w-px h-3.5 bg-[#333338] mx-2"></div>

          {/* Non-functional placeholders: Future CC Libraries & Canvas tools */}
          <button className="flex items-center gap-1 px-2 py-1 text-xs rounded text-zinc-600 cursor-not-allowed opacity-50" title="Vector Pen Tool (Roadmap)" disabled>
            <MousePointer2 size={13} /> Select
          </button>
          <button className="flex items-center gap-1 px-2 py-1 text-xs rounded text-zinc-600 cursor-not-allowed opacity-50" title="Asset Media Store (Roadmap)" disabled>
            <ImageIcon size={13} /> Stock
          </button>
          <button className="flex items-center gap-1 px-2 py-1 text-xs rounded text-zinc-600 cursor-not-allowed opacity-50" title="CC Libraries (Enterprise Integration)" disabled>
            <Folder size={13} /> CC Libraries
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-zinc-500 font-mono">
            {activeBlocks.length} Active Blocks
          </span>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Brand Guidelines & Layer Hierarchy */}
        <aside className={`border-r border-[#27272A] bg-[#18181B] flex flex-col shrink-0 relative z-20 transition-all duration-300 ease-in-out overflow-hidden ${leftPanelOpen ? 'w-[260px]' : 'w-0'}`}>
          <div className="w-[260px] flex flex-col h-full">
            
            {/* Functional: Brand Preset Selector */}
            <div className="p-3 border-b border-[#27272A]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Palette size={12} className="text-red-500" /> Active Brand DNA
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Cascading</span>
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setShowBrandMenu(!showBrandMenu)}
                  className="w-full bg-[#202024] border border-[#2E2E33] hover:border-zinc-500 rounded-lg p-2.5 text-left transition group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-zinc-200 group-hover:text-white">{brand.name}</span>
                    <ChevronDown size={12} className="text-zinc-500" />
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: brand.primary }}></div>
                    <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: brand.secondary }}></div>
                    <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: brand.cardDark }}></div>
                  </div>
                </button>

                {showBrandMenu && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-[#1C1C20] border border-[#333338] rounded-xl shadow-2xl p-1 z-50">
                    {Object.entries(BRAND_PRESETS).map(([key, b]) => (
                      <button
                        key={key}
                        onClick={() => { setSelectedBrandKey(key); setShowBrandMenu(false); }}
                        className="w-full p-2 text-left rounded-lg hover:bg-[#2A2A2E] transition flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: b.primary }}></div>
                          <span className="text-zinc-200 font-medium">{b.name}</span>
                        </div>
                        {selectedBrandKey === key && <Check size={12} className="text-red-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Functional: Dynamic Layer Tree */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Layers size={12} /> Interactive Blocks ({activeBlocks.length})
                </span>
              </div>

              <div className="space-y-1">
                {activeBlocks.map((block, idx) => (
                  <div 
                    key={block.id}
                    onClick={() => setSelectedBlockId(block.id)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition ${
                      selectedBlockId === block.id 
                        ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30' 
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#202024]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[10px] font-mono text-zinc-600">{idx + 1}</span>
                      <span className="truncate">{block.label || block.content}</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteBlock(block.id); }}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-0.5 rounded transition"
                      title="Remove Block"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Non-functional footer: Enterprise asset sync badge */}
            <div className="p-3 border-t border-[#27272A] text-[10px] text-zinc-600 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
              <span>Adobe Firefly Enterprise Guardrails active</span>
            </div>

          </div>
        </aside>

        {/* Central Canvas Area */}
        <main 
          className="flex-1 bg-[#0E0E10] relative overflow-y-auto flex flex-col items-center justify-start p-8"
          style={{ 
            backgroundImage: 'radial-gradient(#222226 1px, transparent 1px)', 
            backgroundSize: '24px 24px' 
          }}
          onClick={() => setSelectedBlockId(null)}
        >

          {/* Theme & Canvas Controls Bar */}
          <div className="w-full max-w-3xl mb-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-medium">Canvas:</span>
              <button
                onClick={() => setCanvasTheme(canvasTheme === 'dark' ? 'light' : 'dark')}
                className="text-xs px-2.5 py-1 rounded bg-[#1C1C20] hover:bg-[#25252A] border border-[#2E2E33] text-zinc-300 transition"
              >
                {canvasTheme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </button>
            </div>

            <div className="text-[11px] text-zinc-500 font-mono">
              Click any block to inspect &amp; adjust with sliders
            </div>
          </div>

          {/* The Live Interactive Artboard */}
          <div 
            className={`w-full max-w-3xl rounded-2xl shadow-2xl border transition-colors duration-500 p-8 min-h-[460px] flex flex-col gap-6 relative ${
              canvasTheme === 'dark' 
                ? 'bg-[#111114] border-[#2E2E33]' 
                : 'bg-white border-zinc-200'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Overlay Loader during AI Synthesis */}
            {isGenerating && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40 rounded-2xl flex items-center justify-center">
                <div className="bg-[#1C1C1F] border border-red-500/40 shadow-2xl rounded-full px-6 py-3 flex items-center gap-3 animate-pulse">
                  <Sparkles className="animate-spin text-red-500" size={18} />
                  <span className="text-xs font-semibold text-white font-mono">Stage AI is compiling interactive blocks...</span>
                </div>
              </div>
            )}

            {/* Render dynamic blocks */}
            {activeBlocks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-zinc-500">
                <Sparkles size={32} className="text-zinc-600 mb-3" />
                <p className="text-sm font-medium text-zinc-400">Canvas is empty</p>
                <p className="text-xs mt-1">Type a prompt below or click '+ Card' in the toolbar to begin.</p>
              </div>
            ) : (
              activeBlocks.map(block => (
                <BlockRenderer
                  key={block.id}
                  block={block}
                  isSelected={selectedBlockId === block.id}
                  onSelect={(id) => setSelectedBlockId(id)}
                  onUpdateContent={updateBlockContent}
                  activeWorkspace={activeWorkspace}
                  brand={brand}
                />
              ))
            )}
          </div>

          {/* AI Prompt Dock */}
          <div className="sticky bottom-4 mt-8 w-full max-w-2xl z-40 shadow-2xl">
            <div className="bg-[#18181B]/95 backdrop-blur-xl border border-[#333338] rounded-2xl p-3 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between pb-2 border-b border-[#27272A] mb-2 px-1">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-red-500" />
                  <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                    Stage AI Co-pilot
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {apiKey ? `${apiProvider.toUpperCase()} Live Mode` : 'Local Synthesis Mode'}
                  </span>
                </div>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                  placeholder={
                    activeWorkspace === 'UI/UX Design'
                      ? "Describe a layout... e.g. 'SaaS pricing card with 3 tiers' or 'Fintech transactions summary'"
                      : "Describe a graphic ad... e.g. 'Semi-annual product launch banner with 40% discount'"
                  }
                  className="w-full bg-[#101012] border border-[#2E2E33] rounded-xl p-3 pb-10 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-500 resize-none h-[80px]"
                />

                {/* Prompt Suggestions */}
                <div className="absolute bottom-2.5 left-2 flex gap-1.5 overflow-x-auto max-w-[calc(100%-48px)] no-scrollbar">
                  {activeWorkspace === 'UI/UX Design' ? (
                    <>
                      <button
                        onClick={() => handleGenerate("SaaS pricing subscription card")}
                        className="px-2 py-0.5 rounded-full bg-[#242428] hover:bg-[#2E2E33] border border-[#333338] text-[10px] text-zinc-300 shrink-0 transition"
                      >
                        ⚡ Pricing Card
                      </button>
                      <button
                        onClick={() => handleGenerate("Analytics performance dashboard")}
                        className="px-2 py-0.5 rounded-full bg-[#242428] hover:bg-[#2E2E33] border border-[#333338] text-[10px] text-zinc-300 shrink-0 transition"
                      >
                        ⚡ Analytics Metrics
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleGenerate("Semi-annual summer sale discount banner")}
                        className="px-2 py-0.5 rounded-full bg-[#242428] hover:bg-[#2E2E33] border border-[#333338] text-[10px] text-zinc-300 shrink-0 transition"
                      >
                        ⚡ Promo Sale
                      </button>
                      <button
                        onClick={() => handleGenerate("AI engine launch event announcement")}
                        className="px-2 py-0.5 rounded-full bg-[#242428] hover:bg-[#2E2E33] border border-[#333338] text-[10px] text-zinc-300 shrink-0 transition"
                      >
                        ⚡ Product Launch
                      </button>
                    </>
                  )}
                </div>

                {/* Submit button */}
                <button
                  onClick={() => handleGenerate()}
                  disabled={isGenerating || !prompt.trim()}
                  className={`absolute bottom-2.5 right-2 p-2 rounded-lg transition ${
                    prompt.trim() && !isGenerating 
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-500/20' 
                      : 'bg-[#242428] text-zinc-600'
                  }`}
                  title="Generate Blocks"
                >
                  <Wand2 size={14} />
                </button>
              </div>

            </div>
          </div>

        </main>

        {/* Right Sidebar: Direct Visual Property Controls (System 1 Autopilot) */}
        <aside className={`border-l border-[#27272A] bg-[#18181B] flex flex-col shrink-0 overflow-hidden relative z-20 transition-all duration-300 ease-in-out ${rightPanelOpen ? 'w-[280px]' : 'w-0'}`}>
          <div className="w-[280px] flex flex-col h-full">
            
            {/* Inspector Header */}
            <div className="px-4 py-3 border-b border-[#27272A] flex items-center justify-between">
              <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Visual Controls
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">
                No Re-Prompt
              </span>
            </div>

            {selectedBlock ? (
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                
                {/* Selected Block Info */}
                <div className="bg-[#202024] p-2.5 rounded-xl border border-[#2E2E33]">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Editing Target</span>
                  <span className="text-xs font-bold text-white">{selectedBlock.label}</span>
                </div>

                {/* Corner Radius Slider (Direct manipulation of 'the last 10%') */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-zinc-300">Corner Radius</span>
                    <span className="font-mono text-zinc-400 text-[11px]">{selectedBlock.styles.borderRadius ?? 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={selectedBlock.styles.borderRadius ?? 8}
                    onChange={(e) => updateSelectedStyle('borderRadius', parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-[#2A2A2E] rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                </div>

                {/* Padding Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-zinc-300">Inner Padding</span>
                    <span className="font-mono text-zinc-400 text-[11px]">{selectedBlock.styles.padding ?? 16}px</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="48"
                    value={selectedBlock.styles.padding ?? 16}
                    onChange={(e) => updateSelectedStyle('padding', parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-[#2A2A2E] rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                {/* Font Size Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-zinc-300">Typography Size</span>
                    <span className="font-mono text-zinc-400 text-[11px]">{selectedBlock.styles.fontSize ?? 16}px</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="48"
                    value={selectedBlock.styles.fontSize ?? 16}
                    onChange={(e) => updateSelectedStyle('fontSize', parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-[#2A2A2E] rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                {/* Background Fill (Color Picker & Presets) */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-zinc-300">Background Fill</span>
                    <span className="font-mono text-zinc-400 text-[11px]">{selectedBlock.styles.backgroundColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedBlock.styles.backgroundColor?.startsWith('#') ? selectedBlock.styles.backgroundColor : '#1E293B'}
                      onChange={(e) => updateSelectedStyle('backgroundColor', e.target.value)}
                      className="w-8 h-8 rounded border border-[#333338] bg-transparent cursor-pointer"
                    />
                    <div className="flex gap-1">
                      {[brand.primary, brand.secondary, '#1E293B', '#0F172A', '#000000', '#FFFFFF'].map((color, idx) => (
                        <button
                          key={idx}
                          onClick={() => updateSelectedStyle('backgroundColor', color)}
                          className="w-5 h-5 rounded-full border border-white/20 transition hover:scale-110"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Text Color */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-zinc-300">Text Color</span>
                    <span className="font-mono text-zinc-400 text-[11px]">{selectedBlock.styles.textColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedBlock.styles.textColor?.startsWith('#') ? selectedBlock.styles.textColor : '#FFFFFF'}
                      onChange={(e) => updateSelectedStyle('textColor', e.target.value)}
                      className="w-8 h-8 rounded border border-[#333338] bg-transparent cursor-pointer"
                    />
                    <div className="flex gap-1">
                      {['#FFFFFF', '#F8FAFC', '#94A3B8', '#0F172A', brand.primary, '#34D399'].map((color, idx) => (
                        <button
                          key={idx}
                          onClick={() => updateSelectedStyle('textColor', color)}
                          className="w-5 h-5 rounded-full border border-white/20 transition hover:scale-110"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Delete Block */}
                <div className="pt-4 border-t border-[#27272A]">
                  <button
                    onClick={() => handleDeleteBlock(selectedBlock.id)}
                    className="w-full py-1.5 px-3 rounded-lg border border-red-500/30 hover:bg-red-500/10 text-red-400 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={13} /> Remove Block
                  </button>
                </div>

              </div>
            ) : (
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center text-zinc-500">
                <MousePointer2 size={24} className="mb-2 text-zinc-600" />
                <p className="text-xs">No block selected</p>
                <p className="text-[11px] text-zinc-600 mt-1">Select any element on the canvas to edit its properties.</p>
              </div>
            )}

            {/* Non-functional placeholder: Advanced CSS & Blend Modes (Greyed out for MVP) */}
            <div className="p-3 border-t border-[#27272A] opacity-40 cursor-not-allowed">
              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                <span>Advanced Blend Modes</span>
                <span className="font-mono text-[9px]">Roadmap</span>
              </div>
            </div>

          </div>
        </aside>

      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        apiProvider={apiProvider}
        onChangeProvider={handleChangeProvider}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        blocks={activeBlocks}
        workspace={activeWorkspace}
        brand={brand}
      />

    </div>
  );
};

export default App;
