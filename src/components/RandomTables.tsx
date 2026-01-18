import * as React from "react"
import { Win95Button, Win95ListBox, Win95ListItem, Win95Panel, Win95GroupBox } from "./ui/Win95Primitives"
import { Package, Shuffle, History, ChevronRight } from "lucide-react"

interface TableCategory {
  id: string;
  name: string;
  tables: RandomTable[];
}

interface RandomTable {
  id: string;
  name: string;
  entries: string[];
}

interface RollResult {
  id: string;
  tableName: string;
  result: string;
  timestamp: string;
}

const RANDOM_TABLES: TableCategory[] = [
  {
    id: 'encounters',
    name: 'Encounters',
    tables: [
      {
        id: 'npc-personality',
        name: 'NPC Personality',
        entries: [
          'Gruff but secretly kind',
          'Overly cheerful and talkative',
          'Suspicious and paranoid',
          'Scholarly and absent-minded',
          'Greedy and opportunistic',
          'Noble and honorable',
          'Mysterious and cryptic',
          'Cowardly but well-meaning',
        ]
      },
      {
        id: 'tavern-events',
        name: 'Tavern Events',
        entries: [
          'A brawl breaks out between two patrons',
          'A bard performs an epic tale',
          'Someone spills ale on a party member',
          'A mysterious hooded figure watches the party',
          'The barkeep offers a quest',
          'A drunk patron shares wild rumors',
          'A gambling game is in progress',
          'Local guards enter looking for someone',
        ]
      },
      {
        id: 'wilderness-encounter',
        name: 'Wilderness Encounter',
        entries: [
          'Wandering merchant caravan',
          'Bandit ambush',
          'Wild animal (non-hostile)',
          'Abandoned campsite with clues',
          'Fellow adventurers',
          'Traveling pilgrims',
          'Monster tracks',
          'Hidden shrine or statue',
        ]
      }
    ]
  },
  {
    id: 'treasure',
    name: 'Treasure',
    tables: [
      {
        id: 'minor-trinkets',
        name: 'Minor Trinkets',
        entries: [
          'A silver locket with a faded portrait',
          'An ornate brass compass that always points north-east',
          'A small crystal that glows faintly in moonlight',
          'A deck of cards with hand-painted faces',
          'A pewter tankard with dwarven runes',
          'A silk handkerchief embroidered with initials',
          'A peculiar key with no apparent lock',
          'A small music box that plays a haunting melody',
        ]
      },
      {
        id: 'gems',
        name: 'Gemstones',
        entries: [
          'Azurite (opaque mottled deep blue)',
          'Obsidian (opaque black)',
          'Agate (translucent banded brown/blue/red)',
          'Jade (translucent light green)',
          'Pearl (opaque lustrous white/pink/black)',
          'Amber (transparent golden yellow)',
          'Amethyst (transparent deep purple)',
          'Sapphire (transparent blue-white)',
        ]
      }
    ]
  },
  {
    id: 'weather',
    name: 'Weather & Atmosphere',
    tables: [
      {
        id: 'weather',
        name: 'Weather',
        entries: [
          'Clear skies, pleasant temperature',
          'Overcast, slightly chilly',
          'Light rain, muddy roads',
          'Heavy fog, visibility reduced',
          'Strong winds, dust and debris',
          'Thunderstorm approaching',
          'Scorching heat, exhausting travel',
          'Unseasonably cold, frost visible',
        ]
      },
      {
        id: 'dungeon-atmosphere',
        name: 'Dungeon Atmosphere',
        entries: [
          'Oppressive silence, only echoes of footsteps',
          'Distant dripping water, damp walls',
          'Faint whispering sounds, origin unknown',
          'Musty smell of decay and rot',
          'Eerie green luminescence from fungi',
          'Cold draft, torches flicker',
          'Scratching sounds in the walls',
          'Ancient bloodstains on the floor',
        ]
      }
    ]
  },
  {
    id: 'names',
    name: 'Names',
    tables: [
      {
        id: 'human-names',
        name: 'Human Names',
        entries: [
          'Aldric Thornblade',
          'Gwyneth Stormwind',
          'Marcus Blackwood',
          'Elara Nightshade',
          'Gareth Ironforge',
          'Seraphina Moonwhisper',
          'Tobias Ashenheart',
          'Rosalind Silverbrook',
        ]
      },
      {
        id: 'tavern-names',
        name: 'Tavern Names',
        entries: [
          'The Prancing Pony',
          'The Dragon\'s Flagon',
          'The Rusty Anchor',
          'The Gilded Griffin',
          'The Silver Stag',
          'The Broken Keg',
          'The Wandering Minstrel',
          'The Copper Cauldron',
        ]
      }
    ]
  }
];

