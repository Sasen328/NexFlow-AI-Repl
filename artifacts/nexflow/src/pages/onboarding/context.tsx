import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";
import { apiFetch } from "@/hooks/useApi";
import type { SetupAnswers, SetupSession, ProposalData, SetupPath } from "./types";
import { defaultAnswers } from "./types";
import { calculatePricing } from "./pricing";
import { TENANT_CONFIG_KEY, TENANT_CONFIG_EVENT } from "@/hooks/useTenantConfig";

interface WizardCtx {
  sessionId: string | null;
  setupPath: SetupPath;
  answers: SetupAnswers;
  step: number;
  totalSteps: number;
  saving: boolean;
  pricing: ReturnType<typeof calculatePricing>;
  proposal: ProposalData | null;
  proposalLoading: boolean;
  error: string | null;

  startSession: (path: SetupPath) => Promise<void>;
  updateAnswers: (partial: Partial<SetupAnswers>) => void;
  goNext: () => Promise<void>;
  goBack: () => void;
  generateProposal: () => Promise<void>;
  approveProposal: () => Promise<string | null>;
}

const Ctx = createContext<WizardCtx | null>(null);

export function useWizard() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useWizard must be inside WizardProvider");
  return c;
}

const TOTAL_STEPS = 6;

export function WizardProvider({ children }: { children: ReactNode }) {
  const [, navigate] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [setupPath, setSetupPath] = useState<SetupPath>("managed");
  const [answers, setAnswers] = useState<SetupAnswers>(defaultAnswers);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [proposalLoading, setProposalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore session from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("s");
    const st  = parseInt(params.get("step") || "1", 10);
    if (sid) {
      setSessionId(sid);
      setStep(isNaN(st) ? 1 : Math.max(1, Math.min(st, TOTAL_STEPS)));
      apiFetch(`/setup/sessions/${sid}`)
        .then((data: SetupSession) => {
          setAnswers({ ...defaultAnswers, ...data.answers });
          setSetupPath(data.setupPath);
        })
        .catch(() => { /* start fresh if session not found */ });
    }
  }, []);

  // Keep URL in sync with step + sessionId
  useEffect(() => {
    if (!sessionId) return;
    const url = `/onboarding/setup?s=${sessionId}&step=${step}`;
    window.history.replaceState(null, "", url);
  }, [sessionId, step]);

  const pricing = calculatePricing(answers, setupPath);

  const startSession = useCallback(async (path: SetupPath) => {
    setError(null);
    setSaving(true);
    try {
      const data: SetupSession = await apiFetch("/setup/sessions", {
        method: "POST",
        body: JSON.stringify({ setupPath: path }),
      });
      setSessionId(data.id);
      setSetupPath(path);
      navigate(`/onboarding/setup?s=${data.id}&step=1`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }, [navigate]);

  const updateAnswers = useCallback((partial: Partial<SetupAnswers>) => {
    setAnswers((prev) => ({ ...prev, ...partial }));
  }, []);

  // Debounced save to backend
  const saveToBackend = useCallback(async (sid: string, a: SetupAnswers) => {
    try {
      await apiFetch(`/setup/sessions/${sid}`, {
        method: "PATCH",
        body: JSON.stringify({ answers: a }),
      });
    } catch { /* non-blocking */ }
  }, []);

  const goNext = useCallback(async () => {
    setError(null);
    if (!sessionId) return;
    setSaving(true);
    try {
      await saveToBackend(sessionId, answers);
      if (step < TOTAL_STEPS) {
        setStep((s) => s + 1);
      } else {
        // All steps done — generate proposal
        navigate(`/onboarding/proposal?s=${sessionId}`);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }, [sessionId, answers, step, navigate, saveToBackend]);

  const goBack = useCallback(() => {
    if (step > 1) setStep((s) => s - 1);
    else navigate("/onboarding");
  }, [step, navigate]);

  const generateProposal = useCallback(async () => {
    if (!sessionId) return;
    setProposalLoading(true);
    setError(null);
    try {
      // Save latest answers first
      await saveToBackend(sessionId, answers);
      const data: ProposalData = await apiFetch(`/setup/sessions/${sessionId}/proposal`, {
        method: "POST",
        body: JSON.stringify({ setupPath }),
      });
      setProposal(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setProposalLoading(false);
    }
  }, [sessionId, answers, setupPath, saveToBackend]);

  const approveProposal = useCallback(async () => {
    if (!sessionId || !proposal) return null;
    setSaving(true);
    try {
      const data = await apiFetch(`/setup/sessions/${sessionId}/approve`, {
        method: "POST",
        body: JSON.stringify({ proposalId: proposal.id }),
      });
      // Persist the full wizard choices so SetupComplete and the main app can read them
      const tenantPayload = {
        companyName:    answers.companyName,
        companyNameAr:  answers.companyNameAr  ?? "",
        primaryColor:   answers.primaryColor,
        secondaryColor: answers.secondaryColor ?? "#88B8B0",
        accentColor:    answers.accentColor    ?? "#C8A880",
        logoBase64:     answers.logoBase64     ?? null,
        enabledModules: answers.enabledModules,
        tabStructure:   answers.tabStructure   ?? ["home","leads","callcenter","datahub","marketing","insights"],
        countries:      answers.countries,
        industry:       answers.industry,
        crNumber:       answers.crNumber       ?? "",
        companyWebsite: answers.companyWebsite ?? "",
        linkedinPage:   answers.linkedinPage   ?? "",
        integrations:   answers.integrations   ?? [],
        setupPath,
        slug:           data.slug ?? sessionId,
        approvedAt:     new Date().toISOString(),
      };
      localStorage.setItem(TENANT_CONFIG_KEY, JSON.stringify(tenantPayload));
      window.dispatchEvent(new CustomEvent(TENANT_CONFIG_EVENT));
      // Auto-sign in as the workspace admin — no human step needed
      const { setSignedIn, setRole } = await import("@/lib/marketing-auth");
      setRole("admin");
      setSignedIn(true);
      navigate(`/onboarding/complete?s=${sessionId}`);
      return data.slug as string;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [sessionId, proposal, answers, setupPath, navigate]);

  return (
    <Ctx.Provider value={{
      sessionId, setupPath, answers, step, totalSteps: TOTAL_STEPS,
      saving, pricing, proposal, proposalLoading, error,
      startSession, updateAnswers, goNext, goBack,
      generateProposal, approveProposal,
    }}>
      {children}
    </Ctx.Provider>
  );
}
