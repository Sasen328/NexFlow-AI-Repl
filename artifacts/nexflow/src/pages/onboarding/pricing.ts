import type { SetupAnswers, PricingBreakdown, PricingLine, SetupPath } from "./types";

export function calculatePricing(answers: SetupAnswers, setupPath: SetupPath = "managed"): PricingBreakdown {
  const totalSeats = (answers.seatsSales || 0) + (answers.seatsSDR || 0) +
                     (answers.seatsMarketing || 0) + (answers.seatsManagement || 0);
  const dialerSeats = (answers.seatsSales || 0) + (answers.seatsSDR || 0);
  const mods = answers.enabledModules || [];

  const lines: PricingLine[] = [];

  // Core CRM — always included
  const coreSeats = Math.max(totalSeats, 1);
  lines.push({ name: "Core CRM", unit: `SAR 149 × ${coreSeats} seats`, monthly: 149 * coreSeats });

  if (mods.includes("dialer") && dialerSeats > 0) {
    lines.push({ name: "Power Dialer", unit: `SAR 89 × ${dialerSeats} seats`, monthly: 89 * dialerSeats });
  }

  if (mods.includes("enrichment")) {
    const credits = answers.enrichmentCreditsMonthly || 1000;
    let cost = 50;
    if (credits > 5000) cost = 800;
    else if (credits > 1000) cost = 200;
    lines.push({ name: "AI Enrichment", unit: `${credits.toLocaleString()} credits/mo`, monthly: cost });
  }

  if (mods.includes("marketing"))        lines.push({ name: "Marketing Suite",     unit: "Flat rate",         monthly: 299  });
  if (mods.includes("voice-agents"))     lines.push({ name: "AI Voice Agents",     unit: "1,000 min included",monthly: 599  });
  if (mods.includes("intelligence"))     lines.push({ name: "Conversation Intel",  unit: "Flat rate",         monthly: 199  });
  if (mods.includes("forecasting"))      lines.push({ name: "Forecasting",         unit: "Flat rate",         monthly: 149  });
  if (mods.includes("cpq"))             lines.push({ name: "CPQ & Quotes",        unit: "Flat rate",         monthly: 99   });
  if (mods.includes("website-tracking")) lines.push({ name: "Website Tracking",    unit: "Flat rate",         monthly: 199  });

  const totalMonthly = lines.reduce((s, l) => s + l.monthly, 0);

  // Setup fee (NexFlow-managed path only)
  let setupFee = 0;
  if (setupPath === "managed") {
    if (totalSeats <= 10)       setupFee = 5_000;
    else if (totalSeats <= 50)  setupFee = 12_000;
    else if (totalSeats <= 200) setupFee = 25_000;
    else                        setupFee = 45_000;
  }

  // Timeline
  let weeks = 4;
  if (answers.migrationNeeded) weeks += 2;
  if (totalSeats > 100)        weeks += 2;
  if (setupPath === "self")    weeks += 1;
  if (answers.currentCrm === "salesforce" || answers.currentCrm === "dynamics") weeks += 1;

  return {
    lines,
    totalMonthly,
    setupFee,
    timelineWeeks: weeks,
    annualTotal: totalMonthly * 12 + setupFee,
  };
}

export function formatSAR(n: number) {
  return `SAR ${n.toLocaleString("en-SA")}`;
}
