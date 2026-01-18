import { 
  X,
  CheckCircle2,
  Clock,
  Zap,
  AlertTriangle,
  Hash,
  Calendar
} from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { cn } from '../ui/utils';

interface SessionMetadataPanelProps {
  onClose: () => void;
}

export function SessionMetadataPanel({ onClose }: SessionMetadataPanelProps) {
  // Mock metadata
  const metadata = {
    runStatus: 'completed' as const,
    createdAt: 'Dec 22, 9:30 PM',
    duration: '5m 47s',
    usage: '~$0.18',
    needsReviewCount: 3,
    lastUpdated: '2 minutes ago',
    modelVersion: 'gpt-4o-2024-08-06',
    promptHash: 'a4f3c2d1',
    pipelineVersion: 'v2.3.1',
    stats: {
      entities: 24,
      quotes: 18,
      events: 12,
      scenes: 6,
      threads: 4,
    },
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="h-14 shrink-0 px-4 border-b border-border flex items-center justify-between bg-[var(--color-parchment-medium)]">
        <span className="text-sm text-[var(--color-ink-dark)]">Session Metadata</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6 h-full overflow-y-auto">
          {/* Current Run Status */}
          <div>
            <div className="text-xs text-muted-foreground mb-2">Current Run</div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm text-[var(--color-ink-dark)]">Completed</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {metadata.createdAt}
            </div>
          </div>

          <Separator />

          {/* Needs Review */}
          {metadata.needsReviewCount > 0 && (
            <>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm text-[var(--color-ink-dark)]">
                    {metadata.needsReviewCount} items need review
                  </span>
                </div>
                <button className="text-xs text-[var(--color-ink-medium)] hover:text-[var(--color-ink-dark)] underline">
                  View review queue
                </button>
              </div>

              <Separator />
            </>
          )}

          {/* Processing Stats */}
          <div>
            <div className="text-xs text-muted-foreground mb-3">Processing Stats</div>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Duration:</span>
                <span className="text-[var(--color-ink-dark)] ml-auto">{metadata.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Usage:</span>
                <span className="text-[var(--color-ink-dark)] ml-auto">{metadata.usage}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Last updated:</span>
                <span className="text-[var(--color-ink-dark)] ml-auto">{metadata.lastUpdated}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Extracted Artifacts */}
          <div>
            <div className="text-xs text-muted-foreground mb-3">Extracted Artifacts</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Entities</span>
                <Badge variant="secondary" className="text-xs">
                  {metadata.stats.entities}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Quotes</span>
                <Badge variant="secondary" className="text-xs">
                  {metadata.stats.quotes}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Events</span>
                <Badge variant="secondary" className="text-xs">
                  {metadata.stats.events}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Scenes</span>
                <Badge variant="secondary" className="text-xs">
                  {metadata.stats.scenes}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Threads</span>
                <Badge variant="secondary" className="text-xs">
                  {metadata.stats.threads}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Technical Details */}
          <div>
            <div className="text-xs text-muted-foreground mb-3">Technical Details</div>
            <div className="space-y-2 text-xs">
              <div>
                <div className="text-muted-foreground mb-0.5">Model</div>
                <div className="text-[var(--color-ink-dark)] font-mono text-[11px]">
                  {metadata.modelVersion}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground mb-0.5">Pipeline Version</div>
                <div className="text-[var(--color-ink-dark)] font-mono text-[11px]">
                  {metadata.pipelineVersion}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground mb-0.5">Prompt Hash</div>
                <div className="text-[var(--color-ink-dark)] font-mono text-[11px]">
                  {metadata.promptHash}
                </div>
              </div>
            </div>
          </div>

          {/* Hint */}
          <div className="pt-4">
            <div className="p-3 bg-[var(--color-parchment-dark)] rounded-lg">
              <div className="text-xs text-muted-foreground leading-relaxed">
                Select a quote, event, or entity from the session to view detailed information here.
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
