import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AsciiBox } from '../src/components/AsciiBox';
import '../src/index.css';
import '../src/styles/ascii.css';

const API_BASE = 'http://localhost:3005';

function BoxesAsciiDemo() {
  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <AsciiBox
            design="simple"
            content="Box 1"
            apiBaseUrl={API_BASE}
            className="h-48 bg-blue-500 rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-lg hover:bg-blue-600 transition-colors cursor-pointer"
          />
          <AsciiBox
            design="ansi-rounded"
            content="Box 2"
            apiBaseUrl={API_BASE}
            className="h-48 bg-teal-500 rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-lg hover:bg-teal-600 transition-colors cursor-pointer"
          />
          <AsciiBox
            design="parchment"
            content="Box 3 (Full Width)"
            apiBaseUrl={API_BASE}
            className="col-span-2 h-64 bg-indigo-600 rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-2xl hover:bg-indigo-700 transition-colors cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <BoxesAsciiDemo />
    </StrictMode>
  );
}
