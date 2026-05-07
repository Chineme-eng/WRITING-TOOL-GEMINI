import React from 'react';

function App() {
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
      
      {/* TOP NAVIGATION BAR */}
      <header className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
        <h1 className="text-xl font-bold tracking-wide">✨ My Studio Editor</h1>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded">Undo</button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-semibold">Export</button>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT SIDEBAR (Tools) */}
        <aside className="w-64 bg-gray-800 border-r border-gray-700 p-4 flex flex-col gap-2">
          <h2 className="text-sm text-gray-400 uppercase tracking-wider mb-2">Tools</h2>
          <button className="text-left px-3 py-2 bg-gray-700 rounded hover:bg-gray-600">🖱️ Select</button>
          <button className="text-left px-3 py-2 hover:bg-gray-700 rounded">✏️ Draw</button>
          <button className="text-left px-3 py-2 hover:bg-gray-700 rounded">📝 Text</button>
          <button className="text-left px-3 py-2 hover:bg-gray-700 rounded">🖼️ Shapes</button>
        </aside>

        {/* CANVAS AREA (The middle) */}
        <main className="flex-1 bg-gray-950 flex items-center justify-center p-8 overflow-auto">
          {/* This is a placeholder box for now. We will put the real canvas here next! */}
          <div className="w-[800px] h-[600px] bg-white shadow-2xl flex items-center justify-center text-gray-400">
            Canvas will go here
          </div>
        </main>

        {/* RIGHT SIDEBAR (Properties/Layers - Optional for later) */}
        <aside className="w-64 bg-gray-800 border-l border-gray-700 p-4">
          <h2 className="text-sm text-gray-400 uppercase tracking-wider mb-2">Properties</h2>
          <p className="text-sm text-gray-500">Select an object to edit.</p>
        </aside>

      </div>
    </div>
  );
}

export default App;
