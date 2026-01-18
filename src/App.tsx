import { useState } from 'react';
import { Toaster } from './components/ui/sonner';
import { SessionWorkspace } from './components/SessionWorkspace';
import { CodexPage } from './components/CodexPage';
import { QuestLog } from './components/QuestLog';
import { DMWorkbench } from './components/DMWorkbench';
import { CampaignSearchPage } from './components/CampaignSearchPage';
import { DiceRoller } from './components/DiceRoller';
import { CombatTracker } from './components/CombatTracker';
import { RandomTables } from './components/RandomTables';
import { FloatingWindow } from './components/FloatingWindow';
import { AsciiBoxesDemo } from './components/AsciiBoxesDemo';
import { Dices, Swords, Package } from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState('dm-workbench');
  const [selectedCampaign, setSelectedCampaign] = useState({
    id: '1',
    name: 'The Lost Mines of Phandelver'
  });

  // Shared floating windows state
  const [openWindows, setOpenWindows] = useState({
    diceRoller: false,
    combatTracker: false,
    randomTables: false,
  });

  // Window z-index management
  const [windowOrder, setWindowOrder] = useState<string[]>([]);
  const baseZIndex = 1000;

  const toggleWindow = (win: keyof typeof openWindows) => {
    setOpenWindows(prev => {
      const newState = { ...prev, [win]: !prev[win] };
      // If opening, bring to front
      if (newState[win]) {
        bringWindowToFront(win);
      } else {
        // If closing, remove from order
        setWindowOrder(prev => prev.filter(w => w !== win));
      }
      return newState;
    });
  };

  const bringWindowToFront = (win: string) => {
    setWindowOrder(prev => {
      const filtered = prev.filter(w => w !== win);
      return [...filtered, win];
    });
  };

  const getZIndex = (win: string) => {
    const index = windowOrder.indexOf(win);
    return index === -1 ? baseZIndex : baseZIndex + index + 1;
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <Toaster />
      <MainContent 
        activePage={activePage}
        setActivePage={setActivePage}
        selectedCampaign={selectedCampaign}
        openWindows={openWindows}
        toggleWindow={toggleWindow}
      />
      
      {/* Floating Windows - Shared across all pages */}
      {openWindows.diceRoller && (
        <FloatingWindow
          title="Quick Dice Roller"
          icon={<Dices className="w-3 h-3" />}
          onClose={() => toggleWindow('diceRoller')}
          initialWidth={300}
          initialHeight={450}
          initialX={100}
          initialY={100}
          minWidth={280}
          minHeight={400}
          zIndex={getZIndex('diceRoller')}
          onFocus={() => bringWindowToFront('diceRoller')}
        >
          <DiceRoller />
        </FloatingWindow>
      )}
      
      {openWindows.combatTracker && (
        <FloatingWindow
          title="Combat Tracker - Encounter_01"
          icon={<Swords className="w-3 h-3" />}
          onClose={() => toggleWindow('combatTracker')}
          initialWidth={400}
          initialHeight={500}
          initialX={420}
          initialY={100}
          minWidth={350}
          minHeight={450}
          zIndex={getZIndex('combatTracker')}
          onFocus={() => bringWindowToFront('combatTracker')}
        >
          <CombatTracker />
        </FloatingWindow>
      )}
      
      {openWindows.randomTables && (
        <FloatingWindow
          title="Random Tables"
          icon={<Package className="w-3 h-3" />}
          onClose={() => toggleWindow('randomTables')}
          initialWidth={500}
          initialHeight={520}
          initialX={200}
          initialY={150}
          minWidth={450}
          minHeight={450}
          zIndex={getZIndex('randomTables')}
          onFocus={() => bringWindowToFront('randomTables')}
        >
          <RandomTables />
        </FloatingWindow>
      )}
    </div>
  );
}

function MainContent({ 
  activePage, 
  setActivePage,
  selectedCampaign, 
  openWindows,
  toggleWindow,
}: any) {
  return (
    <div className="h-full w-full flex flex-col relative overflow-hidden">
      <div className="flex-1 overflow-hidden h-full">
        {activePage === 'sessions' && (
          <SessionWorkspace 
            campaignName={selectedCampaign.name} 
            onNavigate={setActivePage}
            toggleWindow={toggleWindow}
          />
        )}
        {activePage === 'codex' && (
          <CodexPage 
            onNavigate={setActivePage}
            toggleWindow={toggleWindow}
          />
        )}
        {activePage === 'quest-log' && (
          <QuestLog 
            onNavigate={setActivePage}
            toggleWindow={toggleWindow}
          />
        )}
        {activePage === 'dm-workbench' && (
          <DMWorkbench 
            onNavigate={setActivePage}
            toggleWindow={toggleWindow}
          />
        )}
        {activePage === 'campaign-search' && (
          <CampaignSearchPage 
            onNavigate={setActivePage}
            toggleWindow={toggleWindow}
          />
        )}
        {activePage === 'ascii-boxes' && (
          <AsciiBoxesDemo />
        )}
        {activePage !== 'sessions' && activePage !== 'codex' && activePage !== 'quest-log' && activePage !== 'dm-workbench' && activePage !== 'campaign-search' && (
          <div className="h-full flex flex-col">
            {/* Placeholder Windows 95 Window for other pages */}
            <div className="bg-primary h-[20px] m-[2px] px-1 flex items-center justify-between select-none shrink-0">
              <div className="flex items-center gap-1 text-primary-foreground">
                <span className="font-bold text-[11px] leading-none mb-[1px]">D&D Chronicle Tool - [{activePage}]</span>
              </div>
              <div className="flex gap-[2px]">
                <button className="w-[14px] h-[13px] bg-muted border border-t-input border-l-input border-r-border border-b-border flex items-center justify-center">
                  <span className="text-[10px] leading-none mb-[3px] font-bold">_</span>
                </button>
                <button className="w-[14px] h-[13px] bg-muted border border-t-input border-l-input border-r-border border-b-border flex items-center justify-center">
                  <div className="w-[8px] h-[7px] border border-border mb-[1px]"></div>
                </button>
                <button className="w-[14px] h-[13px] bg-muted border border-t-input border-l-input border-r-border border-b-border flex items-center justify-center">
                  <span className="text-[12px] leading-none font-bold">×</span>
                </button>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center bg-muted border-2 border-t-input border-l-input border-r-border border-b-border m-1 shadow-[2px_2px_0_0_rgba(0,0,0,0.5)]">
              <div className="text-center">
                <div className="text-foreground mb-2 text-lg font-medium capitalize">
                  {activePage}
                </div>
                <div className="text-sm text-muted-foreground">
                  This view is not implemented in this demo
                </div>
                <button 
                  onClick={() => setActivePage('sessions')}
                  className="mt-4 px-4 py-1 bg-muted border-2 border-t-input border-l-input border-r-border border-b-border active:border-t-border active:border-l-border active:border-r-input active:border-b-input shadow-[inset_-1px_-1px_0_0_var(--border),inset_1px_1px_0_0_var(--input)]"
                >
                  Back to Sessions
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
