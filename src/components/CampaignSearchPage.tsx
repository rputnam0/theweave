import * as React from "react"
import { Search, Sparkles, History, X, Send, Book, Users, MapPin, Scroll, HelpCircle } from "lucide-react"
import { Win95Button, Win95GroupBox, Win95MenuItem } from "./ui/Win95Primitives"
import { CampaignNavigation } from "./CampaignNavigation";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface CampaignSearchPageProps {
  onNavigate: (page: string) => void;
  toggleWindow: (win: 'diceRoller' | 'combatTracker' | 'randomTables') => void;
}

interface QueryResult {
  id: string;
  query: string;
  answer: string;
  sources: string[];
  timestamp: string;
  category: string;
}

interface QuickPrompt {
  id: string;
  icon: React.ReactNode;
  label: string;
  prompt: string;
  category: string;
}

const QUICK_PROMPTS: QuickPrompt[] = [
  {
    id: 'npc-info',
    icon: <Users className="w-3.5 h-3.5" />,
    label: 'Who is...?',
    prompt: 'Who is ',
    category: 'Characters'
  },
  {
    id: 'location-info',
    icon: <MapPin className="w-3.5 h-3.5" />,
    label: 'Where is...?',
    prompt: 'Where is ',
    category: 'Locations'
  },
  {
    id: 'quest-status',
    icon: <Scroll className="w-3.5 h-3.5" />,
    label: 'Quest status',
    prompt: 'What is the status of ',
    category: 'Quests'
  },
  {
    id: 'lore',
    icon: <Book className="w-3.5 h-3.5" />,
    label: 'What happened...?',
    prompt: 'What happened in ',
    category: 'Events'
  },
  {
    id: 'relationships',
    icon: <Users className="w-3.5 h-3.5" />,
    label: 'Relationships',
    prompt: 'What is the relationship between ',
    category: 'Characters'
  },
  {
    id: 'timeline',
    icon: <History className="w-3.5 h-3.5" />,
    label: 'When did...?',
    prompt: 'When did ',
    category: 'Timeline'
  },
];

const MOCK_RESULTS: QueryResult[] = [
  {
    id: 'q1',
    query: 'Who is Sister Garaele?',
    answer: 'Sister Garaele is an elf cleric of Tymora who presides over the Shrine of Luck, a small temple in Phandalin. She is a member of the Harpers, a scattered network of adventurers and spies who advocate equality and covertly oppose the abuse of power. She seeks adventurers to help her contact a banshee named Agatha.',
    sources: ['Session #54', 'Codex: NPCs', 'Session #3'],
    timestamp: '2 min ago',
    category: 'Characters'
  },
  {
    id: 'q2',
    query: 'What happened at Tresendar Manor?',
    answer: 'Tresendar Manor is a ruined mansion on the east edge of Phandalin. The party discovered it was being used as a hideout by the Redbrands, a gang of ruffians terrorizing the town. The manor\'s cellar connected to a dungeon complex where the party confronted and defeated Glasstaff (Iarno Albrek), the Redbrand leader and a wizard working for the Black Spider.',
    sources: ['Session #4', 'Session #3', 'Codex: Locations'],
    timestamp: '15 min ago',
    category: 'Locations'
  },
];

