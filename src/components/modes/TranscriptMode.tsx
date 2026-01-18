import { useEffect } from 'react';
import { cn } from '../ui/utils';

interface TranscriptModeProps {
  highlightedTimestamp?: string | null;
}

export function TranscriptMode({ highlightedTimestamp }: TranscriptModeProps) {
  const transcript = [
    { 
      speaker: "DM", 
      time: "12:05", 
      text: "As the clouds part, the Spire looms before you, its obsidian surface drinking in the moonlight. You can see the eastern entrance is guarded by three hobgoblins, pacing in a rhythmic pattern." 
    },
    { 
      speaker: "Valerius", 
      time: "12:06", 
      text: "I motion for the group to halt. 'Three of them. Standard formation. I can probably talk our way past if they're mercenaries.'" 
    },
    { 
      speaker: "Ignis", 
      time: "12:07", 
      text: "Or I could just burn them. It's faster." 
    },
    { 
      speaker: "DM", 
      time: "12:45", 
      text: "Valerius, you step out of the shadows. The lead hobgoblin snarls, hand going to his weapon. 'Halt! No entry by order of the Commander.'" 
    },
    { 
      speaker: "Valerius", 
      time: "12:46", 
      text: "I raise my hands. 'Peace, friend. We're expected. The shipment from the south? I have the paperwork right here.' I pulled out a scroll. [Rolls Persuasion: 4]" 
    },
    { 
      speaker: "DM", 
      time: "12:47", 
      text: "The guard squints at the blank parchment, then growls. 'That's a dinner menu. Kill them!' He draws his scimitar. Roll initiative." 
    },
    { 
      speaker: "Mira", 
      time: "13:10", 
      text: "With the guards down, I'm checking the guard post. Just tossing the place." 
    },
    { 
      speaker: "DM", 
      time: "13:11", 
      text: "Amidst the clutter, you find a rough parchment pinned to the table. It's a map of the first level. It shows a ventilation shaft in the north wall—a secret entrance." 
    },
    { 
      speaker: "Mira", 
      time: "13:15", 
      text: "Found a map! Looks like we have a way in that doesn't involve the front door. Also, 'Objective Updated', I guess." 
    },
    { 
      speaker: "DM", 
      time: "13:20", 
      text: "You also spot a note scrawled in red ink: 'The Artifact has been moved to the vault.' Make of that what you will." 
    },
    { 
      speaker: "Shadow Commander", 
      time: "14:00", 
      text: "You step into the main hall. A figure in black plate armor turns to face you. 'You think darkness is your ally? I was born in it, molded by it. You merely adopted the dark.'" 
    },
  ];

  useEffect(() => {
    if (highlightedTimestamp) {
      const element = document.getElementById(`transcript-${highlightedTimestamp}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedTimestamp]);

  return (
    <div className="h-full flex flex-col bg-[var(--background)] font-mono overflow-hidden">
       <div className="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden p-4 md:p-8 flex justify-center">
          <div className="w-full max-w-[90%] pb-20">
            <div className="px-6">
             <div className="text-[10px] text-[var(--muted-foreground)] border-b border-[var(--border)] pb-4 mb-8 uppercase tracking-[0.2em] font-mono flex justify-between items-center opacity-50">
               <span>// ARCHIVE_NODE_55: RAW_TRANSCRIPT_BUFFER</span>
               <span>v1.0.4-LTS</span>
             </div>
             
             {transcript.map((entry, i) => {
               const isHighlighted = entry.time === highlightedTimestamp;
               
               return (
                 <div 
                   key={i} 
                   id={`transcript-${entry.time}`}
                   className={cn(
                     "flex gap-8 group mb-8 transition-all duration-300 relative",
                     isHighlighted ? "bg-[var(--accent)]/10 p-4 -m-4 rounded-sm border border-[var(--accent)]/20" : ""
                   )}
                 >
                    {/* Left Column: Speaker and Time */}
                    <div className="w-24 shrink-0 flex flex-col items-start pt-1">
                       <div className={cn(
                         "text-[11px] font-bold uppercase tracking-tighter mb-1 transition-colors",
                         entry.speaker === "DM" ? "text-[var(--primary)]" : "text-[var(--foreground)]",
                         isHighlighted && "text-[var(--accent)]"
                       )}>
                         {entry.speaker}
                       </div>
                       <div className="text-[10px] text-[var(--muted-foreground)] font-mono opacity-70">
                         [{entry.time}]
                       </div>
                    </div>
                    
                    {/* Vertical Divider */}
                    <div className="w-[1px] bg-[var(--border)] shrink-0 self-stretch my-1" />
                    
                    {/* Right Column: Text */}
                    <div className="flex-1">
                       <p className={cn(
                         "text-[12px] leading-[1.7] font-normal tracking-wide transition-colors font-mono",
                         isHighlighted ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]",
                         entry.speaker === "DM" && !isHighlighted ? "text-[var(--foreground)] opacity-80" : ""
                       )}>
                         {entry.text}
                       </p>
                    </div>
                 </div>
               );
             })}
             
             <div className="text-center text-[10px] text-[var(--muted-foreground)] pt-16 pb-12 uppercase tracking-[0.4em] font-mono opacity-30">
               -- END OF STREAM --
             </div>
          </div>
       </div>
    </div>
    </div>
  );
}
