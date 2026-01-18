import * as React from "react"
import { Win95Button, Win95ListBox, Win95ListItem, Win95Panel, Win95GroupBox } from "./ui/Win95Primitives"
import { Dices, Trash2, History } from "lucide-react"
import { cn } from "./ui/utils"

interface RollResult {
  id: string;
  formula: string;
  total: number;
  results: number[];
  timestamp: string;
}

export function DiceRoller() {
  const [history, setHistory] = React.useState<RollResult[]>([]);
  const [currentFormula, setCurrentFormula] = React.useState<string>("");
  
  const diceTypes = [4, 6, 8, 10, 12, 20, 100];

  const rollDice = (sides: number, count: number = 1) => {
    const results = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
    const total = results.reduce((a, b) => a + b, 0);
    const newRoll: RollResult = {
      id: Date.now().toString(),
      formula: `${count}d${sides}`,
      total,
      results,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setHistory(prev => [newRoll, ...prev].slice(0, 20));
  };

  const clearHistory = () => setHistory([]);

  return (
    <div className="flex flex-col h-full gap-2 p-1 bg-background">
      <Win95GroupBox label="Roll Dice" className="grid grid-cols-4 gap-1">
        {diceTypes.map(d => (
          <Win95Button 
            key={d} 
            className="px-1 py-2 flex flex-col items-center gap-1 min-w-0"
            onClick={() => rollDice(d)}
          >
            <span className="text-[10px] font-bold">d{d}</span>
          </Win95Button>
        ))}
        <Win95Button className="px-1 py-2 flex flex-col items-center gap-1 min-w-0 bg-primary/10">
          <span className="text-[10px] font-bold">Cust</span>
        </Win95Button>
      </Win95GroupBox>

      <Win95Panel className="flex-1 flex flex-col min-h-0 bg-white">
        <div className="bg-muted px-2 py-0.5 border-b border-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase">
            <History className="w-3 h-3" />
            <span>Roll History</span>
          </div>
          <button onClick={clearHistory} className="text-[10px] hover:underline flex items-center gap-0.5">
             <Trash2 className="w-3 h-3" /> Clear
          </button>
        </div>
        
        <Win95ListBox className="flex-1 border-none shadow-none">
          {history.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground italic">
              No rolls yet. Click a die to begin.
            </div>
          ) : (
            history.map((roll) => (
              <Win95ListItem key={roll.id} className="border-b border-muted py-2 hover:bg-muted/30">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] text-muted-foreground font-mono">{roll.timestamp}</span>
                  <span className="text-xs font-bold text-primary">{roll.formula}</span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <div className="flex flex-wrap gap-1">
                    {roll.results.map((r, i) => (
                      <span key={i} className="text-[10px] bg-muted px-1 border border-muted-foreground/30">
                        {r}
                      </span>
                    ))}
                  </div>
                  <span className="text-lg font-bold leading-none">{roll.total}</span>
                </div>
              </Win95ListItem>
            ))
          )}
        </Win95ListBox>
      </Win95Panel>

      <div className="bg-muted border-t border-muted-foreground/30 p-1 flex items-center gap-2">
         <span className="text-[10px] font-bold uppercase">Last Total:</span>
         <span className="text-xl font-bold font-mono tracking-tighter">
           {history[0]?.total || "00"}
         </span>
      </div>
    </div>
  )
}