import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { getBlogPath } from "@/data/blogs";
import { getLotteryUrl } from "@/lib/lotterySlugs";
import { Callout, CheckList, InlineLink, Lead, P, Section, StepList } from "./GuideBlocks";

const POOJA_DETAILS = [
  ["Lottery name", "Pooja Bumper 2026"],
  ["Draw number", "BR-112"],
  ["Ticket price", "₹300"],
  ["First prize", "₹12 crore"],
  ["Ticket series", "JA, JB, JC, JD, JE"],
  ["Draw date", "28 November 2026"],
  ["Draw time", "2:00 PM"],
  ["Draw venue", "Gorky Bhavan, Thiruvananthapuram"],
];

const POOJA_PRIZES = [
  ["First Prize", "₹12 crore"],
  ["Second Prize", "₹50 lakh"],
  ["Third Prize", "₹5 lakh"],
  ["Fourth Prize", "₹3 lakh"],
  ["Fifth Prize", "₹2 lakh"],
  ["Consolation Prize", "₹1 lakh"],
  ["Sixth Prize", "₹5,000"],
  ["Seventh Prize", "₹1,000"],
  ["Eighth Prize", "₹500"],
  ["Ninth Prize", "₹300"],
];

const CHECK_RESULT_STEPS = [
  "Visit the official Kerala State Lotteries website.",
  "Find the Pooja Bumper BR-112 result announcement.",
  "Download or open the official result list.",
  "Check the complete ticket number and series.",
  "Verify the result carefully before making a prize claim.",
];

const BANK_DOCUMENTS = [
  "Original winning lottery ticket.",
  "Completed prize claim application.",
  "PAN card and identity proof.",
  "Recent passport-size photographs, where required.",
  "Bank account details and passbook information.",
  "Authorisation for the bank to submit the claim.",
  "Required bank certificates and supporting documents.",
];

const SURRENDER_STEPS = [
  {
    title: "Protect the original ticket",
    desc: "Keep the winning ticket in a safe place. Avoid damaging, folding excessively or altering the printed information.",
  },
  {
    title: "Sign the ticket",
    desc: "Write your name, address and signature on the reverse side as required by the applicable rules.",
  },
  {
    title: "Contact your bank",
    desc: "Ask your bank whether it can facilitate the Kerala lottery prize surrender procedure, and confirm the required documents and bank certificates.",
  },
  {
    title: "Prepare the necessary documents",
    desc: <CheckList items={BANK_DOCUMENTS} />,
  },
  {
    title: "Submit the claim",
    desc: "Submit the ticket and documents through the accepted bank procedure. The bank and lottery authorities will follow the applicable verification and payment process.",
  },
  {
    title: "Wait for verification",
    desc: "The authorities verify the winning ticket and supporting documents before approving the prize payment.",
  },
];

const AGE_REASONS = [
  <>
    <strong>Protecting young individuals:</strong> Young people may not fully understand financial risks, probability and
    the consequences of spending money on lottery tickets.
  </>,
  <>
    <strong>Encouraging responsible participation:</strong> Adults are generally better positioned to understand that
    lottery outcomes are based on chance and that winning is never guaranteed.
  </>,
  <>
    <strong>Preventing financial exploitation:</strong> Age restrictions help reduce the possibility of minors being
    encouraged or pressured to purchase tickets.
  </>,
  <>
    <strong>Supporting legal compliance:</strong> Following age-related requirements helps maintain the integrity of the
    regulated lottery system.
  </>,
];

const cellSx = { px: 2, py: 1.25, fontSize: "0.92rem", borderTop: "1px solid #F1F5F9" } as const;

const InfoTable = ({ head, rows }: { head: [string, string]; rows: string[][] }) => (
  <Paper elevation={0} sx={{ borderRadius: "14px", border: "1.5px solid #E2E8F0", overflow: "hidden", mb: 1.5 }}>
    <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
      <Box component="thead" sx={{ bgcolor: "#0B3C5D" }}>
        <tr>
          {head.map((label) => (
            <Box component="th" key={label} scope="col" sx={{ px: 2, py: 1.25, textAlign: "left", color: "#FFFFFF", fontSize: "0.85rem", fontWeight: 800 }}>
              {label}
            </Box>
          ))}
        </tr>
      </Box>
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label}>
            <Box component="td" sx={{ ...cellSx, color: "#475569" }}>{label}</Box>
            <Box component="td" sx={{ ...cellSx, fontWeight: 700, color: "#0F172A" }}>{value}</Box>
          </tr>
        ))}
      </tbody>
    </Box>
  </Paper>
);

