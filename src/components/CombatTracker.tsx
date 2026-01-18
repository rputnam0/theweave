import * as React from "react"
import { Win95Panel, Win95Button, Win95ListBox, Win95ListItem, Win95GroupBox } from "./ui/Win95Primitives"
import { Trash2, Plus, ArrowUp, Shield, Heart, Swords } from "lucide-react"
import { cn } from "./ui/utils"

interface Creature {
  id: string;
  name: string;
  initiative: number;
  hp: number;
  maxHp: number;
  ac: number;
  type: 'player' | 'enemy' | 'npc';
}

export function CombatTracker() {
  const [creatures, setCreatures] = React.useState<Creature[]>([
    { id: '1', name: 'Valerius', initiative: 18, hp: 45, maxHp: 52, ac: 18, type: 'player' },
    { id: '2', name: 'Zandalar', initiative: 15, hp: 32, maxHp: 32, ac: 14, type: 'player' },
    { id: '3', name: 'Goblin Chief', initiative: 12, hp: 22, maxHp: 22, ac: 15, type: 'enemy' },
    { id: '4', name: 'Goblin 1', initiative: 8, hp: 7, maxHp: 7, ac: 13, type: 'enemy' },
    { id: '5', name: 'Goblin 2', initiative: 5, hp: 7, maxHp: 7, ac: 13, type: 'enemy' },
  ]);

  const sortedCreatures = [...creatures].sort((a, b) => b.initiative - a.initiative);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const updateHp = (id: string, delta: number) => {
    setCreatures(prev => prev.map(c => 
      c.id === id ? { ...c, hp: Math.min(c.maxHp, Math.max(0, c.hp + delta)) } : c
    ));
  };

  const removeCreature = (id: string) => {
    setCreatures(prev => prev.filter(c => c.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <div className="flex flex-col gap-2 h-full p-1 bg-background">
      <div className="bg-background border border-t-[#808080] border-l-[#808080] border-r-white border-b-white flex items-center gap-1 px-1 py-1">
        <Win95Button className="px-2 py-1 text-[10px]" title="Add Creature">
          <Plus className="w-4 h-4" />
        </Win95Button>
        <Win95Button 
          className="px-2 py-1 text-[10px]"
          title="Remove Selected" 
          disabled={!selectedId}
          onClick={() => selectedId && removeCreature(selectedId)}
        >
          <Trash2 className="w-4 h-4" />
        </Win95Button>
        <div className="w-[1px] h-4 bg-muted-foreground mx-1" />
        <Win95Button className="px-2 py-1 text-[10px]" title="Sort Initiative">
          <ArrowUp className="w-4 h-4" />
        </Win95Button>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="grid grid-cols-12 px-2 text-[10px] font-bold uppercase text-muted-foreground mb-1">
          <div className="col-span-2 text-center">Init</div>
          <div className="col-span-4">Name</div>
          <div className="col-span-2 text-center">HP</div>
          <div className="col-span-2 text-center">AC</div>
          <div className="col-span-2"></div>
        </div>
        
        <Win95ListBox className="flex-1">
          {sortedCreatures.map((creature) => (
            <Win95ListItem 
              key={creature.id} 
              selected={selectedId === creature.id}
              onClick={() => setSelectedId(creature.id)}
              className="grid grid-cols-12 items-center gap-1 py-1"
            >
              <div className="col-span-2 text-center font-bold">{creature.initiative}</div>
              <div className={cn(
                "col-span-4 truncate font-medium",
                creature.type === 'enemy' ? 'text-red-600' : creature.type === 'player' ? 'text-blue-700' : 'text-foreground'
              )}>
                {creature.name}
              </div>
              <div className="col-span-2 text-center flex items-center justify-center gap-1">
                 <span className={creature.hp < creature.maxHp * 0.3 ? "text-red-600 font-bold" : ""}>{creature.hp}</span>
              </div>
              <div className="col-span-2 text-center">{creature.ac}</div>
              <div className="col-span-2 flex justify-end gap-1 px-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); updateHp(creature.id, -1); }}
                  className="w-4 h-4 bg-muted border border-t-white border-l-white border-r-black border-b-black flex items-center justify-center active:bg-[#dfdfdf] active:border-inset text-[10px]"
                >
                  -
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); updateHp(creature.id, 1); }}
                  className="w-4 h-4 bg-muted border border-t-white border-l-white border-r-black border-b-black flex items-center justify-center active:bg-[#dfdfdf] active:border-inset text-[10px]"
                >
                  +
                </button>
              </div>
            </Win95ListItem>
          ))}
        </Win95ListBox>
      </div>

      <Win95GroupBox label="Selected Stats" className="mt-auto">
        {selectedId ? (
          <div className="grid grid-cols-3 gap-2 py-1">
            {(() => {
              const c = creatures.find(x => x.id === selectedId);
              if (!c) return null;
              return (
                <>
                  <div className="flex flex-col items-center">
                    <Heart className="w-4 h-4 text-red-500 mb-1" />
                    <span className="text-xs font-bold">{c.hp} / {c.maxHp} HP</span>
                  </div>
                  <div className="flex flex-col items-center border-x-2 border-x-[#808080]/30">
                    <Shield className="w-4 h-4 text-blue-500 mb-1" />
                    <span className="text-xs font-bold">{c.ac} AC</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Swords className="w-4 h-4 text-orange-500 mb-1" />
                    <span className="text-xs font-bold">Init: {c.initiative}</span>
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          <div className="h-10 flex items-center justify-center text-xs italic text-muted-foreground">
            Select a creature to view details
          </div>
        )}
      </Win95GroupBox>
    </div>
  )
}
