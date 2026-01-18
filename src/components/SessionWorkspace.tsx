import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FolderOpen, Save, Printer, Scissors, Copy, Clipboard, Search, Settings, HelpCircle,
  Play, SquarePen, ChevronsUpDown, Check, Zap, Trash2, FileDown, GitCompare, Info,
  MoreHorizontal, FileText, Box, ScrollText, Swords, Dices, Terminal, ChevronDown,
  AlertTriangle, CornerLeftUp, Home, ChevronLeft, ChevronRight, XCircle, RefreshCw,
  FolderSearch, Star, Type, Baseline, Upload, Package
} from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { cn } from './ui/utils';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent,
} from './ui/dropdown-menu';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from "./ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { SessionNotesPanel } from './inspectors/SessionNotesPanel';
import { OverviewMode, OverviewSidebar } from './modes/OverviewMode';
import { ArtifactsMode } from './modes/ArtifactsMode';
import { TranscriptMode } from './modes/TranscriptMode';
import dragonAscii from 'figma:asset/2581b88cdeb9018ce6635f351816b3af7eafeaac.png';
import { 
  Win95Tab, Win95Toolbar, Win95Button,
  Win95Separator, Win95MenuItem, Win95StartButton, Win95TaskbarItem, Win95Panel
} from './ui/Win95Primitives';
import { CampaignNavigation } from './CampaignNavigation';
import { DiceRoller } from './DiceRoller';
import { CombatTracker } from './CombatTracker';

interface Run {
  id: string;
  status: 'running' | 'completed' | 'partial' | 'failed';
  createdAt: string;
  duration?: string;
  usage?: string;
  isCurrent: boolean;
  error?: string;
}

interface Session {
  id: string;
  title: string;
  date: string;
  number: number;
  runs: Run[];
}

interface SessionWorkspaceProps {
  campaignName: string;
  onNavigate: (page: string) => void;
  toggleWindow: (win: 'diceRoller' | 'combatTracker' | 'randomTables') => void;
}

