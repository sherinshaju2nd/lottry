export interface PrizeCategoryItem {
  category: string;
  amount: string;
  notes?: string;
}

export interface LotteryEditorialContent {
  code: string;
  slug: string;
  name: string;
  nameMl: string;
  hindiName?: string;
  teluguName?: string;
  kannadaName?: string;
  h1Pattern: string;
  introParagraphs: string[];
  keralaResultHeading: string;
  keralaResultParagraphs: string[];
  lotterySectionHeading: string;
  lotterySectionParagraphs: string[];
  keralaStateLotteriesResultsHeading: string;
  keralaStateLotteriesResultsParagraphs: string[];
  weeklyLotteryHeading: string;
  weeklyLotteryParagraphs: string[];
  aboutHeading: string;
  aboutParagraphs: string[];
  drawVenueHeading: string;
  drawVenueParagraphs: string[];
  venueDetails: {
    name: string;
    location: string;
    city: string;
    state: string;
    drawTime: string;
    drawDay: string;
  };
  ticketPriceHeading: string;
  ticketPriceParagraphs: string[];
  ticketPriceDetails: {
    total: string;
    basicPrice: string;
    gst: string;
    seriesCount: number;
  };
  prizes: PrizeCategoryItem[];
  codesAndSeriesHeading: string;
  codesAndSeriesParagraphs: string[];
  seriesList: string[];
  faqItems: { question: string; answer: string }[];
}

