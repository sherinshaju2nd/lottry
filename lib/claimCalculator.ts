/**
 * Kerala State Lottery prize claim estimate.
 *
 * Keep in sync with mobile/src/utils/claimCalculator.ts (same rules, same numbers):
 *  - Prizes above ₹10,000: the selling agent's 10% commission is deducted first, then 30% TDS
 *    (Income Tax Act s.194B) is deducted from the remaining amount. This matches the widely
 *    reported payouts, e.g. ₹25 Cr bumper → ₹22.5 Cr after commission → ₹15.75 Cr after TDS.
 *  - Prizes up to ₹10,000: paid in full.
 *  - Surcharge and 4% health & education cess may be due when the winner files their return;
 *    they are not deducted at source here.
 */
export const TAX_FREE_LIMIT = 10_000;
export const AGENT_COMMISSION_RATE = 0.1;
export const TDS_RATE = 0.3;

export type ClaimOffice = "agent" | "district_office" | "directorate";

export interface ClaimEstimate {
  grossPrize: number;
  agentCommission: number;
  taxableAmount: number;
  tds: number;
  netAmount: number;
  claimOffice: ClaimOffice;
}

export const getClaimOffice = (grossPrize: number): ClaimOffice => {
  if (grossPrize > 100_000) return "directorate";
  if (grossPrize > 5_000) return "district_office";
  return "agent";
};

export const calculateClaim = (grossPrizeInput: number): ClaimEstimate => {
  const grossPrize = Number.isFinite(grossPrizeInput) ? Math.max(0, Math.round(grossPrizeInput)) : 0;
  const deductionsApply = grossPrize > TAX_FREE_LIMIT;

  const agentCommission = deductionsApply ? Math.round(grossPrize * AGENT_COMMISSION_RATE) : 0;
  const taxableAmount = grossPrize - agentCommission;
  const tds = deductionsApply ? Math.round(taxableAmount * TDS_RATE) : 0;

  return {
    grossPrize,
    agentCommission,
    taxableAmount,
    tds,
    netAmount: Math.max(0, taxableAmount - tds),
    claimOffice: getClaimOffice(grossPrize),
  };
};
