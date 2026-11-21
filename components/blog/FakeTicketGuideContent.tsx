import type { BlogRecentDraw } from "@/data/blogs";
import { getBlogPath } from "@/data/blogs";
import RecentDrawsAnalysis from "./RecentDrawsAnalysis";
import { Callout, CheckList, InlineLink, Lead, P, Section, StepList } from "./GuideBlocks";

const CHECKS = {
  printing: [
    "Check whether the lottery name is printed clearly.",
    "Examine the ticket number for unusual fonts or spacing.",
    "Look for blurred letters or poorly printed numbers.",
    "Check whether the colours appear consistent.",
    "Examine the ticket for spelling mistakes.",
    "Notice whether any part of the printed information looks different from the rest.",
  ],
  number: [
    "Missing or unclear digits.",
    "Numbers that appear overwritten.",
    "Unusual spacing between digits.",
    "Different printing styles within the same number.",
    "Visible signs of correction or alteration.",
  ],
  alterations: [
    "Scratches around the printed numbers.",
    "Ink marks or unusual colour differences.",
    "Numbers that appear pasted or overwritten.",
    "Damaged areas around important details.",
    "Unusual paper texture in specific sections.",
    "Signs that printed information has been replaced.",
  ],
  drawDetails: [
    "Incorrect lottery names.",
    "Missing draw information.",
    "Unusual or incomplete dates.",
    "Conflicting draw numbers.",
    "Mismatched printed details.",
  ],
  physical: [
    "Unusual cuts or torn sections.",
    "Different paper textures.",
    "Areas that appear glued or attached.",
    "Unusual folds around printed numbers.",
    "Visible marks suggesting that information has been changed.",
  ],
  seller: [
    "Offers tickets at unusual discounts.",
    "Pressures you to purchase immediately.",
    "Refuses to provide proper ticket details.",
    "Sells tickets that appear altered.",
    "Offers guaranteed winning numbers.",
    "Provides suspicious explanations about the ticket's origin.",
  ],
  compare: [
    "Ticket design and layout.",
    "Printed lottery information.",
    "Number formatting.",
    "Paper quality.",
    "Colour arrangement.",
    "Printing alignment.",
  ],
  suspect: [
    "Do not attempt to change the ticket.",
    "Keep the original ticket safely.",
    "Do not hand it over to unknown individuals.",
    "Avoid paying anyone who promises to verify or approve the ticket for a fee.",
    "Keep the purchase details and any available evidence.",
    "Contact an authorised Kerala State Lottery official for verification.",
    "Report suspected fraudulent activity to the appropriate authorities.",
  ],
  tips: [
    "Purchase tickets only from authorised lottery agents.",
    "Examine every ticket before accepting it.",
    "Check the printed numbers carefully.",
    "Avoid tickets with suspicious alterations.",
    "Keep your original ticket safe.",
    "Never trust guaranteed winning promises.",
    "Do not purchase tickets from suspicious sellers.",
    "Get professional verification whenever you have doubts.",
  ],
};

const WINNING_CHECKS = [
  { title: "Correct lottery draw", desc: "The ticket belongs to the correct lottery, draw number and draw date." },
  { title: "Exact number match", desc: "The full ticket number and series match the winning number." },
  { title: "Original ticket", desc: "You hold the original physical ticket, not a copy or photograph." },
  { title: "No alterations", desc: "The ticket has not been altered, overwritten or repaired." },
  { title: "Official verification", desc: "The ticket passes the official verification process of the Lottery Department." },
];

