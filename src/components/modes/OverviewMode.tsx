import { ExternalLink, MapPin } from 'lucide-react';
import { Win95Divider } from '../ui/Win95Primitives';
import { AsciiBox } from '../AsciiBox';

export function OverviewMode({
  sessionTitle,
  onJumpToTranscript,
}: {
  sessionTitle: string;
  onJumpToTranscript: (timestamp: string) => void;
}) {
  // Mock Data from previous Sidebar
  const summary = {
    recap: "The party infiltrated the Cragmaw Hideout, defeated the goblin sentries, and confronted the bugbear leader Klarg. After a fierce battle, they rescued Sildar Hallwinter and learned about the mysterious Black Spider who seems to be orchestrating events in the region.",
    quote: {
      text: "Klarg roars and charges forward, his massive morningstar swinging toward Krag. But before it connects, Mira's arrow strikes true—right through the bugbear's throat. He crashes to the ground, and suddenly, the hideout is silent.",
      speaker: "DM",
      timestamp: "1:18:22"
    },
    meta: {
      duration: "2h 45m",
      location: "Cragmaw Hideout"
    }
  };
  const recapText = `${sessionTitle}\n\n${summary.recap}\n\n${summary.meta.duration} | ${summary.meta.location}`;
  const quoteText = `"${summary.quote.text}"\n\n— ${summary.quote.speaker} @ ${summary.quote.timestamp}`;
  const narrativeText = [
    "The party's journey into the Cragmaw Hideout began with a stealthy approach along the southern trail. Krag took point, using the dense foliage to mask his movement, while Mira kept watch from the rear. The sound of rushing water from the nearby stream masked their footsteps, allowing them to surprise the two goblin sentries posted outside the cave mouth.",
    "Inside the cave, the air grew damp and cold. The party navigated the slippery bridge, avoiding the flood trap triggered by the goblins in the twin pools room. Sildar Hallwinter was found bound and beaten in the eating cave, guarded by a particularly vicious goblin named Yeemik. Through careful negotiation—and a hefty bribe of 10 gold pieces—the party secured Sildar's release without further bloodshed.",
    "The final confrontation took place in the bugbear's quarters. Klarg, alerted by the noise, had prepared an ambush. However, the party's coordination proved superior. While the wolf Ripper was distracted by the bard's illusions, the fighter engaged Klarg directly. The battle was intense, with Klarg nearly felling the cleric with a single blow of his morningstar.",
    "Victory came swiftly after Klarg fell. Among his possessions, the party found crates marked with the Lionshield Coster seal, confirming the goblins had been raiding caravans. More importantly, a note found in Klarg's chest revealed he was taking orders from someone called \"The Black Spider,\" who sought the location of Wave Echo Cave.",
  ].join('\n\n');

  return (
    <div className="flex h-full w-full overflow-hidden bg-[var(--background)]">
      {/* Center Narrative Summary (The "Window") */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 flex justify-center">
         <div className="w-full max-w-[80ch]">
            <article className="max-w-none">
               
               {/* Summary & Quote Section */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                 {/* Recap */}
                 <div className="md:col-span-2">
                   <AsciiBox
                     design="simple"
                     content={recapText}
                     padding={24}
                     className="bg-[var(--card)]"
                     overlay={
                       <div>
                         <h1 className="mb-3 font-mono leading-none text-[var(--foreground)] text-[18px] font-bold tracking-tight">
                           {sessionTitle}
                         </h1>
                         <p className="text-[var(--text-base)] text-[var(--foreground)] opacity-80 leading-relaxed font-mono">
                           {summary.recap}
                         </p>

                         <div className="mt-auto pt-[7px] border-t border-dashed border-[var(--border)]">
                           <div className="flex items-center gap-3 text-[var(--muted-foreground)] text-[var(--text-base)] leading-none font-mono">
                             <span className="flex items-center gap-1 font-bold text-[var(--foreground)] opacity-90 text-[13px]">Jan 08, 2026</span>
                             <span className="opacity-30">|</span>
                             <span className="text-[13px]">{summary.meta.duration}</span>
                             <span className="opacity-30">|</span>
                             <span className="flex items-center gap-1 text-[13px]">
                               <MapPin className="w-3 h-3" />
                               {summary.meta.location}
                             </span>
                           </div>
                         </div>
                       </div>
                     }
                   />
                 </div>

                 {/* Quote */}
                 <div className="md:col-span-1">
                   <AsciiBox
                     design="scroll"
                     content={quoteText}
                     padding={24}
                     className="bg-[var(--card)]"
                     overlay={
                       <div>
                         <div className="flex-1">
                           <div className="text-[var(--text-base)] text-[var(--foreground)] opacity-80 leading-relaxed italic mb-2 font-mono border-l-2 border-[var(--border)] pl-2 my-2">
                             "{summary.quote.text}"
                           </div>
                         </div>
                         <div className="flex justify-end mt-2 pt-2 border-t border-dashed border-[var(--border)]">
                           <button
                             onClick={() => onJumpToTranscript(summary.quote.timestamp)}
                             className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:underline text-[10px] flex items-center gap-1 uppercase font-bold font-mono"
                             title="View in transcript"
                           >
                             <span>{summary.quote.timestamp}</span> <ExternalLink className="w-3 h-3" />
                           </button>
                         </div>
                       </div>
                     }
                   />
                 </div>
               </div>
               
               {/* Narrative Content */}
               <AsciiBox
                 design="parchment"
                 content={narrativeText}
                 padding={24}
                 className="bg-[var(--card)]"
                 overlay={
                   <div>
                     <div className="space-y-4 text-[var(--text-base)] leading-relaxed text-[var(--foreground)] font-[var(--font-weight-normal)]">
                       <p>
                         The party&apos;s journey into the Cragmaw Hideout began with a stealthy approach along the southern trail.
                         Krag took point, using the dense foliage to mask his movement, while Mira kept watch from the rear.
                         The sound of rushing water from the nearby stream masked their footsteps, allowing them to surprise the two goblin sentries posted outside the cave mouth.
                         <sup
                           className="ml-1 text-[var(--primary)] cursor-pointer hover:underline transition-none select-none text-[9px]"
                           onClick={() => onJumpToTranscript('0:12:45')}
                           title="View evidence"
                         >
                           [0:12:45]
                         </sup>
                       </p>

                       <p>
                         Inside the cave, the air grew damp and cold. The party navigated the slippery bridge, avoiding the flood trap triggered by the goblins in the twin pools room.
                         Sildar Hallwinter was found bound and beaten in the eating cave, guarded by a particularly vicious goblin named Yeemik.
                         Through careful negotiation—and a hefty bribe of 10 gold pieces—the party secured Sildar&apos;s release without further bloodshed.
                         <sup
                           className="ml-1 text-[var(--primary)] cursor-pointer hover:underline transition-none select-none text-[9px]"
                           onClick={() => onJumpToTranscript('0:45:20')}
                           title="View evidence"
                         >
                           [0:45:20]
                         </sup>
                       </p>

                       <p>
                         The final confrontation took place in the bugbear&apos;s quarters. Klarg, alerted by the noise, had prepared an ambush.
                         However, the party&apos;s coordination proved superior. While the wolf Ripper was distracted by the bard&apos;s illusions, the fighter engaged Klarg directly.
                         The battle was intense, with Klarg nearly felling the cleric with a single blow of his morningstar.
                         <sup
                           className="ml-1 text-[var(--primary)] cursor-pointer hover:underline transition-none select-none text-[9px]"
                           onClick={() => onJumpToTranscript('1:15:00')}
                           title="View evidence"
                         >
                           [1:15:00]
                         </sup>
                       </p>

                       <p>
                         Victory came swiftly after Klarg fell. Among his possessions, the party found crates marked with the Lionshield Coster seal, confirming the goblins had been raiding caravans.
                         More importantly, a note found in Klarg&apos;s chest revealed he was taking orders from someone called &quot;The Black Spider,&quot; who sought the location of Wave Echo Cave.
                         <sup
                           className="ml-1 text-[var(--primary)] cursor-pointer hover:underline transition-none select-none text-[9px]"
                           onClick={() => onJumpToTranscript('1:32:10')}
                           title="View evidence"
                         >
                           [1:32:10]
                         </sup>
                       </p>
                     </div>

                     <div className="mt-8 text-center">
                       <Win95Divider />
                       <div className="pt-2 text-[var(--text-base)] text-[var(--muted-foreground)]">
                         End of Session Log
                       </div>
                     </div>
                   </div>
                 }
               />

            </article>
         </div>
      </div>
    </div>
  );
}
