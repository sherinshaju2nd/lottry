import type { GuideTranslations } from "../types";
import type { PoojaBumper2026Copy } from "./types";
import { poojaBumper2026Ml } from "./ml";
import { poojaBumper2026Hi } from "./hi";
import { poojaBumper2026Ta } from "./ta";
import { poojaBumper2026Te } from "./te";

/** "Pooja Bumper Lottery 2026" in every non-English language (English lives in data/blogs.ts + ./en). */
export const POOJA_BUMPER_2026_TRANSLATIONS: GuideTranslations<PoojaBumper2026Copy> = {
  ml: poojaBumper2026Ml,
  hi: poojaBumper2026Hi,
  ta: poojaBumper2026Ta,
  te: poojaBumper2026Te,
};
