import { useWizard } from "../context";
import { CRM_OPTIONS } from "../types";

function SeatsSlider({ label, sub, value, onChange }: { label: string; sub: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">{label}</p>
          <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg px-3 py-1 text-sm font-bold text-indigo-700 min-w-[44px] text-center">
          {value}
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={200}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-indigo-600"
      />
      <div className="flex justify-between text-xs text-slate-400 mt-1">
        <span>0</span><span>50</span><span>100</span><span>200</span>
      </div>
    </div>
  );
}

export default function Step2Team() {
  const { answers, updateAnswers } = useWizard();
  const totalSeats = answers.seatsSales + answers.seatsSDR + answers.seatsMarketing + answers.seatsManagement;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Your Team</h2>
        <p className="text-slate-500 mt-1">Tell us about the people who'll use NexFlow. This sets your seat count and pricing.</p>
      </div>

      {/* Seat sliders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-slate-700">Team headcount by role</label>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1">
            {totalSeats} total seats
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SeatsSlider label="Sales Reps" sub="Account executives, closers" value={answers.seatsSales} onChange={(n) => updateAnswers({ seatsSales: n })} />
          <SeatsSlider label="SDRs / BDRs" sub="Prospecting & outbound reps" value={answers.seatsSDR} onChange={(n) => updateAnswers({ seatsSDR: n })} />
          <SeatsSlider label="Marketers" sub="Campaign & content team" value={answers.seatsMarketing} onChange={(n) => updateAnswers({ seatsMarketing: n })} />
          <SeatsSlider label="Managers & Admins" sub="Team leads, ops, CRM admin" value={answers.seatsManagement} onChange={(n) => updateAnswers({ seatsManagement: n })} />
        </div>
      </div>

      {/* Current CRM */}
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
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 text-slate-600 hover:border-indigo-300 bg-white",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Migration needed */}
      {answers.currentCrm !== "none" && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Do you need to migrate your existing data into NexFlow?</label>
          <div className="flex gap-3">
            {[
              { v: true,  label: "Yes — migrate my data",       desc: "Contacts, deals, activities, notes" },
              { v: false, label: "No — starting fresh",         desc: "We'll begin from a clean slate" },
            ].map(({ v, label, desc }) => (
              <button
                key={String(v)}
                onClick={() => updateAnswers({ migrationNeeded: v })}
                className={[
                  "flex-1 text-left px-4 py-3 rounded-xl border transition-all",
                  answers.migrationNeeded === v
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 bg-white hover:border-indigo-300",
                ].join(" ")}
              >
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
          {answers.migrationNeeded && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs text-amber-700">
                <strong>Migration adds ~2 weeks</strong> to your setup timeline. Our team will handle field mapping, deduplication, and data validation to ensure zero data loss.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
