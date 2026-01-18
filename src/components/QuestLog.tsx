import { useState } from 'react';
import { 
  ScrollText, Search, CheckSquare, Square, XSquare, Clock, Trophy, 
  MapPin, User, Star, ChevronRight, ChevronDown, Target
} from 'lucide-react';
import { 
  Win95MenuItem
} from './ui/Win95Primitives';
import { CampaignNavigation } from './CampaignNavigation';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface QuestObjective {
  id: string;
  description: string;
  completed: boolean;
  optional?: boolean;
}

interface Quest {
  id: string;
  title: string;
  status: 'active' | 'completed' | 'failed';
  questGiver: string;
  location: string;
  level: number;
  objectives: QuestObjective[];
  description: string;
  rewards?: {
    xp?: number;
    gold?: number;
    items?: string[];
  };
  dateStarted: string;
  dateCompleted?: string;
  category: 'main' | 'side' | 'personal';
}

interface QuestLogProps {
  onNavigate: (page: string) => void;
  toggleWindow: (win: 'diceRoller' | 'combatTracker' | 'randomTables') => void;
}

const MOCK_QUESTS: Quest[] = [
  {
    id: 'lost-mine',
    title: 'The Lost Mine of Phandelver',
    status: 'active',
    questGiver: 'Gundren Rockseeker',
    location: 'Phandalin',
    level: 1,
    category: 'main',
    dateStarted: 'Session 1',
    description: `Gundren Rockseeker, a dwarf prospector, has hired you to escort a wagon of supplies to the town of Phandalin. He mentioned that he and his brothers have discovered something important in the region, though he was vague on the details.

Upon arriving near Phandalin, you discovered that Gundren and his bodyguard Sildar Hallwinter were ambushed by goblins. After rescuing Sildar from the Cragmaw hideout, you learned that Gundren has been taken to Cragmaw Castle by a mysterious villain known as the Black Spider, who seeks to claim the legendary Wave Echo Cave for himself.

The cave is rumored to contain the Forge of Spells, an ancient magical forge that can create powerful enchanted items. You must find Gundren and secure Wave Echo Cave before the Black Spider can exploit its power.`,
    objectives: [
      { id: '1', description: 'Escort the wagon to Phandalin', completed: true },
      { id: '2', description: 'Rescue Sildar Hallwinter from the Cragmaw hideout', completed: true },
      { id: '3', description: 'Investigate the Redbrand threat in Phandalin', completed: true },
      { id: '4', description: 'Defeat Glasstaff and clear Tresendar Manor', completed: true },
      { id: '5', description: 'Find Cragmaw Castle', completed: false },
      { id: '6', description: 'Rescue Gundren Rockseeker', completed: false },
      { id: '7', description: 'Locate Wave Echo Cave', completed: false },
      { id: '8', description: 'Stop the Black Spider', completed: false },
    ],
    rewards: {
      xp: 2000,
      gold: 500,
      items: ['Fame and Recognition', 'Access to Wave Echo Cave'],
    },
  },
  {
    id: 'redbrand-menace',
    title: 'The Redbrand Menace',
    status: 'completed',
    questGiver: 'Townmaster Harbin Wester',
    location: 'Phandalin',
    level: 2,
    category: 'side',
    dateStarted: 'Session 2',
    dateCompleted: 'Session 4',
    description: `The town of Phandalin has been plagued by a gang of ruffians called the Redbrands. These thugs have been terrorizing the townspeople, extorting money from local businesses, and threatening anyone who stands up to them.

Townmaster Harbin Wester, too frightened to act himself, offered a reward to anyone who could drive the Redbrands out of town. You discovered that the gang was operating from beneath Tresendar Manor under the leadership of a wizard called Glasstaff.

After infiltrating their hideout, you defeated Glasstaff (revealed to be Iarno Albrek, a corrupt agent of the Lords' Alliance) and scattered the remaining Redbrands. The town is finally free from their tyranny.`,
    objectives: [
      { id: '1', description: 'Investigate the Redbrand hideout', completed: true },
      { id: '2', description: 'Confront Glasstaff', completed: true },
      { id: '3', description: 'Defeat the Redbrand leader', completed: true },
      { id: '4', description: 'Report back to Townmaster Wester', completed: true },
      { id: '5', description: 'Rescue the kidnapped family', completed: true, optional: true },
    ],
    rewards: {
      xp: 600,
      gold: 250,
      items: ['Staff of Defense', 'Glasstaff\'s spellbook'],
    },
  },
  {
    id: 'old-owl-well',
    title: 'Trouble at Old Owl Well',
    status: 'active',
    questGiver: 'Daran Edermath',
    location: 'Old Owl Well',
    level: 3,
    category: 'side',
    dateStarted: 'Session 3',
    description: `Daran Edermath, a retired adventurer and member of the Order of the Gauntlet, asked you to investigate Old Owl Well. Prospectors have reported undead and a mysterious red-robed figure near the ruins.

Old Owl Well is an ancient watchtower that served as a watering hole for traders. It's now controlled by a necromancer who has animated the dead to protect his excavations. He claims to be searching for historical artifacts on behalf of a powerful organization.

Daran wants you to determine the necromancer's intentions and, if necessary, drive him away from the ruins.`,
    objectives: [
      { id: '1', description: 'Travel to Old Owl Well', completed: true },
      { id: '2', description: 'Investigate the ruins', completed: true },
      { id: '3', description: 'Confront the necromancer', completed: false },
      { id: '4', description: 'Deal with the undead threat', completed: false },
      { id: '5', description: 'Report findings to Daran Edermath', completed: false },
    ],
    rewards: {
      xp: 400,
      gold: 150,
    },
  },
  {
    id: 'agatha-banshee',
    title: 'The Banshee\'s Bargain',
    status: 'active',
    questGiver: 'Sister Garaele',
    location: 'Conyberry',
    level: 2,
    category: 'side',
    dateStarted: 'Session 2',
    description: `Sister Garaele, an elf cleric of Tymora and member of the Harpers, seeks information about a legendary tome called the Spellbook of Bowgentle. She believes a banshee named Agatha might know the book's whereabouts.

Agatha was once a mortal woman who loved a nobleman, but her obsessive jealousy turned her into a banshee. She haunts a ruined woodland manor near the town of Conyberry. The Harpers know that Agatha sometimes responds favorably to gifts and flattery.

Sister Garaele has given you a jeweled silver comb as a gift for Agatha, hoping it will persuade the banshee to answer questions about the spellbook.`,
    objectives: [
      { id: '1', description: 'Travel to Conyberry', completed: false },
      { id: '2', description: 'Locate Agatha\'s lair', completed: false },
      { id: '3', description: 'Present the silver comb to Agatha', completed: false },
      { id: '4', description: 'Ask about the Spellbook of Bowgentle', completed: false },
      { id: '5', description: 'Return to Sister Garaele with information', completed: false },
    ],
    rewards: {
      xp: 300,
      gold: 100,
      items: ['Potion of Healing'],
    },
  },
  {
    id: 'dragon-threat',
    title: 'The Dragon\'s Tribute',
    status: 'failed',
    questGiver: 'Reidoth the Druid',
    location: 'Thundertree',
    level: 4,
    category: 'side',
    dateStarted: 'Session 5',
    dateCompleted: 'Session 5',
    description: `Reidoth, a druid living in the ruins of Thundertree, warned you about a young green dragon named Venomfang that has taken up residence in the old tower. The dragon has been terrorizing the region and demanding tribute from nearby settlements.

You attempted to negotiate with Venomfang, but the arrogant dragon took offense to your party's boldness. The confrontation turned violent, and you were forced to retreat when the dragon's poison breath nearly killed your cleric.

The dragon remains a threat, and Reidoth has advised that you return when you're more powerful—or better yet, avoid the ruins altogether.`,
    objectives: [
      { id: '1', description: 'Investigate the tower in Thundertree', completed: true },
      { id: '2', description: 'Confront the dragon Venomfang', completed: true },
      { id: '3', description: 'Defeat or drive away Venomfang', completed: false },
    ],
    rewards: {
      xp: 0,
      gold: 0,
    },
  },
];

