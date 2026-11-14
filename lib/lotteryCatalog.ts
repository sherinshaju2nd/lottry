/**
 * Kerala State lottery catalog: the 7 weekly draws and 6 bumpers (English + Malayalam names).
 * Data only (no Supabase client), so client components like the footer can import it cheaply.
 * Re-exported from lib/supabase for existing imports.
 */
export interface WeeklyLotteryItem {
  day: string;
  name: string;
  nameMl: string;
  code: string;
  is_bumper?: boolean;
  jackpot?: string;
  ticket_price?: string;
  drawTime?: string;
  draw_season?: string;
}

export const WEEKLY_LOTTERIES: WeeklyLotteryItem[] = [
  {
    day: "Monday",
    name: "Bhagyathara",
    nameMl: "ഭാഗ്യതാരാ",
    code: "BT",
    is_bumper: false,
    jackpot: "₹1 Crore",
    ticket_price: "₹50",
  },
  {
    day: "Tuesday",
    name: "Sthree Sakthi",
    nameMl: "സ്ത്രീശക്തി",
    code: "SS",
    is_bumper: false,
    jackpot: "₹1 Crore",
    ticket_price: "₹50",
  },
  {
    day: "Wednesday",
    name: "Dhanalekshmi",
    nameMl: "ധനലക്ഷ്മി",
    code: "DL",
    is_bumper: false,
    jackpot: "₹1 Crore",
    ticket_price: "₹50",
  },
  {
    day: "Thursday",
    name: "Karunya Plus",
    nameMl: "കാരുണ്യ പ്ലസ്",
    code: "KN",
    is_bumper: false,
    jackpot: "₹1 Crore",
    ticket_price: "₹50",
  },
  {
    day: "Friday",
    name: "Suvarna Keralam",
    nameMl: "സുവർണ്ണ കേരളം",
    code: "SK",
    is_bumper: false,
    jackpot: "₹1 Crore",
    ticket_price: "₹50",
  },
  {
    day: "Saturday",
    name: "Karunya",
    nameMl: "കാരുണ്യ",
    code: "KR",
    is_bumper: false,
    jackpot: "₹1 Crore",
    ticket_price: "₹50",
  },
  {
    day: "Sunday",
    name: "Samrudhi",
    nameMl: "സമൃദ്ധി",
    code: "SM",
    is_bumper: false,
    jackpot: "₹1 Crore",
    ticket_price: "₹50",
  },
];

export const BUMPER_LOTTERIES: WeeklyLotteryItem[] = [
  {
    day: "Bumper (January)",
    name: "Christmas New Year Bumper",
    nameMl: "ക്രിസ്മസ് ന്യൂ ഇയർ ബംപർ",
    code: "XN",
    is_bumper: true,
    jackpot: "₹20 Crore",
    ticket_price: "₹400",
    draw_season: "January",
  },
  {
    day: "Bumper (March)",
    name: "Summer Bumper",
    nameMl: "സമ്മർ ബംപർ",
    code: "SB",
    is_bumper: true,
    jackpot: "₹10 Crore",
    ticket_price: "₹250",
    draw_season: "March (Summer)",
  },
  {
    day: "Bumper (May)",
    name: "Vishu Bumper",
    nameMl: "വിഷു ബംപർ",
    code: "VB",
    is_bumper: true,
    jackpot: "₹12 Crore",
    ticket_price: "₹300",
    draw_season: "May (Vishu)",
  },
  {
    day: "Bumper (July)",
    name: "Monsoon Bumper",
    nameMl: "മൺസൂൺ ബംപർ",
    code: "MB",
    is_bumper: true,
    jackpot: "₹10 Crore",
    ticket_price: "₹250",
    draw_season: "July (Monsoon)",
  },
  {
    day: "Bumper (September)",
    name: "Thiruvonam Bumper",
    nameMl: "തിരുവോണം ബംപർ",
    code: "TH",
    is_bumper: true,
    jackpot: "₹25 Crore",
    ticket_price: "₹500",
    draw_season: "September (Onam)",
  },
  {
    day: "Bumper (November)",
    name: "Pooja Bumper",
    nameMl: "പൂജ ബംപർ",
    code: "PB",
    is_bumper: true,
    jackpot: "₹12 Crore",
    ticket_price: "₹300",
    draw_season: "November (Pooja/Diwali)",
  },
];
