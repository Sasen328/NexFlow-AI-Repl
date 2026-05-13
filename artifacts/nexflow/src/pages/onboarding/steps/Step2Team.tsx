import { useWizard } from "../context";
import { CRM_OPTIONS } from "../types";
import { Users } from "lucide-react";

function SeatsSlider({ label, sub, value, onChange, color }: {
  label: string; sub: string; value: number; onChange: (n: number) => void; color: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">{label}</p>
          <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
        </div>
        <div className="min-w-[44px] text-center px-3 py-1 rounded-lg text-sm font-bold border" style={{ color, borderColor: color + "40", backgroundColor: color + "10" }}>
          {value}
        </div>
      </div>
      <input
        type="range" min={0} max={200} step={1} value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: color }}
      />
      <div className="flex justify-between text-xs text-slate-300 mt-1.5">
        <span>0</span><span>50</span><span>100</span><span>150</span><span>200</span>
      </div>
    </div>
  );
}

const ROLE_COLORS = ["#7C3AED", "#0D9488", "#D97706", "#6366f1"];

export default function Step2Team() {
  const { answers, updateAnswers } = useWizard();
  const totalSeats = answers.seatsSales + answers.seatsSDR + answers.seatsMarketing + answers.seatsManagement;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Your Team</h2>
        <p className="text-slate-500 mt-1">Tell us about the people who'll use NexFlow. This sets your seat count and pricing.</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            Team headcount by role
          </label>
          <span className="text-xs font-bold text-violet-700 bg-violet-50 border border-violet-200 rounded-full px-3 py-1">
            {totalSeats} total seats
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SeatsSlider label="Sales Reps" sub="Account executives, closers" value={answers.seatsSales} onChange={(n) => updateAnswers({ seatsSales: n })} color={ROLE_COLORS[0]} />
          <SeatsSlider label="SDRs / BDRs" sub="Prospecting & outbound reps" value={answers.seatsSDR} onChange={(n) => updateAnswers({ seatsSDR: n })} color={ROLE_COLORS[1]} />
          <SeatsSlider label="Marketers" sub="Campaign & content team" value={answers.seatsMarketing} onChange={(n) => updateAnswers({ seatsMarketing: n })} color={ROLE_COLORS[2]} />
          <SeatsSlider label="Managers & Admins" sub="Team leads, ops, CRM admin" value={answers.seatsManagement} onChange={(n) => updateAnswers({ seatsManagement: n })} color={ROLE_COLORS[3]} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current CRM / tool</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CRM_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => updateAnswers({ currentCrm: value })}
              className={[
                "px-3 py-2.5 rounded-xl border text-sm font-medium text-left transition-all",
                answers.currentCrm === value
                  ? "border-violet-500 bg-violet-50 text-violet-700"
                  : "border-slate-200 text-slate-600 hover:border-violet-300 bg-white",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {answers.currentCrm !== "none" && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Migrate your existing data into NexFlow?</label>
          <div className="flex gap-3">
            {[
              { v: true,  label: "Yes — migrate my data",  desc: "Contacts, deals, activities, notes" },
              { v: false, label: "No — start fresh",       desc: "Begin from a clean slate" },
            ].map(({ v, label, desc }) => (
              <button
                key={String(v)}
                onClick={() => updateAnswers({ migrationNeeded: v })}
                className={[
                  "flex-1 text-left px-4 py-3 rounded-xl border-2 transition-all",
                  answers.migrationNeeded === v
                    ? "border-violet-500 bg-violet-50"
                    : "border-slate-200 bg-white hover:border-violet-300",
                ].join(" ")}
              >
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
          {answers.migrationNeeded && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs text-amber-800">
                <strong>Migration adds ~2 weeks</strong> to your setup timeline. Our team handles field mapping, deduplication, and data validation — zero data loss guaranteed.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