export const LOTTERY_EDITORIAL_DATA: Record<string, LotteryEditorialContent> = {
  BT: {
    code: "BT",
    slug: "bhagyathara",
    name: "Bhagyathara",
    nameMl: "ഭാഗ്യധാര",
    hindiName: "भाग्यधारा लॉटरी",
    teluguName: "భాగ్యధార లాటరీ",
    kannadaName: "ಭಾಗ್ಯಧಾರ ಲಾಟರಿ",
    h1Pattern: "Bhagyathara Lottery Result Today: {date} ഭാഗ്യധാര (BT)",
    introParagraphs: [
      "Bhagyathara Lottery (भाग्यधारा लॉटरी) is one of the weekly lottery schemes conducted by the Kerala State Lotteries Department. The lottery is identified by the code “BT”, and its weekly draw is conducted on Monday at 3:00 PM. The latest winning numbers are published after the draw, allowing ticket holders to check their numbers and prize details.",
      "The official Bhagyathara result includes the winning numbers, ticket series, prize categories, and consolation numbers. Once the result is released, participants can compare their tickets with the published result and refer to the official result document for verification. Official records show recent Bhagyathara draws taking place at Gorky Bhavan, near Bakery Junction, Thiruvananthapuram.",
    ],
    keralaResultHeading: "Bhagyathara Kerala Lottery Result",
    keralaResultParagraphs: [
      "The Bhagyathara Kerala Lottery Result (ഭാഗ്യധാര ലോട്ടറി) contains the winning numbers announced for the weekly Bhagyathara draw. The tickets are issued in multiple series, and ticket holders need to check both the series and number when verifying their results.",
      "The Bhagyathara Lottery Result can be checked after the official draw is completed. The result provides details for the first, second, third, and other prize categories, along with consolation prizes where applicable.",
      "If you are checking an older ticket, previous Bhagyathara results can also be useful. Compare the complete ticket number, series, draw number, and prize category carefully before deciding whether your ticket has won.",
    ],
    lotterySectionHeading: "Bhagyathara Lottery",
    lotterySectionParagraphs: [
      "Bhagyathara Lottery (भाग्यधारा लॉटरी) is a weekly lottery ticket issued by the Kerala State Lotteries Department. A Bhagyathara ticket costs ₹50, including the applicable Goods and Services Tax. The official prize structure provides several prize categories, allowing winning tickets to receive different prize amounts.",
      "The Bhagyathara Lottery has a first prize of ₹1 crore, while the second prize is ₹30 lakh and the third prize is ₹5 lakh. Other prize categories are awarded based on the numbers announced during the draw.",
      "Ticket holders should retain their original ticket safely and verify the series and number against the official result before beginning the prize claim process.",
    ],
    keralaStateLotteriesResultsHeading: "Kerala State Lotteries Results",
    keralaStateLotteriesResultsParagraphs: [
      "The Kerala State Lotteries Results are published after the scheduled lottery draws conducted by the Kerala State Lotteries Department. The results contain the winning numbers and relevant prize information for each lottery.",
      "People searching for the Bhagyathara lottery result (భాగ్యధార లాటరీ) can check the latest result after the Monday draw. Earlier results can also be referred to when checking an old ticket or reviewing previous Bhagyathara draws.",
      "Before claiming a prize, ticket holders should carefully verify the ticket number, series, draw number, and prize category. The original ticket should be kept in good condition because it is required for the applicable prize claim procedure.",
    ],
    weeklyLotteryHeading: "Kerala State Bhagyathara Weekly Lottery",
    weeklyLotteryParagraphs: [
      "The Kerala State Bhagyathara Weekly Lottery (ಭಾಗ್ಯಧಾರ ಲಾಟರಿ) is part of the weekly lottery schedule maintained by the Kerala State Lotteries Department. The Bhagyathara draw is currently conducted on Monday at 3:00 PM. Official result records also identify Gorky Bhavan, near Bakery Junction, Thiruvananthapuram as the draw venue.",
      "After the draw, the winning numbers are made available through the official result system. Ticket holders can use these numbers to check whether their Bhagyathara ticket has won a prize.",
      "For accurate verification, always compare your ticket with the officially published result rather than relying only on unofficial numbers shared online.",
    ],
    aboutHeading: "About Bhagyathara Lottery",
    aboutParagraphs: [
      "Bhagyathara Lottery (BT) is a weekly lottery scheme operated by the Kerala State Lotteries Department. The official scheme identifies it as the Bhagyathara (BT) Weekly Lottery, with a ticket price of ₹50, including GST. Tickets are issued in 12 series for the lottery.",
      "The lottery provides a ₹1 crore first prize, followed by a ₹30 lakh second prize and a ₹5 lakh third prize. Additional prizes are available for specified last-four-digit combinations.",
      "The official result records show Bhagyathara draws taking place on Mondays. For example, the official result lists BT-72 on 21 September 2026, following BT-71 on 14 September 2026.",
    ],
    drawVenueHeading: "Bhagyathara Lottery Draw Venue",
    drawVenueParagraphs: [
      "The official Bhagyathara Lottery draw is conducted at Gorky Bhavan, near Bakery Junction, Thiruvananthapuram, Kerala.",
      "The draw is held at 3:00 PM on Monday. Official Bhagyathara result documents identify the venue and draw time along with the respective draw number.",
      "After the draw, the winning numbers are published through the Kerala State Lotteries result system.",
    ],
    venueDetails: {
      name: "Gorky Bhavan",
      location: "Near Bakery Junction, Palayam",
      city: "Thiruvananthapuram",
      state: "Kerala",
      drawTime: "3:00 PM",
      drawDay: "Monday",
    },
    ticketPriceHeading: "Bhagyathara Lottery Ticket Price",
    ticketPriceParagraphs: [
      "The Bhagyathara Lottery ticket price is ₹50. According to the official scheme document, the ticket consists of a basic ticket price of ₹39.06 plus 28% GST.",
      "The official scheme document states that Bhagyathara tickets are issued in 12 series and provides the detailed prize distribution for each category.",
    ],
    ticketPriceDetails: {
      total: "₹50",
      basicPrice: "₹39.06",
      gst: "28% GST",
      seriesCount: 12,
    },
    prizes: [
      { category: "1st Prize", amount: "₹1,00,00,000 (1 Crore)" },
      { category: "2nd Prize", amount: "₹30,00,000 (30 Lakh)" },
      { category: "3rd Prize", amount: "₹5,00,00,000 (5 Lakh)" },
      { category: "4th Prize", amount: "₹5,000" },
      { category: "5th Prize", amount: "₹2,000" },
      { category: "6th Prize", amount: "₹1,000" },
      { category: "7th Prize", amount: "₹500" },
      { category: "8th Prize", amount: "₹200" },
      { category: "Consolation Prize", amount: "₹5,000" },
    ],
    codesAndSeriesHeading: "Bhagyathara Kerala Lottery Codes and Series",
    codesAndSeriesParagraphs: [
      "The Bhagyathara Kerala Lottery Result is identified using the lottery code “BT.” The official scheme provides for tickets to be issued in 12 series. The series used in individual draws can be checked against the official result for that particular draw.",
      "Recent official results demonstrate the use of series such as: BA, BB, BC, BD, BE, BF, BG, BH, BJ, BK, BL, BM and BN, BO, BP, BR, BS, BT, BU, BV, BW, BX, BY, BZ.",
      "When checking the Bhagyathara result, make sure to compare the complete ticket number together with the correct series. The series is particularly important because the official result identifies winning tickets by their corresponding series and number.",
    ],
    seriesList: [
      "BA", "BB", "BC", "BD", "BE", "BF", "BG", "BH", "BJ", "BK", "BL", "BM",
      "BN", "BO", "BP", "BR", "BS", "BT", "BU", "BV", "BW", "BX", "BY", "BZ",
    ],
    faqItems: [
      {
        question: "When is the Kerala Bhagyathara Lottery draw conducted?",
        answer: "The Bhagyathara Lottery (code BT) weekly draw is held every Monday at 3:00 PM at Gorky Bhavan, near Bakery Junction, Thiruvananthapuram, Kerala.",
      },
      {
        question: "What is the first prize for the Bhagyathara Lottery?",
        answer: "The first prize for the Bhagyathara weekly lottery is ₹1,00,00,000 (₹1 Crore). The second prize is ₹30,00,000 (₹30 Lakh) and the third prize is ₹5,00,000 (₹5 Lakh).",
      },
      {
        question: "How much does a Bhagyathara Lottery ticket cost?",
        answer: "A Bhagyathara Lottery ticket costs ₹50 (which comprises ₹39.06 basic ticket price + 28% GST).",
      },
      {
        question: "How many series are issued in Bhagyathara Lottery?",
        answer: "Bhagyathara tickets are issued in 12 series per draw, typically covering series like BA through BM or BN through BZ.",
      },
      {
        question: "Where can I verify the official Bhagyathara result?",
        answer: "You can check the live winning numbers right here on this page at 3:00 PM every Monday, and download the official Kerala Government Gazette PDF document.",
      },
    ],
  },

  SM: {
    code: "SM",
    slug: "samrudhi",
    name: "Samrudhi",
    nameMl: "സമൃദ്ധി",
    hindiName: "समृद्धि लॉटरी",
    teluguName: "సమృద్ధి లాటరీ",
    kannadaName: "ಸಮೃದ್ಧಿ ಲಾಟರಿ",
    h1Pattern: "Samrudhi Lottery Result Today: {date} സമൃദ്ധി (SM)",
    introParagraphs: [
      "Samrudhi Bhagyakuri is among the weekly lottery schemes conducted by the Kerala State Lotteries Department. The Samrudhi lottery draw is generally held every Sunday under the lottery code “SM.” The latest winning numbers are made available shortly after the draw, while the complete and official result document is released by the department later in the day. Once the official result is published, participants can check the winning numbers and download the result PDF for reference.",
    ],
    keralaResultHeading: "Samrudhi Kerala Lottery Result",
    keralaResultParagraphs: [
      "The Samrudhi Kerala Lottery Result (സമൃദ്ധി ലോട്ടറി) contains the winning numbers from the different series issued for the weekly draw. Kerala State Lotteries releases tickets through multiple series, and the series combination can vary from one draw to another.",
      "Ticket holders should carefully compare their ticket number, series, and prize category with the officially published result. Checking all these details is important because the winning numbers are announced according to the respective series.",
      "For the latest Samrudhi Kerala Lottery Result, participants can check the published result after the official draw. Previous Samrudhi results can also be referred to when checking older tickets or reviewing past draws.",
    ],
    lotterySectionHeading: "Samrudhi Bhagyakuri",
    lotterySectionParagraphs: [
      "Samrudhi Bhagyakuri tickets (समृद्धि लॉटरी) are available at the prescribed ticket price fixed by the Kerala State Lotteries Department. The lottery offers multiple prize categories, giving participants the opportunity to win different amounts depending on their ticket number and the prize category.",
      "The first prize is awarded to the ticket matching the announced first-prize number. Along with the major prize, the draw includes several other prize categories and a consolation prize.",
      "Prize winners should verify their ticket details against the official result and follow the applicable Kerala State Lotteries rules for claiming the prize. Winners may also need to produce the original ticket and required identification documents while submitting a prize claim.",
    ],
    keralaStateLotteriesResultsHeading: "Kerala State Lotteries Results",
    keralaStateLotteriesResultsParagraphs: [
      "The Kerala State Lotteries Results are officially announced after each scheduled lottery draw. The winning numbers are later made available through the department's official result publications and newspapers.",
      "Those looking for the Samrudhi lottery result (సమృద్ధి లాటరీ) can check the latest winning numbers after the draw. Previous results are also useful for people who want to check an older ticket or review the results of earlier Samrudhi draws.",
      "Before claiming any prize, ticket holders should verify the number, series, draw date, and prize category carefully. The original lottery ticket should be preserved safely until the result and prize claim process have been completed.",
    ],
    weeklyLotteryHeading: "Kerala State Samrudhi Weekly Lottery",
    weeklyLotteryParagraphs: [
      "The Kerala State Samrudhi Weekly Lottery (ಸಮೃದ್ಧಿ ಲಾಟರಿ) is conducted as part of the weekly lottery schedule of the Kerala State Lotteries Department. The draw can be followed through available live broadcasts and other official announcements.",
      "After the draw, the winning numbers are published so that ticket holders can check their results. If you have purchased a Samrudhi ticket, keep the ticket safely and compare its details with the officially released result.",
    ],
    aboutHeading: "About Samrudhi Lottery",
    aboutParagraphs: [
      "Samrudhi Lottery (SM) is a weekly lottery introduced by the Government of Kerala under the Kerala State Lotteries Department. It was introduced on May 2025 as a new weekly lottery with an enhanced prize structure, replacing the earlier Akshaya Weekly Lottery.",
      "The Samrudhi Lottery draw is conducted once a week, generally on Sunday at 3:00 PM.",
    ],
    drawVenueHeading: "Samrudhi Lottery Draw Venue",
    drawVenueParagraphs: [
      "The official Samrudhi lottery draw is conducted at Gorky Bhavan, near Bakery Junction, Thiruvananthapuram, Kerala. The published result records identify this as the venue for the Samrudhi draw.",
      "The draw is conducted at 3:00 PM, after which the winning numbers are published through the Kerala State Lotteries result system.",
    ],
    venueDetails: {
      name: "Gorky Bhavan",
      location: "Near Bakery Junction, Palayam",
      city: "Thiruvananthapuram",
      state: "Kerala",
      drawTime: "3:00 PM",
      drawDay: "Sunday",
    },
    ticketPriceHeading: "Samrudhi Lottery Ticket Price",
    ticketPriceParagraphs: [
      "A Samrudhi Lottery ticket costs ₹50. The ticket provides participants with an opportunity to win prizes across several categories, with the highest prize reaching ₹1 crore.",
      "The current published Samrudhi results show the following major prize categories:",
      "The official results also specify the winning ticket series and numbers for each prize category.",
    ],
    ticketPriceDetails: {
      total: "₹50",
      basicPrice: "₹39.06",
      gst: "28% GST",
      seriesCount: 12,
    },
    prizes: [
      { category: "1st Prize", amount: "₹1,00,00,000 (1 Crore)" },
      { category: "2nd Prize", amount: "₹25,00,00,000 (25 Lakh)" },
      { category: "3rd Prize", amount: "₹5,00,00,000 (5 Lakh)" },
      { category: "4th Prize", amount: "₹5,000 (5 Thousand)" },
      { category: "5th Prize", amount: "₹2,000 (2 Thousand)" },
      { category: "6th Prize", amount: "₹1,000 (1 Thousand)" },
      { category: "7th Prize", amount: "₹500 (Five Hundred)" },
      { category: "Consolation Prize", amount: "₹5,000" },
    ],
    codesAndSeriesHeading: "Samrudhi Kerala Lottery Codes and Series",
    codesAndSeriesParagraphs: [
      "The Samrudhi Kerala Lottery Result is published based on the series and ticket numbers issued for each draw. The lottery tickets are printed in multiple series, and the applicable series can change from one draw to another.",
      "The series used for Samrudhi lottery tickets include: MA, MB, MC, MD, ME, MF, MG, MH, MJ, MK, ML, MM and MN, MO, MP, MR, MS, MT, MU, MV, MW, MX, MY, MZ.",
      "Therefore, while checking the Samrudhi result, ticket holders should carefully compare both the series and the complete ticket number with the officially announced winning numbers.",
    ],
    seriesList: [
      "MA", "MB", "MC", "MD", "ME", "MF", "MG", "MH", "MJ", "MK", "ML", "MM",
      "MN", "MO", "MP", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ",
    ],
    faqItems: [
      {
        question: "When is the Samrudhi Kerala Lottery draw conducted?",
        answer: "The Samrudhi Lottery draw is conducted every Sunday at 3:00 PM at Gorky Bhavan, near Bakery Junction, Thiruvananthapuram.",
      },
      {
        question: "What is the 1st prize for Samrudhi Lottery?",
        answer: "The first prize for Samrudhi Lottery is ₹1,00,00,000 (₹1 Crore), with a 2nd prize of ₹25,00,000 (₹25 Lakh) and 3rd prize of ₹5,00,000 (₹5 Lakh).",
      },
      {
        question: "What is the ticket price for Samrudhi Lottery?",
        answer: "The official ticket price for Samrudhi Lottery is ₹50.",
      },
      {
        question: "Which earlier lottery did Samrudhi replace?",
        answer: "Samrudhi Weekly Lottery was introduced in May 2025 by the Government of Kerala with an enhanced prize structure, replacing the earlier Akshaya Weekly Lottery.",
      },
    ],
  },

  SS: {
    code: "SS",
    slug: "sthreesakthi",
    name: "Sthree Sakthi",
    nameMl: "സ്ത്രീ ശക്തി",
    hindiName: "स्त्री शक्ति लॉटरी",
    teluguName: "స్త్రీ శక్తి లాటరీ",
    kannadaName: "ಸ್ತ್ರೀ ಶಕ್ತಿ ಲಾಟರಿ",
    h1Pattern: "Sthree Sakthi Lottery Result Today: {date} സ്ത്രീ ശക്തി (SS)",
    introParagraphs: [
      "Sthree Sakthi is one of the weekly lottery schemes conducted by the Kerala State Lotteries Department. The Sthree Sakthi lottery is held every Tuesday under the lottery code “SS.” The draw takes place at 3:00 PM, and the winning numbers are published after the draw through the Kerala State Lotteries result system.",
      "Ticket holders can check the latest Sthree Sakthi Lottery Result Today by matching their ticket series and number with the published winning numbers. Once the official result is available, the complete result details can also be referred to for prize verification.",
    ],
    keralaResultHeading: "Sthree Sakthi Kerala Lottery Result",
    keralaResultParagraphs: [
      "The Sthree Sakthi Kerala Lottery Result (സ്ത്രീ ശക്തി ലോട്ടറി) contains the winning numbers announced for the weekly SS lottery draw. The tickets are issued in multiple series, and the result is published with the corresponding series and winning ticket numbers.",
      "While checking the Sthree Sakthi Kerala Lottery Result, ticket holders should compare the complete ticket number, series, draw number, and applicable prize category. This helps ensure that the ticket is checked against the correct result.",
      "Previous Sthree Sakthi results can also be referred to when checking an older ticket or reviewing earlier weekly draws.",
    ],
    lotterySectionHeading: "Sthree Sakthi Lottery",
    lotterySectionParagraphs: [
      "Sthree Sakthi Lottery (स्त्री शक्ति लॉटरी) tickets are issued by the Kerala State Lotteries Department at the prescribed price. The current ticket price is ₹50, and the lottery has several prize categories for different winning numbers.",
      "The current prize structure provides a first prize of ₹1,00,00,000 (₹1 crore). The second prize is ₹30,00,000, while the third prize is ₹5,00,000. Other prize categories are also available, including prizes for matching the last four digits of the ticket number.",
      "A consolation prize is also provided for eligible tickets from the remaining series. Prize winners should verify their ticket against the official result and follow the Kerala State Lotteries Department's applicable rules for claiming the prize.",
    ],
    keralaStateLotteriesResultsHeading: "Kerala State Lotteries Results",
    keralaStateLotteriesResultsParagraphs: [
      "The Kerala State Lotteries Results are published following the scheduled lottery draws conducted by the Kerala State Lotteries Department. The official result system provides the winning numbers and draw details for the different weekly lotteries.",
      "Those searching for the Sthree Sakthi lottery result (స్త్రీ శక్తి లాటరీ) can check the latest winning numbers after the Tuesday draw. Earlier results can also be useful for checking previous tickets and reviewing older Sthree Sakthi draws.",
      "Before claiming a prize, ticket holders should carefully verify the ticket number, series, draw number, draw date, and prize category. The original winning ticket should be kept safely until the prize claim process is completed.",
    ],
    weeklyLotteryHeading: "Kerala State Sthree Sakthi Weekly Lottery",
    weeklyLotteryParagraphs: [
      "The Kerala State Sthree Sakthi Weekly Lottery (ಸ್ತ್ರೀ ಶಕ್ತಿ ಲಾಟರಿ) is conducted every Tuesday as part of the weekly lottery schedule of the Kerala State Lotteries Department.",
      "The draw is conducted at 3:00 PM, after which the winning numbers are made available for ticket holders to check. The draw can also be followed through official lottery announcements and live broadcasts.",
      "If you have an SS ticket, compare your complete ticket details with the officially released Sthree Sakthi Kerala Lottery Result.",
    ],
    aboutHeading: "About Sthree Sakthi Lottery",
    aboutParagraphs: [
      "Sthree Sakthi Lottery (SS) is a weekly lottery operated by the Kerala State Lotteries Department. The lottery has been part of Kerala's weekly lottery schedule for several years, with the first recorded SS-1 draw taking place on 3 May 2016. Historical result records identify SS-1 as the first Sthree Sakthi draw.",
      "The Sthree Sakthi Lottery draw is conducted every Tuesday at 3:00 PM. The current ticket price is ₹50, and the lottery is issued in 12 series under the current prize structure.",
    ],
    drawVenueHeading: "Sthree Sakthi Lottery Draw Venue",
    drawVenueParagraphs: [
      "The official Sthree Sakthi lottery draw is conducted at Gorky Bhavan, near Bakery Junction, Thiruvananthapuram, Kerala.",
      "The draw is held at 3:00 PM every Tuesday. Recent official result records and published draw reports confirm Thiruvananthapuram as the draw location.",
      "After the draw, the winning numbers are published through the Kerala State Lotteries result system, allowing ticket holders to check their SS tickets.",
    ],
    venueDetails: {
      name: "Gorky Bhavan",
      location: "Near Bakery Junction, Palayam",
      city: "Thiruvananthapuram",
      state: "Kerala",
      drawTime: "3:00 PM",
      drawDay: "Tuesday",
    },
    ticketPriceHeading: "Sthree Sakthi Lottery Ticket Price",
    ticketPriceParagraphs: [
      "The current Sthree Sakthi Lottery ticket price is ₹50. The official prize-structure notification states that the ticket price is ₹50, with the ticket issued in 12 series.",
      "The official prize structure also provides additional prize categories and specifies how the winning numbers are determined.",
    ],
    ticketPriceDetails: {
      total: "₹50",
      basicPrice: "₹39.06",
      gst: "28% GST",
      seriesCount: 12,
    },
    prizes: [
      { category: "1st Prize", amount: "₹1,00,00,000 (₹1 Crore)" },
      { category: "2nd Prize", amount: "₹30,00,000 (₹30 Lakh)" },
      { category: "3rd Prize", amount: "₹5,00,00,000 (₹5 Lakh)" },
      { category: "4th Prize", amount: "₹5,000" },
      { category: "5th Prize", amount: "₹2,000" },
      { category: "6th Prize", amount: "₹1,000" },
      { category: "7th Prize", amount: "₹500" },
      { category: "8th Prize", amount: "₹200" },
      { category: "Consolation Prize", amount: "₹5,000" },
    ],
    codesAndSeriesHeading: "Sthree Sakthi Kerala Lottery Codes and Series",
    codesAndSeriesParagraphs: [
      "The Sthree Sakthi Kerala Lottery Result is identified by the lottery code SS. Tickets are issued in 12 different series, and the applicable series should be checked carefully when verifying a winning ticket.",
      "The series used for Sthree Sakthi tickets can include: SA, SB, SC, SD, SE, SF, SG, SH, SI, SJ, SK, SL.",
      "The exact series and winning numbers should always be checked against the official result for the relevant draw number. When checking the Sthree Sakthi result, ticket holders should compare both the series and the complete ticket number before confirming a prize.",
    ],
    seriesList: [
      "SA", "SB", "SC", "SD", "SE", "SF", "SG", "SH", "SI", "SJ", "SK", "SL",
    ],
    faqItems: [
      {
        question: "When is the Sthree Sakthi Lottery draw held?",
        answer: "The Sthree Sakthi Lottery (code SS) is held every Tuesday at 3:00 PM at Gorky Bhavan, Thiruvananthapuram.",
      },
      {
        question: "What is the 1st prize for Sthree Sakthi Lottery?",
        answer: "The first prize for Sthree Sakthi is ₹1,00,00,000 (₹1 Crore), followed by a 2nd prize of ₹30 Lakh and 3rd prize of ₹5 Lakh.",
      },
      {
        question: "When did Sthree Sakthi Lottery begin?",
        answer: "Sthree Sakthi lottery's inaugural draw (SS-1) took place on 3 May 2016.",
      },
    ],
  },

  DL: {
    code: "DL",
    slug: "dhanalekshmi",
    name: "Dhanalekshmi",
    nameMl: "ധനലക്ഷ്മി",
    hindiName: "धनलक्ष्मी लॉटरी",
    teluguName: "ధనలక్ష్మి లాటరీ",
    kannadaName: "ಧನಲಕ್ಷ್ಮಿ ಲಾಟರಿ",
    h1Pattern: "Dhanalekshmi Lottery Result Today: {date} ധനലക്ഷ്മി (DL)",
    introParagraphs: [
      "Dhanalekshmi Lottery is one of the weekly lottery schemes conducted by the Kerala State Lotteries Department. The lottery is identified by the code “DL”, and its weekly draw is conducted on Wednesday at 3:00 PM. The latest winning numbers are released after the draw, followed by the complete official result document. Ticket holders can check the winning numbers and refer to the official result PDF after it is published.",
    ],
    keralaResultHeading: "Dhanalekshmi Kerala Lottery Result",
    keralaResultParagraphs: [
      "The Dhanalekshmi Kerala Lottery Result (ധനലക്ഷ്മി ലോട്ടറി) contains the winning numbers announced for the different ticket series in each weekly draw. The Kerala State Lotteries Department issues Dhanalekshmi tickets in multiple series, and the applicable series can vary according to the draw.",
      "When checking the Dhanalekshmi Kerala Lottery Result, ticket holders should compare the complete ticket number, series, draw number, and prize category. This helps ensure that the ticket is matched correctly with the announced winning numbers.",
      "The latest Dhanalekshmi result can be checked after the official draw. Previous Dhanalekshmi results can also be useful for checking older tickets and reviewing earlier weekly draws.",
    ],
    lotterySectionHeading: "Dhanalekshmi Lottery",
    lotterySectionParagraphs: [
      "Dhanalekshmi Lottery (धनलक्ष्मी लॉटरी) tickets are issued at a price of ₹50. The weekly lottery provides several prize categories, allowing winning tickets to receive different prize amounts depending on the announced number and category.",
      "The first prize is ₹1,00,00,000, while the lottery also provides second and third prizes along with several lower prize categories. A consolation prize is also provided for eligible tickets matching the applicable first-prize number criteria.",
      "Prize winners should carefully verify their ticket details against the official result before beginning the prize claim process. The original ticket and required documents should be preserved safely until the claim has been completed.",
    ],
    keralaStateLotteriesResultsHeading: "Kerala State Lotteries Results",
    keralaStateLotteriesResultsParagraphs: [
      "The Kerala State Lotteries Results are released after each scheduled lottery draw conducted by the Kerala State Lotteries Department. The winning numbers are made available through the department's official result publications.",
      "Those searching for the Dhanalekshmi lottery result (ధనలక్ష్మి లాటరీ) can check the winning numbers after the Wednesday draw. Previous results can also help ticket holders verify older tickets and look through past Dhanalekshmi draws.",
      "Before claiming a prize, always compare the ticket number, series, draw number, draw date, and prize category with the officially published result. Keep the original lottery ticket safely stored until the verification and prize claim process is completed.",
    ],
    weeklyLotteryHeading: "Kerala State Dhanalekshmi Weekly Lottery",
    weeklyLotteryParagraphs: [
      "The Kerala State Dhanalekshmi Weekly Lottery (ಧನಲಕ್ಷ್ಮಿ ಲಾಟರಿ) is conducted every week as part of the Kerala State Lotteries Department's regular lottery schedule. The draw is held on Wednesday at 3:00 PM.",
      "After the draw, the winning numbers are published for ticket holders to check. People who have purchased a Dhanalekshmi ticket should compare their ticket's series and number with the officially announced result.",
      "The latest result and previous draw information can be used to verify winning numbers and keep track of the Dhanalekshmi weekly lottery.",
    ],
    aboutHeading: "About Dhanalekshmi Lottery",
    aboutParagraphs: [
      "Dhanalekshmi Lottery (DL) is a weekly lottery operated by the Government of Kerala through the Kerala State Lotteries Department. The lottery is identified by the code DL and is conducted as part of the department's weekly lottery schedule.",
      "The Dhanalekshmi draw is currently held every Wednesday at 3:00 PM. Official Kerala State Lotteries results show regular weekly draws being conducted on Wednesdays.",
    ],
    drawVenueHeading: "Dhanalekshmi Lottery Draw Venue",
    drawVenueParagraphs: [
      "The official Dhanalekshmi Lottery draw is conducted at Gorky Bhavan, near Bakery Junction, Thiruvananthapuram, Kerala.",
      "The official result documents record the venue and draw time as 3:00 PM. Following the draw, the winning numbers are entered into the Kerala State Lotteries result system for publication.",
    ],
    venueDetails: {
      name: "Gorky Bhavan",
      location: "Near Bakery Junction, Palayam",
      city: "Thiruvananthapuram",
      state: "Kerala",
      drawTime: "3:00 PM",
      drawDay: "Wednesday",
    },
    ticketPriceHeading: "Dhanalekshmi Lottery Ticket Price",
    ticketPriceParagraphs: [
      "A Dhanalekshmi Lottery ticket costs ₹50. According to the official prize-structure document, this consists of a ₹39.06 ticket price plus 28% Goods and Services Tax.",
      "The lottery has multiple prize categories. The official prize structure states that Dhanalekshmi tickets are issued in 12 series.",
    ],
    ticketPriceDetails: {
      total: "₹50",
      basicPrice: "₹39.06",
      gst: "28% GST",
      seriesCount: 12,
    },
    prizes: [
      { category: "1st Prize", amount: "₹1,00,00,000 (1 Crore)" },
      { category: "2nd Prize", amount: "₹30,00,000 (30 Lakh)" },
      { category: "3rd Prize", amount: "₹5,00,00,000 (5 Lakh)" },
      { category: "4th Prize", amount: "₹5,000" },
      { category: "5th Prize", amount: "₹2,000" },
      { category: "6th Prize", amount: "₹1,000" },
      { category: "7th Prize", amount: "₹500" },
      { category: "8th Prize", amount: "₹200" },
      { category: "9th Prize", amount: "₹100" },
      { category: "Consolation Prize", amount: "₹5,000" },
    ],
    codesAndSeriesHeading: "Dhanalekshmi Kerala Lottery Codes and Series",
    codesAndSeriesParagraphs: [
      "The Dhanalekshmi Kerala Lottery Result is determined using the ticket series and number assigned to each ticket. The lottery uses the code “DL”, while the individual tickets are issued across multiple series.",
      "Recent official Dhanalekshmi results demonstrate the use of series such as DA, DB, DC, DD, DE, DF, DG, DH, DJ, DK, DL, DM, DN, DO, DP, DR, DS, DT, DU, DV, DW, DX, DY and DZ in the published winning and consolation results.",
      "Ticket holders should therefore check the complete series and ticket number rather than comparing the number alone. The series is an important part of verifying a Dhanalekshmi winning ticket.",
    ],
    seriesList: [
      "DA", "DB", "DC", "DD", "DE", "DF", "DG", "DH", "DJ", "DK", "DL", "DM",
      "DN", "DO", "DP", "DR", "DS", "DT", "DU", "DV", "DW", "DX", "DY", "DZ",
    ],
    faqItems: [
      {
        question: "When is the Kerala Dhanalekshmi lottery draw held?",
        answer: "The Dhanalekshmi lottery draw is held every Wednesday at 3:00 PM at Gorky Bhavan, Thiruvananthapuram.",
      },
      {
        question: "What is the 1st prize of Dhanalekshmi Lottery?",
        answer: "The first prize is ₹1,00,00,000 (₹1 Crore), followed by a 2nd prize of ₹30 Lakh and 3rd prize of ₹5 Lakh.",
      },
      {
        question: "How much does a Dhanalekshmi lottery ticket cost?",
        answer: "A Dhanalekshmi ticket costs ₹50 (including 28% GST).",
      },
    ],
  },

  KN: {
    code: "KN",
    slug: "karunyaplus",
    name: "Karunya Plus",
    nameMl: "കാരുണ്യ പ്ലസ്",
    hindiName: "करुण्या प्लस लॉटरी",
    teluguName: "కరుణ్య ప్లస్ లాటరీ",
    kannadaName: "ಕರುಣ್ಯ ಪ್ಲಸ್ ಲಾಟರಿ",
    h1Pattern: "Karunya Plus Lottery Result Today: {date} കാരുണ്യ പ്ലസ് (KN)",
    introParagraphs: [
      "Karunya Plus Lottery is one of the weekly lottery schemes operated by the Kerala State Lotteries Department. The lottery is identified by the code “KN” and the draw is conducted every Thursday at 3:00 PM. The winning numbers are announced after the draw, followed by the publication of the official result document. Ticket holders can use the published result to compare their ticket series and number and check whether they have won a prize.",
    ],
    keralaResultHeading: "Karunya Plus Kerala Lottery Result",
    keralaResultParagraphs: [
      "The Karunya Plus Kerala Lottery Result (കാരുണ്യ പ്ലസ് ലോട്ടറി) contains the winning numbers announced for the weekly Karunya Plus draw. The tickets are issued across multiple series, and the applicable series should be checked along with the ticket number when verifying a result.",
      "Ticket holders should compare the complete ticket number, series and prize category with the officially published result. This helps avoid mistakes when checking winning numbers, especially because different prize categories have different matching requirements.",
      "For the latest Karunya Plus Kerala Lottery Result, ticket holders can check the result after the scheduled Thursday draw. Previous Karunya Plus results can also be referred to when checking an older ticket or reviewing earlier draws.",
    ],
    lotterySectionHeading: "Karunya Plus Lottery",
    lotterySectionParagraphs: [
      "Karunya Plus Lottery (करुण्या प्लस लॉटरी) is a weekly lottery conducted by the Kerala State Lotteries Department. A ticket is currently priced at ₹50, and the lottery has several prize categories ranging from the major prizes to smaller prizes based on the announced winning numbers.",
      "The current prize structure includes a first prize of ₹1,00,00,000, while the second prize is ₹30,00,000 and the third prize is ₹5,00,000. Other prize categories are also included in the draw, along with consolation prizes.",
      "Winners should carefully verify their ticket details against the official result before starting the prize claim process. The original ticket and required documents should be kept safely until the claim has been completed.",
    ],
    keralaStateLotteriesResultsHeading: "Kerala State Lotteries Results",
    keralaStateLotteriesResultsParagraphs: [
      "The Kerala State Lotteries Results are released after each scheduled lottery draw conducted by the Kerala State Lotteries Department. The official result information provides the winning ticket numbers and corresponding prize categories.",
      "People searching for the Karunya Plus lottery result (కరుణ్య ప్లస్ లాటరీ) can check the latest winning numbers after the Thursday draw. Previous results can also help ticket holders check older draws and verify tickets purchased on earlier dates.",
      "When checking a result, make sure the ticket number, series, draw number and prize category are matched correctly. The original ticket should also be preserved safely until the result has been verified and any applicable claim process has been completed.",
    ],
    weeklyLotteryHeading: "Kerala State Karunya Plus Weekly Lottery",
    weeklyLotteryParagraphs: [
      "The Kerala State Karunya Plus Weekly Lottery (ಕರුණ್ಯ ಪ್ಲಸ್ ಲಾಟರಿ) is conducted every Thursday as part of the Kerala State Lotteries weekly draw schedule. The draw takes place at 3:00 PM, and the winning numbers are subsequently published through the lottery result system.",
      "Ticket holders can check the winning numbers after the draw and compare them with their tickets. If your ticket matches one of the announced prize categories, verify the result with the official publication before proceeding with a prize claim.",
    ],
    aboutHeading: "About Karunya Plus Lottery",
    aboutParagraphs: [
      "Karunya Plus Lottery (KN) is a weekly lottery scheme conducted by the Government of Kerala through the Kerala State Lotteries Department. The lottery has been running for several years, with historical Karunya Plus results documented from at least 2016. The lottery is identified by the KN code.",
      "The Karunya Plus Lottery draw is held every Thursday at 3:00 PM. Current official result records show the draw continuing on Thursdays.",
    ],
    drawVenueHeading: "Karunya Plus Lottery Draw Venue",
    drawVenueParagraphs: [
      "The Karunya Plus draw is conducted at Gorky Bhavan, near Bakery Junction, Thiruvananthapuram, Kerala. Recent Karunya Plus result records identify Gorky Bhavan as the draw venue.",
      "The draw takes place at 3:00 PM every Thursday. After the draw, the winning numbers are published so that ticket holders can check their tickets against the announced results.",
    ],
    venueDetails: {
      name: "Gorky Bhavan",
      location: "Near Bakery Junction, Palayam",
      city: "Thiruvananthapuram",
      state: "Kerala",
      drawTime: "3:00 PM",
      drawDay: "Thursday",
    },
    ticketPriceHeading: "Karunya Plus Lottery Ticket Price",
    ticketPriceParagraphs: [
      "A Karunya Plus Lottery ticket costs ₹50 under the current prize structure. The official notification states that the ticket price consists of a ₹39.06 ticket value plus 28% GST. The lottery tickets are printed in 12 series.",
      "The current official prize structure also contains additional prize categories, and the number of prizes varies according to the category.",
    ],
    ticketPriceDetails: {
      total: "₹50",
      basicPrice: "₹39.06",
      gst: "28% GST",
      seriesCount: 12,
    },
    prizes: [
      { category: "1st Prize", amount: "₹1,00,00,000 (1 Crore)" },
      { category: "2nd Prize", amount: "₹30,00,000 (30 Lakh)" },
      { category: "3rd Prize", amount: "₹5,00,00,000 (5 Lakh)" },
      { category: "4th Prize", amount: "₹5,000" },
      { category: "5th Prize", amount: "₹2,000" },
      { category: "6th Prize", amount: "₹1,000" },
      { category: "7th Prize", amount: "₹500" },
      { category: "8th Prize", amount: "₹200" },
      { category: "Consolation Prize", amount: "₹5,000" },
    ],
    codesAndSeriesHeading: "Karunya Plus Kerala Lottery Codes and Series",
    codesAndSeriesParagraphs: [
      "The Karunya Plus Kerala Lottery Result is identified by the lottery code KN and is published according to the series and ticket numbers issued for each draw.",
      "The current Karunya Plus tickets are issued in 12 series. Recent draws have used the following series: PN, PO, PP, PR, PS, PT, PU, PV, PW, PX, PY, PZ.",
      "When checking the Karunya Plus result, ticket holders should compare both the series and the complete ticket number. A matching number without the correct series may not correspond to the winning ticket for that prize category.",
    ],
    seriesList: [
      "PN", "PO", "PP", "PR", "PS", "PT", "PU", "PV", "PW", "PX", "PY", "PZ",
    ],
    faqItems: [
      {
        question: "When is the Karunya Plus Lottery draw held?",
        answer: "The Karunya Plus Lottery draw is conducted every Thursday at 3:00 PM at Gorky Bhavan, near Bakery Junction, Thiruvananthapuram.",
      },
      {
        question: "What is the first prize for Karunya Plus?",
        answer: "The first prize for Karunya Plus Lottery is ₹1,00,00,000 (₹1 Crore), followed by a second prize of ₹30 Lakh and third prize of ₹5 Lakh.",
      },
      {
        question: "What is the ticket price of Karunya Plus?",
        answer: "A Karunya Plus Lottery ticket costs ₹50 (comprising ₹39.06 basic price + 28% GST).",
      },
    ],
  },

  SK: {
    code: "SK",
    slug: "suvarnakeralam",
    name: "Suvarna Keralam",
    nameMl: "സുവർണ കേരളം",
    hindiName: "सुवर्ण केरलम",
    teluguName: "సువర్ణ కేరళం",
    kannadaName: "ಸುವರ್ಣ ಕೇರಳಂ",
    h1Pattern: "Suvarna Keralam Lottery Result Today: {date} സുവർണ കേരളം (SK)",
    introParagraphs: [
      "Suvarna Keralam is one of the weekly lottery schemes conducted by the Kerala State Lotteries Department. The lottery is identified by the code “SK” and its weekly draw is conducted on Friday at 3:00 PM. The draw takes place at Gorky Bhavan, near Bakery Junction, Thiruvananthapuram, Kerala. The latest winning numbers are published after the draw, allowing ticket holders to check their numbers and prize categories.",
      "The complete result is released through the Kerala State Lotteries result system. Once the result is available, participants can check the winning numbers and use the official result document for verification.",
    ],
    keralaResultHeading: "Suvarna Keralam Kerala Lottery Result",
    keralaResultParagraphs: [
      "The Suvarna Keralam Kerala Lottery Result (സുവർണ കേരളം) contains the winning numbers announced for the weekly SK draw. Tickets are issued in multiple series, and each series has its own ticket numbers.",
      "When checking the Suvarna Keralam result, ticket holders should compare the complete ticket number along with the series shown on their ticket. The prize category should also be checked carefully against the officially announced result.",
      "The latest Suvarna Keralam Kerala Lottery Result can be checked after the scheduled Friday draw. Previous results can also be referred to when checking an older ticket or reviewing earlier SK lottery draws.",
    ],
    lotterySectionHeading: "Suvarna Keralam Bhagyakury",
    lotterySectionParagraphs: [
      "Suvarna Keralam Lottery tickets (सुवर्ण केरलम) are sold at the price fixed by the Kerala State Lotteries Department. A ticket costs ₹50, including the applicable GST. The lottery provides several prize categories, with the highest prize currently set at ₹1 crore.",
      "The winning numbers are selected during the scheduled draw, and prizes are distributed according to the published prize structure. Ticket holders who believe they have won should verify the ticket number and series with the official result before proceeding with a prize claim.",
      "The original ticket should be kept safely, as it is required during the prize claim process. Winners must also follow the applicable rules and documentation requirements of the Kerala State Lotteries Department.",
    ],
    keralaStateLotteriesResultsHeading: "Kerala State Lotteries Results",
    keralaStateLotteriesResultsParagraphs: [
      "The Kerala State Lotteries Results are published following the scheduled lottery draws conducted by the Kerala State Lotteries Department. The results contain the winning numbers, ticket series, prize categories and other relevant draw information.",
      "People searching for the Suvarna Keralam lottery result (సువర్ణ కేరళం) can check the latest winning numbers after the Friday draw. Earlier results can also be useful for verifying tickets from previous draws.",
      "Before claiming a prize, ticket holders should carefully verify the ticket number, series, draw number, draw date and prize category. The original ticket should be preserved until the result has been confirmed and the applicable claim procedure has been completed.",
    ],
    weeklyLotteryHeading: "Kerala State Suvarna Keralam Weekly Lottery",
    weeklyLotteryParagraphs: [
      "The Kerala State Suvarna Keralam Weekly Lottery (ಸುವರ್ಣ ಕೇರಳಂ) is conducted every week as part of the Kerala State Lotteries schedule. The draw is currently held on Friday at 3:00 PM.",
      "The draw venue is Gorky Bhavan, near Bakery Junction, Thiruvananthapuram. After the draw, the winning numbers are published through the Kerala State Lotteries result system.",
      "Ticket holders can check their Suvarna Keralam Lottery Result by matching the series and ticket number printed on their ticket with the published winning numbers.",
    ],
    aboutHeading: "About Suvarna Keralam Lottery",
    aboutParagraphs: [
      "Suvarna Keralam Lottery (SK) is a weekly lottery scheme introduced by the Kerala State Lotteries Department in May 2025. The first draw, SK-1, was conducted on 2 May 2025 at Gorky Bhavan, near Bakery Junction, Thiruvananthapuram. The initial draw was scheduled for 2:00 PM, while subsequent official records show the draw being conducted at 3:00 PM.",
      "The lottery has continued as part of Kerala's weekly lottery schedule. Current Kerala State Lotteries records list Suvarna Keralam as a Friday lottery, with draws conducted at 3:00 PM at Gorky Bhavan, Thiruvananthapuram.",
    ],
    drawVenueHeading: "Suvarna Keralam Lottery Draw Venue",
    drawVenueParagraphs: [
      "The Suvarna Keralam Lottery draw is conducted at Gorky Bhavan, near Bakery Junction, Thiruvananthapuram, Kerala.",
      "Official result records identify Gorky Bhavan as the venue for Suvarna Keralam draws. Current lottery schedules show the draw taking place on Friday at 3:00 PM.",
      "After the draw, the winning numbers are published through the Kerala State Lotteries result system for ticket holders to verify their tickets.",
    ],
    venueDetails: {
      name: "Gorky Bhavan",
      location: "Near Bakery Junction, Palayam",
      city: "Thiruvananthapuram",
      state: "Kerala",
      drawTime: "3:00 PM",
      drawDay: "Friday",
    },
    ticketPriceHeading: "Suvarna Keralam Lottery Ticket Price",
    ticketPriceParagraphs: [
      "A Suvarna Keralam Lottery ticket costs ₹50. According to the current official prize structure, the ticket price consists of a ₹39.06 ticket value plus 28% GST. The department's current prize structure provides tickets in twelve series.",
      "The official prize structure also includes additional lower prize categories based on the last four digits of tickets.",
    ],
    ticketPriceDetails: {
      total: "₹50",
      basicPrice: "₹39.06",
      gst: "28% GST",
      seriesCount: 12,
    },
    prizes: [
      { category: "1st Prize", amount: "₹1,00,00,000 (1 Crore)" },
      { category: "2nd Prize", amount: "₹30,00,000 (30 Lakh)" },
      { category: "3rd Prize", amount: "₹5,00,00,000 (5 Lakh)" },
      { category: "4th Prize", amount: "₹5,000" },
      { category: "5th Prize", amount: "₹2,000" },
      { category: "6th Prize", amount: "₹1,000" },
      { category: "7th Prize", amount: "₹500" },
      { category: "Consolation Prize", amount: "₹5,000" },
    ],
    codesAndSeriesHeading: "Suvarna Keralam Kerala Lottery Codes and Series",
    codesAndSeriesParagraphs: [
      "The Suvarna Keralam Kerala Lottery Result is organized according to the series and ticket numbers issued for each draw. The current official prize structure states that tickets are issued in twelve series.",
      "The series used for Suvarna Keralam tickets include: RA, RB, RC, RD, RE, RF, RG, RH, RJ, RK, RL and RM.",
      "Each draw result identifies the winning ticket along with its corresponding series. For example, official Suvarna Keralam results show winning tickets from different series such as RD, RG, RH, RN, RO, RP, RR, RS, RT, RU, RV, RW, RX, RY and RZ in different draw periods, reflecting changes in the applicable series over time.",
      "Therefore, while checking the Suvarna Keralam lottery result, ticket holders should match the complete series and ticket number rather than checking the number alone.",
    ],
    seriesList: [
      "RA", "RB", "RC", "RD", "RE", "RF", "RG", "RH", "RJ", "RK", "RL", "RM",
      "RN", "RO", "RP", "RR", "RS", "RT", "RU", "RV", "RW", "RX", "RY", "RZ",
    ],
    faqItems: [
      {
        question: "When is the Suvarna Keralam Lottery draw held?",
        answer: "The Suvarna Keralam Lottery (code SK) is conducted every Friday at 3:00 PM at Gorky Bhavan, near Bakery Junction, Thiruvananthapuram.",
      },
      {
        question: "What is the 1st prize for Suvarna Keralam Lottery?",
        answer: "The first prize is ₹1,00,00,000 (₹1 Crore), followed by a 2nd prize of ₹30 Lakh and 3rd prize of ₹5 Lakh.",
      },
      {
        question: "What is the ticket price for Suvarna Keralam?",
        answer: "A Suvarna Keralam ticket costs ₹50 (which consists of ₹39.06 ticket value + 28% GST).",
      },
      {
        question: "When was Suvarna Keralam Lottery introduced?",
        answer: "Suvarna Keralam was introduced in May 2025 by the Kerala State Lotteries Department, with the inaugural SK-1 draw conducted on 2 May 2025.",
      },
    ],
  },

  KR: {
    code: "KR",
    slug: "karunya",
    name: "Karunya",
    nameMl: "കാരുണ്യ",
    hindiName: "करुण्या लॉटरी",
    teluguName: "కరుణ్య లాటరీ",
    kannadaName: "ಕರුණ್ಯ ಲಾಟರಿ",
    h1Pattern: "Karunya Lottery Result Today: {date} കാരുണ്യ (KR)",
    introParagraphs: [
      "Karunya Lottery is one of the weekly lottery schemes conducted by the Kerala State Lotteries Department. The lottery is issued under the code “KR”, and the draw is conducted every Saturday at 3:00 PM. After the draw, the winning numbers are published through the Kerala State Lotteries result system. Ticket holders can check their series and ticket numbers and download the official result document after it is released.",
    ],
    keralaResultHeading: "Karunya Kerala Lottery Result",
    keralaResultParagraphs: [
      "The Karunya Kerala Lottery Result (കാരുണ്യ ലോട്ടറി) contains the winning numbers announced for the different ticket series in the weekly draw. Karunya lottery tickets are issued in 12 series, and the winning numbers are published according to the applicable prize categories.",
      "When checking the Karunya Kerala Lottery Result, ticket holders should compare the complete ticket number, series, and prize category carefully. This helps ensure that the result is matched with the correct ticket.",
      "The latest Karunya result can be checked after the official Saturday draw. Previous Karunya results can also be referred to when checking older tickets or reviewing earlier weekly draws.",
    ],
    lotterySectionHeading: "Karunya Lottery Ticket",
    lotterySectionParagraphs: [
      "Karunya Lottery tickets (करुण्या लॉटरी) are issued at a prescribed price by the Kerala State Lotteries Department. The current official prize structure specifies an MRP of ₹40 per ticket, including applicable GST. The lottery offers several prize categories, allowing winning tickets to receive different prize amounts.",
      "The first prize is ₹80,00,000 (₹80 lakh), followed by additional prize categories. Consolation prizes are also included in the draw.",
      "Anyone holding a winning ticket should verify the ticket number and series against the official result. Prize claims must follow the rules and procedures prescribed by the Kerala State Lotteries Department.",
    ],
    keralaStateLotteriesResultsHeading: "Kerala State Lotteries Results",
    keralaStateLotteriesResultsParagraphs: [
      "The Kerala State Lotteries Results are published after the scheduled lottery draws. The department's official result system provides the winning numbers for each lottery, including Karunya.",
      "Those searching for the Karunya lottery result (ಕರුණ್ಯ ಲಾಟರಿ) can check the latest winning numbers after the Saturday draw. Earlier results can also be useful for checking previous tickets and reviewing past Karunya draws.",
      "Before claiming a prize, ticket holders should carefully verify the ticket number, series, draw number, draw date, and prize category. The original ticket should be kept safely until the result has been verified and the prize claim process is completed.",
    ],
    weeklyLotteryHeading: "Kerala State Karunya Weekly Lottery",
    weeklyLotteryParagraphs: [
      "The Kerala State Karunya Weekly Lottery (కరుణ్య లాటరీ) is part of the weekly lottery schedule operated by the Kerala State Lotteries Department. The Karunya draw takes place every Saturday at 3:00 PM.",
      "After the draw, the winning numbers are made available through the official result system. Ticket holders can compare their ticket details with the published numbers to determine whether their ticket has won a prize.",
      "If you have purchased a Karunya ticket, keep the original ticket safely and check the result using the correct KR series and ticket number.",
    ],
    aboutHeading: "About Karunya Lottery",
    aboutParagraphs: [
      "Karunya Lottery (KR) is a weekly lottery conducted by the Government of Kerala through the Kerala State Lotteries Department. The lottery has been part of Kerala's weekly lottery programme for several years and is identified by the code KR.",
      "According to the current official prize structure, Karunya tickets are sold for ₹40, and tickets are issued in 12 series. The current structure provides a first prize of ₹80,00,000, with additional prize categories and a consolation prize.",
      "Karunya Lottery was launched in August 2011 by the Government of Kerala as a weekly lottery associated with the Karunya welfare initiative. The first draw, KR-1, was conducted on 24 September 2011 at Sri Chitra Home Auditorium, Pazhavangadi, Thiruvananthapuram. Revenue generated through the lottery was intended to support financial assistance for people requiring treatment for serious illnesses.",
    ],
    drawVenueHeading: "Karunya Lottery Draw Venue",
    drawVenueParagraphs: [
      "The Karunya lottery draw is conducted in Thiruvananthapuram, Kerala, as part of the official Kerala State Lotteries draw process. The scheduled draw takes place at 3:00 PM on Saturday.",
      "Once the draw is completed, the winning numbers are published through the Kerala State Lotteries result system. Ticket holders can then check their Karunya ticket against the announced numbers.",
    ],
    venueDetails: {
      name: "Gorky Bhavan",
      location: "Near Bakery Junction, Palayam",
      city: "Thiruvananthapuram",
      state: "Kerala",
      drawTime: "3:00 PM",
      drawDay: "Saturday",
    },
    ticketPriceHeading: "Karunya Lottery Ticket Price",
    ticketPriceParagraphs: [
      "The current Karunya Lottery ticket price is ₹50. The official prize-structure document states that the ticket's face value is ₹31.25 plus 28% GST.",
      "The major prize categories under the current structure include:",
      "The official prize structure specifies that the tickets are issued in 12 series, with different prize categories based on the winning numbers drawn.",
    ],
    ticketPriceDetails: {
      total: "₹50",
      basicPrice: "₹31.25",
      gst: "28% GST",
      seriesCount: 12,
    },
    prizes: [
      { category: "1st Prize", amount: "₹1,00,00,000 (1 Crore)" },
      { category: "2nd Prize", amount: "₹25,00,000 (25 Lakh)" },
      { category: "3rd Prize", amount: "₹10,00,000 (10 Lakh)" },
      { category: "4th Prize", amount: "₹5,000" },
      { category: "5th Prize", amount: "₹2,000" },
      { category: "6th Prize", amount: "₹1,000" },
      { category: "7th Prize", amount: "₹500" },
      { category: "8th Prize", amount: "₹200" },
      { category: "9th Prize", amount: "₹100" },
      { category: "Consolation Prize", amount: "₹5,000" },
    ],
    codesAndSeriesHeading: "Karunya Kerala Lottery Codes and Series",
    codesAndSeriesParagraphs: [
      "The Karunya Kerala Lottery Result is determined using the ticket series and numbers issued for each weekly draw. The official prize structure states that Karunya tickets are issued in 12 series.",
      "The applicable series can vary according to the draw and should be checked against the official result document. When checking a Karunya ticket, it is important to compare both the series and complete ticket number with the winning numbers.",
    ],
    seriesList: [
      "KA", "KB", "KC", "KD", "KE", "KF", "KG", "KH", "KJ", "KK", "KL", "KM",
      "WA", "WB", "WC", "WD", "WE", "WF", "WG", "WH", "WJ", "WK", "WL", "WM",
    ],
    faqItems: [
      {
        question: "When is Karunya Lottery draw conducted?",
        answer: "The Karunya Lottery (code KR) draw is held every Saturday at 3:00 PM at Gorky Bhavan, Thiruvananthapuram.",
      },
      {
        question: "What is the 1st prize for Karunya Lottery?",
        answer: "The first prize for Karunya Lottery is ₹1,00,00,000 (₹1 Crore), followed by a 2nd prize of ₹25 Lakh and 3rd prize of ₹10 Lakh.",
      },
      {
        question: "When was the Karunya Lottery first launched?",
        answer: "Karunya Lottery was launched in August 2011 by the Government of Kerala to support medical healthcare assistance for families in Kerala, with the KR-1 draw held on 24 September 2011.",
      },
    ],
  },
};