const FakeTicketGuideContent = ({ recentDraws }: { recentDraws: BlogRecentDraw[] }) => (
  <>
    <Lead>
      <strong>Be careful before accepting a Kerala lottery ticket.</strong> Kerala lotteries are popular among people
      who buy tickets hoping to win exciting cash prizes. However, fake lottery tickets and fraudulent activities can
      create serious problems for innocent buyers. Some people unknowingly purchase duplicate, altered or counterfeit
      tickets without understanding the warning signs.
    </Lead>
    <P>
      Knowing how to find fake Kerala lottery tickets is important for anyone who takes part in Kerala lotteries. A fake
      ticket may look similar to an original one, but certain details can reveal suspicious differences. From ticket
      numbers and printing quality to lottery details and physical condition, a few precautions can help you avoid
      becoming a victim of fraud.
    </P>
    <P>
      Below we explain how to recognise suspicious Kerala lottery tickets, what details to examine and how to protect
      yourself before accepting a ticket or claiming a prize.
    </P>

    <Section id="printing-quality" title="1. Carefully Examine the Printing Quality">
      <P>
        Printing quality is one of the first things to examine. Genuine tickets are professionally printed with clear
        text, proper colours and readable information. Fake tickets may contain printing mistakes, unclear letters,
        uneven colours or blurred numbers.
      </P>
      <CheckList items={CHECKS.printing} />
      <Callout tone="info">
        Poor printing does not automatically prove that a ticket is fake, but unusual differences should make you
        cautious.
      </Callout>
    </Section>

    <Section id="ticket-number" title="2. Check the Lottery Ticket Number">
      <P>
        Every lottery ticket carries identifying numbers that distinguish it from other tickets. Examine the ticket
        number carefully and make sure it is clearly visible. Pay attention to:
      </P>
      <CheckList items={CHECKS.number} tone="bad" />
      <P>
        If the ticket number looks modified or suspicious, do not assume the ticket is genuine. Even minor changes may
        indicate manipulation.
      </P>
    </Section>

    <Section id="alterations" title="3. Look for Changes or Alterations on the Ticket">
      <P>
        Fraudsters may try to change printed numbers, draw details or other information to make an unsuccessful ticket
        look like a winning one. Check the ticket for:
      </P>
      <CheckList items={CHECKS.alterations} tone="bad" />
      <Callout tone="warning">
        Never try to correct, erase or modify any information on a lottery ticket. If you notice suspicious changes,
        keep the ticket safe and ask an authorised lottery official to verify it.
      </Callout>
    </Section>

    <Section id="draw-details" title="4. Verify the Lottery Name and Draw Details">
      <P>
        Kerala State Lotteries run different draws, and every ticket identifies its particular lottery. Before buying
        or checking a ticket, examine the printed lottery name, draw number and draw date, and make sure they match the
        ticket you intended to buy. Common warning signs include:
      </P>
      <CheckList items={CHECKS.drawDetails} tone="bad" />
      <RecentDrawsAnalysis
        draws={recentDraws}
        variant="verify"
        title="Recent draws: what a real winning number looks like"
        intro="Latest published Kerala lottery results from our database. A winning number is valid only for its own lottery, draw code and date. The same digits on a ticket from another draw do not win."
      />
    </Section>

    <Section id="physical-condition" title="5. Examine the Physical Condition of the Ticket">
      <P>
        A genuine ticket should carry its original printed information without suspicious damage or manipulation. Pay
        attention to:
      </P>
      <CheckList items={CHECKS.physical} tone="bad" />
      <P>
        Remember that a genuine ticket can also get damaged through ordinary handling. Physical damage alone does not
        prove that a ticket is counterfeit; it is a signal for closer examination.
      </P>
    </Section>

    <Section id="unknown-sellers" title="6. Be Careful When Buying Tickets from Unknown Sellers">
      <P>
        Always buy Kerala lottery tickets from authorised lottery agents. Avoid unknown individuals who cannot show that
        they are authorised sellers, and be especially cautious if someone:
      </P>
      <CheckList items={CHECKS.seller} tone="bad" />
      <P>
        Never let excitement about a possible prize influence your decision when something about a ticket looks wrong.
        Tickets offered over WhatsApp or websites are a red flag. Read{" "}
        <InlineLink href={getBlogPath("why-online-kerala-lottery-ticket-sales-are-illegal")}>
          why online Kerala lottery ticket sales are illegal
        </InlineLink>
        .
      </P>
    </Section>

    <Section id="compare-genuine" title="7. Compare the Ticket with a Genuine Ticket">
      <P>
        Comparing a suspicious ticket with a genuine ticket from the same lottery can reveal unusual differences. Check
        whether these features are consistent:
      </P>
      <CheckList items={CHECKS.compare} />
      <P>
        Do not make a final decision on visual comparison alone, because designs and printing details can change
        between lottery series and draws. If you notice major differences, ask authorised lottery officials to verify
        the ticket.
      </P>
    </Section>

    <Section id="winning-number" title="8. Never Trust a Ticket Only Because It Shows a Winning Number">
      <P>
        A counterfeit or altered ticket can carry a number that matches a published result. That alone does not make it
        eligible for a prize. Before believing you have won, make sure that:
      </P>
      <StepList steps={WINNING_CHECKS} />
    </Section>

    <Section id="suspect-fake" title="9. What to Do If You Suspect a Fake Kerala Lottery Ticket">
      <P>If you receive or buy a suspicious ticket, avoid quick decisions and follow these precautions:</P>
      <CheckList items={CHECKS.suspect} />
      <Callout tone="danger">
        Report online lottery fraud on the National Cyber Crime Reporting Portal or call the helpline 1930.
      </Callout>
    </Section>

    <Section id="tips" title="10. Important Tips to Avoid Fake Lottery Tickets">
      <CheckList items={CHECKS.tips} />
      <P>
        Holding a genuine winning ticket? See the{" "}
        <InlineLink href={getBlogPath("documents-required-to-claim-kerala-lottery-prize")}>
          documents required to claim a Kerala lottery prize
        </InlineLink>
        .
      </P>
    </Section>

    <Section id="conclusion" title="Conclusion">
      <P>
        Identifying fake Kerala lottery tickets takes attention to detail and awareness of common fraud. Printing
        quality, ticket numbers, lottery details, physical condition and signs of alteration all deserve a close look
        before you trust a ticket.
      </P>
      <P>
        A ticket that looks genuine is not guaranteed to be authentic. The safest approach is to buy from authorised
        agents, check numbers against the <InlineLink href="/">Kerala Lottery Results Today</InlineLink> and the
        official result, and seek official verification whenever something looks unusual.
      </P>
      <P>
        <strong>Stay alert, check carefully and protect yourself from fake Kerala lottery tickets.</strong>
      </P>
    </Section>
  </>
);

export default FakeTicketGuideContent;
