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
 * Variant B — FEED RAIL
 * Single narrow column (~720px) centered with generous whitespace.
 * Vertical chronological flow: the user reads their briefing top-to-bottom
 * like a morning newsletter. Quick tiles inline as a horizontal strip near
 * the top for at-a-glance status.
 * Hypothesis: focus + narrative — feels like reading a curated brief, lower
 * cognitive load, mobile-friendly without changing layout.
 */
export function FeedRail() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-[720px] space-y-5">
        <HomeHeader subtitle="Your briefing, top to bottom — read like a morning memo." />
        <SectionLabel>Feed Rail layout</SectionLabel>

        {/* Inline status strip */}
        <div className="grid grid-cols-4 gap-2">
          {QUICK_TILES.map((t) => (
            <QuickTile key={t.label} {...t} compact />
          ))}
        </div>

        {/* Story 1 — AI Summary */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Full Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AIAnalysisProse />
          </CardContent>
        </Card>

        {/* Story 2 — Action Items as standalone card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Today's Action Items</CardTitle>
          </CardHeader>
          <CardContent>
            <ActionItemsList limit={4} />
          </CardContent>
        </Card>

        {/* Story 3 — News */}
        <NewsSignalsFeed />

        {/* Story 4 — Bottlenecks */}
        <BottlenecksCard />

        {/* Story 5 — Coaching */}
        <LiveCoachingCard />
      </div>
    </div>
  );
}