export function RandomTables() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>(RANDOM_TABLES[0].id);
  const [selectedTable, setSelectedTable] = React.useState<string | null>(null);
  const [history, setHistory] = React.useState<RollResult[]>([]);

  const currentCategory = RANDOM_TABLES.find(c => c.id === selectedCategory);
  const currentTable = currentCategory?.tables.find(t => t.id === selectedTable);

  const rollOnTable = (table: RandomTable) => {
    const randomIndex = Math.floor(Math.random() * table.entries.length);
    const result = table.entries[randomIndex];
    
    const newRoll: RollResult = {
      id: Date.now().toString(),
      tableName: table.name,
      result,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    
    setHistory(prev => [newRoll, ...prev].slice(0, 10));
  };

  const clearHistory = () => setHistory([]);

  return (
    <div className="flex h-full gap-0 bg-background">
      {/* Category Sidebar */}
      <div className="w-[140px] border-r-2 border-r-[#808080] bg-background flex flex-col">
        <div className="bg-muted px-2 py-1 border-b-2 border-b-[#808080]">
          <span className="text-[10px] font-bold uppercase">Categories</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {RANDOM_TABLES.map(category => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id);
                setSelectedTable(null);
              }}
              className={`w-full text-left px-2 py-1.5 text-[11px] border-b border-muted ${ 
                selectedCategory === category.id
                  ? 'bg-[#000080] text-white'
                  : 'hover:bg-muted'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tables List */}
        <div className="flex-1 flex flex-col border-b-2 border-b-[#808080]">
          <div className="bg-muted px-2 py-1 border-b-2 border-b-[#808080]">
            <span className="text-[10px] font-bold uppercase">{currentCategory?.name} Tables</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {currentCategory?.tables.map(table => (
              <div 
                key={table.id}
                className="border-2 border-t-white border-l-white border-r-black border-b-black bg-background p-2"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] font-bold">{table.name}</span>
                  <Win95Button
                    onClick={() => rollOnTable(table)}
                    className="px-2 py-0.5 h-[20px] flex items-center gap-1 min-w-0"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span className="text-[10px]">Roll</span>
                  </Win95Button>
                </div>
                <button
                  onClick={() => setSelectedTable(selectedTable === table.id ? null : table.id)}
                  className="text-[9px] text-muted-foreground hover:underline flex items-center gap-0.5"
                >
                  <ChevronRight className={`w-3 h-3 transition-transform ${selectedTable === table.id ? 'rotate-90' : ''}`} />
                  {table.entries.length} entries
                </button>
                
                {selectedTable === table.id && (
                  <div className="mt-2 bg-white border border-[#808080] p-2 max-h-[150px] overflow-y-auto">
                    <ul className="text-[10px] space-y-0.5">
                      {table.entries.map((entry, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-muted-foreground font-mono">{idx + 1}.</span>
                          <span>{entry}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* History Panel */}
        <div className="h-[180px] flex flex-col">
          <div className="bg-muted px-2 py-1 border-b-2 border-b-[#808080] flex items-center justify-between">
            <div className="flex items-center gap-1">
              <History className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase">Recent Rolls</span>
            </div>
            <button 
              onClick={clearHistory} 
              className="text-[10px] hover:underline"
            >
              Clear
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-white">
            {history.length === 0 ? (
              <div className="p-4 text-center text-[11px] text-muted-foreground italic">
                No rolls yet. Click "Roll" on any table.
              </div>
            ) : (
              <div className="divide-y divide-muted">
                {history.map(roll => (
                  <div key={roll.id} className="p-2 hover:bg-muted/30">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold text-primary">{roll.tableName}</span>
                      <span className="text-[9px] text-muted-foreground font-mono">{roll.timestamp}</span>
                    </div>
                    <div className="text-[11px]">{roll.result}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}