const QUEST_CATEGORIES = [
  { id: 'active', label: 'Active Quests', icon: Clock, color: 'text-blue-600' },
  { id: 'completed', label: 'Completed Quests', icon: Trophy, color: 'text-green-600' },
  { id: 'failed', label: 'Failed Quests', icon: XSquare, color: 'text-red-600' },
  { id: 'main', label: 'Main Quests', icon: Star, color: 'text-yellow-600' },
  { id: 'side', label: 'Side Quests', icon: Target, color: 'text-purple-600' },
];

export function QuestLog({ onNavigate, toggleWindow }: QuestLogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('active');
  const [selectedQuestId, setSelectedQuestId] = useState<string>('lost-mine');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['active', 'completed', 'main', 'side'])
  );

  const selectedQuest = MOCK_QUESTS.find(q => q.id === selectedQuestId);

  const filteredQuests = MOCK_QUESTS.filter(quest => {
    let matchesCategory = false;
    
    if (selectedCategory === 'active') {
      matchesCategory = quest.status === 'active';
    } else if (selectedCategory === 'completed') {
      matchesCategory = quest.status === 'completed';
    } else if (selectedCategory === 'failed') {
      matchesCategory = quest.status === 'failed';
    } else if (selectedCategory === 'main' || selectedCategory === 'side') {
      matchesCategory = quest.category === selectedCategory;
    }
    
    const matchesSearch = searchQuery === '' || 
      quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quest.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const getQuestStatusColor = (status: Quest['status']) => {
    switch (status) {
      case 'active': return 'text-blue-700';
      case 'completed': return 'text-green-700';
      case 'failed': return 'text-red-700';
      default: return 'text-foreground';
    }
  };

  const completedObjectives = selectedQuest?.objectives.filter(obj => obj.completed).length || 0;
  const totalObjectives = selectedQuest?.objectives.length || 0;

  const handlePrint = () => {
    window.print();
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
        <DropdownMenuContent align="start" sideOffset={0} className="w-[160px] bg-background border border-t-input border-l-input border-r-border border-b-border p-0 rounded-none shadow-[1px_1px_0_0_var(--muted-foreground),2px_2px_0_0_var(--border),inset_1px_1px_0_0_var(--input),inset_-1px_-1px_0_0_var(--muted-foreground)]">
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => alert("Create New Quest wizard not implemented.")}
          >
            <span className="relative z-10"><u>N</u>ew Quest</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => document.querySelector<HTMLInputElement>('input[placeholder="Search quests..."]')?.focus()}
          >
            <span className="relative z-10"><u>O</u>pen...</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => alert("Quest log saved.")}
          >
            <span className="relative z-10"><u>S</u>ave</span>
          </DropdownMenuItem>
          <div className="h-[2px] border-t border-t-muted-foreground border-b border-b-input my-1 mx-1" />
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={handlePrint}
          >
            <span className="relative z-10"><u>P</u>rint Quest</span>
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
          <Win95MenuItem className="data-[state=open]:bg-primary data-[state=open]:text-primary-foreground focus:outline-none focus:ring-0"><u>E</u>dit</Win95MenuItem>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={0} className="w-[180px] bg-background border border-t-input border-l-input border-r-border border-b-border p-0 rounded-none shadow-[1px_1px_0_0_var(--muted-foreground),2px_2px_0_0_var(--border),inset_1px_1px_0_0_var(--input),inset_-1px_-1px_0_0_var(--muted-foreground)]">
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => alert("Quest updated: Completed")}
          >
            <span className="relative z-10"><u>M</u>ark as Completed</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => alert("Quest updated: Failed")}
          >
            <span className="relative z-10">Mark as <u>F</u>ailed</span>
          </DropdownMenuItem>
          <div className="h-[2px] border-t border-t-muted-foreground border-b border-b-input my-1 mx-1" />
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => alert("Note editor not available in demo.")}
          >
            <span className="relative z-10"><u>A</u>dd Note...</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Win95MenuItem className="data-[state=open]:bg-primary data-[state=open]:text-primary-foreground focus:outline-none focus:ring-0"><u>V</u>iew</Win95MenuItem>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={0} className="w-[180px] bg-background border border-t-input border-l-input border-r-border border-b-border p-0 rounded-none shadow-[1px_1px_0_0_var(--muted-foreground),2px_2px_0_0_var(--border),inset_1px_1px_0_0_var(--input),inset_-1px_-1px_0_0_var(--muted-foreground)]">
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => setSelectedCategory('active')}
          >
            <span className="relative z-10">Active Quests</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => setSelectedCategory('completed')}
          >
            <span className="relative z-10">Completed Quests</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Win95MenuItem className="data-[state=open]:bg-primary data-[state=open]:text-primary-foreground focus:outline-none focus:ring-0"><u>H</u>elp</Win95MenuItem>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={0} className="w-[180px] bg-background border border-t-input border-l-input border-r-border border-b-border p-0 rounded-none shadow-[1px_1px_0_0_var(--muted-foreground),2px_2px_0_0_var(--border),inset_1px_1px_0_0_var(--input),inset_-1px_-1px_0_0_var(--muted-foreground)]">
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => alert("Quest Log v1.0\nTracks objectives and rewards.")}
          >
            <span className="relative z-10"><u>A</u>bout Quest Log</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  return (
    <div className="h-full flex flex-col bg-background text-foreground overflow-hidden border-2 border-t-input border-l-input border-r-border border-b-border shadow-[1px_1px_0_0_var(--muted-foreground),2px_2px_0_0_var(--border)]">
      
      <CampaignNavigation 
        activePage="quest-log"
        onNavigate={onNavigate}
        toggleWindow={toggleWindow}
        pageTitle="Quest Log - Campaign Journal"
        menuItems={menuItems}
      />

      {/* Search Bar */}
      <div className="px-2 py-1.5 border-b border-b-muted-foreground/30 bg-background">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search quests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-input-background border border-t-muted-foreground border-l-muted-foreground border-r-input border-b-input shadow-[inset_1px_1px_0_0_var(--border)] px-1 py-0.5 text-[11px] focus:outline-none"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar - Quest Categories */}
        <div className="w-[220px] border-r-2 border-r-input bg-background overflow-y-auto flex-shrink-0">
          <div className="p-2">
            {QUEST_CATEGORIES.map(category => {
              const isExpanded = expandedCategories.has(category.id);
              const categoryQuests = filteredQuests.filter(q => {
                if (category.id === 'active') return q.status === 'active';
                if (category.id === 'completed') return q.status === 'completed';
                if (category.id === 'failed') return q.status === 'failed';
                if (category.id === 'main') return q.category === 'main';
                if (category.id === 'side') return q.category === 'side';
                return false;
              });
              const Icon = category.icon;

              return (
                <div key={category.id} className="mb-1">
                  <button
                    onClick={() => {
                      setSelectedCategory(category.id);
                      toggleCategory(category.id);
                    }}
                    className="w-full flex items-center gap-1 px-1 py-0.5 hover:bg-primary hover:text-primary-foreground group text-left"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-3 h-3 flex-shrink-0" />
                    )}
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${category.color} group-hover:text-primary-foreground`} />
                    <span className="text-[11px] truncate">{category.label}</span>
                    <span className="text-[10px] text-muted-foreground group-hover:text-primary-foreground ml-auto">
                      ({categoryQuests.length})
                    </span>
                  </button>
                  
                  {isExpanded && categoryQuests.length > 0 && (
                    <div className="ml-4 mt-0.5 border-l border-l-muted-foreground/30 pl-2">
                      {categoryQuests.map(quest => (
                        <button
                          key={quest.id}
                          onClick={() => setSelectedQuestId(quest.id)}
                          className={`w-full text-left px-1 py-0.5 text-[11px] truncate hover:bg-primary hover:text-primary-foreground ${
                            selectedQuestId === quest.id ? 'bg-primary text-primary-foreground' : ''
                          }`}
                        >
                          {quest.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quest Details */}
        {selectedQuest ? (
          <div className="flex-1 overflow-y-auto bg-input">
            <div className="max-w-[900px] mx-auto p-4">
              
              {/* Quest Header */}
              <div className="border-2 border-t-input border-l-input border-r-border border-b-border bg-background p-3 mb-4 shadow-[1px_1px_0_0_var(--muted-foreground)]">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h1 className="text-[18px] font-bold mb-1">{selectedQuest.title}</h1>
                    <div className={`text-[11px] font-bold uppercase ${getQuestStatusColor(selectedQuest.status)}`}>
                      {selectedQuest.status === 'active' && '◆ IN PROGRESS'}
                      {selectedQuest.status === 'completed' && '✓ COMPLETED'}
                      {selectedQuest.status === 'failed' && '✗ FAILED'}
                    </div>
                  </div>
                  <div className="text-right text-[10px]">
                    <div className="bg-primary text-primary-foreground px-2 py-0.5 mb-1">
                      LEVEL {selectedQuest.level}
                    </div>
                    <div className="text-muted-foreground uppercase">
                      {selectedQuest.category} QUEST
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-muted-foreground/30 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <div className="text-[9px] text-muted-foreground uppercase">Quest Giver</div>
                      <div className="font-bold">{selectedQuest.questGiver}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <div className="text-[9px] text-muted-foreground uppercase">Location</div>
                      <div className="font-bold">{selectedQuest.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <div className="text-[9px] text-muted-foreground uppercase">Started</div>
                      <div className="font-bold">{selectedQuest.dateStarted}</div>
                    </div>
                  </div>
                  {selectedQuest.dateCompleted && (
                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <div className="text-[9px] text-muted-foreground uppercase">Completed</div>
                        <div className="font-bold">{selectedQuest.dateCompleted}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {selectedQuest.status === 'active' && (
                <div className="mb-4">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span>Progress: {completedObjectives}/{totalObjectives} Objectives</span>
                    <span>{Math.round((completedObjectives / totalObjectives) * 100)}%</span>
                  </div>
                  <div className="h-3 border border-t-muted-foreground border-l-muted-foreground border-r-input border-b-input bg-background relative">
                    <div 
                      className="absolute top-0 left-0 bottom-0 bg-primary"
                      style={{ width: `${(completedObjectives / totalObjectives) * 100}%` }}
                    />
                    {/* Stripes pattern overlay for Win95 look */}
                    <div className="absolute inset-0 w-full h-full opacity-20" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }}></div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-[12px] font-bold uppercase border-b border-muted-foreground/30 mb-2">Briefing</h3>
                <div className="text-[11px] leading-relaxed whitespace-pre-wrap">
                  {selectedQuest.description}
                </div>
              </div>

              {/* Objectives */}
              <div className="mb-6">
                <h3 className="text-[12px] font-bold uppercase border-b border-muted-foreground/30 mb-2">Objectives</h3>
                <div className="space-y-1">
                  {selectedQuest.objectives.map((obj, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px]">
                      {obj.completed ? (
                        <CheckSquare className="w-3.5 h-3.5 text-green-700 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      )}
                      <div className={obj.completed ? 'text-muted-foreground line-through decoration-muted-foreground' : ''}>
                        {obj.description}
                        {obj.optional && <span className="text-muted-foreground ml-1">(Optional)</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rewards */}
              {selectedQuest.rewards && (
                <div>
                  <h3 className="text-[12px] font-bold uppercase border-b border-muted-foreground/30 mb-2">Rewards</h3>
                  <div className="bg-background border border-muted-foreground p-2">
                    <div className="flex flex-wrap gap-4 text-[11px]">
                      {selectedQuest.rewards.xp && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-yellow-600" />
                          <span className="font-bold">{selectedQuest.rewards.xp} XP</span>
                        </div>
                      )}
                      {selectedQuest.rewards.gold && (
                        <div className="flex items-center gap-1">
                          <div className="w-3.5 h-3.5 rounded-full border border-yellow-600 bg-yellow-400"></div>
                          <span className="font-bold">{selectedQuest.rewards.gold} gp</span>
                        </div>
                      )}
                      {selectedQuest.rewards.items && selectedQuest.rewards.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <Target className="w-3.5 h-3.5 text-purple-600" />
                          <span className="font-bold">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-input text-muted-foreground">
            <div className="text-center">
              <ScrollText className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>Select a quest to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
