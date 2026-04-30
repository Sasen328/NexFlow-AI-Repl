import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Zap } from "lucide-react";
import {
  ActionItemsList,
  AIAnalysisProse,
  BottlenecksCard,
  HomeHeader,
  LiveCoachingCard,
  NewsSignalsFeed,
  QUICK_TILES,
  QuickTile,
  SectionLabel,
} from "./_shared";

/**
 * Variant C — SPLIT VIEW
 * Two-column 60/40 grid below header. LEFT rail = everything actionable
 * (AI summary, action items, bottlenecks). RIGHT rail = everything
 * informational (news/signals, coaching). Quick tiles live in a sticky
 * status bar across the top.
 * Hypothesis: mental model split between "what I do" and "what I know" —
 * lets the rep work the left rail while ambient intel stays in peripheral
 * vision on the right.
 */
export function SplitView() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-[1180px] space-y-4">
        <HomeHeader subtitle="Action rail on the left, intel rail on the right." />
        <SectionLabel>Split View layout</SectionLabel>

        {/* Status bar — quick tiles spanning full width */}
        <div className="grid grid-cols-4 gap-2">
          {QUICK_TILES.map((t) => (
            <QuickTile key={t.label} {...t} />
          ))}
        </div>

        {/* Two-rail grid */}
        <div className="grid grid-cols-5 gap-4">
          {/* LEFT — action rail (60%) */}
          <div className="col-span-3 space-y-4">
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Full Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AIAnalysisProse />
                <ActionItemsList limit={4} />
              </CardContent>
            </Card>

            <BottlenecksCard />
          </div>

          {/* RIGHT — intel rail (40%) */}
          <div className="col-span-2 space-y-4">
            <div className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <Zap className="mr-1 inline h-3 w-3 text-primary" />
              Intelligence rail · ambient updates
            </div>
            <NewsSignalsFeed compact />
            <LiveCoachingCard />
          </div>
        </div>
      </div>
    </div>
  );
}
