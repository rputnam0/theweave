import { useState } from "react";
import { 
  Home, Info, ScrollText, Search, Terminal, 
  Dices, Swords, Package, Upload 
} from 'lucide-react';
import { 
  Win95Toolbar, Win95Button, Win95Separator, 
  Win95MenuBar, Win95MenuItem, Win95Window
} from './ui/Win95Primitives';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { UserMenuDialog } from './UserMenuDialog';

interface CampaignNavigationProps {
  activePage: string;
  onNavigate: (page: string) => void;
  toggleWindow: (win: 'diceRoller' | 'combatTracker' | 'randomTables') => void;
  pageTitle?: string;
  menuItems?: React.ReactNode;
}

export function CampaignNavigation({ 
  activePage, 
  onNavigate, 
  toggleWindow,
  pageTitle = "D&D Chronicle Tool",
  menuItems
}: CampaignNavigationProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const getPageIcon = () => {
    switch(activePage) {
      case 'sessions': return <ScrollText className="w-3.5 h-3.5" />;
      case 'codex': return <Info className="w-3.5 h-3.5" />;
      case 'quest-log': return <ScrollText className="w-3.5 h-3.5" />;
      case 'campaign-search': return <Search className="w-3.5 h-3.5" />;
      case 'dm-workbench': return <Terminal className="w-3.5 h-3.5" />;
      default: return <Terminal className="w-3.5 h-3.5" />;
    }
  };

  return (
    <>
      {/* Title Bar */}
      <div className="bg-primary h-[20px] m-[2px] px-1 flex items-center justify-between select-none shrink-0">
        <div className="flex items-center gap-1 text-primary-foreground">
          {getPageIcon()}
          <span className="font-bold text-[11px] leading-none mb-[1px] font-medium">{pageTitle}</span>
        </div>
        <div className="flex gap-[2px]">
          <button className="w-[14px] h-[13px] bg-muted border border-t-input border-l-input border-r-border border-b-border flex items-center justify-center active:shadow-[inset_1px_1px_0_0_var(--border)]">
            <span className="text-[10px] leading-none mb-[3px] font-bold">_</span>
          </button>
          <button className="w-[14px] h-[13px] bg-muted border border-t-input border-l-input border-r-border border-b-border flex items-center justify-center active:shadow-[inset_1px_1px_0_0_var(--border)]">
            <div className="relative w-[9px] h-[8px] mb-[1px]">
              <div className="absolute top-0 right-0 w-[6px] h-[5px] border-t-2 border-l border-r border-b border-border"></div>
              <div className="absolute bottom-0 left-0 w-[6px] h-[5px] border-t-2 border-l border-r border-b border-border bg-muted z-10"></div>
            </div>
          </button>
          <button className="w-[14px] h-[13px] bg-muted border border-t-input border-l-input border-r-border border-b-border flex items-center justify-center active:shadow-[inset_1px_1px_0_0_var(--border)]">
            <span className="text-[12px] leading-none font-bold">×</span>
          </button>
        </div>
      </div>

      {/* Menu Bar */}
      <Win95MenuBar className="border-b-0 px-0 h-[20px] py-0 items-center">
        {menuItems}
        
        {/* User Profile */}
        <div className="ml-auto flex items-center gap-2 pr-1">
          <div className="w-2 h-2 bg-[#008000] shadow-[inset_-1px_-1px_0_0_#004000,inset_1px_1px_0_0_#00ff00]"></div>
          <button 
            onClick={() => setUserMenuOpen(true)}
            className="text-[10px] font-bold select-none hover:text-primary cursor-pointer"
          >
            DM_REX (ADMIN)
          </button>
        </div>
      </Win95MenuBar>
      
      {/* Menu/Toolbar Separator */}
      <div className="h-[2px] border-t border-t-muted-foreground border-b border-b-input mx-[2px]" />

      {/* Icon Toolbar */}
      <Win95Toolbar className="py-[2px] px-1 gap-2 shadow-none h-[30px] items-center">
        {/* Navigation Group */}
        <div className="flex gap-0">
          <Win95Button 
            onClick={() => onNavigate('sessions')}
            title="Sessions" 
            className={`min-w-[26px] w-[26px] h-[26px] p-0 flex items-center justify-center ${activePage === 'sessions' ? 'bg-muted border-t-muted-foreground border-l-muted-foreground border-r-input border-b-input shadow-[inset_1px_1px_0_0_var(--border)]' : ''}`}
          >
            <Home className="w-4 h-4" />
          </Win95Button>
          <Win95Button 
            onClick={() => onNavigate('codex')}
            title="Codex" 
            className={`min-w-[26px] w-[26px] h-[26px] p-0 flex items-center justify-center ${activePage === 'codex' ? 'bg-muted border-t-muted-foreground border-l-muted-foreground border-r-input border-b-input shadow-[inset_1px_1px_0_0_var(--border)]' : ''}`}
          >
            <Info className="w-4 h-4" />
          </Win95Button>
        </div>
        <Win95Separator className="h-[24px] mx-0.5" />
        {/* History Group */}
        <div className="flex gap-0">
          <Win95Button 
            onClick={() => onNavigate('quest-log')}
            title="Quest Log" 
            className={`min-w-[26px] w-[26px] h-[26px] p-0 flex items-center justify-center ${activePage === 'quest-log' ? 'bg-muted border-t-muted-foreground border-l-muted-foreground border-r-input border-b-input shadow-[inset_1px_1px_0_0_var(--border)]' : ''}`}
          >
            <ScrollText className="w-4 h-4" />
          </Win95Button>
          <Win95Button 
            title="Campaign Search" 
            className={`min-w-[26px] w-[26px] h-[26px] p-0 flex items-center justify-center ${activePage === 'campaign-search' ? 'bg-muted border-t-muted-foreground border-l-muted-foreground border-r-input border-b-input shadow-[inset_1px_1px_0_0_var(--border)]' : ''}`} 
            onClick={() => onNavigate('campaign-search')}
          >
            <Search className={`w-4 h-4 ${activePage === 'campaign-search' ? 'text-blue-600' : ''}`} />
          </Win95Button>
          <Win95Button 
            onClick={() => onNavigate('dm-workbench')}
            title="DM Workbench" 
            className={`min-w-[26px] w-[26px] h-[26px] p-0 flex items-center justify-center ${activePage === 'dm-workbench' ? 'bg-muted border-t-muted-foreground border-l-muted-foreground border-r-input border-b-input shadow-[inset_1px_1px_0_0_var(--border)]' : ''}`}
          >
            <Terminal className="w-4 h-4" />
          </Win95Button>
        </div>
        <Win95Separator className="h-[24px] mx-0.5" />
        {/* Tools Group */}
        <div className="flex gap-0">
          <Win95Button title="Dice Roller" className="min-w-[26px] w-[26px] h-[26px] p-0 flex items-center justify-center" onClick={() => toggleWindow('diceRoller')}>
            <Dices className="w-4 h-4 text-red-700" />
          </Win95Button>
          <Win95Button title="Combat Tracker" className="min-w-[26px] w-[26px] h-[26px] p-0 flex items-center justify-center" onClick={() => toggleWindow('combatTracker')}>
            <Swords className="w-4 h-4 text-blue-800" />
          </Win95Button>
          <Win95Button title="Random Tables" className="min-w-[26px] w-[26px] h-[26px] p-0 flex items-center justify-center" onClick={() => toggleWindow('randomTables')}>
            <Package className="w-4 h-4 text-purple-700" />
          </Win95Button>
        </div>
        
        {/* Spacer to push Load Session to the right */}
        <div className="flex-1" />
      </Win95Toolbar>

      <div className="h-[2px] border-t border-t-muted-foreground border-b border-b-input" />
      
      <UserMenuDialog 
        isOpen={userMenuOpen} 
        onClose={() => setUserMenuOpen(false)} 
        onNavigate={onNavigate} 
      />
    </>
  );
}
