import { useState, useRef } from 'react';
import { 
  Book, Search, User, Users, MapPin, Package, Shield, 
  Scroll, ChevronRight, ChevronDown, Globe, Menu, Settings, X
} from 'lucide-react';
import { 
  Win95MenuItem
} from './ui/Win95Primitives';
import { CampaignNavigation } from './CampaignNavigation';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface CodexArticle {
  id: string;
  title: string;
  category: 'npc' | 'player' | 'location' | 'item' | 'faction' | 'lore';
  content: string;
  infobox?: {
    image?: string;
    fields: { label: string; value: string }[];
  };
  categories: string[];
  relatedArticles: string[];
}

interface CodexPageProps {
  onNavigate: (page: string) => void;
  toggleWindow: (win: 'diceRoller' | 'combatTracker' | 'randomTables') => void;
}

const MOCK_ARTICLES: CodexArticle[] = [
  {
    id: 'sildar-hallwinter',
    title: 'Sildar Hallwinter',
    category: 'npc',
    content: `Sildar Hallwinter is a human warrior and member of the Lords' Alliance. He serves as a loyal agent dedicated to bringing law and order to the frontier settlements of the Sword Coast.

**Background**
Sildar was escorting supplies to Phandalin when he and his companion Gundren Rockseeker were ambushed by goblins. He was captured and held prisoner at the Cragmaw hideout until the adventuring party rescued him.

**Personality**
Sildar is a genial and professional soldier who takes his duties seriously. He is deeply concerned about the safety of civilians and works tirelessly to establish order in lawless regions. Despite his military bearing, he treats allies with warmth and respect.

**Current Status**
After being rescued, Sildar established himself in Phandalin to investigate the disappearance of Iarno Albrek, a fellow agent who was sent to help secure the town but has gone missing. He suspects foul play and offers rewards to adventurers who can help solve the mystery.`,
    infobox: {
      fields: [
        { label: 'Race', value: 'Human' },
        { label: 'Class', value: 'Fighter' },
        { label: 'Affiliation', value: "Lords' Alliance" },
        { label: 'Location', value: 'Phandalin' },
        { label: 'Status', value: 'Alive' },
        { label: 'First Appearance', value: 'Session 1' },
      ],
    },
    categories: ['NPCs', 'Lords\' Alliance', 'Phandalin', 'Humans', 'Fighters'],
    relatedArticles: ['gundren-rockseeker', 'phandalin', 'lords-alliance', 'iarno-albrek'],
  },
  {
    id: 'phandalin',
    title: 'Phandalin',
    category: 'location',
    content: `Phandalin is a small frontier township located in the foothills of the Sword Mountains, built on the ruins of a much older settlement. The town serves as a hub for miners, farmers, and prospectors seeking their fortune in the surrounding wilderness.

**History**
Centuries ago, Phandalin was a thriving human settlement with deep ties to nearby dwarven and gnome communities. However, it was sacked by orc raiders and abandoned for hundreds of years. In recent times, hardy settlers have rebuilt the town, constructing new homes and businesses amid the ancient ruins.

**Notable Locations**
The town features several key establishments including the Stonehill Inn (owned by Toblen Stonehill), Barthen's Provisions (the general store), the Shrine of Luck (a small temple to Tymora), and the Sleeping Giant tap house. The townmaster's hall serves as the center of local government.

**Current Situation**
Phandalin faces threats from bandits known as the Redbrands, who operate from a manor on the eastern edge of town. The townmaster, Harbin Wester, is ineffectual in dealing with this menace, leaving concerned citizens to seek help from passing adventurers.`,
    infobox: {
      fields: [
        { label: 'Type', value: 'Town' },
        { label: 'Region', value: 'Sword Coast' },
        { label: 'Population', value: '~50' },
        { label: 'Government', value: 'Townmaster' },
        { label: 'Ruler', value: 'Harbin Wester' },
        { label: 'Notable NPCs', value: 'Sildar, Toblen, Halia' },
      ],
    },
    categories: ['Locations', 'Settlements', 'Sword Coast', 'Frontier'],
    relatedArticles: ['sildar-hallwinter', 'redbrands', 'tresendar-manor', 'barthen'],
  },
  {
    id: 'wave-echo-cave',
    title: 'Wave Echo Cave',
    category: 'location',
    content: `Wave Echo Cave is a legendary lost mine rich in magical minerals and precious ores. The cavern got its name from the echoing sound of waves crashing on a subterranean shore, creating an eerie reverberating effect throughout the complex.

**The Phandelver's Pact**
Five hundred years ago, dwarves and gnomes of the Phandelver's Pact discovered the rich mine and began extracting ore. Alongside human spellcasters from Phandalin, they forged the Forge of Spells - a magical workshop capable of creating powerful enchanted items.

**The Downfall**
Orc hordes attacked Wave Echo Cave, slaughtering the defenders and triggering a magical explosion that collapsed sections of the mine. The location was lost for centuries until Gundren Rockseeker and his brothers discovered a map leading to its entrance.

**Current State**
The cave is now haunted by undead, inhabited by monsters, and its magical forge lies dormant. The Black Spider (a drow villain) seeks to claim the Forge of Spells for his own dark purposes.`,
    infobox: {
      fields: [
        { label: 'Type', value: 'Dungeon/Mine' },
        { label: 'Region', value: 'Near Phandalin' },
        { label: 'Status', value: 'Lost (recently rediscovered)' },
        { label: 'Danger Level', value: 'High' },
        { label: 'Notable Feature', value: 'Forge of Spells' },
      ],
    },
    categories: ['Locations', 'Dungeons', 'Mines', 'Historical Sites'],
    relatedArticles: ['gundren-rockseeker', 'forge-of-spells', 'black-spider', 'phandalin'],
  },
  {
    id: 'redbrands',
    title: 'The Redbrands',
    category: 'faction',
    content: `The Redbrands are a gang of criminals and ruffians who have taken control of Phandalin through intimidation and violence. They are named for the scarlet cloaks they wear as a symbol of their membership.

**Leadership**
The gang is led by a mysterious figure known as Glasstaff, who operates from a base beneath Tresendar Manor. The Redbrands believe their leader to be a powerful wizard, which adds to the fear they inspire in the townspeople.

**Activities**
The Redbrands engage in theft, extortion, and assault. They have murdered several townsfolk who resisted their demands and kidnapped others. The gang has essentially paralyzed the town's legitimate authorities through fear and corruption.

**True Nature**
Unknown to most of the Redbrands, their leader Glasstaff (actually Iarno Albrek, a former Lords' Alliance agent) is working for a larger criminal organization known as the Zhentarim. The gang is merely a tool in a broader scheme to control trade routes in the region.`,
    infobox: {
      fields: [
        { label: 'Type', value: 'Criminal Gang' },
        { label: 'Leader', value: 'Glasstaff' },
        { label: 'Base', value: 'Tresendar Manor' },
        { label: 'Influence', value: 'Phandalin' },
        { label: 'Allegiance', value: 'Zhentarim (secret)' },
        { label: 'Status', value: 'Active' },
      ],
    },
    categories: ['Factions', 'Criminal Organizations', 'Phandalin', 'Antagonists'],
    relatedArticles: ['glasstaff', 'tresendar-manor', 'phandalin', 'zhentarim'],
  },
  {
    id: 'staff-of-defense',
    title: 'Staff of Defense',
    category: 'item',
    content: `The Staff of Defense is a magical quarterstaff that provides protection to its wielder. This elegant weapon is carved from sturdy oak and inscribed with protective runes that glow faintly when danger approaches.

**Properties**
This staff functions as a +1 quarterstaff in combat. While holding the staff, the wielder gains a +1 bonus to Armor Class. The staff has 10 charges and regains 1d6 + 4 expended charges daily at dawn.

**Special Abilities**
The wielder can use an action to expend 1 or more of the staff's charges to cast one of the following spells: mage armor (1 charge) or shield (2 charges). The spells use the wielder's spell save DC and spellcasting ability, or DC 15 if the wielder doesn't have a spellcasting ability.

**Discovery**
This staff was found in the possession of Glasstaff within the Redbrand hideout beneath Tresendar Manor. It was likely acquired through his connections to the Zhentarim.`,
    infobox: {
      fields: [
        { label: 'Type', value: 'Weapon (Quarterstaff)' },
        { label: 'Rarity', value: 'Rare' },
        { label: 'Requires Attunement', value: 'No' },
        { label: 'Charges', value: '10' },
        { label: 'Found', value: 'Tresendar Manor' },
        { label: 'Current Owner', value: '[Party Member]' },
      ],
    },
    categories: ['Items', 'Magical Items', 'Weapons', 'Staves'],
    relatedArticles: ['glasstaff', 'tresendar-manor', 'redbrand-hideout'],
  },
  {
    id: 'main',
    title: 'Main Page',
    category: 'lore',
    content: `Welcome to the Campaign Codex, the definitive encyclopedia for our adventures in the Forgotten Realms. This database is maintained by the Dungeon Master for the benefit of the party.

**Featured Article: Phandalin**
Phandalin is a small frontier township located in the foothills of the Sword Mountains. Once a thriving settlement, it was destroyed by orcs centuries ago and has only recently been resettled. The town now serves as a hub for prospectors and adventurers.

**Did You Know...**
*   ...that the Redbrands are actually led by a former member of the Lords' Alliance?
*   ...that Wave Echo Cave contains a magical forge capable of enchanting weapons?
*   ...that Sildar Hallwinter was originally captured while escorting supplies for Gundren Rockseeker?

**In The News**
*   **Session 3:** The party successfully cleared the Redbrand Hideout and defeated Glasstaff's familiar.
*   **Session 2:** Sildar Hallwinter was rescued from the Cragmaw Hideout.
*   **Session 1:** The party was ambushed by goblins on the Triboar Trail.`,
    categories: ['System'],
    relatedArticles: ['phandalin', 'redbrands', 'sildar-hallwinter'],
  },
  {
    id: 'contents',
    title: 'Contents',
    category: 'lore',
    content: `Overview of all categories in the Campaign Codex.

**People & Factions**
*   **NPCs:** Key figures like Sildar Hallwinter and Gundren Rockseeker.
*   **Factions:** Organizations such as the Lords' Alliance, The Redbrands, and The Zhentarim.
*   **Enemies:** Goblins, Bugbears, and other threats.

**Geography**
*   **Locations:** Towns like Phandalin and dungeons like Wave Echo Cave.
*   **Regions:** The Sword Coast, Neverwinter Wood, and the Sword Mountains.

**Items & Magic**
*   **Magic Items:** Artifacts like the Staff of Defense.
*   **Loot:** Valuable treasures found during adventures.`,
    categories: ['System'],
    relatedArticles: [],
  },
  {
    id: 'current-events',
    title: 'Current Events',
    category: 'lore',
    content: `A timeline of recent events in the campaign.

**Eleint 14, 1491 DR (Session 3)**
The party infiltrated Tresendar Manor, the base of operations for the Redbrands. After a fierce battle in the cellar, they discovered the Nothic guardian and negotiated safe passage. They later confronted Glasstaff's minions, liberating several prisoners from the slave pens.

**Eleint 13, 1491 DR (Session 2)**
Upon arriving in Phandalin, the party delivered Gundren's supplies to Barthen's Provisions. They learned of the Redbrand threat from the townmaster but decided to first investigate the Cragmaw Hideout to rescue Sildar Hallwinter. The rescue was successful, though Yeemik escaped.

**Eleint 11, 1491 DR (Session 1)**
The adventure began on the High Road south of Neverwinter. The party's wagon was ambushed by goblins. Tracking the attackers back to their lair, they discovered the entrance to the Cragmaw Hideout.`,
    categories: ['System', 'Timeline'],
    relatedArticles: ['phandalin', 'sildar-hallwinter'],
  },
  {
    id: 'about',
    title: 'About Campaign Codex',
    category: 'lore',
    content: `Campaign Codex is a proprietary database software running on the Dungeon Master's Terminal (DMT) OS. It is designed to organize and present lore, NPC data, and session logs in an accessible format for players.

**Version:** 1.0.4 (Build 95)
**License:** Open Game License (OGL)
**Developer:** Wizards of the Coast / DM Tech

This software simulates a "wiki" interface, allowing for cross-linking of articles and easy navigation through categories.`,
    categories: ['System'],
    relatedArticles: [],
  },
  {
    id: 'contact',
    title: 'Contact Dungeon Master',
    category: 'lore',
    content: `For inquiries regarding rules clarifications, scheduling, or character grievances, please use the following channels:

**Discord:** Direct Message
**Email:** dm@campaign.net
**In-Person:** Carrier Pigeon or Smoke Signals (during sessions only)

Please note that bribe attempts for magical items must be submitted in writing (and accompanied by snacks).`,
    categories: ['System'],
    relatedArticles: [],
  },
  {
    id: 'donate',
    title: 'Support the Campaign',
    category: 'lore',
    content: `Keeping the realms running requires caffeine and snacks. If you would like to support the Dungeon Master and ensure the survival of your character, consider the following donations:

*   **Pizza:** Always accepted. Grants Inspiration (1d4).
*   **Soda/Coffee:** Prevents DM Fatigue levels.
*   **Miniatures:** Grants Advantage on "Coolness" checks.
*   **Dice:** One can never have enough math rocks.

*Disclaimer: Donations do not guarantee immunity from Critical Failures or TPKs.*`,
    categories: ['System'],
    relatedArticles: [],
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Articles', icon: Book, color: 'text-black' },
  { id: 'npc', label: 'NPCs', icon: User, color: 'text-blue-600' },
  { id: 'player', label: 'Player Characters', icon: Users, color: 'text-green-600' },
  { id: 'location', label: 'Locations', icon: MapPin, color: 'text-red-600' },
  { id: 'item', label: 'Items', icon: Package, color: 'text-purple-600' },
  { id: 'faction', label: 'Factions', icon: Shield, color: 'text-orange-600' },
  { id: 'lore', label: 'Lore & History', icon: Scroll, color: 'text-amber-700' },
];

export function CodexPage({ onNavigate, toggleWindow }: CodexPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArticleId, setSelectedArticleId] = useState<string>('sildar-hallwinter');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Flattened categories for the "wiki sidebar" look
  const wikiSidebarLinks = [
    { label: 'Main page', action: () => setSelectedArticleId('main') },
    { label: 'Contents', action: () => setSelectedArticleId('contents') },
    { label: 'Current events', action: () => setSelectedArticleId('current-events') },
    { label: 'Random article', action: () => {
      const random = MOCK_ARTICLES[Math.floor(Math.random() * MOCK_ARTICLES.length)];
      setSelectedArticleId(random.id);
    }},
    { label: 'About Codex', action: () => setSelectedArticleId('about') },
    { label: 'Contact DM', action: () => setSelectedArticleId('contact') },
    { label: 'Donate', action: () => setSelectedArticleId('donate') },
  ];

  const selectedArticle = MOCK_ARTICLES.find(a => a.id === selectedArticleId);

  const filteredArticles = MOCK_ARTICLES.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const [isEditing, setIsEditing] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleRandom = () => {
    const random = MOCK_ARTICLES[Math.floor(Math.random() * MOCK_ARTICLES.length)];
    setSelectedArticleId(random.id);
  };

  const handleEdit = () => {
    setIsEditing(true);
    // In a real app, this would enable content editing
    alert("Edit mode enabled - Changes will be local only");
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
            onClick={() => alert("New Article creation not implemented yet.")}
          >
            <span className="relative z-10"><u>N</u>ew Article</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => searchInputRef.current?.focus()}
          >
            <span className="relative z-10"><u>O</u>pen...</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => alert("Saved successfully!")}
          >
            <span className="relative z-10"><u>S</u>ave</span>
          </DropdownMenuItem>
          <div className="h-[2px] border-t border-t-muted-foreground border-b border-b-input my-1 mx-1" />
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={handlePrint}
          >
            <span className="relative z-10"><u>P</u>rint</span>
          </DropdownMenuItem>
          <div className="h-[2px] border-t border-t-muted-foreground border-b border-b-input my-1 mx-1" />
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => onNavigate('sessions')}
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
            onClick={handleEdit}
          >
            <span className="relative z-10"><u>E</u>dit Article</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => alert("Delete not supported in demo mode.")}
          >
            <span className="relative z-10"><u>D</u>elete Article</span>
          </DropdownMenuItem>
          <div className="h-[2px] border-t border-t-muted-foreground border-b border-b-input my-1 mx-1" />
          <DropdownMenuItem 
            className="focus:bg-primary focus:text-primary-foreground rounded-none px-3 py-0.5 h-[22px] text-[11px] cursor-default font-normal leading-none relative"
            onClick={() => searchInputRef.current?.focus()}
          >
            <span className="relative z-10"><u>F</u>ind...</span>
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
            onClick={handleRandom}
          >
            <span className="relative z-10"><u>R</u>andom Article</span>
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
            onClick={() => alert("Campaign Codex v1.0\nA Windows 95 Style RPG Manager")}
          >
            <span className="relative z-10"><u>A</u>bout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  return (
    <div className="h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] overflow-hidden border-2 border-t-[var(--input)] border-l-[var(--input)] border-r-[var(--border)] border-b-[var(--border)] shadow-[1px_1px_0_0_var(--muted-foreground),2px_2px_0_0_var(--border)]">
      
      <CampaignNavigation 
        activePage="codex"
        onNavigate={onNavigate}
        toggleWindow={toggleWindow}
        pageTitle="Campaign Codex - Encyclopedia"
        menuItems={menuItems}
      />

      {/* Main Content Area - Wiki Style */}
      <div className="flex-1 flex overflow-hidden bg-[var(--card)]">
        
        {/* Left Sidebar (Wiki Style) */}
        <div className="w-[160px] bg-[var(--muted)]/30 border-r-2 border-[var(--border)] overflow-y-auto flex-shrink-0 hidden md:block">
          <div className="p-4 flex justify-center mb-4">
             <div className="w-24 h-24 rounded-full bg-[var(--card)] border-2 border-[var(--border)] flex items-center justify-center shadow-sm">
                <Globe className="w-16 h-16 text-[var(--muted-foreground)]" />
             </div>
          </div>
          
          <div className="px-4 mb-6">
            <div className="text-[11px] font-bold text-[var(--muted-foreground)] border-b border-[var(--border)] pb-1 mb-1">
              Navigation
            </div>
            <ul className="space-y-1">
              {wikiSidebarLinks.map((link, idx) => (
                <li key={idx}>
                  <button 
                    onClick={link.action}
                    className="text-[var(--primary)] hover:underline text-[12px]"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="px-4 mb-6">
            <div className="text-[11px] font-bold text-[var(--muted-foreground)] border-b border-[var(--border)] pb-1 mb-1">
              Categories
            </div>
            <ul className="space-y-1">
              {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                <li key={cat.id}>
                  <button 
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`text-[12px] hover:underline ${selectedCategory === cat.id ? 'font-bold text-[var(--foreground)]' : 'text-[var(--primary)]'}`}
                  >
                    {cat.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 overflow-y-auto flex flex-col bg-[var(--input)]">
          
          {/* Wiki Header (Search) */}
          <div className="h-[50px] border-b-2 border-[var(--border)] flex items-center px-4 bg-[var(--card)] sticky top-0 z-10 shadow-sm">
             <div className="flex items-center gap-4 w-full">
                <div className="md:hidden">
                   <Menu className="w-5 h-5 text-[var(--muted-foreground)]" />
                </div>
                <div className="flex-1 max-w-xl flex items-center">
                   <div className="relative w-full">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                      <input 
                        ref={searchInputRef}
                        type="text" 
                        placeholder="Search Database..." 
                        className="w-full pl-8 pr-4 py-1.5 border-2 border-t-[var(--muted-foreground)] border-l-[var(--muted-foreground)] border-r-[var(--input)] border-b-[var(--input)] bg-[var(--background)] text-[var(--foreground)] text-[13px] placeholder:text-[var(--muted-foreground)] focus:outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                   </div>
                   <button className="ml-2 px-3 py-1.5 bg-[var(--card)] border-2 border-t-[var(--input)] border-l-[var(--input)] border-r-[var(--muted-foreground)] border-b-[var(--muted-foreground)] text-[13px] font-bold text-[var(--foreground)] active:border-t-[var(--muted-foreground)] active:border-l-[var(--muted-foreground)] active:border-r-[var(--input)] active:border-b-[var(--input)]">
                      Search
                   </button>
                </div>
                <div className="ml-auto text-[12px] text-[var(--primary)] hidden md:block">
                   Logged in as <span className="text-[var(--foreground)] font-bold">DungeonMaster</span>
                </div>
             </div>
          </div>

          {/* Article Content */}
          <div className="p-6 md:p-8 max-w-[1000px] w-full">
            {selectedArticle ? (
              <>
                <div className="flex justify-between items-end border-b-2 border-[var(--border)] mb-4">
                   <div>
                      <h1 className="text-[28px] font-bold italic text-[var(--foreground)] leading-tight border-b-0 pb-0">
                        {selectedArticle.title}
                      </h1>
                      <div className="text-[12px] text-[var(--muted-foreground)] mt-1 mb-2">From Campaign Codex, the party database</div>
                   </div>
                   <div className="flex gap-1 text-[13px]">
                      <div className="px-3 py-1 bg-[var(--input)] border-t-2 border-l-2 border-r-2 border-[var(--border)] border-b-[var(--input)] z-10 mb-[-2px] pb-2 font-bold">Read</div>
                      <div className="px-3 py-1 bg-[var(--muted)]/30 text-[var(--primary)] hover:bg-[var(--muted)]/50 cursor-pointer border-t-2 border-l-2 border-r-2 border-transparent">Edit</div>
                      <div className="px-3 py-1 bg-[var(--muted)]/30 text-[var(--primary)] hover:bg-[var(--muted)]/50 cursor-pointer border-t-2 border-l-2 border-r-2 border-transparent">History</div>
                   </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Article Text */}
                  <div className="flex-1 text-[var(--foreground)] text-[14px] leading-relaxed">
                    {/* Intro paragraph (extract from content) */}
                    {selectedArticle.content.split('\n\n').map((paragraph, idx) => {
                      if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                        // Section header
                        const headerText = paragraph.replace(/\*\*/g, '');
                        return (
                          <div key={idx} className="mt-6 mb-3">
                            <h2 className="text-[20px] font-bold border-b border-[var(--border)] pb-1 mb-2 flex items-center">
                              {headerText}
                              <span className="text-[12px] text-[var(--primary)] ml-auto font-normal cursor-pointer">[edit]</span>
                            </h2>
                          </div>
                        );
                      }
                      // Regular paragraph
                      // Simulate wiki links for names in mock data
                      const linkedText = paragraph.split(' ').map((word, wIdx) => {
                         const cleanWord = word.replace(/[.,]/g, '');
                         const isLink = ['Phandalin', 'Sildar', 'Gundren', 'Cragmaw', 'Klarg', 'Redbrands'].includes(cleanWord);
                         return isLink ? <span key={wIdx} className="text-[var(--primary)] hover:underline cursor-pointer">{word} </span> : word + ' ';
                      });

                      return (
                        <p key={idx} className="mb-3">
                          {linkedText}
                          {idx === 0 && <sup className="text-[var(--primary)] cursor-pointer">[1]</sup>}
                        </p>
                      );
                    })}

                    {/* See Also Section */}
                    <div className="mt-8">
                       <h2 className="text-[20px] font-bold border-b border-[var(--border)] pb-1 mb-2 flex items-center">
                          See also
                          <span className="text-[12px] text-[var(--primary)] ml-auto font-normal cursor-pointer">[edit]</span>
                       </h2>
                       <ul className="list-disc pl-5 space-y-1">
                          {selectedArticle.relatedArticles.map(rel => {
                             const relArt = MOCK_ARTICLES.find(a => a.id === rel);
                             if (!relArt) return null;
                             return (
                               <li key={rel}>
                                  <button onClick={() => setSelectedArticleId(rel)} className="text-[var(--primary)] hover:underline">
                                     {relArt.title}
                                  </button>
                               </li>
                             )
                          })}
                       </ul>
                    </div>
                  </div>

                  {/* Infobox */}
                  {selectedArticle.infobox && (
                    <div className="w-full md:w-[300px] flex-shrink-0 mb-6 md:mb-0 order-first md:order-last">
                      <div className="border-2 border-t-[var(--input)] border-l-[var(--input)] border-r-[var(--muted-foreground)] border-b-[var(--muted-foreground)] bg-[var(--card)] p-1 text-[88%] leading-tight shadow-md">
                        <div className="bg-[var(--primary)]/20 text-center font-bold p-1 border border-[var(--border)] mb-1">
                           {selectedArticle.title}
                        </div>
                        {/* Placeholder Image */}
                        <div className="border border-[var(--border)] bg-[var(--background)] p-1 mb-1">
                           <div className="w-full aspect-[4/3] bg-[var(--muted)]/20 flex items-center justify-center text-[var(--muted-foreground)]">
                              <Globe className="w-16 h-16 opacity-20" />
                           </div>
                           <div className="text-[10px] text-center mt-1 text-[var(--muted-foreground)]">
                              Artist's depiction of {selectedArticle.title}
                           </div>
                        </div>
                        
                        <table className="w-full border-collapse">
                           <tbody>
                              {selectedArticle.infobox.fields.map((field, idx) => (
                                 <tr key={idx} className={idx % 2 === 0 ? '' : 'bg-[var(--muted)]/10'}>
                                    <th className="text-left font-bold py-1 pr-2 align-top text-[var(--muted-foreground)]">{field.label}</th>
                                    <td className="py-1 align-top">{field.value}</td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-[var(--muted-foreground)]">
                 <Globe className="w-24 h-24 mb-4 opacity-20" />
                 <p className="text-lg">Welcome to the Campaign Codex</p>
                 <p className="text-sm">Search for an article or select a category to begin.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