export function CampaignSearchPage({ onNavigate, toggleWindow }: CampaignSearchPageProps) {
  const [query, setQuery] = React.useState<string>("");
  const [results, setResults] = React.useState<QueryResult[]>(MOCK_RESULTS);
  const [isSearching, setIsSearching] = React.useState(false);
  const [selectedResult, setSelectedResult] = React.useState<string | null>(results[0]?.id || null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const searchTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate AI search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      const newResult: QueryResult = {
        id: Date.now().toString(),
        query: searchQuery,
        answer: 'This is a simulated answer to your question. In a real implementation, this would query your campaign knowledge base using AI to provide relevant information from sessions, codex entries, and other campaign data.',
        sources: ['Session #54', 'Codex Entry', 'Quest Log'],
        timestamp: 'Just now',
        category: 'General'
      };
      
      setResults(prev => [newResult, ...prev].slice(0, 20));
      setSelectedResult(newResult.id);
      setQuery("");
      setIsSearching(false);
      searchTimeoutRef.current = null;
    }, 1000);
  };

  const handleQuickPrompt = (prompt: string) => {
    setQuery(prompt);
    inputRef.current?.focus();
  };

  const selectedResultData = results.find(r => r.id === selectedResult);

  const handleExit = () => {
    onNavigate('sessions');
  };

  const handleCopyAnswer = () => {
    if (selectedResultData) {
      navigator.clipboard.writeText(selectedResultData.answer);
      alert("Answer copied to clipboard!");
    }
  };

  const menuItems = (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Win95MenuItem className="data-[state=open]:bg-primary data-[state=open]:text-primary-foreground focus:outline-none focus:ring-0">
            <u>F</u>ile
          </Win95MenuItem>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={0} className="w-[180px] bg-background border border-t-input border-l-input border-r-border border-b-border p-0 rounded-none shadow-[inset_1px_1px_0_0_var(--input),inset_-1px_-1px_0_0_var(--muted-foreground)]">
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => alert("History exported to CSV.")}
          >
            <span className="relative z-10"><u>E</u>xport Search History</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => { setResults([]); setSelectedResult(null); }}
          >
            <span className="relative z-10"><u>C</u>lear History</span>
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
          <Win95MenuItem className="data-[state=open]:bg-primary data-[state=open]:text-primary-foreground focus:outline-none focus:ring-0">
            <u>E</u>dit
          </Win95MenuItem>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={0} className="w-[180px] bg-background border border-t-input border-l-input border-r-border border-b-border p-0 rounded-none shadow-[inset_1px_1px_0_0_var(--input),inset_-1px_-1px_0_0_var(--muted-foreground)]">
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={handleCopyAnswer}
          >
            <span className="relative z-10"><u>C</u>opy Answer</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => alert("Sources copied!")}
          >
            <span className="relative z-10">Copy <u>S</u>ources</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Win95MenuItem><u>V</u>iew</Win95MenuItem>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Win95MenuItem className="data-[state=open]:bg-primary data-[state=open]:text-primary-foreground focus:outline-none focus:ring-0"><u>H</u>elp</Win95MenuItem>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={0} className="w-[180px] bg-background border border-t-input border-l-input border-r-border border-b-border p-0 rounded-none shadow-[inset_1px_1px_0_0_var(--input),inset_-1px_-1px_0_0_var(--muted-foreground)]">
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => alert("AI Search v2.0\nPowered by Arcana Intelligence")}
          >
            <span className="relative z-10"><u>A</u>bout Search</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  return (
    <div className="h-full flex flex-col bg-background text-foreground overflow-hidden border-2 border-t-input border-l-input border-r-border border-b-border shadow-[1px_1px_0_0_var(--muted-foreground),2px_2px_0_0_var(--border)]">
      
      <CampaignNavigation 
        activePage="campaign-search"
        onNavigate={onNavigate}
        toggleWindow={toggleWindow}
        pageTitle="Campaign Search - AI-Powered Knowledge Base"
        menuItems={menuItems}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden mb-1">
        {/* Sidebar - Quick Prompts & History */}
        <div className="w-[180px] border-r-2 border-r-muted-foreground bg-background flex flex-col">
          <div className="bg-primary px-2 py-1 border-b border-border">
            <span className="text-[10px] font-bold uppercase text-primary-foreground">Quick Prompts</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {QUICK_PROMPTS.map(prompt => (
              <Win95Button
                key={prompt.id}
                onClick={() => handleQuickPrompt(prompt.prompt)}
                className="w-full flex items-center gap-2 px-2 py-1.5 justify-start min-w-0"
              >
                {prompt.icon}
                <span className="text-[10px] truncate">{prompt.label}</span>
              </Win95Button>
            ))}
          </div>

          <div className="border-t-2 border-t-muted-foreground">
            <div className="bg-muted px-2 py-1 border-b border-border">
              <span className="text-[9px] font-bold uppercase">Recent Queries</span>
            </div>
            <div className="p-1 space-y-0.5 max-h-[120px] overflow-y-auto bg-background">
              {results.slice(0, 5).map(result => (
                <button
                  key={result.id}
                  onClick={() => setSelectedResult(result.id)}
                  className={`w-full text-left px-1.5 py-1 text-[9px] border ${ 
                    selectedResult === result.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:bg-muted'
                  }`}
                >
                  <div className="truncate">{result.query}</div>
                  <div className={`text-[8px] ${selectedResult === result.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {result.timestamp}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          {/* Search Input */}
          <div className="p-3 border-b-2 border-b-muted-foreground bg-background">
            <Win95GroupBox title="Ask a Question">
              <div className="flex gap-2 p-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch(query);
                      }
                    }}
                    placeholder="Type your query..."
                    className="w-full bg-input-background border-2 border-t-muted-foreground border-l-muted-foreground border-r-input border-b-input px-2 py-1.5 text-[11px] focus:outline-none pr-8"
                    disabled={isSearching}
                  />
                  {query && !isSearching && (
                    <button
                      onClick={() => setQuery("")}
                      className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-muted p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <Win95Button
                  onClick={() => handleSearch(query)}
                  disabled={!query.trim() || isSearching}
                  className="px-3 py-1.5 flex items-center gap-1"
                >
                  {isSearching ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      <span className="text-[11px]">Searching...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Search</span>
                    </>
                  )}
                </Win95Button>
              </div>
            </Win95GroupBox>
          </div>

          {/* Results Display */}
          <div className="flex-1 overflow-y-auto bg-background p-3 min-h-0">
            {results.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-8">
                <HelpCircle className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-[12px] font-bold mb-1">
                  No Queries in History
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Enter a query above or select a quick prompt to begin...
                </p>
              </div>
            ) : selectedResultData ? (
              <div className="space-y-3">
                {/* Query */}
                <Win95GroupBox title="Query">
                  <div className="flex items-start gap-2 p-2">
                    <Search className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-[11px] font-bold mb-1">
                        {selectedResultData.query}
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                        <span>{selectedResultData.timestamp}</span>
                        <span>|</span>
                        <span className="bg-primary text-primary-foreground px-1.5 py-0 uppercase font-bold">
                          {selectedResultData.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </Win95GroupBox>

                {/* Answer */}
                <Win95GroupBox title="AI Response">
                  <div className="p-2">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[10px] font-bold uppercase">
                        Answer
                      </span>
                    </div>
                    <div className="text-[11px] leading-relaxed whitespace-pre-wrap">
                      {selectedResultData.answer}
                    </div>
                  </div>
                </Win95GroupBox>

                {/* Sources */}
                <Win95GroupBox title="Sources">
                  <div className="p-2">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
                      <Book className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[10px] font-bold uppercase">
                        Referenced Material
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedResultData.sources.map((source, idx) => (
                        <Win95Button
                          key={idx}
                          className="px-2 py-1 text-[10px]"
                        >
                          {source}
                        </Win95Button>
                      ))}
                    </div>
                  </div>
                </Win95GroupBox>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Win95Button
                    onClick={() => onNavigate('codex')}
                    className="flex items-center gap-1 px-2 py-1 text-[10px]"
                  >
                    <Book className="w-3 h-3" />
                    View in Codex
                  </Win95Button>
                  <Win95Button
                    onClick={() => onNavigate('quest-log')}
                    className="flex items-center gap-1 px-2 py-1 text-[10px]"
                  >
                    <Scroll className="w-3 h-3" />
                    Related Quests
                  </Win95Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
