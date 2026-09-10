import React, { useState, useEffect } from 'react';
import { 
  MousePointer2, Move, Type, Square, Layout, Sparkles, 
  ChevronDown, Users, Play, Share, Layers, Palette, 
  Folder, Settings, Menu, AlignLeft, AlignCenter, AlignRight,
  Maximize, X, SlidersHorizontal, Image as ImageIcon,
  Wand2, CornerUpLeft, CornerUpRight, Check, PanelRight,
  Minus, CreditCard, ArrowRightLeft, PieChart, Search, Bell
} from 'lucide-react';
import Onboarding, { STORAGE_KEY, API_KEY_STORAGE, API_PROVIDER_STORAGE } from './components/Onboarding';
import { generateWithAI } from './services/aiService';

const App = () => {
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [activeWorkspace, setActiveWorkspace] = useState('UI/UX Design');
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  
  // Sidebar Toggle States
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  
  const [fidelity, setFidelity] = useState(80);
  const [creativity, setCreativity] = useState(30);
  const [prompt, setPrompt] = useState("");
  
  // Interactive States
  const [isGenerating, setIsGenerating] = useState(false);
  const [canvasTheme, setCanvasTheme] = useState('light');
  const [ctaStyle, setCtaStyle] = useState('blue'); // 'blue' or 'black'
  const [gdStyle, setGdStyle] = useState('modern'); // 'modern' or 'cyberpunk'
  const [aiMessage, setAiMessage] = useState(''); // status message from AI
  
  const [selectedElement, setSelectedElement] = useState('hero'); // 'hero', 'card', 'gdHeadline', 'gdShape', or dynamic ID

  // Dynamic Custom Elements State
  const [customElements, setCustomElements] = useState([]);

  // Onboarding & AI Config
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem(STORAGE_KEY));
  const [aiApiKey, setAiApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) || '');
  const [aiProvider, setAiProvider] = useState(() => localStorage.getItem(API_PROVIDER_STORAGE) || 'gemini');

  const handleOnboardingComplete = ({ apiKey, provider }) => {
    setShowOnboarding(false);
    setAiApiKey(apiKey);
    setAiProvider(provider);
  };

  // Dragging & Resizing State
  const [positions, setPositions] = useState({
    hero: { x: 0, y: 0 },
    card: { x: 0, y: 0 },
    gdHeadline: { x: 0, y: 0 },
    gdShape: { x: 0, y: 0 }
  });
  const [sizes, setSizes] = useState({}); // Stores w and h for custom shapes
  const [draggingId, setDraggingId] = useState(null);
  const [resizingId, setResizingId] = useState(null);

  const handleMouseMove = (e) => {
    const scale = 0.85; // Matches the canvas scale
    
    if (resizingId) {
      setSizes(prev => ({
        ...prev,
        [resizingId]: {
          w: Math.max(30, (prev[resizingId]?.w || 96) + (e.movementX / scale)),
          h: Math.max(30, (prev[resizingId]?.h || 96) + (e.movementY / scale))
        }
      }));
      return;
    }

    if (draggingId) {
      setPositions(prev => ({
        ...prev,
        [draggingId]: {
          x: (prev[draggingId]?.x || 0) + (e.movementX / scale),
          y: (prev[draggingId]?.y || 0) + (e.movementY / scale)
        }
      }));
    }
  };

  const handleMouseUp = () => {
    setDraggingId(null);
    setResizingId(null);
  };

  // Add Tools functionality
  const addElement = (type) => {
    const id = `custom-${Date.now()}`;
    const newEl = { id, type, ws: activeWorkspace };
    setCustomElements(prev => [...prev, newEl]);
    setPositions(prev => ({ ...prev, [id]: { x: 0, y: 0 } }));
    if (type === 'shape') {
      setSizes(prev => ({ ...prev, [id]: { w: 96, h: 96 } }));
    }
    setSelectedElement(id);
  };

  // AI Generation (real API or fallback demo)
  const handleGenerate = async (customPrompt = prompt) => {
    if (!customPrompt) return;
    setIsGenerating(true);
    setAiMessage('');

    try {
      const result = await generateWithAI(customPrompt, {
        apiKey: aiApiKey,
        provider: aiProvider,
        workspace: activeWorkspace,
        selectedElement
      });

      // Apply changes from AI response
      if (result.theme) setCanvasTheme(result.theme);
      if (result.ctaStyle) setCtaStyle(result.ctaStyle);
      if (result.gdStyle) setGdStyle(result.gdStyle);

      // Add any new elements the AI requested
      if (result.addElements && result.addElements.length > 0) {
        result.addElements.forEach(el => addElement(el.type || 'shape'));
      }

      if (result.message) setAiMessage(result.message);
    } catch (err) {
      setAiMessage('Something went wrong. Try again.');
    }

    setIsGenerating(false);
    setPrompt('');
  };

  const handleSuggestionClick = (text) => {
    setPrompt(text);
    handleGenerate(text);
  };

  // Dynamic Properties based on selection, theme, and drag/resize position
  const properties = {
    hero: { x: Math.round(232 + positions.hero.x), y: Math.round(112 + positions.hero.y), w: '280', h: '190', fill: canvasTheme === 'light' ? '2563EB' : '1E3A8A' },
    card: { x: Math.round(536 + positions.card.x), y: Math.round(112 + positions.card.y), w: '240', h: '320', fill: canvasTheme === 'light' ? 'FFFFFF' : '1E293B' },
    gdHeadline: { x: Math.round(40 + positions.gdHeadline.x), y: Math.round(96 + positions.gdHeadline.y), w: '320', h: '150', fill: canvasTheme === 'light' ? '1E1B4B' : 'FFFFFF' },
    gdShape: { x: Math.round(96 + positions.gdShape.x), y: Math.round(256 + positions.gdShape.y), w: '192', h: '192', fill: '3B82F6' }
  };

  // Fallback for dynamically added elements
  const activeProps = properties[selectedElement] || { 
    x: Math.round(100 + (positions[selectedElement]?.x || 0)), 
    y: Math.round(100 + (positions[selectedElement]?.y || 0)), 
    w: sizes[selectedElement]?.w ? Math.round(sizes[selectedElement].w) : (customElements.find(e => e.id === selectedElement)?.type === 'shape' ? '96' : 'Auto'), 
    h: sizes[selectedElement]?.h ? Math.round(sizes[selectedElement].h) : (customElements.find(e => e.id === selectedElement)?.type === 'shape' ? '96' : 'Auto'), 
    fill: canvasTheme === 'light' ? 'E5E7EB' : '334155' 
  };

  return (
    <div 
      className="flex flex-col h-screen w-full bg-[#1e1e1e] text-[#d4d4d4] font-sans overflow-hidden selection:bg-blue-500/30"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      
      {/* Onboarding Overlay */}
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}

      {/* Top Navigation Bar */}
      <header className="h-12 border-b border-[#333333] bg-[#252525] flex items-center justify-between px-3 shrink-0 relative z-40">
        <div className="flex items-center gap-4">
          {/* Left Panel Toggle */}
          <button 
            onClick={() => setLeftPanelOpen(!leftPanelOpen)}
            className={`p-1.5 rounded transition-colors ${leftPanelOpen ? 'bg-[#333333] text-white' : 'hover:bg-[#333333] text-gray-300'}`}
            title="Toggle Left Sidebar"
          >
            <Menu size={18} />
          </button>
          
          <div className="flex items-center gap-2 cursor-pointer hover:bg-[#333333] px-2 py-1 rounded transition-colors">
            {/* Authentic Adobe Logo SVG */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FF0000" d="M15.1 2H22V22L15.1 2ZM8.9 2H2V22L8.9 2ZM12 9.4L17.6 22H13.8L12 17.5L8.5 22H5.4L12 9.4Z"/>
            </svg>
            <span className="font-semibold text-sm text-gray-100">Stage</span>
          </div>

          <div className="h-4 w-px bg-[#444444] mx-1"></div>

          {/* Interactive Workspace Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-sm font-medium transition-colors ${showWorkspaceMenu ? 'bg-[#333333] text-white' : 'hover:bg-[#333333] text-gray-300'}`}
            >
              {activeWorkspace} <ChevronDown size={14} className={`text-gray-400 transition-transform ${showWorkspaceMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {showWorkspaceMenu && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-[#252525] border border-[#333333] rounded-md shadow-xl py-1 z-50">
                <button 
                  onClick={() => { setActiveWorkspace('UI/UX Design'); setSelectedElement('hero'); setShowWorkspaceMenu(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-[#333333] flex items-center justify-between"
                >
                  UI/UX Design {activeWorkspace === 'UI/UX Design' && <Check size={14} className="text-blue-500" />}
                </button>
                <button 
                  onClick={() => { setActiveWorkspace('Graphic Design'); setSelectedElement('gdHeadline'); setShowWorkspaceMenu(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-[#333333] flex items-center justify-between"
                >
                  Graphic Design {activeWorkspace === 'Graphic Design' && <Check size={14} className="text-blue-500" />}
                </button>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-[#444444] mx-1"></div>

          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span className="hover:text-white cursor-pointer px-2 py-1 rounded hover:bg-[#333333] transition-colors">Fintech_Dashboard_v2</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-[#333333] text-gray-400">Draft</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className="w-7 h-7 rounded-full bg-blue-500 border-2 border-[#252525] flex items-center justify-center text-xs text-white font-medium z-20 shadow-sm">JD</div>
            <div className="w-7 h-7 rounded-full bg-emerald-500 border-2 border-[#252525] flex items-center justify-center text-xs text-white font-medium z-10 shadow-sm">AL</div>
          </div>
          
          <div className="h-4 w-px bg-[#444444] mx-1"></div>
          
          <button className="p-1.5 rounded text-gray-300 transition-colors opacity-40 cursor-not-allowed" title="Present (Coming Soon)">
            <Play size={16} fill="currentColor" />
          </button>
          
          <button className="flex items-center gap-2 bg-blue-600/40 text-white/50 px-3 py-1.5 rounded-md text-sm font-medium cursor-not-allowed shadow-sm" title="Share (Coming Soon)">
            <Share size={14} /> Share
          </button>

          <div className="h-4 w-px bg-[#444444] mx-1"></div>

          {/* Right Panel Toggle */}
          <button 
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className={`p-1.5 rounded transition-colors ${rightPanelOpen ? 'bg-[#333333] text-white' : 'hover:bg-[#333333] text-gray-300'}`}
            title="Toggle Right Sidebar"
          >
            <PanelRight size={18} />
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="h-10 border-b border-[#333333] bg-[#1e1e1e] flex items-center justify-center gap-1 px-4 shrink-0 relative z-30">
        <ToolButton icon={<MousePointer2 size={16} />} active />
        <ToolButton icon={<Square size={16} />} onClick={() => addElement('shape')} title="Add Shape" />
        <ToolButton icon={<Type size={16} />} onClick={() => addElement('text')} title="Add Text" />
        <ToolButton icon={<Layout size={16} />} disabled title="Auto Layout (Coming Soon)" />
        <ToolButton icon={<ImageIcon size={16} />} disabled title="Image Upload (Coming Soon)" />
        <div className="w-px h-4 bg-[#444444] mx-2"></div>
        <ToolButton icon={<Folder size={16} />} disabled title="Creative Cloud Libraries (Coming Soon)" />
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar (Collapsible) */}
        <aside className={`border-r border-[#333333] bg-[#252525] flex flex-col shrink-0 relative z-20 transition-all duration-300 ease-in-out overflow-hidden ${leftPanelOpen ? 'w-[260px]' : 'w-0'}`}>
          <div className="w-[260px]"> {/* Fixed inner width to prevent content reflow during animation */}
            {/* Brand Guidelines Section */}
            <div className="p-3 border-b border-[#333333]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Palette size={12} /> Active Brand
                </span>
                <button className="p-1 rounded transition-colors opacity-40 cursor-not-allowed" title="Brand Settings (Coming Soon)"><Settings size={12} /></button>
              </div>
              <div className="bg-[#1e1e1e] border border-[#333333] rounded-md p-2 cursor-pointer hover:border-blue-500/50 transition-colors group">
                <div className="text-sm font-medium text-gray-200 mb-1.5 group-hover:text-blue-400 transition-colors">Acme Corp Global</div>
                <div className="flex gap-1">
                  <div className="w-4 h-4 rounded-full bg-[#0F172A] shadow-sm"></div>
                  <div className="w-4 h-4 rounded-full bg-[#3B82F6] shadow-sm"></div>
                  <div className="w-4 h-4 rounded-full bg-[#10B981] shadow-sm"></div>
                  <div className="w-4 h-4 rounded-full border border-[#444] bg-white shadow-sm"></div>
                </div>
                <div className="text-[10px] text-gray-500 mt-1.5">Inter, Roboto Mono</div>
              </div>
            </div>

            {/* Layers Section */}
            <div className="flex-1 overflow-y-auto h-[calc(100vh-200px)]">
              <div className="p-3">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Layers size={12} /> Layers
                </span>
                <div className="space-y-0.5">
                  {activeWorkspace === 'UI/UX Design' ? (
                    <LayerItem name="App Dashboard Canvas" type="frame" expanded>
                      <LayerItem name="App Sidebar Nav" type="group" />
                      <LayerItem name="Top Search Header" type="group" />
                      <LayerItem name="Balance Widget" type="group" selected={selectedElement === 'hero'} onClick={() => setSelectedElement('hero')} expanded>
                        <LayerItem name="Balance Value" type="text" />
                        <LayerItem name="Transfer Button" type="component" />
                      </LayerItem>
                      <LayerItem name="Transactions List" type="group" selected={selectedElement === 'card'} onClick={() => setSelectedElement('card')} expanded>
                         <LayerItem name="List Item 1" type="component" />
                         <LayerItem name="List Item 2" type="component" />
                      </LayerItem>
                      {/* Dynamic Elements in Layers */}
                      {customElements.filter(el => el.ws === 'UI/UX Design').map((el, i) => (
                         <LayerItem key={el.id} name={`Custom ${el.type === 'text' ? 'Text' : 'Shape'} ${i+1}`} type={el.type} selected={selectedElement === el.id} onClick={() => setSelectedElement(el.id)} />
                      ))}
                      <LayerItem name="Dashboard Background" type="image" />
                    </LayerItem>
                  ) : (
                    <LayerItem name="Social Media Ad" type="frame" expanded>
                      <LayerItem name="Brand Logo" type="image" />
                      <LayerItem name="Main Headline" type="text" selected={selectedElement === 'gdHeadline'} onClick={() => setSelectedElement('gdHeadline')} />
                      <LayerItem name="Abstract Shape" type="component" selected={selectedElement === 'gdShape'} onClick={() => setSelectedElement('gdShape')} />
                      {/* Dynamic Elements in Layers */}
                      {customElements.filter(el => el.ws === 'Graphic Design').map((el, i) => (
                         <LayerItem key={el.id} name={`Custom ${el.type === 'text' ? 'Text' : 'Shape'} ${i+1}`} type={el.type} selected={selectedElement === el.id} onClick={() => setSelectedElement(el.id)} />
                      ))}
                      <LayerItem name="Gradient Background" type="image" />
                    </LayerItem>
                  )}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Canvas Area */}
        <main className="flex-1 bg-[#121212] relative overflow-hidden flex items-center justify-center" style={{ backgroundImage: 'radial-gradient(#2a2a2a 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
          
          {/* Zoom controls */}
          <div className="absolute top-4 right-4 bg-[#252525] border border-[#333333] rounded-md flex items-center shadow-lg z-20">
            <button className="px-3 py-1.5 text-xs font-medium hover:bg-[#333333] border-r border-[#333333] rounded-l-md transition-colors">75%</button>
            <button className="p-1.5 hover:bg-[#333333] rounded-r-md transition-colors"><Maximize size={14} /></button>
          </div>

          {/* The Artboard / Canvas Mockup */}
          {activeWorkspace === 'UI/UX Design' ? (
            // --- NEW: FINTECH APP DASHBOARD UI ---
            <div className={`w-[800px] h-[500px] rounded-lg shadow-2xl relative overflow-hidden flex scale-[0.85] transform origin-center transition-colors duration-700 ease-in-out ${canvasTheme === 'dark' ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
              
              {/* App Sidebar */}
              <div className={`w-[200px] border-r flex flex-col p-5 transition-colors duration-700 z-10 ${canvasTheme === 'dark' ? 'border-[#1e293b] bg-[#1e293b]/50' : 'border-gray-200 bg-white'}`}>
                <div className="font-bold text-xl flex items-center gap-2 mb-8">
                  <div className={`w-6 h-6 rounded-md ${canvasTheme === 'dark' ? 'bg-blue-500' : 'bg-blue-600'}`}></div>
                  <span className={`transition-colors ${canvasTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>AcmeBank</span>
                </div>
                
                <div className="space-y-1">
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer ${canvasTheme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                    <Layout size={16} /> Dashboard
                  </div>
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer ${canvasTheme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-[#334155]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                    <CreditCard size={16} /> Cards
                  </div>
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer ${canvasTheme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-[#334155]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                    <ArrowRightLeft size={16} /> Transfers
                  </div>
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer ${canvasTheme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-[#334155]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                    <PieChart size={16} /> Analytics
                  </div>
                </div>
              </div>
              
              {/* Main Content Area */}
              <div className="flex-1 flex flex-col relative">
                
                {/* Overlay Loader for AI Generation Effect */}
                {isGenerating && (
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-50 flex items-center justify-center rounded-r-lg">
                     <div className="bg-[#1e1e1e] border border-[#444] shadow-2xl rounded-full px-6 py-3 flex items-center gap-3 animate-bounce">
                       <Sparkles className="animate-spin text-purple-500" size={20} />
                       <span className="text-sm font-medium text-white">Stage AI is generating...</span>
                     </div>
                  </div>
                )}

                {/* Top Header */}
                <div className={`h-16 border-b flex items-center justify-between px-8 transition-colors duration-700 z-10 ${canvasTheme === 'dark' ? 'border-[#1e293b]' : 'border-gray-200'}`}>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${canvasTheme === 'dark' ? 'bg-[#1e293b] text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                    <Search size={14} />
                    <span className="text-xs">Search transactions...</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Bell size={18} className={`transition-colors ${canvasTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 border-2 border-white shadow-sm"></div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="flex-1 p-8 relative">
                  <h1 
                    className={`text-2xl font-bold mb-6 transition-colors outline-none cursor-text ${canvasTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                    contentEditable
                    suppressContentEditableWarning
                  >
                    Welcome back, Alex
                  </h1>
                  
                  {/* Left Column: Balance Widget (Draggable ID: hero) */}
                  <div 
                    className={`absolute group ${draggingId === 'hero' ? 'cursor-grabbing' : 'cursor-grab'}`}
                    onClick={(e) => { e.stopPropagation(); setSelectedElement('hero'); }}
                    onMouseDown={(e) => { 
                      e.stopPropagation(); 
                      setSelectedElement('hero');
                      if (e.target.closest('[contenteditable="true"]')) return; // Allow text editing without dragging
                      setDraggingId('hero'); 
                    }}
                    style={{ transform: `translate(${positions.hero.x}px, ${positions.hero.y}px)`, left: '32px', top: '112px', zIndex: selectedElement === 'hero' ? 10 : 1 }}
                  >
                    {/* Active Selection Outline */}
                    <div className={`absolute inset-0 border-2 rounded-2xl pointer-events-none -m-2 transition-all duration-200 ${selectedElement === 'hero' ? 'border-blue-500 opacity-100' : 'border-transparent group-hover:border-blue-500/30'}`}>
                      {selectedElement === 'hero' && (
                        <>
                          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm"></div>
                          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm"></div>
                          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm"></div>
                          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm"></div>
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm whitespace-nowrap">Balance Widget</div>
                        </>
                      )}
                    </div>

                    {/* Actual Widget Content */}
                    <div className={`w-[280px] p-6 rounded-2xl shadow-xl transition-all duration-700 text-white overflow-hidden relative ${canvasTheme === 'dark' ? 'bg-gradient-to-br from-blue-800 to-indigo-900' : 'bg-gradient-to-br from-blue-600 to-blue-800'}`}>
                      <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                      
                      {/* Editable Text */}
                      <div 
                        className="text-blue-100 text-sm font-medium mb-1 relative z-10 outline-none cursor-text" 
                        contentEditable 
                        suppressContentEditableWarning
                      >
                        Total Balance
                      </div>
                      <div 
                        className="text-3xl font-bold mb-6 relative z-10 outline-none cursor-text" 
                        contentEditable 
                        suppressContentEditableWarning
                      >
                        $24,500.00
                      </div>
                      
                      <div className="flex gap-3 relative z-10 pointer-events-none">
                        {/* Dynamic CTA Button */}
                        <button className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all duration-700 shadow-md ${ctaStyle === 'black' ? 'bg-[#000000] text-white shadow-black/20' : 'bg-white text-blue-900 shadow-white/10'}`}>Transfer</button>
                        <button className="p-2 rounded-lg bg-white/20 text-white backdrop-blur-sm"><ArrowRightLeft size={16} /></button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Transactions (Draggable ID: card) */}
                  <div 
                    className={`absolute group ${draggingId === 'card' ? 'cursor-grabbing' : 'cursor-grab'}`}
                    onClick={(e) => { e.stopPropagation(); setSelectedElement('card'); }}
                    onMouseDown={(e) => { 
                      e.stopPropagation(); 
                      setSelectedElement('card');
                      if (e.target.closest('[contenteditable="true"]')) return;
                      setDraggingId('card'); 
                    }}
                    style={{ transform: `translate(${positions.card.x}px, ${positions.card.y}px)`, left: '344px', top: '112px', zIndex: selectedElement === 'card' ? 10 : 1 }}
                  >
                    {/* Active Selection Outline */}
                    <div className={`absolute inset-0 border-2 rounded-xl pointer-events-none -m-2 transition-all duration-200 ${selectedElement === 'card' ? 'border-blue-500 opacity-100' : 'border-transparent group-hover:border-blue-500/30'}`}>
                      {selectedElement === 'card' && (
                        <>
                          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm"></div>
                          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm"></div>
                          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm"></div>
                          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm"></div>
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm whitespace-nowrap">Transactions List</div>
                        </>
                      )}
                    </div>

                    {/* Actual Widget Content */}
                    <div className={`w-[240px] p-5 rounded-xl border shadow-sm transition-colors duration-700 ${canvasTheme === 'dark' ? 'bg-[#1e293b] border-[#334155]' : 'bg-white border-gray-200'}`}>
                      <h3 
                        className={`font-bold mb-4 text-sm outline-none cursor-text ${canvasTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
                        contentEditable suppressContentEditableWarning
                      >
                        Recent Activity
                      </h3>
                      <div className="space-y-4 pointer-events-none">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center"><CreditCard size={14}/></div>
                             <div>
                               <div className={`text-xs font-bold ${canvasTheme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>Apple Store</div>
                               <div className={`text-[10px] ${canvasTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Today, 2:45 PM</div>
                             </div>
                           </div>
                           <div className={`text-xs font-bold ${canvasTheme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>-$999</div>
                        </div>
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><PieChart size={14}/></div>
                             <div>
                               <div className={`text-xs font-bold ${canvasTheme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>Upwork Inc.</div>
                               <div className={`text-[10px] ${canvasTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Yesterday</div>
                             </div>
                           </div>
                           <div className="text-xs font-bold text-green-500">+$2,400</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Render Dynamically Added Elements (UI/UX) */}
                  {customElements.filter(el => el.ws === 'UI/UX Design').map(el => (
                    <div
                      key={el.id}
                      className={`absolute group ${draggingId === el.id ? 'cursor-grabbing' : 'cursor-grab'}`}
                      style={{ 
                        top: 100, left: 100, // starting point
                        transform: `translate(${positions[el.id]?.x || 0}px, ${positions[el.id]?.y || 0}px)`, 
                        zIndex: selectedElement === el.id ? 20 : 5 
                      }}
                      onClick={(e) => { e.stopPropagation(); setSelectedElement(el.id); }}
                      onMouseDown={(e) => { 
                        e.stopPropagation(); 
                        setSelectedElement(el.id);
                        if (e.target.closest('[contenteditable="true"]')) return;
                        setDraggingId(el.id); 
                      }}
                    >
                      <div className={`absolute inset-0 border-2 rounded pointer-events-none -m-1 transition-all duration-200 ${selectedElement === el.id ? 'border-blue-500 opacity-100' : 'border-transparent group-hover:border-blue-500/30'}`}>
                        {selectedElement === el.id && el.type === 'text' && (
                          <>
                            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm"></div>
                            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm"></div>
                          </>
                        )}
                      </div>
                      
                      {el.type === 'shape' ? (
                        <div 
                          className={`relative shadow-lg border border-white/10 ${canvasTheme === 'dark' ? 'bg-[#334155]' : 'bg-gray-200'}`}
                          style={{ width: sizes[el.id]?.w || 96, height: sizes[el.id]?.h || 96, borderRadius: 8 }}
                        >
                          {/* Resize Handle */}
                          {selectedElement === el.id && (
                            <div 
                              className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-se-resize shadow-md"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setResizingId(el.id);
                              }}
                            />
                          )}
                        </div>
                      ) : (
                        <div 
                          contentEditable 
                          suppressContentEditableWarning
                          className={`text-2xl font-bold whitespace-nowrap outline-none cursor-text ${canvasTheme === 'dark' ? 'text-white' : 'text-gray-800'}`}
                        >
                          Custom Text
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // --- Graphic Design Workspace Canvas ---
            <div className={`w-[400px] h-[500px] rounded-lg shadow-2xl relative overflow-hidden flex flex-col scale-[0.85] transform origin-center transition-colors duration-700 ease-in-out ${canvasTheme === 'dark' ? 'bg-gradient-to-br from-indigo-950 to-violet-950' : 'bg-gradient-to-br from-indigo-50 to-purple-100'}`}>
              
              {/* Overlay Loader for AI Generation Effect */}
              {isGenerating && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-50 flex items-center justify-center rounded-lg">
                   <div className="bg-[#1e1e1e] border border-[#444] shadow-2xl rounded-full px-6 py-3 flex items-center gap-3 animate-bounce">
                     <Sparkles className="animate-spin text-purple-500" size={20} />
                     <span className="text-sm font-medium text-white">Stage AI is generating...</span>
                   </div>
                </div>
              )}

              {/* Background abstract element (static) */}
              <div className={`absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl transition-colors duration-700 ${canvasTheme === 'dark' ? 'bg-pink-600/40' : 'bg-pink-300/50'}`}></div>
              <div className={`absolute -left-20 -bottom-20 w-64 h-64 rounded-full blur-3xl transition-colors duration-700 ${canvasTheme === 'dark' ? 'bg-blue-600/40' : 'bg-blue-300/50'}`}></div>

              {/* Brand Logo */}
              <div className="absolute top-6 left-6 flex items-center gap-2 pointer-events-none z-10">
                 <div className={`w-6 h-6 rounded-md transition-colors duration-700 ${canvasTheme === 'dark' ? 'bg-white' : 'bg-indigo-600'}`}></div>
                 <span className={`font-bold text-sm transition-colors duration-700 ${canvasTheme === 'dark' ? 'text-white' : 'text-indigo-900'}`}>ACME</span>
              </div>

              {/* Headline Text (Draggable) */}
              <div 
                className={`absolute left-10 top-24 w-[320px] group ${draggingId === 'gdHeadline' ? 'cursor-grabbing' : 'cursor-grab'}`}
                onClick={(e) => { e.stopPropagation(); setSelectedElement('gdHeadline'); }}
                onMouseDown={(e) => { 
                  e.stopPropagation(); 
                  setSelectedElement('gdHeadline');
                  if (e.target.closest('[contenteditable="true"]')) return;
                  setDraggingId('gdHeadline'); 
                }}
                style={{ transform: `translate(${positions.gdHeadline.x}px, ${positions.gdHeadline.y}px)`, zIndex: selectedElement === 'gdHeadline' ? 10 : 2 }}
              >
                <div className={`absolute inset-0 border-2 rounded pointer-events-none -m-2 transition-all duration-200 ${selectedElement === 'gdHeadline' ? 'border-blue-500 opacity-100' : 'border-transparent group-hover:border-blue-500/30'}`}>
                  {selectedElement === 'gdHeadline' && (
                    <>
                      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm"></div>
                      <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm"></div>
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm whitespace-nowrap">Main Headline</div>
                    </>
                  )}
                </div>

                {gdStyle === 'cyberpunk' ? (
                  <h2 
                    contentEditable suppressContentEditableWarning
                    className={`text-[42px] font-mono font-bold leading-none tracking-tighter outline-none cursor-text transition-all duration-700 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-500 drop-shadow-[0_0_15px_rgba(0,255,255,0.4)]`}
                  >
                    NEO-BANKING <br/>PROTOCOL <br/><span className="text-white drop-shadow-[0_0_10px_rgba(255,0,255,0.8)]">INITIATED_</span>
                  </h2>
                ) : (
                  <h2 
                    contentEditable suppressContentEditableWarning
                    className={`text-5xl font-black leading-none tracking-tight outline-none cursor-text transition-colors duration-700 ${canvasTheme === 'dark' ? 'text-white' : 'text-indigo-950'}`}
                  >
                    THE FUTURE <br/>OF DIGITAL <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">BANKING.</span>
                  </h2>
                )}
              </div>

              {/* Abstract Shape (Draggable) */}
              <div 
                className={`absolute top-64 left-24 w-48 h-48 group ${draggingId === 'gdShape' ? 'cursor-grabbing' : 'cursor-grab'}`}
                onClick={(e) => { e.stopPropagation(); setSelectedElement('gdShape'); }}
                onMouseDown={(e) => { e.stopPropagation(); setDraggingId('gdShape'); setSelectedElement('gdShape'); }}
                style={{ transform: `translate(${positions.gdShape.x}px, ${positions.gdShape.y}px)`, zIndex: selectedElement === 'gdShape' ? 10 : 2 }}
              >
                <div className={`absolute inset-0 border-2 rounded-xl pointer-events-none -m-2 transition-all duration-200 ${selectedElement === 'gdShape' ? 'border-blue-500 opacity-100' : 'border-transparent group-hover:border-blue-500/30'}`}>
                   {selectedElement === 'gdShape' && (
                    <>
                      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm"></div>
                      <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm"></div>
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm whitespace-nowrap">Abstract Shape</div>
                    </>
                  )}
                </div>
                <div className={`w-full h-full rounded-2xl backdrop-blur-md border shadow-2xl flex items-center justify-center transform transition-all duration-700 pointer-events-none ${gdStyle === 'cyberpunk' ? 'bg-black/40 border-cyan-500/50 rotate-45' : 'rotate-12 border-white/20'} ${canvasTheme === 'dark' ? (gdStyle === 'cyberpunk' ? '' : 'bg-white/10') : 'bg-white/40'}`}>
                   <div className={`w-24 h-24 rounded-full animate-pulse transition-all duration-700 ${gdStyle === 'cyberpunk' ? 'bg-gradient-to-tr from-cyan-400 to-fuchsia-500 shadow-[0_0_30px_rgba(0,255,255,0.6)] rounded-none rotate-45' : 'bg-gradient-to-tr from-blue-400 to-pink-400'}`}></div>
                </div>
              </div>

               {/* Render Dynamically Added Elements (Graphic Design) */}
               {customElements.filter(el => el.ws === 'Graphic Design').map(el => (
                  <div
                    key={el.id}
                    className={`absolute group ${draggingId === el.id ? 'cursor-grabbing' : 'cursor-grab'}`}
                    style={{ 
                      top: 100, left: 100, // starting point
                      transform: `translate(${positions[el.id]?.x || 0}px, ${positions[el.id]?.y || 0}px)`, 
                      zIndex: selectedElement === el.id ? 20 : 5 
                    }}
                    onClick={(e) => { e.stopPropagation(); setSelectedElement(el.id); }}
                    onMouseDown={(e) => { 
                      e.stopPropagation(); 
                      setSelectedElement(el.id);
                      if (e.target.closest('[contenteditable="true"]')) return;
                      setDraggingId(el.id); 
                    }}
                  >
                    <div className={`absolute inset-0 border-2 rounded pointer-events-none -m-1 transition-all duration-200 ${selectedElement === el.id ? 'border-blue-500 opacity-100' : 'border-transparent group-hover:border-blue-500/30'}`}>
                      {selectedElement === el.id && el.type === 'text' && (
                        <>
                          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm"></div>
                          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm"></div>
                        </>
                      )}
                    </div>
                    
                    {el.type === 'shape' ? (
                      <div 
                        className={`relative shadow-lg border border-white/20 backdrop-blur-md ${canvasTheme === 'dark' ? 'bg-indigo-500/50' : 'bg-white/60'}`}
                        style={{ width: sizes[el.id]?.w || 96, height: sizes[el.id]?.h || 96, borderRadius: 8 }}
                      >
                         {/* Resize Handle */}
                         {selectedElement === el.id && (
                          <div 
                            className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-se-resize shadow-md"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setResizingId(el.id);
                            }}
                          />
                        )}
                      </div>
                    ) : (
                      <div 
                        contentEditable suppressContentEditableWarning
                        className={`text-2xl font-bold whitespace-nowrap outline-none cursor-text ${canvasTheme === 'dark' ? 'text-white' : 'text-indigo-900'}`}
                      >
                        Custom Text
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* AI Prompt Interface Toggle & Panel */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center shadow-2xl z-50">
            {!showAIPanel ? (
              <button 
                onClick={() => setShowAIPanel(true)}
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[1px] rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <div className="bg-[#1e1e1e] hover:bg-[#252525] rounded-full px-6 py-3 flex items-center gap-2 transition-colors">
                  <Sparkles size={18} className="text-purple-400" />
                  <span className="font-semibold text-sm bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-400">
                    Stage AI
                  </span>
                </div>
              </button>
            ) : (
              <div className="bg-[#222222]/95 backdrop-blur-xl border border-[#444] rounded-2xl w-[560px] flex flex-col shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 ring-1 ring-white/10">
                <div className="flex items-center justify-between px-4 py-2 border-b border-[#333]">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-400" />
                    <span className="font-medium text-sm text-gray-200">Stage AI Co-pilot</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <button className="p-1 hover:bg-[#333] rounded text-gray-400 transition-colors" title="History">
                        <CornerUpLeft size={14} />
                     </button>
                     {/* Minimize Button */}
                    <button onClick={() => setShowAIPanel(false)} className="p-1 hover:bg-[#333] rounded text-gray-400 transition-colors" title="Minimize">
                      <Minus size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="p-4 flex gap-4">
                  <div className="flex-1 flex flex-col gap-3">
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
                        placeholder={`Describe what you want to create or change in the ${
                          selectedElement === 'hero' ? 'Balance Widget' : 
                          selectedElement === 'card' ? 'Transactions List' : 
                          selectedElement === 'gdHeadline' ? 'Main Headline' : 
                          selectedElement === 'gdShape' ? 'Abstract Shape' : 'selection'
                        }...`}
                        className="w-full bg-[#111] border border-[#444] rounded-lg p-3 pb-12 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none h-[110px] transition-colors"
                      />
                      
                      {/* Interactive Prompt Bubbles Inside Text Area Footer */}
                      <div className="absolute bottom-3 left-3 right-12 flex gap-2 overflow-x-auto no-scrollbar pointer-events-auto">
                        <button 
                          onClick={() => handleSuggestionClick(canvasTheme === 'light' ? "Make it dark mode" : "Make it light mode")}
                          className="flex items-center gap-1.5 shrink-0 bg-[#2a2a2a] hover:bg-[#333] border border-[#444] hover:border-purple-500/50 text-gray-300 hover:text-purple-400 transition-colors px-3 py-1.5 rounded-full text-[11px] font-medium shadow-sm"
                        >
                          <Sparkles size={10} /> {canvasTheme === 'light' ? "Make it dark mode" : "Make it light mode"}
                        </button>
                        {activeWorkspace === 'UI/UX Design' ? (
                          <button 
                            onClick={() => handleSuggestionClick("Make transfer button black")}
                            className="flex items-center gap-1.5 shrink-0 bg-[#2a2a2a] hover:bg-[#333] border border-[#444] hover:border-blue-500/50 text-gray-300 hover:text-white transition-colors px-3 py-1.5 rounded-full text-[11px] font-medium shadow-sm"
                          >
                            <Sparkles size={10} /> Make transfer button black
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleSuggestionClick("Make it cyberpunk style")}
                            className="flex items-center gap-1.5 shrink-0 bg-[#2a2a2a] hover:bg-[#333] border border-[#444] hover:border-cyan-500/50 text-gray-300 hover:text-cyan-400 transition-colors px-3 py-1.5 rounded-full text-[11px] font-medium shadow-sm"
                          >
                            <Sparkles size={10} /> Make it cyberpunk style
                          </button>
                        )}
                      </div>

                      <button 
                        onClick={() => handleGenerate()}
                        disabled={isGenerating || !prompt}
                        className={`absolute top-3 right-3 p-1.5 rounded-md transition-colors ${prompt && !isGenerating ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md' : 'bg-[#333] text-gray-500'}`}
                      >
                        <Wand2 size={16} />
                      </button>
                    </div>

                    {/* Differentiator: Temperature/Style Controls */}
                    <div className="flex flex-col gap-4 p-3 bg-[#1a1a1a] rounded-lg border border-[#333]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                           <SlidersHorizontal size={12} /> Parameters
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                            <span>Wireframe</span>
                            <span>{fidelity}% Fidelity</span>
                            <span>High-Fi</span>
                          </div>
                          <input 
                            type="range" min="0" max="100" value={fidelity} onChange={(e) => setFidelity(e.target.value)}
                            className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-purple-500" 
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                            <span>Strict (Brand)</span>
                            <span>{creativity}% Creative</span>
                            <span>Exploratory</span>
                          </div>
                          <input 
                            type="range" min="0" max="100" value={creativity} onChange={(e) => setCreativity(e.target.value)}
                            className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-blue-500" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="px-4 py-2 bg-[#1a1a1a] border-t border-[#333] flex justify-between items-center text-xs text-gray-500">
                  {aiMessage ? (
                    <span className="text-gray-400 truncate max-w-[350px]">{aiMessage}</span>
                  ) : (
                    <span></span>
                  )}
                  <span className="flex items-center gap-1 shrink-0 ml-4">
                    <span className={`w-1.5 h-1.5 rounded-full ${aiApiKey ? 'bg-green-400' : 'bg-yellow-500'}`}></span>
                    {aiApiKey ? `${aiProvider === 'gemini' ? 'Gemini' : 'OpenAI'} connected` : 'Demo mode'}
                  </span>
                </div>
              </div>
            )}
          </div>

        </main>

        {/* Right Sidebar (Traditional Properties - Collapsible) */}
        <aside className={`border-l border-[#333333] bg-[#252525] flex flex-col shrink-0 overflow-hidden relative z-20 transition-all duration-300 ease-in-out ${rightPanelOpen ? 'w-[280px]' : 'w-0'}`}>
          <div className="w-[280px]"> {/* Fixed inner width */}
            {/* Tabs */}
            <div className="flex border-b border-[#333333]">
              <button className="flex-1 py-2 text-sm font-medium text-white border-b-2 border-blue-500 transition-colors">Design</button>
              <button className="flex-1 py-2 text-sm font-medium text-gray-600 cursor-not-allowed transition-colors" title="Coming Soon">Prototype</button>
              <button className="flex-1 py-2 text-sm font-medium text-gray-600 cursor-not-allowed transition-colors" title="Coming Soon">Inspect</button>
            </div>

            <div className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-100px)]">
              
              {/* Dynamic Selection Header */}
              <div className="flex items-center justify-between text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                {selectedElement === 'hero' ? 'Balance Widget' : 
                 selectedElement === 'card' ? 'Transactions List' : 
                 selectedElement === 'gdHeadline' ? 'Main Headline' : 
                 selectedElement === 'gdShape' ? 'Abstract Shape' : 'Custom Element'}
              </div>

              {/* Alignment & Coordinates */}
              <section>
                <div className="flex justify-between mb-4">
                  <button className="p-1 hover:bg-[#333] rounded text-gray-400 transition-colors"><AlignLeft size={16}/></button>
                  <button className="p-1 hover:bg-[#333] rounded text-gray-400 transition-colors"><AlignCenter size={16}/></button>
                  <button className="p-1 hover:bg-[#333] rounded text-gray-400 transition-colors"><AlignRight size={16}/></button>
                  <div className="w-px h-4 bg-[#444] self-center"></div>
                  <button className="p-1 hover:bg-[#333] rounded text-gray-400 transition-colors"><AlignLeft size={16} className="rotate-90"/></button>
                  <button className="p-1 hover:bg-[#333] rounded text-gray-400 transition-colors"><AlignCenter size={16} className="rotate-90"/></button>
                  <button className="p-1 hover:bg-[#333] rounded text-gray-400 transition-colors"><AlignRight size={16} className="rotate-90"/></button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <NumberInput label="X" value={activeProps.x} />
                  <NumberInput label="Y" value={activeProps.y} />
                  <NumberInput label="W" value={activeProps.w} />
                  <NumberInput label="H" value={activeProps.h} />
                </div>
              </section>

              <Divider />

              {/* Layout */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-200">Layout</span>
                  <button className="p-1 hover:bg-[#333] rounded transition-colors"><Layout size={12}/></button>
                </div>
                <div className="bg-[#1e1e1e] border border-[#333] rounded p-2 flex items-center justify-between text-sm">
                  <span className="text-gray-400">Flex</span>
                  <span className="text-gray-200">
                    {selectedElement === 'hero' ? 'Column' : 
                     selectedElement === 'card' ? 'Center' : 'Absolute'}
                  </span>
                </div>
              </section>

              <Divider />

              {/* Fill */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-200">Fill</span>
                  <button className="text-lg leading-none hover:text-white transition-colors">+</button>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded border border-[#444] cursor-pointer transition-colors duration-700"
                    style={{ backgroundColor: `#${activeProps.fill}` }}
                  ></div>
                  <span className="text-sm text-gray-200 font-mono transition-colors truncate">{activeProps.fill}</span>
                  <span className="text-sm text-gray-500 ml-auto">100%</span>
                </div>
              </section>

              <Divider />

              {/* Stroke */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-200">Stroke</span>
                  <button className="text-lg leading-none hover:text-white transition-colors">+</button>
                </div>
              </section>

               <Divider />

              {/* Effects */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-200">Effects</span>
                  <button className="text-lg leading-none hover:text-white transition-colors">+</button>
                </div>
              </section>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};

// UI Helper Components
const ToolButton = ({ icon, active, title, onClick, disabled }) => (
  <button 
    title={title}
    onClick={disabled ? undefined : onClick}
    className={`p-2 rounded-md transition-colors ${
      disabled ? 'text-gray-600 cursor-not-allowed opacity-40' :
      active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-100 hover:bg-[#333333]'
    }`}
  >
    {icon}
  </button>
);

const LayerItem = ({ name, type, selected, expanded, onClick, children }) => {
  const getIcon = () => {
    switch(type) {
      case 'frame': return <Layout size={12} />;
      case 'group': return <Folder size={12} />;
      case 'text': return <Type size={12} />;
      case 'image': return <ImageIcon size={12} />;
      case 'component': return <Layers size={12} className="text-purple-400" />;
      case 'shape': return <Square size={12} />;
      default: return <Square size={12} />;
    }
  };

  return (
    <div>
      <div 
        onClick={onClick}
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer transition-colors ${selected ? 'bg-blue-600/20 text-blue-400' : 'text-gray-300 hover:bg-[#333333]'}`}
      >
        <span className="w-3 flex justify-center text-gray-500">
          {(type === 'frame' || type === 'group') && (
            <ChevronDown size={12} className={`transform transition-transform ${expanded ? '' : '-rotate-90'}`} />
          )}
        </span>
        {getIcon()}
        <span className="text-xs font-medium truncate">{name}</span>
      </div>
      {expanded && children && (
        <div className="ml-4 border-l border-[#444] pl-1 mt-0.5">
          {children}
        </div>
      )}
    </div>
  );
};

const NumberInput = ({ label, value }) => (
  <div className="flex items-center bg-[#1e1e1e] border border-[#333333] rounded hover:border-[#555] transition-colors overflow-hidden">
    <span className="text-xs text-gray-500 px-2 py-1 select-none">{label}</span>
    <input 
      type="text" 
      value={value}
      readOnly
      className="bg-transparent w-full text-sm text-gray-200 outline-none py-1 pointer-events-none"
    />
  </div>
);

const Divider = () => <div className="h-px w-full bg-[#333333]"></div>;

export default App;
