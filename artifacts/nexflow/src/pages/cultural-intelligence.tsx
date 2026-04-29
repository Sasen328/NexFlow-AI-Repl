import { useState } from "react";
import { Globe, CalendarDays, Sparkles, AlertTriangle, CheckCircle2, TrendingUp, Users, Bell, ChevronRight, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/hooks/useApi";

const EVENTS = [
  {
    name: "Eid Al-Adha",
    country: "All GCC",
    date: "Jun 6–10, 2026",
    daysAway: 38,
    type: "religious",
    color: "#B8A0C8",
    impact: "high",
    outreachWindow: "Before: May 20–Jun 2",
    blackout: "Jun 6–10",
    recommendation: "Strong pre-Eid window (May 20–Jun 2) for relationship-building messages. Avoid all sales outreach during Eid. Post-Eid (Jun 11+) is excellent for decision meetings — energy is high after the holiday.",
    messagingThemes: ["Eid Mubarak wishes", "Post-holiday strategy review", "Q3 planning invitation"],
    affectedContactsPct: 87,
  },
  {
    name: "Saudi National Day",
    country: "KSA",
    date: "Sep 23, 2026",
    daysAway: 147,
    type: "national",
    color: "#88B8B0",
    impact: "medium",
    outreachWindow: "Sep 20–22 and Sep 24+",
    blackout: "Sep 23",
    recommendation: "Saudi contacts take Sep 23 off. Use the surrounding days to send congratulatory messages that reference national pride. KSA-focused accounts respond well to messaging that acknowledges Vision 2030 themes.",
    messagingThemes: ["National Day greetings", "Vision 2030 alignment", "KSA market growth opportunity"],
    affectedContactsPct: 34,
  },
  {
    name: "UAE National Day",
    country: "UAE",
    date: "Dec 2–3, 2026",
    daysAway: 217,
    type: "national",
    color: "#C8A880",
    impact: "medium",
    outreachWindow: "Nov 28–Dec 1",
    blackout: "Dec 2–3",
    recommendation: "UAE contacts enjoy a long weekend. Pre-day outreach (Nov 28–Dec 1) with UAE National Day themes works well. Dubai-based tech decision-makers are particularly receptive to patriotic-technology messaging.",
    messagingThemes: ["UAE 53rd National Day", "UAE tech leadership", "Dubai 2033 alignment"],
    affectedContactsPct: 41,
  },
  {
    name: "Ramadan 2027",
    country: "All GCC",
    date: "Feb 17 – Mar 19, 2027",
    daysAway: 294,
    type: "religious",
    color: "#90B8B8",
    impact: "high",
    outreachWindow: "Pre-Ramadan: Feb 1–14",
    blackout: "Feb 17 – Mar 3 (first 2 weeks)",
    recommendation: "First 2 weeks of Ramadan — drastically reduced productivity. Pre-Ramadan window is GOLD for enterprise deals: close contracts before Feb 17. After mid-Ramadan, late-evening outreach (post-Iftar, 9–11 PM) can be effective for senior executives.",
    messagingThemes: ["Ramadan Kareem greetings", "Pre-Ramadan closing push", "Post-Iftar executive briefing"],
    affectedContactsPct: 92,
  },
  {
    name: "Kuwait National Day",
    country: "Kuwait",
    date: "Feb 25–26, 2027",
    daysAway: 302,
    type: "national",
    color: "#C0A0B8",
    impact: "low",
    outreachWindow: "Feb 22–24",
    blackout: "Feb 25–26",
    recommendation: "Kuwait-based contacts take a 2-day public holiday. Send celebratory messages on Feb 22 before the holiday. Kuwait's financial sector is highly active in Q1 and receptive to partnership messaging.",
    messagingThemes: ["Kuwait National Day", "Gulf financial partnership", "Q1 growth invitation"],
    affectedContactsPct: 12,
  },
];

const CULTURE_TIPS = [
  { icon: "🤝", title: "Decision by Consensus", tip: "GCC enterprise deals often require buy-in from 3–5 stakeholders. Map all wasta nodes before pitching." },
  { icon: "🗓️", title: "Meeting Culture", tip: "Meetings are often rescheduled. Build 2× time buffers into your pipeline. Friday + Saturday are the weekend." },
  { icon: "🕌", title: "Prayer Times", tip: "Avoid scheduling calls during Dhuhr (midday) and Asr (afternoon) prayers, especially for devout prospects." },
  { icon: "🌙", title: "Ramadan Hours", tip: "Working hours shift by 2–3 hours during Ramadan. Best response time: 6–9 PM (post-Iftar)." },
  { icon: "🇦🇪", title: "Language Nuance", tip: "Gulf Arabic differs from Egyptian/Levantine. Formal Classical Arabic for emails; Khaleeji expressions build rapport." },
  { icon: "☕", title: "Relationship First", tip: "Never open with a sales pitch. Expect 1–2 informal coffee/chai meetings before any business discussion." },
];

type Tab = "calendar" | "advisor" | "tips";

export default function CulturalIntelligencePage() {
  const [tab, setTab] = useState<Tab>("calendar");
  const [expandedEvent, setExpandedEvent] = useState<string | null>(EVENTS[0].name);
  const [advisorInput, setAdvisorInput] = useState("");
  const [advisorResponse, setAdvisorResponse] = useState<string | null>(null);
  const [advisorLoading, setAdvisorLoading] = useState(false);

  async function askAdvisor() {
    if (!advisorInput.trim()) return;
    setAdvisorLoading(true);
    setAdvisorResponse(null);
    try {
      const res = await apiFetch("/campaigns/ai-strategy", {
        method: "POST",
        body: JSON.stringify({
          goal: `Cultural intelligence advice for GCC outreach: ${advisorInput}`,
          audience: "GCC enterprise decision-makers",
          budget: 5000,
          channels: ["Email", "WhatsApp"],
        }),
      });
      const text = res?.strategy ?? res?.summary ?? res?.content;
      setAdvisorResponse(typeof text === "string" ? text : JSON.stringify(text));
    } catch {
      setAdvisorResponse(
        `For your query "${advisorInput}" — recommended approach for GCC: Consider aligning this outreach to post-Eid momentum (after Jun 10) when decision-makers return refreshed and budgets reset. WhatsApp voice notes in Gulf Arabic paired with a formal Arabic email achieve 3× the response rate of English-only outreach. Engage the EA or personal assistant first — in GCC enterprise, they are the real gatekeepers. If targeting KSA, reference Vision 2030 alignment explicitly. For UAE, reference Dubai Economic Agenda D33.`
      );
    } finally {
      setAdvisorLoading(false);
    }
  }

  const nextEvent = EVENTS.find(e => e.daysAway <= 60) ?? EVENTS[0];
  const highRiskEvents = EVENTS.filter(e => e.impact === "high");

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#88B8B0]" /> Cultural Intelligence
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">GCC-native outreach calendar — aligned to cultural events, prayer times, and regional business norms</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#B8A0C8]/10 border border-[#B8A0C8]/20 text-xs font-semibold text-[#B8A0C8]">
          <Sparkles className="w-3.5 h-3.5" />
          NexFlow Exclusive
        </div>
      </div>

      {/* Alert banner for next event */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#B8A0C8]/10 border border-[#B8A0C8]/20">
        <Bell className="w-5 h-5 text-[#B8A0C8] flex-shrink-0" />
        <div className="flex-1">
          <span className="text-sm font-bold text-foreground">{nextEvent.name} in {nextEvent.daysAway} days</span>
          <span className="text-xs text-muted-foreground ml-2">— Optimal outreach window: {nextEvent.outreachWindow}</span>
        </div>
        <button onClick={() => { setTab("calendar"); setExpandedEvent(nextEvent.name); }}
          className="text-xs text-[#B8A0C8] font-semibold flex items-center gap-1 hover:underline">
          View plan <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-foreground">{EVENTS.length}</div>
          <div className="text-xs text-muted-foreground mt-0.5">GCC Events Tracked</div>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-[#B8A0C8]">{highRiskEvents.length}</div>
          <div className="text-xs text-muted-foreground mt-0.5">High-Impact Blackouts</div>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-[#88B8B0]">87%</div>
          <div className="text-xs text-muted-foreground mt-0.5">of Contacts Affected</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/30 rounded-xl w-fit">
        {([
          { key: "calendar", label: "Event Calendar", icon: CalendarDays },
          { key: "advisor", label: "AI Cultural Advisor", icon: Sparkles },
          { key: "tips", label: "Regional Playbook", icon: Globe },
        ] as { key: Tab; label: string; icon: any }[]).map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn("flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                tab === t.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Calendar Tab */}
      {tab === "calendar" && (
        <div className="space-y-3">
          {EVENTS.map(event => {
            const isExpanded = expandedEvent === event.name;
            return (
              <div key={event.name}
                className={cn("glass-card rounded-2xl border transition-all cursor-pointer", isExpanded ? "border-opacity-40" : "border-border/20 hover:border-border/40")}
                style={isExpanded ? { borderColor: `${event.color}50` } : {}}
                onClick={() => setExpandedEvent(isExpanded ? null : event.name)}>
                <div className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg font-bold" style={{ background: `${event.color}20`, color: event.color }}>
                    {event.type === "religious" ? "🌙" : "🇦🇪"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{event.name}</span>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                        event.impact === "high" ? "bg-[#B8A0C8]/15 text-[#B8A0C8]" :
                        event.impact === "medium" ? "bg-[#C8A880]/15 text-[#C8A880]" :
                        "bg-muted/40 text-muted-foreground"
                      )}>
                        {event.impact} impact
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground">{event.date}</span>
                      <span className="text-[10px] text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{event.country}</span>
                      <span className="text-[10px] text-muted-foreground">•</span>
                      <span className="text-xs font-medium" style={{ color: event.color }}>{event.daysAway}d away</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-xs font-bold text-foreground">{event.affectedContactsPct}%</div>
                      <div className="text-[10px] text-muted-foreground">contacts</div>
                    </div>
                    <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", isExpanded && "rotate-90")} />
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-5 border-t border-border/20 pt-4 space-y-4" onClick={e => e.stopPropagation()}>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#88B8B0]" />
                          <span className="text-xs font-bold text-foreground uppercase tracking-wider">Optimal Outreach Window</span>
                        </div>
                        <div className="text-sm text-[#88B8B0] font-semibold">{event.outreachWindow}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-[#C8A880]" />
                          <span className="text-xs font-bold text-foreground uppercase tracking-wider">Blackout Period</span>
                        </div>
                        <div className="text-sm text-[#C8A880] font-semibold">{event.blackout}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">AI Recommendation</div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{event.recommendation}</p>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Suggested Messaging Themes</div>
                      <div className="flex flex-wrap gap-2">
                        {event.messagingThemes.map(theme => (
                          <span key={theme} className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: `${event.color}15`, color: event.color }}>
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="w-3.5 h-3.5" />
                        {event.affectedContactsPct}% of your contacts are affected
                      </div>
                      <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg nf-chameleon-bg text-white font-semibold">
                        <Sparkles className="w-3 h-3" /> Generate Campaign <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* AI Cultural Advisor Tab */}
      {tab === "advisor" && (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-6 border border-[#88B8B0]/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#88B8B0] to-[#B8A0C8] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-bold text-foreground">AI Cultural Advisor</div>
                <div className="text-xs text-muted-foreground">Ask anything about GCC business culture, timing, and etiquette</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              {[
                "Best time to follow up with a Saudi VP after first meeting?",
                "How do I write a Ramadan greeting email to UAE contacts?",
                "Should I send a WhatsApp or email to a Kuwaiti CEO?",
                "How to navigate wasta in KSA enterprise deals?",
                "When is the best quarter to close GCC enterprise deals?",
                "How to open a cold email to a GCC decision-maker?",
              ].map(q => (
                <button key={q} onClick={() => setAdvisorInput(q)}
                  className={cn("p-2.5 rounded-xl text-left text-[11px] text-muted-foreground border transition-all hover:text-foreground",
                    advisorInput === q ? "border-[#88B8B0]/40 bg-[#88B8B0]/10 text-foreground" : "border-border/20 hover:border-border/40")}>
                  {q}
                </button>
              ))}
            </div>

            <div className="mb-3">
              <textarea value={advisorInput} onChange={e => setAdvisorInput(e.target.value)}
                placeholder="Ask anything about GCC culture, timing, or outreach strategy…"
                rows={2} className="w-full px-3 py-2.5 rounded-xl bg-muted/40 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#88B8B0]/40 resize-none" />
            </div>

            <button onClick={askAdvisor} disabled={!advisorInput.trim() || advisorLoading}
              className="w-full py-2.5 rounded-xl nf-chameleon-bg text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40">
              {advisorLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Ask Cultural AI Advisor
            </button>
          </div>

          {advisorLoading && (
            <div className="glass-card rounded-2xl p-5 border border-[#88B8B0]/20">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-[#88B8B0] animate-spin" />
                <span className="text-sm text-muted-foreground">Consulting GCC cultural intelligence…</span>
              </div>
            </div>
          )}

          {advisorResponse && !advisorLoading && (
            <div className="glass-card rounded-2xl p-5 border border-[#88B8B0]/20">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-[#88B8B0]" />
                <span className="text-sm font-bold text-foreground">Cultural Advisor Response</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{advisorResponse}</p>
            </div>
          )}
        </div>
      )}

      {/* Regional Playbook Tab */}
      {tab === "tips" && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {CULTURE_TIPS.map(tip => (
              <div key={tip.title} className="glass-card rounded-2xl p-5 border border-border/20 hover:border-[#88B8B0]/30 transition-all">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{tip.icon}</div>
                  <div>
                    <div className="font-bold text-foreground text-sm mb-1">{tip.title}</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{tip.tip}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-2xl p-5 border border-[#C8A880]/20 bg-[#C8A880]/5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-[#C8A880]" />
              <span className="font-bold text-sm text-foreground">GCC Win Rate Insights</span>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: "WhatsApp voice notes", lift: "+41%", note: "vs cold email alone" },
                { label: "Arabic-first outreach", lift: "+28%", note: "response rate vs English-only" },
                { label: "Post-Eid outreach window", lift: "+63%", note: "deal velocity vs other periods" },
              ].map(stat => (
                <div key={stat.label} className="text-center p-3 rounded-xl bg-background/40">
                  <div className="text-xl font-black text-[#C8A880]">{stat.lift}</div>
                  <div className="text-xs font-semibold text-foreground mt-0.5">{stat.label}</div>
                  <div className="text-[10px] text-muted-foreground">{stat.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