const BumperDrawsGuideContent = () => (
  <>
    <Lead>
      Kerala&apos;s lottery system has become an important part of the state&apos;s financial and social landscape. Among
      the different lottery schemes available, bumper draws attract considerable public attention because of their
      attractive prize structures, special draw schedules and the opportunity to win substantial rewards.
    </Lead>
    <P>
      Unlike regular weekly lotteries, bumper lotteries are conducted on special occasions and generally offer larger
      prize pools. Their popularity comes from the excitement surrounding the announcement of winning numbers, the
      anticipation of prize distribution and the interest generated by major cash rewards.
    </P>
    <P>
      With the increasing availability of digital information, people can also follow announcements, winning numbers and
      related updates through online platforms. <InlineLink href="/">Kerala Lottery Results Today</InlineLink> aims to
      help readers access useful lottery-related information, understand important procedures and stay informed about
      Kerala lottery announcements.
    </P>

    <Section id="prize-structures" title="Attractive Prize Structures Create Public Interest">
      <P>
        One of the biggest reasons Kerala Lottery Bumper Draws receive public attention is their attractive prize
        structures. These special lotteries generally provide substantial first prizes along with several additional
        prize categories. Apart from the first prize, second, third and consolation prizes also attract attention because
        they provide multiple opportunities for ticket holders to receive rewards.
      </P>
      <P>
        Prize structures are usually announced before the draw. However, ticket buyers should always check the official
        notification for the applicable prize amounts and conditions.
      </P>
      <Callout tone="warning">
        Purchasing a lottery ticket does not guarantee a financial return. Lottery participation involves chance, and
        people should spend only what they can comfortably afford.
      </Callout>
    </Section>

    <Section id="special-occasions" title="Special Occasions Increase Excitement">
      <P>
        Kerala bumper lotteries are often associated with special occasions and seasonal celebrations. These draws
        generate additional interest because they are conducted separately from the regular weekly lottery schedule.
        People discuss upcoming bumper draws with family, friends and colleagues, and announcements receive attention
        through newspapers, television, websites and other communication channels.
      </P>
      <P>
        The combination of festive interest and attractive prizes makes bumper draws an important topic of discussion
        among lottery enthusiasts.
      </P>
    </Section>

    <Section id="large-prizes" title="Large Prize Amounts Attract Different Groups of People">
      <P>
        Another reason bumper draws attract attention is the possibility of receiving a significant financial reward.
        For some individuals, the attraction comes from the possibility of additional financial support. Others
        participate occasionally as a form of entertainment.
      </P>
      <P>
        However, it is important to maintain realistic expectations. Lottery winnings are never guaranteed, and
        participants should not consider lotteries as a reliable source of income or a financial planning strategy.
      </P>
    </Section>

    <Section id="pooja-bumper-2026" title="Pooja Bumper Lottery 2026 (BR-112): Ticket Price, Prize Structure, Draw Date & Result">
      <P>
        The Pooja Bumper Lottery 2026 (BR-112) is one of the special draws generating considerable interest among Kerala
        lottery enthusiasts. Its attractive first prize, multiple prize categories and special draw arrangements have
        made it a widely discussed lottery event.
      </P>
      <Typography component="h3" sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#0F172A", mb: 1.5 }}>
        Important Pooja Bumper 2026 Details
      </Typography>
      <InfoTable head={["Details", "Information"]} rows={POOJA_DETAILS} />
      <Typography sx={{ fontSize: "0.82rem", color: "#64748B", mb: 3 }}>
        As listed on the Kerala State Lotteries Department&apos;s official lottery information portal.
      </Typography>

      <Typography component="h3" sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#0F172A", mb: 1.5 }}>
        Pooja Bumper 2026 Prize Structure
      </Typography>
      <InfoTable head={["Prize category", "Prize amount"]} rows={POOJA_PRIZES} />
      <Typography sx={{ fontSize: "0.82rem", color: "#64748B", mb: 3 }}>
        The announced total prize pool is approximately ₹39.11 crore. Always check winning numbers against the official
        result publication.
      </Typography>

      <Typography component="h3" sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#0F172A", mb: 1.5 }}>
        How to Check the Pooja Bumper Lottery Result
      </Typography>
      <P>After the scheduled draw, ticket holders can follow these steps:</P>
      <StepList steps={CHECK_RESULT_STEPS.map((title) => ({ title, desc: "" }))} />
      <P>
        You can also follow the <InlineLink href={getLotteryUrl("PB")}>Pooja Bumper result page</InlineLink> and our{" "}
        <InlineLink href={getBlogPath("pooja-bumper-lottery-2026")}>full Pooja Bumper 2026 guide</InlineLink>. Always
        cross-check winning numbers with the official department notification.
      </P>
    </Section>

    <Section id="surrender-through-bank" title="How to Surrender a Kerala Lottery Winning Ticket Through Bank">
      <P>
        Winning a Kerala lottery prize is an exciting experience, but receiving the prize money requires following the
        prescribed procedures. Winners must submit their original winning tickets and the necessary documents within the
        applicable claim period. For eligible claims, the bank route provides a way to submit the winning ticket through
        a bank instead of personally handling the entire submission process.
      </P>
      <Typography component="h3" sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#0F172A", mb: 1.5 }}>
        Steps to Surrender a Winning Ticket Through a Bank
      </Typography>
      <StepList steps={SURRENDER_STEPS} />
      <P>
        The official prize claim form includes bank account details and an authorisation section for claims presented
        through banks. Requirements may vary according to the prize amount and the applicable rules. Read the detailed
        guide to{" "}
        <InlineLink href={getBlogPath("surrender-kerala-lottery-winning-ticket-through-bank")}>
          surrendering a winning ticket through a bank
        </InlineLink>
        .
      </P>
      <Typography component="h3" sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#0F172A", mb: 1.5 }}>
        Why Is It Important to Follow the Correct Procedure?
      </Typography>
      <P>
        Following the correct surrender procedure helps prevent documentation errors, payment delays and problems
        associated with invalid or damaged tickets. Winners should never hand over their original tickets to unknown
        individuals or unofficial intermediaries. For large prizes, contact the Directorate of State Lotteries or the
        relevant District Lottery Office for the latest instructions.
      </P>
    </Section>

    <Section id="minimum-age" title="Why Is There a Minimum Age to Buy a Kerala Lottery Ticket?">
      <P>
        Age restrictions are an important part of responsible lottery participation. Kerala lottery tickets are intended
        for adults, and the minimum-age requirement helps prevent minors from participating in gambling-related
        activities.
      </P>
      <CheckList items={AGE_REASONS} />
      <P>
        Lottery tickets should only be purchased by eligible adults through authorised sellers. See{" "}
        <InlineLink href={getBlogPath("minimum-age-to-buy-kerala-lottery-ticket")}>the minimum age rules</InlineLink>.
      </P>
    </Section>

    <Section id="digital-platforms" title="The Role of Digital Platforms in Sharing Kerala Lottery Information">
      <P>
        The internet has changed how people access lottery-related announcements. Previously, many individuals depended
        mainly on newspapers, television and physical notice boards to learn about winning numbers. Today, websites make
        it easier to find information about upcoming draws, ticket prices, prize categories and published results, and
        help readers understand procedures such as ticket verification, document preparation and prize claiming.
      </P>
      <P>
        However, online information platforms are not substitutes for official lottery authorities. The official
        department remains the primary source for confirmed winning numbers, draw notifications and prize claim
        instructions.
      </P>
    </Section>

    <Section id="responsible-participation" title="Responsible Lottery Participation Is Important">
      <P>
        Although bumper lotteries attract attention because of their attractive prizes, responsible participation should
        always remain a priority. Set a reasonable spending limit before purchasing tickets, and avoid borrowing money,
        using savings intended for essential expenses or purchasing tickets based on unrealistic expectations.
      </P>
      <Callout tone="danger">
        Buy tickets only from authorised lottery agents. Fake websites, misleading advertisements and unofficial
        ticket-booking offers create unnecessary risks. See{" "}
        <InlineLink href={getBlogPath("why-online-kerala-lottery-ticket-sales-are-illegal")}>
          why online Kerala lottery ticket sales are illegal
        </InlineLink>
        .
      </Callout>
    </Section>

    <Section id="conclusion" title="Conclusion">
      <P>
        Kerala Lottery Bumper Draws continue to attract public attention because of their attractive prize structures,
        special occasions and the excitement associated with major lottery announcements. The Pooja Bumper Lottery 2026
        (BR-112), with its ₹12 crore first prize, is another example of how special draws generate widespread interest.
      </P>
      <P>
        However, understanding ticket prices, prize categories, age restrictions and winning-ticket surrender procedures
        is equally important. Participants should always follow official guidelines and maintain responsible purchasing
        habits.
      </P>
    </Section>
  </>
);

export default BumperDrawsGuideContent;