export function SessionWorkspace({ campaignName, onNavigate, toggleWindow }: SessionWorkspaceProps) {
  const [mode, setMode] = useState<'overview' | 'artifacts' | 'transcript'>('transcript');
  const [highlightedTimestamp, setHighlightedTimestamp] = useState<string | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const inspectorRef = useRef<HTMLDivElement>(null);
  const [artifactsDropdownOpen, setArtifactsDropdownOpen] = useState(false);
  const [artifactsSection, setArtifactsSection] = useState<string | null>(null);
  
  useEffect(() => {
    if (mode !== 'transcript') {
      setHighlightedTimestamp(null);
    }
  }, [mode]);

  // Campaign State
  const campaigns = [
    { id: 'c1', name: 'Lost Mine of Phandelver' },
    { id: 'c2', name: 'Curse of Strahd' },
    { id: 'c3', name: 'Waterdeep: Dragon Heist' },
  ];
  const [openCampaign, setOpenCampaign] = useState(false);
  const [openSession, setOpenSession] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(campaigns[0]);

  // Mock data
  const sessions: Session[] = [
    {
      id: 's55',
      title: 'Showdown at the Spire',
      date: 'Jan 15, 2026',
      number: 55,
      runs: [{ id: 'r55-1', status: 'completed', createdAt: 'Jan 15, 8:45 PM', isCurrent: true }],
    },
    {
      id: 's54',
      title: 'The Whispering Caverns',
      date: 'Jan 08, 2026',
      number: 54,
      runs: [{ id: 'r54-1', status: 'failed', createdAt: 'Jan 08, 9:00 PM', isCurrent: true }],
    },
    {
      id: 's53',
      title: 'Negotiations with the Drow',
      date: 'Jan 01, 2026',
      number: 53,
      runs: [{ id: 'r53-1', status: 'partial', createdAt: 'Jan 01, 7:30 PM', isCurrent: true }],
    },
    {
      id: 's52',
      title: 'Arrival at Undermountain',
      date: 'Dec 18, 2025',
      number: 52,
      runs: [{ id: 'r52-1', status: 'completed', createdAt: 'Dec 18, 8:15 PM', isCurrent: true }],
    }
  ];

  const [selectedSessionId, setSelectedSessionId] = useState('s54');
  const selectedSession = sessions.find(s => s.id === selectedSessionId);

  // Click-away logic for Inspector
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!inspectorOpen) return;
      
      const target = event.target as Node;
      const isInsideInspector = inspectorRef.current?.contains(target);
      const navSelectors = document.getElementById('top-nav-selectors');
      const isInsideNav = navSelectors?.contains(target);
      const toggleBtn = document.getElementById('session-notes-toggle');
      const isInsideToggle = toggleBtn?.contains(target);
      const isInsidePopover = (event.target as HTMLElement).closest('[role="dialog"]') || 
                               (event.target as HTMLElement).closest('[data-radix-popper-content-wrapper]');

      if (!isInsideInspector && !isInsideNav && !isInsideToggle && !isInsidePopover) {
        setInspectorOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [inspectorOpen]);

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    alert("Session saved successfully!");
  };

  const handleExit = () => {
    onNavigate('sessions');
  };

  const menuItems = (
    <>
      {/* FILE MENU */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Win95MenuItem className="data-[state=open]:bg-primary data-[state=open]:text-primary-foreground focus:outline-none focus:ring-0"><u>F</u>ile</Win95MenuItem>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={0} className="w-[160px] bg-background border border-t-input border-l-input border-r-border border-b-border p-0 rounded-none shadow-[inset_1px_1px_0_0_var(--input),inset_-1px_-1px_0_0_var(--muted-foreground)]">
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => alert("New Session created!")}
          >
            <span className="relative z-10"><u>N</u>ew</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => setOpenSession(true)}
          >
            <span className="relative z-10"><u>O</u>pen...</span>
          </DropdownMenuItem>
          <div className="h-[2px] border-t border-t-muted-foreground border-b border-b-input my-1 mx-1" />
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => alert("Upload Audio dialog")}
          >
            <span className="relative z-10"><u>U</u>pload Audio File...</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => alert("Upload Transcript dialog")}
          >
            <span className="relative z-10">Upload <u>T</u>ranscript...</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => alert("Import URL dialog")}
          >
            <span className="relative z-10"><u>I</u>mport from URL...</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={handleSave}
          >
            <span className="relative z-10"><u>S</u>ave</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => alert("Save As dialog placeholder")}
          >
            <span className="relative z-10">Save <u>A</u>s...</span>
          </DropdownMenuItem>
          <div className="h-[2px] border-t border-t-muted-foreground border-b border-b-input my-1 mx-1" />
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => alert("Page Setup dialog placeholder")}
          >
            <span className="relative z-10">Page Set<u>u</u>p...</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={handlePrint}
          >
            <span className="relative z-10"><u>P</u>rint</span>
          </DropdownMenuItem>
          <div className="h-[2px] border-t border-t-muted-foreground border-b border-b-input my-1 mx-1" />
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={handleExit}
          >
            <span className="relative z-10">E<u>x</u>it</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* EDIT MENU */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Win95MenuItem className="data-[state=open]:bg-primary data-[state=open]:text-primary-foreground focus:outline-none focus:ring-0"><u>E</u>dit</Win95MenuItem>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={0} className="w-[180px] bg-background border border-t-input border-l-input border-r-border border-b-border p-0 rounded-none shadow-[inset_1px_1px_0_0_var(--input),inset_-1px_-1px_0_0_var(--muted-foreground)]">
          <DropdownMenuItem disabled className="focus:bg-transparent focus:text-muted-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative text-muted-foreground disabled:opacity-100 flex justify-between w-full"><span className="drop-shadow-[1px_1px_0_var(--input)]"><u>U</u>ndo</span><span className="drop-shadow-[1px_1px_0_var(--input)]">Ctrl+Z</span></DropdownMenuItem>
          <div className="h-[2px] border-t border-t-muted-foreground border-b border-b-input my-1 mx-1" />
          <DropdownMenuItem disabled className="focus:bg-transparent focus:text-muted-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative text-muted-foreground disabled:opacity-100 flex justify-between w-full"><span className="drop-shadow-[1px_1px_0_var(--input)]">Cu<u>t</u></span><span className="drop-shadow-[1px_1px_0_var(--input)]">Ctrl+X</span></DropdownMenuItem>
          <DropdownMenuItem disabled className="focus:bg-transparent focus:text-muted-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative text-muted-foreground disabled:opacity-100 flex justify-between w-full"><span className="drop-shadow-[1px_1px_0_var(--input)]"><u>C</u>opy</span><span className="drop-shadow-[1px_1px_0_var(--input)]">Ctrl+C</span></DropdownMenuItem>
          <DropdownMenuItem disabled className="focus:bg-transparent focus:text-muted-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative text-muted-foreground disabled:opacity-100 flex justify-between w-full"><span className="drop-shadow-[1px_1px_0_var(--input)]"><u>P</u>aste</span><span className="drop-shadow-[1px_1px_0_var(--input)]">Ctrl+V</span></DropdownMenuItem>
          <DropdownMenuItem disabled className="focus:bg-transparent focus:text-muted-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative text-muted-foreground disabled:opacity-100"><span className="drop-shadow-[1px_1px_0_var(--input)]">Paste <u>S</u>hortcut</span></DropdownMenuItem>
          <div className="h-[2px] border-t border-t-muted-foreground border-b border-b-input my-1 mx-1" />
          <DropdownMenuItem className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative flex justify-between w-full"><span className="relative z-10">Select <u>A</u>ll</span><span className="relative z-10">Ctrl+A</span></DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"><span className="relative z-10"><u>I</u>nvert Selection</span></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* VIEW MENU */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Win95MenuItem className="data-[state=open]:bg-primary data-[state=open]:text-primary-foreground focus:outline-none focus:ring-0"><u>V</u>iew</Win95MenuItem>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={0} className="w-[180px] bg-background border border-t-input border-l-input border-r-border border-b-border p-0 rounded-none shadow-[inset_1px_1px_0_0_var(--input),inset_-1px_-1px_0_0_var(--muted-foreground)]">
          <DropdownMenuItem className="group focus:bg-primary focus:text-primary-foreground rounded-none pl-6 pr-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"><span className="relative z-10"><u>T</u>oolbar</span></DropdownMenuItem>
          <DropdownMenuItem className="group focus:bg-primary focus:text-primary-foreground rounded-none pl-6 pr-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative">
            <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 flex items-center justify-center text-foreground group-focus:text-primary-foreground group-data-[state=open]:text-primary-foreground"><Check className="w-3 h-3" strokeWidth={3} /></span>
            <span className="relative z-10">Status <u>B</u>ar</span>
          </DropdownMenuItem>
          <div className="h-[2px] border-t border-t-muted-foreground border-b border-b-input my-1 mx-1" />
          <DropdownMenuItem 
            className="group focus:bg-primary focus:text-primary-foreground rounded-none pl-6 pr-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => setMode('overview')}
          >
            {mode === 'overview' && <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-foreground group-focus:bg-primary-foreground group-data-[state=open]:bg-primary-foreground shadow-none border-none"></span>}
            <span className="relative z-10">Overview Mode</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="group focus:bg-primary focus:text-primary-foreground rounded-none pl-6 pr-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => setMode('artifacts')}
          >
             {mode === 'artifacts' && <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-foreground group-focus:bg-primary-foreground group-data-[state=open]:bg-primary-foreground shadow-none border-none"></span>}
            <span className="relative z-10">Artifacts Mode</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="group focus:bg-primary focus:text-primary-foreground rounded-none pl-6 pr-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => setMode('transcript')}
          >
             {mode === 'transcript' && <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-foreground group-focus:bg-primary-foreground group-data-[state=open]:bg-primary-foreground shadow-none border-none"></span>}
            <span className="relative z-10">Transcript Mode</span>
          </DropdownMenuItem>
          <div className="h-[2px] border-t border-t-muted-foreground border-b border-b-input my-1 mx-1" />
          <DropdownMenuItem 
            className="group focus:bg-primary focus:text-primary-foreground rounded-none pl-6 pr-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => setInspectorOpen(!inspectorOpen)}
          >
            <span className="relative z-10">Toggle <u>I</u>nspector</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Win95MenuItem>Fa<u>v</u>orites</Win95MenuItem>

      {/* HELP MENU */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Win95MenuItem className="data-[state=open]:bg-primary data-[state=open]:text-primary-foreground focus:outline-none focus:ring-0"><u>H</u>elp</Win95MenuItem>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={0} className="w-[180px] bg-background border border-t-input border-l-input border-r-border border-b-border p-0 rounded-none shadow-[inset_1px_1px_0_0_var(--input),inset_-1px_-1px_0_0_var(--muted-foreground)]">
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => alert("Dungeon Master's Terminal v1.0\nCreated by DM Tech")}
          >
            <span className="relative z-10"><u>H</u>elp Topics</span>
          </DropdownMenuItem>
          <div className="h-[2px] border-t border-t-muted-foreground border-b border-b-input my-1 mx-1" />
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => alert("D&D Chronicle Tool\nVersion 1.0.4 (Build 95)\n\nLicense: OGL\nDeveloper: Wizards of the Coast")}
          >
            <span className="relative z-10"><u>A</u>bout D&D Chronicle Tool</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  return (
    <div className="h-full flex flex-col bg-background text-foreground overflow-hidden border-2 border-t-input border-l-input border-r-border border-b-border shadow-[1px_1px_0_0_var(--border)]">
      
      <CampaignNavigation 
        activePage="sessions"
        onNavigate={onNavigate}
        toggleWindow={toggleWindow}
        pageTitle="D&D Chronicle Tool - [Sessions]"
        menuItems={menuItems}
      />

      {/* Control Bar (Campaign/Session/Tabs) */}
      <Win95Toolbar className="py-[2px] px-1 gap-2 h-[30px] flex items-center bg-background border-b border-muted-foreground/30 shadow-none overflow-hidden">
        <div className="flex items-center gap-2 shrink-0" id="top-nav-selectors">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold whitespace-nowrap uppercase tracking-tighter">CAMPAIGN:</span>
            <Popover open={openCampaign} onOpenChange={setOpenCampaign}>
              <PopoverTrigger asChild>
                <div className="bg-input border border-t-muted-foreground border-l-muted-foreground border-r-input border-b-input shadow-[inset_1px_1px_0_0_var(--border)] flex items-center justify-between min-w-[160px] h-[20px] px-1 cursor-pointer">
                  <span className="truncate text-[11px]">{selectedCampaign.name}</span>
                  <div className="bg-muted border border-t-input border-l-input border-r-border border-b-border w-4 h-full flex items-center justify-center -mr-1"><ChevronDown className="h-3 w-3" /></div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0 border-2 border-t-input border-l-input border-r-border border-b-border bg-background">
                <Command className="bg-background">
                  <CommandList>
                    <CommandGroup>
                      {campaigns.map((campaign) => (
                        <CommandItem key={campaign.id} value={campaign.name} onSelect={() => { setSelectedCampaign(campaign); setOpenCampaign(false); }} className="text-xs">{campaign.name}</CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold whitespace-nowrap uppercase tracking-tighter">SESSION:</span>
            <Popover open={openSession} onOpenChange={setOpenSession}>
              <PopoverTrigger asChild>
                <div className="bg-input border border-t-muted-foreground border-l-muted-foreground border-r-input border-b-input shadow-[inset_1px_1px_0_0_var(--border)] flex items-center justify-between min-w-[200px] h-[20px] px-1 cursor-pointer">
                  <span className="truncate text-[11px]">{selectedSession?.title} (#{selectedSession?.number})</span>
                  <div className="bg-muted border border-t-input border-l-input border-r-border border-b-border w-4 h-full flex items-center justify-center -mr-1"><ChevronDown className="h-3 w-3" /></div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0 border-2 border-t-input border-l-input border-r-border border-b-border bg-background">
                <Command className="bg-background">
                  <CommandInput placeholder="Search sessions..." className="h-8 text-xs" />
                  <CommandList>
                    <CommandEmpty>No session found.</CommandEmpty>
                    <CommandGroup>
                      {sessions.map((session) => (
                        <CommandItem key={session.id} value={session.title} onSelect={() => { setSelectedSessionId(session.id); setOpenSession(false); }} className="text-xs">
                          <span className="w-6 mr-2 text-muted-foreground">#{session.number}</span>
                          <span>{session.title}</span>
                          <span className="ml-auto text-muted-foreground text-[10px]">{session.date}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Win95Separator className="h-[20px] mx-1" />

        {/* View Mode Buttons */}
        <div className="flex items-center gap-1 h-full">
          <Win95Button
            onClick={() => setMode('overview')}
            className={cn(
              "h-[26px] px-3 flex items-center gap-1.5 text-[11px]",
              mode === 'overview' && "bg-muted border-t-muted-foreground border-l-muted-foreground border-r-input border-b-input shadow-[inset_1px_1px_0_0_var(--border)]"
            )}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Overview
          </Win95Button>
          <Win95Button
            onClick={() => setMode('artifacts')}
            className={cn(
              "h-[26px] px-3 flex items-center gap-1.5 text-[11px]",
              mode === 'artifacts' && "bg-muted border-t-muted-foreground border-l-muted-foreground border-r-input border-b-input shadow-[inset_1px_1px_0_0_var(--border)]"
            )}
          >
            <Box className="w-3.5 h-3.5" />
            Artifacts
          </Win95Button>
          <Win95Button
            onClick={() => setMode('transcript')}
            className={cn(
              "h-[26px] px-3 flex items-center gap-1.5 text-[11px]",
              mode === 'transcript' && "bg-muted border-t-muted-foreground border-l-muted-foreground border-r-input border-b-input shadow-[inset_1px_1px_0_0_var(--border)]"
            )}
          >
            <ScrollText className="w-3.5 h-3.5" />
            Transcript
          </Win95Button>
        </div>

        {/* Spacer to push settings button to the right */}
        <div className="flex-1" />

        {/* Settings/Inspector Toggle Button */}
        <Win95Button
          id="session-notes-toggle"
          variant="toolbar"
          onClick={() => setInspectorOpen(!inspectorOpen)}
          className={cn(
            "min-w-[26px] w-[26px] h-[26px] p-0 flex items-center justify-center",
            inspectorOpen && "bg-muted border-t-muted-foreground border-l-muted-foreground border-r-input border-b-input shadow-[inset_1px_1px_0_0_var(--border)]"
          )}
          title="Toggle Session Inspector"
        >
          <SquarePen className={cn(
            "w-4 h-4",
            inspectorOpen ? "text-primary" : "text-muted-foreground"
          )} />
        </Win95Button>
      </Win95Toolbar>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden bg-background relative border-t-2 border-t-input">
        
        {/* Main Workspace */}
        <div className="flex-1 flex overflow-hidden">
          {mode === 'overview' && (
            <OverviewMode 
              selectedSession={selectedSession!}
              onInspectorOpen={() => setInspectorOpen(true)}
            />
          )}
          
          {mode === 'artifacts' && (
            <ArtifactsMode 
              selectedSession={selectedSession!}
            />
          )}
          
          {mode === 'transcript' && (
            <TranscriptMode 
              selectedSession={selectedSession!}
              highlightedTimestamp={highlightedTimestamp}
              onTimestampClick={setHighlightedTimestamp}
            />
          )}
        </div>

        {/* Right Sidebar - Inspector */}
        <div className={cn(
          "w-[300px] border-l-2 border-l-muted-foreground bg-muted flex flex-col transition-all duration-300 ease-in-out absolute right-0 top-0 bottom-0 z-20 shadow-[-2px_0_5px_rgba(0,0,0,0.1)]",
          inspectorOpen ? "translate-x-0" : "translate-x-full hidden"
        )} ref={inspectorRef}>
          
          {/* Inspector Header */}
          <div className="h-[24px] bg-primary px-2 flex items-center justify-between shrink-0 border-b border-b-input">
            <span className="text-primary-foreground font-bold text-[11px] uppercase tracking-wider">
              Session Notes
            </span>
            <button 
              onClick={() => setInspectorOpen(false)}
              className="text-primary-foreground hover:bg-red-600 p-0.5 rounded-sm"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Inspector Content */}
          <div className="flex-1 overflow-y-auto bg-background p-2">
            <SessionNotesPanel session={selectedSession!} />
          </div>
        </div>
      </div>

    </div>
  );
}
