import { useState } from "react";
import {
  Calendar, Plus, Link2, Copy, Clock, Users, Video, Phone, Globe,
  Coffee, Briefcase, Star, ChevronRight, Sparkles, CheckCircle2,
  ExternalLink, Filter, MoreHorizontal, MapPin, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BOOKING_LINKS = [
  {
    id: "bl1",
    name: "Discovery Call",
    slug: "discovery",
    description: "15-minute intro call to understand needs",
    duration: 15,
    color: "#B8A0C8",
    icon: Coffee,
    type: "round-robin",
    bookings: 47,
    noShow: 8,
    location: "Google Meet (auto)",
    buffers: "10 min before/after",
    available: "Mon–Thu, 09:00–17:00 KSA",
  },
  {
    id: "bl2",
    name: "Product Demo",
    slug: "demo",
    description: "30-minute personalised platform walkthrough",
    duration: 30,
    color: "#88B8B0",
    icon: Video,
    type: "individual",
    bookings: 32,
    noShow: 4,
    location: "Microsoft Teams",
    buffers: "15 min after",
    available: "Tue–Thu, 10:00–16:00",
  },
  {
    id: "bl3",
    name: "Executive Briefing",
    slug: "exec",
    description: "60-min strategic session for VP/C-level",
    duration: 60,
    color: "#C8A880",
    icon: Briefcase,
    type: "individual",
    bookings: 11,
    noShow: 1,
    location: "On-site Riyadh / Dubai office, or Zoom",
    buffers: "30 min before/after",
    available: "By approval, GCC business hours",
  },
  {
    id: "bl4",
    name: "Technical Deep Dive",
    slug: "tech",
    description: "45-min session with solutions engineer",
    duration: 45,
    color: "#90B8B8",
    icon: Sparkles,
    type: "round-robin",
    bookings: 18,
    noShow: 2,
    location: "Zoom + screen share",
    buffers: "15 min before/after",
    available: "Wed–Fri, 13:00–18:00",
  },
];

const UPCOMING_MEETINGS = [
  { time: "Today · 14:00", title: "Discovery — Sara Al-Mansouri", company: "Gulf Ventures",      type: "discovery", attendees: 2, owner: "Khalid Al-Sayed",    location: "Google Meet" },
  { time: "Today · 15:30", title: "Demo — Aramco Digital",        company: "Aramco Digital",     type: "demo",      attendees: 4, owner: "Layla Hussain",       location: "Microsoft Teams" },
  { time: "Tomorrow · 10:00",title:"Exec Briefing — Hessa Al-Nahyan",company:"Abu Dhabi Holdings",type: "exec",      attendees: 3, owner: "Reem Al-Saud",        location: "On-site Dubai" },
  { time: "Wed · 11:00",   title: "Technical Deep Dive — NEOM",    company: "NEOM Tech",          type: "tech",      attendees: 5, owner: "Omar Farouq",         location: "Zoom" },
  { time: "Wed · 16:00",   title: "Demo — Riyadh Capital",         company: "Riyadh Capital",     type: "demo",      attendees: 2, owner: "Khalid Al-Sayed",    location: "Microsoft Teams" },
  { time: "Thu · 09:30",   title: "Discovery — Mariam Al-Falasi",  company: "Emirates Holdings",  type: "discovery", attendees: 2, owner: "Layla Hussain",       location: "Google Meet" },
];

const TYPE_TO_LINK: Record<string, any> = Object.fromEntries(BOOKING_LINKS.map((b) => [b.slug, b]));

export default function MeetingsPage() {
  const [selectedLink, setSelectedLink] = useState<string>(BOOKING_LINKS[0].id);
  const link = BOOKING_LINKS.find((b) => b.id === selectedLink) ?? BOOKING_LINKS[0];

  const totalBookings = BOOKING_LINKS.reduce((s, b) => s + b.bookings, 0);
  const totalNoShow = BOOKING_LINKS.reduce((s, b) => s + b.noShow, 0);
  const noShowRate = Math.round((totalNoShow / Math.max(totalBookings, 1)) * 100);

  const Icon = link.icon;

  return (
    <div className="max-w-[1500px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-7 h-7 text-[#88B8B0]" />
            <h1 className="text-3xl font-black text-foreground">Meetings</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Booking links with round-robin team assignment, calendar sync (Google, Outlook), Zoom/Teams/Meet auto-creation, and SMS reminders. Eliminate the email ping-pong.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl nf-chameleon-bg text-white text-sm font-semibold shadow-md hover:opacity-90">
          <Plus className="w-4 h-4" />
          New booking link
        </button>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Calendar}     color="#88B8B0" label="Bookings · 30d"   value={totalBookings.toString()}    sub="across all links" />
        <StatCard icon={Users}        color="#B8A0C8" label="No-show rate"     value={`${noShowRate}%`}            sub="industry avg 22%" />
        <StatCard icon={Clock}        color="#C8A880" label="Avg time to book" value="2h 14m"                      sub="from email send" />
        <StatCard icon={CheckCircle2} color="#C0A0B8" label="Show → opportunity" value="68%"                       sub="conversion to deal" />
      </div>

      {/* Two-column */}
      <div className="grid grid-cols-12 gap-6">
        {/* Booking links list */}
        <div className="col-span-7 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">Your booking links</h2>
            <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {BOOKING_LINKS.map((b) => {
              const BIcon = b.icon;
              const url = `nexflow.ai/book/${b.slug}`;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedLink(b.id)}
                  className={cn(
                    "glass-card rounded-2xl p-4 text-left transition-all border-2 group",
                    selectedLink === b.id
                      ? "border-[#88B8B0]/40 shadow-md"
                      : "border-transparent hover:border-border/40"
                  )}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${b.color}25` }}>
                      <BIcon className="w-5 h-5" style={{ color: b.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-foreground">{b.name}</h3>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <Clock className="w-2.5 h-2.5" />
                        {b.duration} min
                        <span>·</span>
                        <span className={cn("font-bold uppercase tracking-wider", b.type === "round-robin" ? "text-[#B8A0C8]" : "text-[#88B8B0]")}>
                          {b.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{b.description}</p>

                  {/* URL row */}
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/30 mb-3">
                    <Link2 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-[11px] font-mono text-foreground/70 truncate flex-1">{url}</span>
                    <Copy className="w-3 h-3 text-muted-foreground hover:text-foreground cursor-pointer flex-shrink-0" />
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-1 text-center">
                    <div className="py-1.5 rounded-md bg-muted/20">
                      <div className="text-sm font-black text-foreground">{b.bookings}</div>
                      <div className="text-[9px] uppercase text-muted-foreground font-bold tracking-wider">Booked</div>
                    </div>
                    <div className="py-1.5 rounded-md bg-muted/20">
                      <div className="text-sm font-black text-[#C0A0B8]">{b.noShow}</div>
                      <div className="text-[9px] uppercase text-muted-foreground font-bold tracking-wider">No-show</div>
                    </div>
                    <div className="py-1.5 rounded-md bg-muted/20">
                      <div className="text-sm font-black text-[#88B8B0]">{Math.round((b.bookings - b.noShow) / Math.max(b.bookings, 1) * 100)}%</div>
                      <div className="text-[9px] uppercase text-muted-foreground font-bold tracking-wider">Show rate</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Booking link detail / config */}
        <div className="col-span-5">
          <div className="glass-card rounded-2xl overflow-hidden sticky top-6">
            <div className="p-5 border-b border-border/30" style={{ background: `${link.color}10` }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${link.color}25` }}>
                    <Icon className="w-6 h-6" style={{ color: link.color }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-foreground">{link.name}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{link.description}</p>
                  </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-muted/40 text-muted-foreground"><MoreHorizontal className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Config rows */}
            <div className="p-5 space-y-3">
              <ConfigRow icon={Clock}    label="Duration"        value={`${link.duration} minutes`} />
              <ConfigRow icon={Users}    label="Assignment"      value={link.type === "round-robin" ? "Round-robin team" : "Individual"} />
              <ConfigRow icon={MapPin}   label="Location"        value={link.location} />
              <ConfigRow icon={Calendar} label="Available"       value={link.available} />
              <ConfigRow icon={Star}     label="Buffer time"     value={link.buffers} />
              <ConfigRow icon={Globe}    label="Languages"       value="🇬🇧 English · 🇸🇦 Arabic" />

              {/* Share box */}
              <div className="mt-4 p-4 rounded-xl border-2 border-dashed border-border/40 bg-muted/10">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">Share this link</div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border/40 mb-3">
                  <Link2 className="w-3.5 h-3.5 text-[#88B8B0] flex-shrink-0" />
                  <span className="text-xs font-mono text-foreground flex-1 truncate">https://nexflow.ai/book/{link.slug}</span>
                  <button className="text-[10px] font-bold text-[#88B8B0] hover:underline flex items-center gap-1">
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border/40 text-xs font-semibold text-foreground/70 hover:bg-muted/40">
                    <ExternalLink className="w-3 h-3" /> Embed
                  </button>
                  <button className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border/40 text-xs font-semibold text-foreground/70 hover:bg-muted/40">
                    📧 Email
                  </button>
                  <button className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border/40 text-xs font-semibold text-foreground/70 hover:bg-muted/40">
                    💬 WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming meetings */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border/30 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Upcoming meetings</h3>
            <p className="text-xs text-muted-foreground">{UPCOMING_MEETINGS.length} this week</p>
          </div>
          <button className="text-xs text-[#88B8B0] font-semibold hover:underline flex items-center gap-1">
            View calendar <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="divide-y divide-border/20">
          {UPCOMING_MEETINGS.map((m, i) => {
            const meta = TYPE_TO_LINK[m.type] ?? BOOKING_LINKS[0];
            const MIcon = meta.icon;
            return (
              <div key={i} className="p-4 hover:bg-muted/20 transition-colors flex items-center gap-4 group">
                <div className="text-center w-24 flex-shrink-0">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{m.time.split(" · ")[0]}</div>
                  <div className="text-sm font-black text-foreground">{m.time.split(" · ")[1]}</div>
                </div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${meta.color}25` }}>
                  <MIcon className="w-4 h-4" style={{ color: meta.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-foreground">{m.title}</div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-2 flex-wrap">
                    <span>{m.company}</span>
                    <span>·</span>
                    <Users className="w-2.5 h-2.5" /><span>{m.attendees} attendees</span>
                    <span>·</span>
                    <span>Owner: {m.owner}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="px-2 py-1 rounded-full text-[10px] font-bold border" style={{ background: `${meta.color}15`, color: meta.color, borderColor: `${meta.color}40` }}>
                    {meta.name}
                  </span>
                  <button className="p-2 rounded-lg text-muted-foreground hover:bg-muted/40">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, color, label, value, sub }: any) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}25` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <div className="text-2xl font-black text-foreground leading-tight">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

function ConfigRow({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border/15 last:border-0">
      <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{label}</div>
        <div className="text-sm text-foreground font-semibold">{value}</div>
      </div>
    </div>
  );
}
