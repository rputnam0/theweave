import { useState } from 'react';
import { cn } from './ui/utils';
import { 
  Terminal, CheckSquare, Square, Clock, Trophy, 
  MapPin, User, Users, Check, X,
  Settings, Book, Database, Plus, UserCog,
  RotateCcw, FileText, Archive
} from 'lucide-react';
import { 
  Win95Button, 
  Win95Separator, Win95MenuItem,
  Win95Input,
  Win95Window
} from './ui/Win95Primitives';
import { SessionMetadataPanel } from './inspectors/SessionMetadataPanel';
import { CampaignNavigation } from './CampaignNavigation';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface PendingApproval {
  id: string;
  type: 'codex-entry' | 'character-update' | 'location-update' | 'quest-update';
  title: string;
  description: string;
  timestamp: string;
  source: string;
  data: any;
}

interface Character {
  id: string;
  name: string;
  type: 'player' | 'npc';
  aliases: string[];
  status: 'active' | 'retired' | 'deceased';
  firstAppearance: string;
  lastSeen: string;
}

interface SessionControl {
  id: string;
  number: number;
  title: string;
  date: string;
  status: 'completed' | 'processing' | 'failed' | 'archived';
  runCount: number;
  lastProcessed: string;
}

interface DMWorkbenchProps {
  onNavigate: (page: string) => void;
  toggleWindow: (win: 'diceRoller' | 'combatTracker' | 'randomTables') => void;
}

const MOCK_APPROVALS: PendingApproval[] = [
  {
    id: 'a1',
    type: 'codex-entry',
    title: 'New NPC: Sister Garaele',
    description: 'An elf cleric of Tymora stationed at the Shrine of Luck in Phandalin. Member of the Harpers.',
    timestamp: '2 hours ago',
    source: 'Session #54',
    data: {
      category: 'npc',
      race: 'Elf',
      class: 'Cleric',
      affiliation: 'Harpers',
      location: 'Phandalin - Shrine of Luck'
    }
  },
  {
    id: 'a2',
    type: 'character-update',
    title: 'Character Name Change: "Gundrun" → "Gundren"',
    description: 'Detected misspelling in transcript. Suggests correcting "Gundrun Rockseeker" to "Gundren Rockseeker".',
    timestamp: '3 hours ago',
    source: 'Session #53',
    data: {
      oldName: 'Gundrun Rockseeker',
      newName: 'Gundren Rockseeker',
      occurrences: 7
    }
  },
  {
    id: 'a3',
    type: 'location-update',
    title: 'New Location: Cragmaw Castle',
    description: 'A ruined fortress taken over by the Cragmaw goblin tribe. Current location of the kidnapped Gundren Rockseeker.',
    timestamp: '1 day ago',
    source: 'Session #54',
    data: {
      category: 'location',
      region: 'Neverwinter Woods',
      controlledBy: 'Cragmaw Tribe',
      dangerLevel: 'High'
    }
  },
  {
    id: 'a4',
    type: 'quest-update',
    title: 'Quest Progress: "The Lost Mine of Phandelver"',
    description: 'Objective completed: "Defeat Glasstaff and clear Tresendar Manor"',
    timestamp: '1 day ago',
    source: 'Session #54',
    data: {
      questId: 'lost-mine',
      objectiveId: '4',
      action: 'complete'
    }
  },
];

const MOCK_CHARACTERS: Character[] = [
  {
    id: 'c1',
    name: 'Sildar Hallwinter',
    type: 'npc',
    aliases: ['Sildar'],
    status: 'active',
    firstAppearance: 'Session 1',
    lastSeen: 'Session 54'
  },
  {
    id: 'c2',
    name: 'Gundren Rockseeker',
    type: 'npc',
    aliases: ['Gundren', 'Gundrun (misspelled)'],
    status: 'active',
    firstAppearance: 'Session 1',
    lastSeen: 'Session 53'
  },
  {
    id: 'c3',
    name: 'Glasstaff',
    type: 'npc',
    aliases: ['Iarno Albrek', 'The Wizard'],
    status: 'deceased',
    firstAppearance: 'Session 2',
    lastSeen: 'Session 4'
  },
  {
    id: 'c4',
    name: 'Thornval Ironheart',
    type: 'player',
    aliases: ['Thorn', 'Ironheart'],
    status: 'active',
    firstAppearance: 'Session 1',
    lastSeen: 'Session 54'
  },
];

