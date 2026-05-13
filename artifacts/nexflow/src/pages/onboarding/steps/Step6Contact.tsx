import { useWizard } from "../context";

export default function Step6Contact() {
  const { answers, updateAnswers, setupPath } = useWizard();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Contact Details</h2>
        <p className="text-slate-500 mt-1">
          {setupPath === "managed"
            ? "Our implementation team will reach out within one business day to kick off your setup."
            : "We'll send your proposal and workspace credentials to this email."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={answers.contactName}
            onChange={(e) => updateAnswers({ contactName: e.target.value })}
            placeholder="Khalid Al-Otaibi"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Work email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={answers.contactEmail}
            onChange={(e) => updateAnswers({ contactEmail: e.target.value })}
            placeholder="khalid@company.com.sa"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Phone number <span className="text-slate-400 font-normal text-xs">(optional)</span>
          </label>
          <input
            type="tel"
            value={answers.contactPhone}
            onChange={(e) => updateAnswers({ contactPhone: e.target.value })}
            placeholder="+966 5x xxx xxxx"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Anything else? <span className="text-slate-400 font-normal text-xs">(optional)</span>
          </label>
          <textarea
            value={answers.notes}
            onChange={(e) => updateAnswers({ notes: e.target.value })}
            placeholder="Any specific requirements, questions, or context for our team…"
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white resize-none"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
        <p className="text-sm font-bold text-slate-800 mb-3">Your setup summary</p>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <span className="text-slate-500">Company</span>
          <span className="font-medium text-slate-800">{answers.companyName || "—"}</span>
          <span className="text-slate-500">Industry</span>
          <span className="font-medium text-slate-800">{answers.industry || "—"}</span>
          <span className="text-slate-500">Team size</span>
          <span className="font-medium text-slate-800">
            {answers.seatsSales + answers.seatsSDR + answers.seatsMarketing + answers.seatsManagement} seats
          </span>
          <span className="text-slate-500">Setup path</span>
          <span className="font-medium text-slate-800">{setupPath === "managed" ? "Managed by NexFlow" : "Self-service"}</span>
          <span className="text-slate-500">Modules</span>
          <span className="font-medium text-slate-800">{answers.enabledModules.length} selected</span>
          <span className="text-slate-500">Migration</span>
          <span className="font-medium text-slate-800">{answers.migrationNeeded ? `From ${answers.currentCrm}` : "Not required"}</span>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        By continuing you agree to NexFlow's Terms of Service and Privacy Policy. Your data is stored in your selected region and never shared with third parties.
      </p>
    </div>
  );
}
