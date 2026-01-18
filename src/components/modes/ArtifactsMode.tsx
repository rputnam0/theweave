import { useState, useEffect } from 'react';
import { 
  Pin, 
  MessageCircle,
  Map,
  Settings,
  ArrowRight,
  Link,
  Circle,
  Swords,
  Eye,
  Hash,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { cn } from '../ui/utils';
// Button removed
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Win95Panel, Win95GroupBox, Win95Button, Win95ListBox, Win95ListItem, Win95Divider } from '../ui/Win95Primitives';
import { SectionHeader, Rule, QuoteBox, AsciiCard } from '../ui/TerminalPrimitives';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command"

interface ArtifactsModeProps {
  session: any;
  onJumpToTranscript: (timestamp: string) => void;
  section: string | null;
  setSection: (section: string | null) => void;
}

// Mock Data
const MOCK_TIMELINE = [
  {
    id: 't1',
    title: 'Arrival at the Spire',
    summary: 'The party approached the ancient spire under the cover of darkness, observing the patrol patterns.',
    context: { location: 'Spire Gate', npcs: 'Patrol Guards' },
    outcomes: [
      'Discovered the eastern entrance is guarded by 3 hobgoblins.',
      'Noticed magical wards on the main gate.'
    ],
    timestamp: '12:05',
    significance: 'major' as const,
    type: 'exploration'
  },
  {
    id: 't2',
    title: 'The Negotiator',
    summary: 'Valerius attempted to bribe the guard, but the roll failed, leading to immediate combat.',
    context: { location: 'Spire Gate', npcs: 'Guard Captain' },
    outcomes: [
      'Combat initiated with Spire Guards.',
      'Valerius lost 15 HP.',
      'Alarm was raised.'
    ],
    timestamp: '12:45',
    significance: 'minor' as const,
    type: 'combat'
  },
  {
    id: 't3',
    title: 'Finding the Map',
    summary: 'After defeating the guards, the party searched the guard post and found a map of the lower levels.',
    context: { location: 'Guard Post', npcs: 'None' },
    outcomes: [
      'Obtained Item: Map of Level 1.',
      'Revealed secret entrance location.'
    ],
    timestamp: '13:10',
    significance: 'major' as const,
    type: 'exploration'
  }
];

const MOCK_QUEST_UPDATES = [
  {
    id: 'q1',
    questName: 'Infiltrate the Spire',
    changes: ['Objective complete: Enter the spire', 'New objective: Find the Commander'],
    timestamp: '13:15'
  },
  {
    id: 'q2',
    questName: 'The Lost Artifact',
    changes: ['Clue found: The artifact is in the vault'],
    timestamp: '13:20'
  }
];

const MOCK_QUOTES = [
  {
    id: 'qu1',
    text: "You think darkness is your ally? I was born in it, molded by it.",
    context: 'Shadow Commander',
    timestamp: '14:00',
    initials: 'SC'
  },
  {
    id: 'qu2',
    text: "I didn't ask how big the room is, I said I cast Fireball.",
    context: 'Ignis',
    timestamp: '14:15',
    initials: 'IG'
  },
  {
    id: 'qu3',
    text: "The prophecy is clear. Only the one with the silver hand may open the door.",
    context: 'Old Scroll',
    timestamp: '14:30',
    initials: 'OS'
  },
  {
    id: 'qu4',
    text: "Wait, are we the baddies?",
    context: 'Valerius',
    timestamp: '14:45',
    initials: 'VA'
  }
];

