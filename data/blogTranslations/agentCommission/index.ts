import type { GuideTranslations } from "../types";
import type { AgentCommissionCopy } from "./types";
import { agentCommissionMl } from "./ml";
import { agentCommissionHi } from "./hi";
import { agentCommissionTa } from "./ta";
import { agentCommissionTe } from "./te";

/** "How Kerala Lottery Agents Earn Commission on Winning Tickets" in every non-English language (English lives in data/blogs.ts + ./en). */
export const AGENT_COMMISSION_TRANSLATIONS: GuideTranslations<AgentCommissionCopy> = {
  ml: agentCommissionMl,
  hi: agentCommissionHi,
  ta: agentCommissionTa,
  te: agentCommissionTe,
};
