interface SessionNotesPanelProps {
  session?: any;
}

export function SessionNotesPanel({ session }: SessionNotesPanelProps) {
  return (
    <div className="h-full flex flex-col gap-1">
      <div className="flex-1 relative">
        <textarea 
          className="absolute inset-0 w-full h-full bg-white text-black p-2 outline-none border-2 border-t-muted-foreground border-l-muted-foreground border-r-input border-b-input font-sans text-[12px] resize-none leading-normal shadow-[inset_1px_1px_0_0_var(--muted-foreground)]"
          placeholder="Start typing session notes..."
          defaultValue={session ? `Notes for Session #${session.number}: ${session.title}\n----------------------------------------\n\n` : ''}
        />
      </div>
      
      <div className="h-[18px] border border-t-muted-foreground border-l-muted-foreground border-r-input border-b-input bg-input px-1 flex items-center justify-between text-[10px] text-muted-foreground select-none">
        <span>Ln 1, Col 1</span>
        <span>{session ? session.id.toUpperCase() : 'NO_SESSION'}</span>
      </div>
    </div>
  );
}
