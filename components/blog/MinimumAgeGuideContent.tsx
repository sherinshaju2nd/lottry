import { getBlogPath } from "@/data/blogs";
import { Callout, CheckList, InlineLink, Lead, P, Section } from "./GuideBlocks";

const PURPOSES = [
  "Protect young people from gambling-related risks.",
  "Encourage responsible participation.",
  "Reduce the possibility of financial harm.",
  "Prevent minors from developing unhealthy gambling habits.",
  "Support compliance with lottery regulations.",
];
const RESPONSIBLE = [
  "Set a spending limit.",
  "Buy tickets only with money you can afford to lose.",
  "Never borrow money to buy tickets.",
  "Never chase previous losses.",
  "Remember that every draw is chance.",
  "Ignore pressure from friends or sellers.",
];
const PARENT_FOCUS = [
  "Education and skill development.",
  "Saving money.",
  "Understanding personal budgets.",
  "Avoiding financial risks.",
  "Recognising misleading advertisements.",
  "Making informed decisions.",
];
const NOT_FOR = ["Household expenses.", "Loan repayments.", "Education fees.", "Medical bills.", "Long-term financial security."];
const BEFORE_BUYING = [
  "Confirm the seller is authorised.",
  "Check the printed ticket details.",
  "Understand the ticket price.",
  "Avoid unauthorised online offers.",
  "Keep the original ticket safe.",
  "Stay within your personal budget.",
];

const MinimumAgeGuideContent = () => (
  <>
    <Lead>
      Kerala State Lotteries attract buyers from every background, but lottery participation is not meant for children
      or young people who may not understand the financial risks of a game of chance. This guide explains why there is a
      minimum age to buy a Kerala lottery ticket, the age rules for agents, and how to play responsibly.
    </Lead>

    <Section id="quick-answer" title="Quick Answer: Minimum Age for Kerala Lottery">
      <Callout tone="warning">
        Kerala lottery participation is intended for <strong>eligible adults only</strong>. The Kerala lottery agent
        registration framework sets an <strong>18-year age requirement</strong> for agents. Minors should not buy
        tickets, and sellers should not sell to them.
      </Callout>
    </Section>

    <Section id="why-minimum-age" title="1. Why Is a Minimum Age Important for Lottery Participation?">
      <P>
        A lottery is chance: buying a ticket guarantees no prize or return. Younger people may not see the difference
        between entertainment and financial risk. Age restrictions limit participation to people mature enough to make
        that judgement. Their purpose is to:
      </P>
      <CheckList items={PURPOSES} />
    </Section>

    <Section id="financial-risks" title="2. Protecting Young People from Financial Risks">
      <P>
        Young people often have little experience managing money. Lottery play can create the false belief that tickets
        are a reliable way to earn. A minimum age protects minors until they have the financial awareness to understand
        the risks, and opens a conversation about saving, budgeting and good money habits.
      </P>
    </Section>

    <Section id="responsible-play" title="3. Encouraging Responsible Lottery Participation">
      <P>
        Responsible play means accepting that results are random. Never spend money meant for food, education, rent,
        healthcare or family needs. Good habits:
      </P>
      <CheckList items={RESPONSIBLE} />
    </Section>

    <Section id="agents-sellers" title="4. Why Age Restrictions Matter for Lottery Agents and Sellers">
      <P>
        Kerala lotteries are sold through authorised agents and sellers who must meet registration requirements. The
        agent registration framework includes an age requirement of 18 years for individuals seeking to become agents,
        so the people handling tickets understand their legal responsibilities.
      </P>
      <P>
        Learn how these agents are paid in{" "}
        <InlineLink href={getBlogPath("kerala-lottery-agent-commission-on-winning-tickets")}>Kerala lottery agent commission on winning tickets</InlineLink>
        .
      </P>
    </Section>

    <Section id="parents" title="5. The Role of Parents and Guardians">
      <P>
        Open talk about money and games of chance helps children build healthy habits. Parents can encourage young people
        to focus on:
      </P>
      <CheckList items={PARENT_FOCUS} />
    </Section>

    <Section id="results-vs-playing" title="6. Understanding Lottery Results Does Not Mean Participating">
      <P>
        Reading the winning numbers on <InlineLink href="/">Kerala Lottery Results Today</InlineLink> is public
        information, not participation. Parents and teachers should help young people understand the difference between
        reading information and taking part in a game of chance.
      </P>
    </Section>

    <Section id="not-investment" title="7. Why Lottery Tickets Should Not Be Viewed as an Investment">
      <P>
        Unlike a savings account or investment, a lottery ticket gives no predictable growth. Do not depend on lottery
        winnings for:
      </P>
      <CheckList items={NOT_FOR} tone="bad" />
      <P>
        Even a winning ticket pays less than the headline prize after agent commission and{" "}
        <InlineLink href={getBlogPath("kerala-lottery-tax-deduction-on-winnings")}>30% tax on lottery winnings</InlineLink>
        .
      </P>
    </Section>

    <Section id="buy-responsibly" title="8. Following the Rules and Buying Tickets Responsibly">
      <P>Before buying a ticket, adults should:</P>
      <CheckList items={BEFORE_BUYING} />
      <P>
        Learn to{" "}
        <InlineLink href={getBlogPath("how-to-find-fake-kerala-lottery-tickets")}>spot fake Kerala lottery tickets</InlineLink>{" "}
        and why{" "}
        <InlineLink href={getBlogPath("why-online-kerala-lottery-ticket-sales-are-illegal")}>buying Kerala lottery tickets online is illegal</InlineLink>
        .
      </P>
    </Section>

    <Section id="conclusion" title="Conclusion">
      <P>
        Minimum age rules protect young people and encourage safer lottery practice. A lottery ticket is chance, never a
        guaranteed way to earn money. Parents, sellers and buyers all have a part in promoting informed, responsible
        decisions.
      </P>
    </Section>
  </>
);

export default MinimumAgeGuideContent;
