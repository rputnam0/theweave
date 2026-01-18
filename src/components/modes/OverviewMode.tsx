import { Win95Divider } from '../ui/Win95Primitives';
import { AsciiBox } from '../AsciiBox';
import { countWrappedLines } from '../../utils/asciiBox';

const PROTOTYPE_PADDING_PX = 24;
const CHAR_WIDTH_PX = 6.6;
const LINE_HEIGHT_PX = 13.2;
const PAD_COLS = Math.max(1, Math.round(PROTOTYPE_PADDING_PX / CHAR_WIDTH_PX));
const PAD_ROWS = Math.max(1, Math.round(PROTOTYPE_PADDING_PX / LINE_HEIGHT_PX));
const GRID_MAX_COLS = 86;
const GRID_GAP_PX = 10;
const MIN_BOX_COLS = 22;

export function OverviewMode({
  selectedSession,
}: {
  selectedSession: { title: string };
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

  const recapText = `${selectedSession.title}\n\n${summary.recap}\n\n${summary.meta.duration} | ${summary.meta.location}`;
  const quoteText = `"${summary.quote.text}"\n\n— ${summary.quote.speaker} @ ${summary.quote.timestamp}`;
  const gapCols = Math.max(1, Math.round(GRID_GAP_PX / 6.6));
  const availableCols = GRID_MAX_COLS - gapCols - 1;
  let recapCols = Math.floor((availableCols * 2) / 3);
  let quoteCols = availableCols - recapCols;
  if (recapCols < MIN_BOX_COLS) recapCols = MIN_BOX_COLS;
  if (quoteCols < MIN_BOX_COLS) quoteCols = MIN_BOX_COLS;
  const recapInner = Math.max(10, recapCols - (PAD_COLS * 2) - 2);
  const quoteInner = Math.max(10, quoteCols - (PAD_COLS * 2) - 2);
  const recapLines = countWrappedLines(recapText, recapInner);
  const quoteLines = countWrappedLines(quoteText, quoteInner);
  const sharedRows = Math.max(recapLines, quoteLines) + (PAD_ROWS * 2) + 2;

  return (
    <div className="flex h-full w-full overflow-hidden bg-[var(--background)]">
      {/* Center Narrative Summary (The "Window") */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 flex justify-center">
         <div className="w-full max-w-[80ch]">
            <article className="max-w-none">
               
               {/* Summary & Quote Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                 {/* Recap */}
                 <div className="md:col-span-2 h-full">
                   <AsciiBox
                     design="simple"
                     cols={recapCols}
                     rows={sharedRows}
                     className="bg-[var(--card)]"
                     content={recapText}
                     padding={PROTOTYPE_PADDING_PX}
                     title={selectedSession.title}
                     titleClassName="text-[12px] font-bold bg-[var(--card)] px-1"
                   />
                 </div>

                 {/* Quote */}
                 <div className="md:col-span-1 h-full">
                   <AsciiBox
                     design="simple"
                     cols={quoteCols}
                     rows={sharedRows}
                     className="bg-[var(--card)]"
                     content={quoteText}
                     padding={PROTOTYPE_PADDING_PX}
                   />
                 </div>
               </div>
               
               {/* Narrative Content */}
               <AsciiBox
                 design="parchment"
                 cols={GRID_MAX_COLS}
                 className="bg-[var(--card)]"
                 content={[
                   "The party's journey into the Cragmaw Hideout began with a stealthy approach along the southern trail. Krag took point, using the dense foliage to mask his movement, while Mira kept watch from the rear. The sound of rushing water from the nearby stream masked their footsteps, allowing them to surprise the two goblin sentries posted outside the cave mouth.",
                   "Inside the cave, the air grew damp and cold. The party navigated the slippery bridge, avoiding the flood trap triggered by the goblins in the twin pools room. Sildar Hallwinter was found bound and beaten in the eating cave, guarded by a particularly vicious goblin named Yeemik. Through careful negotiation—and a hefty bribe of 10 gold pieces—the party secured Sildar's release without further bloodshed.",
                   "The final confrontation took place in the bugbear's quarters. Klarg, alerted by the noise, had prepared an ambush. However, the party's coordination proved superior. While the wolf Ripper was distracted by the bard's illusions, the fighter engaged Klarg directly. The battle was intense, with Klarg nearly felling the cleric with a single blow of his morningstar.",
                   "Victory came swiftly after Klarg fell. Among his possessions, the party found crates marked with the Lionshield Coster seal, confirming the goblins had been raiding caravans. More importantly, a note found in Klarg's chest revealed he was taking orders from someone called \"The Black Spider,\" who sought the location of Wave Echo Cave.",
                 ].join('\n\n')}
                 padding={PROTOTYPE_PADDING_PX}
               />

               <div className="mt-8 text-center">
                 <Win95Divider />
                 <div className="pt-2 text-[var(--text-base)] text-[var(--muted-foreground)]">
                   End of Session Log
                 </div>
               </div>
            </article>
         </div>
      </div>
    </div>
  );
}
