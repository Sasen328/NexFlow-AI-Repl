import { useWizard } from "../context";
import { User, Mail, Phone, FileText, CheckCircle } from "lucide-react";

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-1.5">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

const inp = (icon?: boolean) =>
  `w-full rounded-xl border border-border ${icon ? "pl-9" : "px-4"} px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8A0C8]/40 bg-card text-foreground transition-colors`;

function IconWrap({ children }: { children: React.ReactNode }) {
  return <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">{children}</div>;
}

export default function Step6Contact() {
  const { answers, updateAnswers, setupPath } = useWizard();

  const totalSeats = answers.seatsSales + answers.seatsSDR + answers.seatsMarketing + answers.seatsManagement;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Contact Details</h2>
        <p className="text-muted-foreground mt-1">
          {setupPath === "managed"
            ? "Our implementation team will reach out within one business day to kick off your workspace."
            : "We'll send your proposal and workspace link to this email."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Full name" required>
          <div className="relative">
            <IconWrap><User className="w-4 h-4" /></IconWrap>
            <input
              type="text" value={answers.contactName}
              onChange={(e) => updateAnswers({ contactName: e.target.value })}
              placeholder="Khalid Al-Otaibi"
              className={inp(true)}
            />
          </div>
        </Field>

        <Field label="Work email" required>
          <div className="relative">
            <IconWrap><Mail className="w-4 h-4" /></IconWrap>
            <input
              type="email" value={answers.contactEmail}
              onChange={(e) => updateAnswers({ contactEmail: e.target.value })}
              placeholder="khalid@company.com.sa"
              className={inp(true)}
            />
          </div>
        </Field>

        <Field label="Phone number">
          <div className="relative">
            <IconWrap><Phone className="w-4 h-4" /></IconWrap>
            <input
              type="tel" value={answers.contactPhone}
              onChange={(e) => updateAnswers({ contactPhone: e.target.value })}
              placeholder="+966 5x xxx xxxx"
              className={inp(true)}
            />
          </div>
        </Field>

        <Field label="Anything else?" hint="Optional — helps our team tailor the proposal.">
          <div className="relative">
            <div className="absolute left-3 top-3 text-muted-foreground pointer-events-none">
              <FileText className="w-4 h-4" />
            </div>
            <textarea
              value={answers.notes}
              onChange={(e) => updateAnswers({ notes: e.target.value })}
              placeholder="Specific requirements, questions, or context for our team…"
              rows={3}
              className="w-full rounded-xl border border-border pl-9 pr-4 pt-2.5 pb-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8A0C8]/40 bg-card text-foreground resize-none"
            />
          </div>
        </Field>
      </div>

      {/* Setup summary — shows user their choices */}
      <div className="border border-border rounded-2xl p-5" style={{ background: "rgba(184,160,200,0.04)" }}>
        <p className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" style={{ color: "#B8A0C8" }} />
          Your setup summary
        </p>
        <div className="grid grid-cols-2 gap-y-3 text-sm">
          {[
            ["Company",    answers.companyName || "—"],
            ["Industry",   answers.industry || "—"],
            ["CR Number",  answers.crNumber || "—"],
            ["Team size",  `${totalSeats} seat${totalSeats !== 1 ? "s" : ""}`],
            ["Countries",  answers.countries.join(", ") || "—"],
            ["Setup path", setupPath === "managed" ? "Managed by NexFlow" : "Self-service"],
            ["Modules",    `${answers.enabledModules.length} selected`],
            ["Migration",  answers.migrationNeeded ? `From ${answers.currentCrm}` : "Not required"],
          ].map(([k, v]) => (
            <div key={k} className="contents">
              <span className="text-muted-foreground text-xs">{k}</span>
              <span className="font-medium text-foreground text-xs">{v}</span>
            </div>
          ))}
        </div>

        {/* Brand color preview */}
        {answers.primaryColor && (
          <div className="mt-4 pt-3 border-t border-border flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Brand</span>
            <div className="flex gap-1.5">
              {[answers.primaryColor, answers.secondaryColor, answers.accentColor].filter(Boolean).map((c, i) => (
                <div key={i} className="w-5 h-5 rounded-md shadow-sm border border-white/20" style={{ background: c }} title={c} />
              ))}
            </div>
            {answers.logoBase64 && (
              <img src={answers.logoBase64} alt="Logo" className="h-5 object-contain rounded ml-1" />
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        By continuing you agree to NexFlow's Terms of Service and Privacy Policy. Your data is stored in your selected region and never shared with third parties. PDPL compliant.
      </p>
    </div>
  );
}
