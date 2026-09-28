import { useState } from 'react';
import { PhaserGame } from './game/PhaserGame';
import { MousePointer2, Skull, Bomb, ShieldAlert, User, Zap, Wind, Flame } from 'lucide-react';

function App() {
  const [currentTool, setCurrentTool] = useState('inspect');

  const tools = [
    { id: 'inspect', label: 'Inspect / Pan', icon: <MousePointer2 size={20} /> },
    { id: 'skibidi', label: 'Spawn Skibidi', icon: <User size={20} className="text-gray-300" /> },
    { id: 'chad', label: 'Spawn GigaChad', icon: <User size={20} className="text-blue-400" /> },
    { id: 'epstein', label: 'Epstein Island', icon: <ShieldAlert size={20} className="text-yellow-500" /> },
    { id: 'tornado', label: 'Tornado', icon: <Wind size={20} className="text-teal-300" /> },
    { id: 'meteor', label: 'Meteorite', icon: <Flame size={20} className="text-orange-500" /> },
    { id: 'cancel', label: 'Cancel Culture', icon: <Skull size={20} className="text-red-400" /> },
    { id: 'nuke', label: 'Ratio Nuke', icon: <Bomb size={20} className="text-red-600" /> },
  ];

  return (
    <div className="w-screen h-screen overflow-hidden relative bg-black">
      {/* Game Canvas */}
      <PhaserGame currentTool={currentTool} />

      {/* UI Overlay */}
      <div className="absolute inset-x-0 bottom-8 flex justify-center pointer-events-none z-10">
        <div className="glass px-6 py-4 rounded-2xl flex gap-4 pointer-events-auto shadow-2xl items-center flex-wrap max-w-full justify-center">
          <div className="mr-4 pr-4 border-r border-slate-700/50 hidden md:block">
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent whitespace-nowrap">
              Brainrot WorldBox
            </h1>
            <p className="text-xs text-slate-400">Premium Sandbox Engine</p>
          </div>
          
          <div className="flex gap-2 flex-wrap justify-center">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setCurrentTool(tool.id)}
                className={`flex flex-col items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
                  currentTool === tool.id
                    ? 'bg-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-indigo-400/50'
                    : 'hover:bg-slate-700/50 border border-transparent'
                }`}
              >
                {tool.icon}
                <span className="text-[10px] sm:text-xs font-medium tracking-wide text-slate-200">
                  {tool.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Help text */}
      <div className="absolute top-4 left-4 glass px-4 py-3 rounded-xl shadow-lg z-10 text-sm text-slate-300 pointer-events-none">
        <p className="mb-1"><span className="text-indigo-400 font-bold">Left Click:</span> Use selected tool</p>
        <p className="mb-1"><span className="text-indigo-400 font-bold">Drag:</span> Pan camera (Inspect mode)</p>
        <p><span className="text-indigo-400 font-bold">Scroll:</span> Zoom in/out</p>
      </div>
    </div>
  );
}

export default App;