/**
 * Returns editorial content for a given lottery code or fallback defaults.
 */
export function getLotteryEditorialContent(
  lotteryCode: string,
  lotteryName: string,
  lotteryNameMl: string,
  drawDay: string,
  jackpot?: string,
  ticketPrice?: string
): LotteryEditorialContent {
  const upperCode = (lotteryCode || "").toUpperCase().trim();
  if (LOTTERY_EDITORIAL_DATA[upperCode]) {
    return LOTTERY_EDITORIAL_DATA[upperCode];
  }

  // Fallback for bumpers or newly added lotteries
  const defaultPrizes: PrizeCategoryItem[] = [
    { category: "1st Prize", amount: jackpot || "₹1 Crore" },
    { category: "2nd Prize", amount: "₹30,00,000 (30 Lakh)" },
    { category: "3rd Prize", amount: "₹5,00,00,000 (5 Lakh)" },
    { category: "Consolation Prize", amount: "₹5,000" },
  ];

  return {
    code: upperCode,
    slug: lotteryName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: lotteryName,
    nameMl: lotteryNameMl,
    h1Pattern: `${lotteryName} Lottery Result Today: {date} ${lotteryNameMl} (${upperCode})`,
    introParagraphs: [
      `${lotteryName} is conducted by the Kerala State Lotteries Department under lottery code “${upperCode}”. The draw takes place at Gorky Bhavan, Thiruvananthapuram. Winning numbers are published shortly after the draw.`,
    ],
    keralaResultHeading: `${lotteryName} Kerala Lottery Result`,
    keralaResultParagraphs: [
      `The official ${lotteryName} Kerala Lottery Result contains winning numbers across multiple series. Ticket holders should verify their ticket number, series, and prize category.`,
    ],
    lotterySectionHeading: `${lotteryName} Lottery`,
    lotterySectionParagraphs: [
      `${lotteryName} tickets are priced at ${ticketPrice || "₹50"} (inclusive of GST). The draw offers multiple prize tiers, with a top prize of ${jackpot || "₹1 Crore"}.`,
    ],
    keralaStateLotteriesResultsHeading: "Kerala State Lotteries Results",
    keralaStateLotteriesResultsParagraphs: [
      "The Kerala State Lotteries Results are published following the scheduled draws. Winning numbers are announced by the department's official lottery draw committee.",
    ],
    weeklyLotteryHeading: `Kerala State ${lotteryName} Lottery`,
    weeklyLotteryParagraphs: [
      `Conducted at Gorky Bhavan, near Bakery Junction, Thiruvananthapuram, Kerala, as part of the official Kerala State Lotteries schedule.`,
    ],
    aboutHeading: `About ${lotteryName} Lottery`,
    aboutParagraphs: [
      `${lotteryName} is operated by the Government of Kerala. Participants can check draw results and download the official Gazette PDF.`,
    ],
    drawVenueHeading: `${lotteryName} Lottery Draw Venue`,
    drawVenueParagraphs: [
      `The official draw is conducted at Gorky Bhavan, near Bakery Junction, Thiruvananthapuram, Kerala.`,
    ],
    venueDetails: {
      name: "Gorky Bhavan",
      location: "Near Bakery Junction, Palayam",
      city: "Thiruvananthapuram",
      state: "Kerala",
      drawTime: "3:00 PM",
      drawDay: drawDay || "Scheduled Day",
    },
    ticketPriceHeading: `${lotteryName} Lottery Ticket Price`,
    ticketPriceParagraphs: [
      `A ${lotteryName} Lottery ticket costs ${ticketPrice || "₹50"}.`,
    ],
    ticketPriceDetails: {
      total: ticketPrice || "₹50",
      basicPrice: "₹39.06",
      gst: "28% GST",
      seriesCount: 12,
    },
    prizes: defaultPrizes,
    codesAndSeriesHeading: `${lotteryName} Kerala Lottery Codes and Series`,
    codesAndSeriesParagraphs: [
      `Winning tickets are identified by their respective series and ticket numbers under code “${upperCode}”.`,
    ],
    seriesList: [],
    faqItems: [
      {
        question: `When is ${lotteryName} Lottery drawn?`,
        answer: `The draw is held on ${drawDay || "its scheduled draw day"} at Gorky Bhavan, Thiruvananthapuram.`,
      },
      {
        question: `What is the first prize for ${lotteryName}?`,
        answer: `The first prize is ${jackpot || "₹1 Crore"}.`,
      },
    ],
  };
}