export function ArtifactsMode({ session, onJumpToTranscript, section, setSection }: ArtifactsModeProps) {
  const [timelineExpanded, setTimelineExpanded] = useState(true);
  const [showAllQuests, setShowAllQuests] = useState(false);
  const [showAllQuotes, setShowAllQuotes] = useState(false);
  const [activeSection, setActiveSection] = useState('section-timeline');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle section scrolling from parent
  useEffect(() => {
    if (section) {
      scrollToSection(section);
      setSection(null); // Reset after scrolling
    }
  }, [section, setSection]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -70% 0px' } 
    );

    const sections = ['section-timeline', 'section-quests', 'section-quotes'];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'combat': return <Swords className="w-3.5 h-3.5" />;
      case 'roleplay': return <MessageCircle className="w-3.5 h-3.5" />;
      case 'exploration': return <Eye className="w-3.5 h-3.5" />;
      case 'system': return <Settings className="w-3.5 h-3.5" />;
      default: return <Circle className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--background)] font-mono overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden p-4 md:p-8 flex justify-center">
        <div className="w-full max-w-[90%] pb-20">
          <div className="px-6">
            
            {/* Timeline Section */}
            <div id="section-timeline" className="mb-12 scroll-mt-24">
              <div className="flex items-center justify-between mb-6">
                <SectionHeader className="mt-0">Timeline_Log</SectionHeader>
                {MOCK_TIMELINE.length > 5 && (
                  <Win95Button 
                    onClick={() => setTimelineExpanded(!timelineExpanded)}
                    className="text-xs h-[22px] px-2 min-w-[unset]"
                  >
                    {timelineExpanded ? '[-] COLLAPSE' : '[+] EXPAND'}
                  </Win95Button>
                )}
              </div>
              
              <div className="space-y-0 relative border-l border-[var(--border)] ml-4 pl-8">
                {MOCK_TIMELINE.length === 0 ? (
                  <div className="text-center py-8 text-[var(--muted-foreground)] italic text-sm border border-dashed border-[var(--border)]">
                    No timeline generated for this session.
                  </div>
                ) : (
                  MOCK_TIMELINE.map((item, index) => (
                    <div key={item.id} className="relative mb-8 group">
                       {/* Node on Axis */}
                       <div className="absolute -left-[41px] top-0 bg-[var(--background)] p-1 border border-[var(--border)] group-hover:border-[var(--accent)] transition-colors">
                          <span className="text-[var(--muted-foreground)] group-hover:text-[var(--accent)] transition-colors">
                            {getEventIcon(item.type)}
                          </span>
                       </div>
                       
                       {/* Timestamp */}
                       <div className="absolute -left-[120px] top-4 text-xs text-[var(--muted-foreground)] w-16 text-right font-mono">
                          {item.timestamp}
                       </div>
                      
                      {/* Content Card with ASCII Border */}
                      <AsciiCard 
                         title={item.title}
                         className="bg-[var(--card)] hover:bg-[var(--card)]/80 transition-colors"
                         footer={
                            item.outcomes.length > 0 && (
                                <div>
                                   <h5 className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] font-bold mb-1">&gt;&gt; Outcomes:</h5>
                                   <ul className="space-y-1">
                                     {item.outcomes.map((outcome, idx) => {
                                       const isLoot = outcome.toLowerCase().includes('item') || outcome.toLowerCase().includes('obtained');
                                       return (
                                         <li 
                                           key={idx} 
                                           className={cn(
                                             "text-xs pl-2 flex gap-2 items-start",
                                             isLoot ? "text-[var(--accent)]" : "text-[var(--foreground)]"
                                           )}
                                         >
                                           <span>-</span>
                                           <span>{outcome}</span>
                                         </li>
                                       );
                                     })}
                                   </ul>
                                </div>
                            )
                         }
                      >
                          {/* Jump Link */}
                          <button
                            className="absolute top-3 right-3 h-6 w-6 flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              onJumpToTranscript(item.timestamp);
                            }}
                            title="Jump to Transcript"
                          >
                            <Link className="w-3 h-3" />
                          </button>
  
                          {/* Context Pills */}
                          <div className="flex flex-wrap gap-2 mb-3 text-xs mt-2">
                            <span className="bg-[var(--muted)] text-[var(--muted-foreground)] px-1.5 py-0.5 border border-[var(--border)]">
                              LOC: {item.context.location}
                            </span>
                            {item.context.npcs && (
                              <span className="bg-[var(--muted)] text-[var(--muted-foreground)] px-1.5 py-0.5 border border-[var(--border)]">
                                 NPC: {item.context.npcs}
                              </span>
                            )}
                          </div>
  
                          <p className="text-sm text-[var(--foreground)] opacity-80 mb-2 leading-relaxed font-mono text-center">
                            {item.summary}
                          </p>
                      </AsciiCard>
                    </div>
                  ))
                )}
              </div>
            </div>
  
            <Rule />
  
            {/* Quest Updates Section */}
            <div id="section-quests" className="mb-12 scroll-mt-24">
              <SectionHeader className="mt-0 mb-6">Quest_Updates</SectionHeader>
  
              <div className="grid grid-cols-1 gap-4">
                 {MOCK_QUEST_UPDATES.length === 0 ? (
                    <div className="text-center py-8 text-[var(--muted-foreground)] italic text-sm border border-dashed border-[var(--border)]">
                      No updates found.
                    </div>
                 ) : (
                   <>
                     {(showAllQuests ? MOCK_QUEST_UPDATES : MOCK_QUEST_UPDATES.slice(0, 2)).map((quest) => (
                       <AsciiCard 
                         key={quest.id} 
                         className="bg-[var(--card)]"
                       >
                         <div className="flex items-center gap-2 mb-3">
                           <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] bg-[var(--muted)] px-1">Quest_ID:{quest.id}</span>
                           <h4 className="font-bold text-[var(--foreground)]">
                             {quest.questName}
                           </h4>
                           <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                 className="h-6 w-6 flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--accent)]"
                                 onClick={() => onJumpToTranscript(quest.timestamp)}
                              >
                                 <Link className="w-3 h-3" />
                              </button>
                           </div>
                         </div>
                         
                         <div className="space-y-2">
                           {quest.changes.map((change, idx) => {
                               const isNew = change.toLowerCase().includes('new objective') || change.toLowerCase().includes('started');
                               let displayText = change;
                               if (isNew) {
                                   displayText = change.replace(/New objective:\s*/i, 'Objective: ');
                               }
                               
                               return (
                                 <div key={idx} className="flex gap-2 items-start text-sm">
                                   <span className={cn("text-[10px] px-1 font-bold h-4 flex items-center justify-center border", isNew ? "text-[var(--accent)] border-[var(--accent)]" : "text-[var(--muted-foreground)] border-[var(--muted-foreground)]")}>
                                     {isNew ? 'NEW' : 'UPD'}
                                   </span>
                                   <span className={cn("leading-tight text-[var(--foreground)]", isNew && "font-bold")}>
                                     {displayText}
                                   </span>
                                 </div>
                               );
                           })}
                         </div>
                       </AsciiCard>
                     ))}
                     
                     {MOCK_QUEST_UPDATES.length > 2 && !showAllQuests && (
                       <Win95Button 
                         className="w-full text-xs h-8"
                         onClick={() => setShowAllQuests(true)}
                       >
                         [ LOAD MORE RECORDS ]
                       </Win95Button>
                     )}
                   </>
                 )}
              </div>
            </div>
            
            <Rule />
  
            {/* Quotes Section */}
            <div id="section-quotes" className="mb-12 scroll-mt-24">
              <SectionHeader className="mt-0 mb-6">Quote_Database</SectionHeader>
  
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_QUOTES.length === 0 ? (
                    <div className="col-span-2 text-center py-8 text-[var(--muted-foreground)] italic text-sm border border-dashed border-[var(--border)]">
                      No quotes found.
                    </div>
                ) : (
                  <>
                    {(showAllQuotes ? MOCK_QUOTES : MOCK_QUOTES.slice(0, 4)).map((quote) => (
                      <AsciiCard 
                        key={quote.id} 
                        className="bg-[var(--card)] flex flex-col justify-between"
                      >
                          <button
                            className="absolute top-2 right-2 h-6 w-6 flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            onClick={() => onJumpToTranscript(quote.timestamp)}
                            title="Jump to Transcript"
                          >
                            <Link className="w-3 h-3" />
                          </button>
                        
                        <div className="mb-4">
                           <QuoteBox className="my-0 text-center">"{quote.text}"</QuoteBox>
                        </div>
  
                        <div className="flex items-center gap-3 pt-2 border-t border-[var(--border)] mt-auto">
                          <div className="h-6 w-6 border border-[var(--border)] bg-[var(--muted)] flex items-center justify-center text-[10px] text-[var(--foreground)] font-bold">
                            {quote.initials}
                          </div>
                          <cite className="text-xs font-bold text-[var(--muted-foreground)] not-italic uppercase tracking-tight">
                            {quote.context}
                          </cite>
                          <span className="ml-auto text-[10px] text-[var(--muted-foreground)] font-mono">
                            {quote.timestamp}
                          </span>
                        </div>
                      </AsciiCard>
                    ))}
  
                    {MOCK_QUOTES.length > 4 && !showAllQuests && (
                       <div className="col-span-2">
                         <Win95Button 
                           className="w-full text-xs h-8"
                           onClick={() => setShowAllQuotes(true)}
                         >
                           [ LOAD MORE RECORDS ]
                         </Win95Button>
                       </div>
                     )}
                   </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}