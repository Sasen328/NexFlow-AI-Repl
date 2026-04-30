import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
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
 * Variant A — COCKPIT
 * 3-column dense grid. Header full width, AI summary spans full width with
 * inline tiles, then equal-weight 3-column row of Actions / News / Bottlenecks.
 * Live Coaching docked as a slim banner at the bottom.
 * Hypothesis: scan-friendly "pilot dashboard" — everything visible with
 * minimal scroll, equal visual weight across information types.
 */
export function Cockpit() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-[1180px] space-y-4">
        <HomeHeader subtitle="Pilot view · everything at a glance, minimal scroll." />
        <SectionLabel>Cockpit layout</SectionLabel>

        {/* Row 1 — AI summary + 4 quick tiles inline */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Full Analysis · live 2 min ago
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AIAnalysisProse />
            <div className="grid grid-cols-4 gap-2">
              {QUICK_TILES.map((t) => (
                <QuickTile key={t.label} {...t} compact />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Row 2 — equal-weight 3-column grid */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Action Items</CardTitle>
            </CardHeader>
            <CardContent>
              <ActionItemsList limit={4} />
            </CardContent>
          </Card>
          <NewsSignalsFeed compact />
          <BottlenecksCard compact />
        </div>

        {/* Row 3 — slim coaching banner */}
        <LiveCoachingCard slim />
      </div>
    </div>
  );
}