const MOCK_SESSIONS: SessionControl[] = [
  { id: 's54', number: 54, title: 'The Whispering Caverns', date: 'Jan 08, 2026', status: 'failed', runCount: 2, lastProcessed: '3 hours ago' },
  { id: 's53', number: 53, title: 'Negotiations with the Drow', date: 'Jan 01, 2026', status: 'completed', runCount: 1, lastProcessed: '1 week ago' },
  { id: 's52', number: 52, title: 'Arrival at Undermountain', date: 'Dec 18, 2025', status: 'completed', runCount: 1, lastProcessed: '3 weeks ago' },
  { id: 's51', number: 51, title: 'The Dragon\'s Lair', date: 'Dec 11, 2025', status: 'archived', runCount: 3, lastProcessed: '1 month ago' },
];

export function DMWorkbench({ onNavigate, toggleWindow }: DMWorkbenchProps) {
  const [activeTab, setActiveTab] = useState<'approvals' | 'characters' | 'sessions' | 'settings'>('approvals');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApprovals, setSelectedApprovals] = useState<Set<string>>(new Set());
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>('c2');
  const [editingCharacter, setEditingCharacter] = useState(false);
  const [characterEditForm, setCharacterEditForm] = useState({
    name: 'Gundren Rockseeker',
    aliases: 'Gundren, Gundrun (misspelled)',
    status: 'active'
  });
  const [showMetadata, setShowMetadata] = useState(false);

  const selectedCharacter = MOCK_CHARACTERS.find(c => c.id === selectedCharacterId);

  const toggleApproval = (id: string) => {
    setSelectedApprovals(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const approveSelected = () => {
    console.log('Approving:', Array.from(selectedApprovals));
    setSelectedApprovals(new Set());
  };

  const rejectSelected = () => {
    console.log('Rejecting:', Array.from(selectedApprovals));
    setSelectedApprovals(new Set());
  };

  const getApprovalIcon = (type: PendingApproval['type']) => {
    switch (type) {
      case 'codex-entry': return <Book className="w-4 h-4 text-blue-600" />;
      case 'character-update': return <UserCog className="w-4 h-4 text-green-600" />;
      case 'location-update': return <MapPin className="w-4 h-4 text-red-600" />;
      case 'quest-update': return <Trophy className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: SessionControl['status']) => {
    switch (status) {
      case 'completed': return 'text-green-700';
      case 'processing': return 'text-blue-700';
      case 'failed': return 'text-red-700';
      case 'archived': return 'text-muted-foreground';
    }
  };

  const getCharacterStatusColor = (status: Character['status']) => {
    switch (status) {
      case 'active': return 'text-green-700';
      case 'retired': return 'text-blue-700';
      case 'deceased': return 'text-red-700';
    }
  };

  const handleExit = () => {
    onNavigate('sessions');
  };

  const menuItems = (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Win95MenuItem className="data-[state=open]:bg-primary data-[state=open]:text-primary-foreground focus:outline-none focus:ring-0"><u>F</u>ile</Win95MenuItem>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={0} className="w-[180px] bg-background border border-t-input border-l-input border-r-border border-b-border p-0 rounded-none shadow-[1px_1px_0_0_var(--muted-foreground),2px_2px_0_0_var(--border),inset_1px_1px_0_0_var(--input),inset_-1px_-1px_0_0_var(--muted-foreground)]">
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => alert("Campaign Data Exported successfully.")}
          >
            <span className="relative z-10"><u>E</u>xport Campaign Data</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => alert("Import Wizard starting...")}
          >
            <span className="relative z-10"><u>I</u>mport Session</span>
          </DropdownMenuItem>
          <div className="h-[2px] border-t border-t-muted-foreground border-b border-b-input my-1 mx-1" />
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => alert("Backup created: campaign_backup_001.dat")}
          >
            <span className="relative z-10"><u>B</u>ackup Campaign</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => alert("Restore Wizard starting...")}
          >
            <span className="relative z-10"><u>R</u>estore Backup...</span>
          </DropdownMenuItem>
          <div className="h-[2px] border-t border-t-muted-foreground border-b border-b-input my-1 mx-1" />
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => setShowMetadata(true)}
          >
            <span className="relative z-10">Session <u>M</u>etadata</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => alert("Compare Run")}
          >
            <span className="relative z-10"><u>C</u>ompare Run</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => alert("Delete")}
          >
            <span className="relative z-10"><u>D</u>elete</span>
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Win95MenuItem className="data-[state=open]:bg-primary data-[state=open]:text-primary-foreground focus:outline-none focus:ring-0"><u>A</u>ctions</Win95MenuItem>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={0} className="w-[200px] bg-background border border-t-input border-l-input border-r-border border-b-border p-0 rounded-none shadow-[1px_1px_0_0_var(--muted-foreground),2px_2px_0_0_var(--border),inset_1px_1px_0_0_var(--input),inset_-1px_-1px_0_0_var(--muted-foreground)]">
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={approveSelected}
          >
            <span className="relative z-10"><u>A</u>pprove All Pending</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={rejectSelected}
          >
            <span className="relative z-10"><u>R</u>eject All Pending</span>
          </DropdownMenuItem>
          <div className="h-[2px] border-t border-t-muted-foreground border-b border-b-input my-1 mx-1" />
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => alert("Reprocessing failed sessions...")}
          >
            <span className="relative z-10">Re<u>p</u>rocess Failed Sessions</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => alert("Syncing character names...")}
          >
            <span className="relative z-10"><u>S</u>ync Character Names</span>
          </DropdownMenuItem>
          <div className="h-[2px] border-t border-t-muted-foreground border-b border-b-input my-1 mx-1" />
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => alert("Rebuilding search index...")}
          >
            <span className="relative z-10">Rebuild <u>C</u>odex Index</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Win95MenuItem><u>V</u>iew</Win95MenuItem>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Win95MenuItem className="data-[state=open]:bg-primary data-[state=open]:text-primary-foreground focus:outline-none focus:ring-0"><u>H</u>elp</Win95MenuItem>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={0} className="w-[180px] bg-background border border-t-input border-l-input border-r-border border-b-border p-0 rounded-none shadow-[1px_1px_0_0_var(--muted-foreground),2px_2px_0_0_var(--border),inset_1px_1px_0_0_var(--input),inset_-1px_-1px_0_0_var(--muted-foreground)]">
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => alert("DM Workbench v1.0\nAdministrative tools.")}
          >
            <span className="relative z-10"><u>A</u>bout DM Workbench</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  return (
    <div className="h-full flex flex-col bg-background text-foreground overflow-hidden border-2 border-t-input border-l-input border-r-border border-b-border shadow-[1px_1px_0_0_var(--muted-foreground),2px_2px_0_0_var(--border)]">
      
      <CampaignNavigation 
        activePage="dm-workbench"
        onNavigate={onNavigate}
        toggleWindow={toggleWindow}
        pageTitle="DM Workbench - Campaign Control Center"
        menuItems={menuItems}
      />

      {/* Tab Navigation */}
      <div className="px-2 py-2 border-b border-b-muted-foreground/30 bg-background flex gap-1 items-center">
        {[
          { id: 'approvals', label: 'Pending Approvals', icon: Clock, count: MOCK_APPROVALS.length },
          { id: 'characters', label: 'Character Manager', icon: Users, count: MOCK_CHARACTERS.length },
          { id: 'sessions', label: 'Session Control', icon: Database, count: MOCK_SESSIONS.length },
          { id: 'settings', label: 'Settings', icon: Settings, count: null },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Win95Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-1.5 h-[26px] px-3",
                isActive && "bg-muted border-t-muted-foreground border-l-muted-foreground border-r-input border-b-input shadow-[inset_1px_1px_0_0_var(--border)]"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="font-bold">{tab.label}</span>
              {tab.count !== null && (
                <span className="bg-primary text-primary-foreground px-1.5 py-0 rounded-sm text-[9px] font-bold">
                  {tab.count}
                </span>
              )}
            </Win95Button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden bg-background relative">
        {showMetadata && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[500px] z-50">
            <Win95Window 
              title="Session Metadata" 
              onClose={() => setShowMetadata(false)}
              showControls
              className="h-full"
            >
              <SessionMetadataPanel onClose={() => setShowMetadata(false)} />
            </Win95Window>
          </div>
        )}
        
        {/* APPROVALS TAB */}
        {activeTab === 'approvals' && (
          <div className="h-full flex flex-col">
            {/* Action Bar */}
            <div className="px-2 py-2 border-b border-b-muted-foreground/30 bg-background flex items-center gap-2">
              <Win95Button 
                onClick={approveSelected}
                disabled={selectedApprovals.size === 0}
                className="flex items-center gap-1 px-2 h-[24px] disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5 text-green-700" />
                <span className="text-[11px]">Approve Selected</span>
              </Win95Button>
              <Win95Button 
                onClick={rejectSelected}
                disabled={selectedApprovals.size === 0}
                className="flex items-center gap-1 px-2 h-[24px] disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5 text-red-700" />
                <span className="text-[11px]">Reject Selected</span>
              </Win95Button>
              <Win95Separator className="h-[20px] mx-1" />
              <div className="text-[11px] text-muted-foreground">
                {selectedApprovals.size} selected
              </div>
            </div>

            {/* Approvals List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {MOCK_APPROVALS.map(approval => (
                <div
                  key={approval.id}
                  className="border-2 border-t-input border-l-input border-r-border border-b-border bg-input p-3 shadow-[1px_1px_0_0_var(--muted-foreground)]"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleApproval(approval.id)}
                      className="mt-0.5 flex-shrink-0"
                    >
                      {selectedApprovals.has(approval.id) ? (
                        <CheckSquare className="w-4 h-4 text-primary" />
                      ) : (
                        <Square className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                    
                    <div className="flex-shrink-0 mt-0.5">
                      {getApprovalIcon(approval.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-[12px] font-bold">{approval.title}</h3>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {approval.timestamp}
                        </span>
                      </div>
                      
                      <p className="text-[11px] mb-2 text-muted-foreground">
                        {approval.description}
                      </p>

                      {/* Data Preview */}
                      <div className="bg-input border border-muted-foreground p-2 text-[10px] space-y-0.5">
                        {Object.entries(approval.data).map(([key, value]) => (
                          <div key={key} className="flex gap-2">
                            <span className="font-bold text-muted-foreground uppercase">{key}:</span>
                            <span>{value as string}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] text-muted-foreground">Source:</span>
                        <span className="text-[10px] font-bold">{approval.source}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <Win95Button className="px-2 py-0.5 h-[20px] min-w-[60px] flex items-center justify-center gap-1">
                        <Check className="w-3 h-3 text-green-700" />
                        <span className="text-[10px]">Approve</span>
                      </Win95Button>
                      <Win95Button className="px-2 py-0.5 h-[20px] min-w-[60px] flex items-center justify-center gap-1">
                        <X className="w-3 h-3 text-red-700" />
                        <span className="text-[10px]">Reject</span>
                      </Win95Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHARACTERS TAB */}
        {activeTab === 'characters' && (
          <div className="h-full flex">
            {/* Character List */}
            <div className="w-[280px] border-r-2 border-r-input bg-background overflow-y-auto flex-shrink-0">
              <div className="p-2">
                <div className="mb-2">
                  <Win95Input
                    type="text"
                    placeholder="Search characters..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-1">
                  {MOCK_CHARACTERS.map(character => (
                    <button
                      key={character.id}
                      onClick={() => {
                        setSelectedCharacterId(character.id);
                        setEditingCharacter(false);
                        setCharacterEditForm({
                          name: character.name,
                          aliases: character.aliases.join(', '),
                          status: character.status
                        });
                      }}
                      className={`w-full text-left px-2 py-1.5 text-[11px] border ${
                        selectedCharacterId === character.id
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-input border-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {character.type === 'player' ? (
                          <User className="w-3.5 h-3.5 flex-shrink-0" />
                        ) : (
                          <Users className="w-3.5 h-3.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold truncate">{character.name}</div>
                          <div className={`text-[9px] uppercase ${
                            selectedCharacterId === character.id 
                              ? 'text-primary-foreground/80' 
                              : getCharacterStatusColor(character.status)
                          }`}>
                            {character.type} • {character.status}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <Win95Button className="w-full mt-2 flex items-center justify-center gap-1 py-1">
                  <Plus className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Add Character</span>
                </Win95Button>
              </div>
            </div>

            {/* Character Details */}
            {selectedCharacter && (
              <div className="flex-1 overflow-y-auto p-4 bg-input">
                <div className="max-w-[600px]">
                  <div className="border-2 border-t-input border-l-input border-r-border border-b-border bg-background p-4 shadow-[1px_1px_0_0_var(--muted-foreground)] mb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h2 className="text-[18px] font-bold mb-1">{selectedCharacter.name}</h2>
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className={`uppercase font-bold ${getCharacterStatusColor(selectedCharacter.status)}`}>
                            {selectedCharacter.status}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">First Seen: {selectedCharacter.firstAppearance}</span>
                        </div>
                      </div>
                      <Win95Button onClick={() => setEditingCharacter(!editingCharacter)}>
                        {editingCharacter ? 'Cancel Edit' : 'Edit Details'}
                      </Win95Button>
                    </div>

                    {editingCharacter ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold mb-1">Name</label>
                          <input 
                            type="text" 
                            value={characterEditForm.name}
                            onChange={e => setCharacterEditForm({...characterEditForm, name: e.target.value})}
                            className="w-full bg-input border border-muted-foreground px-2 py-1 text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold mb-1">Aliases (comma separated)</label>
                          <input 
                            type="text" 
                            value={characterEditForm.aliases}
                            onChange={e => setCharacterEditForm({...characterEditForm, aliases: e.target.value})}
                            className="w-full bg-input border border-muted-foreground px-2 py-1 text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold mb-1">Status</label>
                          <select 
                            value={characterEditForm.status}
                            onChange={e => setCharacterEditForm({...characterEditForm, status: e.target.value})}
                            className="w-full bg-input border border-muted-foreground px-2 py-1 text-[11px]"
                          >
                            <option value="active">Active</option>
                            <option value="retired">Retired</option>
                            <option value="deceased">Deceased</option>
                          </select>
                        </div>
                        <div className="flex justify-end pt-2">
                          <Win95Button className="px-4">Save Changes</Win95Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-[11px]">
                        <div>
                          <span className="font-bold text-muted-foreground block mb-0.5">Aliases:</span>
                          <div className="p-1 bg-input border border-muted-foreground/30">
                            {selectedCharacter.aliases.length > 0 ? selectedCharacter.aliases.join(', ') : 'None'}
                          </div>
                        </div>
                        <div>
                          <span className="font-bold text-muted-foreground block mb-0.5">Last Seen:</span>
                          <div className="p-1 bg-input border border-muted-foreground/30">
                            {selectedCharacter.lastSeen}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SESSIONS TAB */}
        {activeTab === 'sessions' && (
          <div className="h-full p-4 overflow-y-auto bg-input">
            <div className="max-w-[800px] mx-auto">
              <h2 className="text-[14px] font-bold mb-4 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Session Processing Status
              </h2>
              
              <div className="border-2 border-t-muted-foreground border-l-muted-foreground border-r-input border-b-input bg-background">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="bg-muted border-b border-muted-foreground">
                      <th className="text-left p-2 font-bold w-[60px]">#</th>
                      <th className="text-left p-2 font-bold">Title</th>
                      <th className="text-left p-2 font-bold w-[100px]">Date</th>
                      <th className="text-left p-2 font-bold w-[100px]">Status</th>
                      <th className="text-left p-2 font-bold w-[120px]">Last Processed</th>
                      <th className="text-right p-2 font-bold w-[100px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_SESSIONS.map((session, idx) => (
                      <tr key={session.id} className={idx % 2 === 0 ? 'bg-input' : 'bg-input/50'}>
                        <td className="p-2 border-b border-muted-foreground/10 font-bold">{session.number}</td>
                        <td className="p-2 border-b border-muted-foreground/10">{session.title}</td>
                        <td className="p-2 border-b border-muted-foreground/10 text-muted-foreground">{session.date}</td>
                        <td className="p-2 border-b border-muted-foreground/10">
                          <span className={`uppercase font-bold ${getStatusColor(session.status)}`}>
                            {session.status}
                          </span>
                        </td>
                        <td className="p-2 border-b border-muted-foreground/10 text-muted-foreground">{session.lastProcessed}</td>
                        <td className="p-2 border-b border-muted-foreground/10 text-right">
                          <div className="flex justify-end gap-1">
                            {session.status === 'failed' && (
                              <button className="p-1 hover:bg-muted border border-transparent hover:border-muted-foreground" title="Retry">
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button className="p-1 hover:bg-muted border border-transparent hover:border-muted-foreground" title="View Logs">
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1 hover:bg-muted border border-transparent hover:border-muted-foreground" title="Archive">
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="h-full flex items-center justify-center bg-input text-muted-foreground">
            <div className="text-center">
              <Settings className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>Campaign Settings - Under Construction</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
