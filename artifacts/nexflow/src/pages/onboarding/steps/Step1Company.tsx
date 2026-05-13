import { useRef } from "react";
import { useWizard } from "../context";
import { INDUSTRIES, GCC_COUNTRIES, COMPANY_SIZES, TABS_META } from "../types";

export default function Step1Company() {
  const { answers, updateAnswers } = useWizard();
  const fileRef = useRef<HTMLInputElement>(null);

  const toggleCountry = (c: string) => {
    const next = answers.countries.includes(c)
      ? answers.countries.filter((x) => x !== c)
      : [...answers.countries, c];
    if (next.length > 0) updateAnswers({ countries: next });
  };

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateAnswers({ logoBase64: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const moveTab = (tabId: string, dir: -1 | 1) => {
    const tabs = [...answers.tabStructure];
    const idx = tabs.indexOf(tabId);
    if (idx < 0) return;
    const next = idx + dir;
    if (next < 0 || next >= tabs.length) return;
    [tabs[idx], tabs[next]] = [tabs[next], tabs[idx]];
    updateAnswers({ tabStructure: tabs });
  };

  const toggleTab = (tabId: string) => {
    const hidden = answers.tabStructure.filter((t) => !answers.tabStructure.includes(t));
    if (answers.tabStructure.includes(tabId) && answers.tabStructure.length > 1) {
      updateAnswers({ tabStructure: answers.tabStructure.filter((t) => t !== tabId) });
    } else if (!answers.tabStructure.includes(tabId)) {
      updateAnswers({ tabStructure: [...answers.tabStructure, tabId] });
    }
    void hidden;
  };

  const allTabs = Object.keys(TABS_META);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Company & Branding</h2>
        <p className="text-slate-500 mt-1">Tell us about your company. This shapes your entire workspace.</p>
      </div>

      {/* Company name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Company name (English) <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={answers.companyName}
            onChange={(e) => updateAnswers({ companyName: e.target.value })}
            placeholder="Acme Corp"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            اسم الشركة بالعربية <span className="text-slate-400 font-normal text-xs">(optional)</span>
          </label>
          <input
            type="text"
            value={answers.companyNameAr}
            onChange={(e) => updateAnswers({ companyNameAr: e.target.value })}
            placeholder="أكمي"
            dir="rtl"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          />
        </div>
      </div>

      {/* Industry */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Industry <span className="text-red-500">*</span></label>
        <select
          value={answers.industry}
          onChange={(e) => updateAnswers({ industry: e.target.value })}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
        >
          <option value="">Select your industry</option>
          {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>

      {/* Company size */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Company size</label>
        <div className="flex flex-wrap gap-2">
          {COMPANY_SIZES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => updateAnswers({ companySize: value })}
              className={[
                "px-4 py-2 rounded-xl border text-sm font-medium transition-all",
                answers.companySize === value
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 text-slate-600 hover:border-indigo-300",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Countries */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Countries operating in</label>
        <div className="flex flex-wrap gap-2">
          {GCC_COUNTRIES.map((c) => (
            <button
              key={c}
              onClick={() => toggleCountry(c)}
              className={[
                "px-3 py-1.5 rounded-lg border text-sm transition-all",
                answers.countries.includes(c)
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-medium"
                  : "border-slate-200 text-slate-500 hover:border-indigo-300",
              ].join(" ")}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Branding */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logo upload */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Company logo</label>
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-slate-200 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
          >
            {answers.logoBase64 ? (
              <img src={answers.logoBase64} alt="Logo" className="h-16 object-contain" />
            ) : (
              <>
                <span className="text-3xl">🖼️</span>
                <p className="text-sm text-slate-500">Click to upload logo</p>
                <p className="text-xs text-slate-400">PNG, SVG or JPG — max 2 MB</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
          {answers.logoBase64 && (
            <button onClick={() => updateAnswers({ logoBase64: "" })} className="mt-1 text-xs text-red-500 hover:underline">
              Remove
            </button>
          )}
        </div>

        {/* Brand color */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Brand colour</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={answers.primaryColor}
              onChange={(e) => updateAnswers({ primaryColor: e.target.value })}
              className="w-12 h-12 rounded-xl border border-slate-200 cursor-pointer bg-white"
            />
            <span className="text-sm font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              {answers.primaryColor}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Used for your workspace header and accent elements</p>
          {/* Quick palette */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {["#4F46E5","#0EA5E9","#10B981","#F59E0B","#EF4444","#8B5CF6","#06B6D4","#1E293B"].map((c) => (
              <button
                key={c}
                onClick={() => updateAnswers({ primaryColor: c })}
                style={{ backgroundColor: c }}
                className={[
                  "w-7 h-7 rounded-lg border-2 transition-transform hover:scale-110",
                  answers.primaryColor === c ? "border-slate-900 scale-110" : "border-transparent",
                ].join(" ")}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tab structure */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Navigation tabs</label>
        <p className="text-xs text-slate-400 mb-3">Reorder with the arrows — hide tabs your team won't use</p>
        <div className="space-y-2">
          {allTabs.map((tabId) => {
            const meta = TABS_META[tabId];
            const isVisible = answers.tabStructure.includes(tabId);
            const idx = answers.tabStructure.indexOf(tabId);
            return (
              <div
                key={tabId}
                className={[
                  "flex items-center gap-3 p-3 rounded-xl border transition-all",
                  isVisible ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-50",
                ].join(" ")}
              >
                <span className="text-lg w-7 text-center">{meta.icon}</span>
                <span className={["flex-1 text-sm font-medium", isVisible ? "text-slate-800" : "text-slate-400"].join(" ")}>
                  {meta.label}
                </span>
                {isVisible && (
                  <span className="text-xs text-slate-400 font-mono bg-slate-100 rounded px-1.5 py-0.5">
                    #{idx + 1}
                  </span>
                )}
                <div className="flex gap-1">
                  <button
                    onClick={() => moveTab(tabId, -1)}
                    disabled={!isVisible || idx === 0}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-500"
                  >↑</button>
                  <button
                    onClick={() => moveTab(tabId, 1)}
                    disabled={!isVisible || idx === answers.tabStructure.length - 1}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-500"
                  >↓</button>
                  <button
                    onClick={() => toggleTab(tabId)}
                    className={[
                      "w-7 h-7 flex items-center justify-center rounded-lg text-xs transition-colors",
                      isVisible ? "hover:bg-red-50 text-slate-400 hover:text-red-500" : "hover:bg-green-50 text-slate-400 hover:text-green-600",
                    ].join(" ")}
                  >
                    {isVisible ? "✕" : "+"}
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
