import { getBlogPath } from "@/data/blogs";
import { Callout, CheckList, InlineLink, Lead, P, Section, StepList } from "./GuideBlocks";

const PUBLISHING_PRACTICES = [
  <>
    <strong>Accuracy:</strong> Publish winning numbers and draw details only after checking reliable sources.
  </>,
  <>
    <strong>Transparency:</strong> Clearly mention the draw date, lottery name and relevant result details.
  </>,
  <>
    <strong>Timely updates:</strong> Avoid presenting old results as newly announced information.
  </>,
  <>
    <strong>Clear communication:</strong> Explain prize categories, claim procedures and important conditions in simple
    language.
  </>,
  <>
    <strong>Responsible messaging:</strong> Never suggest that purchasing a lottery ticket guarantees financial success.
  </>,
];

const PLATFORM_BENEFITS = [
  <>
    <strong>Easy access to results:</strong> Users can check published results without waiting for printed newspapers or
    travelling to another location.
  </>,
  <>
    <strong>Information availability:</strong> Websites can provide details about different lottery draws, prize
    categories and announcements in one place.
  </>,
  <>
    <strong>Public awareness:</strong> Online articles can explain ticket verification, prize eligibility, official
    procedures and responsible participation.
  </>,
  <>
    <strong>Educational resources:</strong> Informational blogs can help readers understand how the lottery system
    operates and what precautions they should take.
  </>,
];

const CLAIM_DOCUMENTS = [
  { title: "Original winning ticket", desc: "The original ticket is essential for verification." },
  {
    title: "Completed claim application",
    desc: "The prescribed application form, such as Form V where applicable, must be completed correctly.",
  },
  { title: "Identity proof", desc: "Documents such as PAN, Aadhaar or another accepted identity document may be required." },
  { title: "Photographs", desc: "Recent passport-size photographs may be required under the applicable procedure." },
  { title: "Ticket photocopies", desc: "Self-attested copies of both sides of the winning ticket may be requested." },
  {
    title: "Bank account details",
    desc: "Bank account information, including the account number and IFSC, may be needed for prize payment.",
  },
  {
    title: "Additional declarations",
    desc: "Joint winners, minor winners and authorised representatives may need to provide additional documents.",
  },
];

const UNVERIFIED_RISKS = [
  <>
    <strong>Fake winning announcements:</strong> Fraudulent websites may publish incorrect winning numbers to attract
    visitors.
  </>,
  <>
    <strong>Prize scams:</strong> Criminals may contact people claiming they have won a lottery and demand processing
    fees.
  </>,
  <>
    <strong>Misleading advertisements:</strong> Some online promotions create unrealistic expectations about winning.
  </>,
  <>
    <strong>False predictions:</strong> Websites may advertise supposedly guaranteed winning numbers without any factual
    basis.
  </>,
  <>
    <strong>Privacy risks:</strong> Untrustworthy platforms may attempt to collect personal or financial information.
  </>,
];

const AWARENESS_PRACTICES = [
  <>
    <strong>Publish information from reliable sources:</strong> Use official government announcements and notifications
    when preparing lottery-related content.
  </>,
  <>
    <strong>Provide educational articles:</strong> Explain lottery rules, prize claims, tax deductions, agent commissions
    and other relevant topics.
  </>,
  <>
    <strong>Avoid misleading headlines:</strong> Headlines should accurately represent the information provided in the
    article.
  </>,
  <>
    <strong>Update outdated content:</strong> Review older articles and update them whenever official rules or
    procedures change.
  </>,
  <>
    <strong>Include responsible participation messages:</strong> Remind readers that lotteries involve chance and should
    never be considered a guaranteed source of income.
  </>,
  <>
    <strong>Maintain transparency:</strong> Clearly distinguish independent informational websites from official
    government lottery platforms.
  </>,
];

const ResponsibleSharingGuideContent = () => (
  <>
    <Lead>
      The internet has transformed the way people access information, communicate and stay updated about important
      events. Today, people can easily find lottery announcements, result updates, prize details and other related
      information through websites, social media platforms and online communities. While this accessibility offers
      convenience, it also creates a responsibility to ensure that the information being shared is accurate, reliable
      and presented ethically.
    </Lead>
    <P>
      In Kerala, lotteries have a long-standing connection with the state&apos;s economy and public welfare initiatives.
      Thousands of people follow lottery announcements and results, making accurate information particularly important.
      However, the rapid spread of online content can sometimes lead to misinformation, misleading claims, fake winning
      announcements and fraudulent prize-claim messages.
    </P>
    <P>
      This is why responsible online lottery information sharing has become increasingly important. Websites such as{" "}
      <InlineLink href="/">Kerala Lottery Results Today</InlineLink> can help readers access lottery-related information
      conveniently by focusing on clarity, accuracy and responsible communication.
    </P>

    <Section id="why-it-matters" title="Why Responsible Lottery Information Sharing Matters">
      <P>
        Responsible information sharing is essential because lottery-related content can influence people&apos;s
        expectations, decisions and financial behaviour. Incorrect numbers, outdated announcements or misleading prize
        details can create confusion and disappointment. Online publishers should follow a few important practices:
      </P>
      <CheckList items={PUBLISHING_PRACTICES} />
      <P>
        Websites should also correct inaccurate information as soon as it is identified. Readers deserve information that
        helps them understand the lottery system rather than content designed only to attract clicks. Kerala Lottery
        Results Today prioritises clear presentation and encourages visitors to verify important announcements through
        the official Kerala State Lotteries Department.
      </P>
    </Section>

    <Section id="digital-platforms" title="The Role of Digital Platforms in Sharing Lottery Information">
      <P>
        Digital platforms have made lottery information more accessible to people across different locations.
        Previously, many people depended on newspapers, television announcements or local lottery agents to learn about
        winning numbers. Today, websites and social media platforms allow users to access information using smartphones
        and computers. Important benefits include:
      </P>
      <CheckList items={PLATFORM_BENEFITS} />
      <Callout tone="warning">
        Fake websites, manipulated screenshots, misleading advertisements and fraudulent social media accounts can
        circulate incorrect information. Always distinguish between official announcements and independent
        informational websites.
      </Callout>
    </Section>

    <Section id="accurate-results" title="The Importance of Accurate Kerala Lottery Results">
      <P>
        Accuracy is one of the most important responsibilities of any website publishing lottery information. Even a
        small mistake in a winning number can create unnecessary confusion for ticket holders.
      </P>
      <P>
        People checking Kerala lottery results today should carefully compare the published numbers with the official
        result announcement. They should also check the lottery name, draw date, ticket series and prize category before
        deciding whether their ticket has won. Websites should avoid publishing unverified winning numbers or promising
        that a particular ticket will receive a prize. Lottery results must be communicated as factual information
        rather than predictions.
      </P>
      <Callout tone="danger">
        No website should ask visitors to disclose bank passwords, OTPs or confidential financial information to check
        lottery results.
      </Callout>
    </Section>

    <Section id="social-impact" title="The Social Impact of Kerala Lotteries on Healthcare and Public Welfare">
      <P>
        Kerala&apos;s state lottery system has an important connection with the state&apos;s public finances and social
        development. Since its introduction in 1967, the programme has developed into a significant government-operated
        activity that generates revenue and supports employment opportunities.
      </P>
      <P>
        Government revenue can contribute to broader public expenditure, including healthcare services, educational
        facilities, social security initiatives and other welfare and development programmes. The lottery sector also
        creates livelihood opportunities for authorised agents and sellers.
      </P>
      <P>
        However, lottery revenue should not automatically be described as being directly allocated to a particular
        hospital or healthcare programme without official financial evidence. Read more about the{" "}
        <InlineLink href={getBlogPath("kerala-lottery-social-impact-karunya-benevolent-fund")}>
          social impact of Kerala lotteries and the Karunya Benevolent Fund
        </InlineLink>
        .
      </P>
    </Section>

    <Section id="agent-commission" title="How Kerala Lottery Agents Earn Commission on Winning Tickets">
      <P>
        Lottery agents are an important part of Kerala&apos;s lottery distribution network. They help distribute
        tickets, provide access to lottery products and assist customers with basic ticket-related information.
      </P>
      <P>
        Generally, agents can earn income through authorised ticket sales and eligible commission or incentive
        arrangements connected with winning tickets. The applicable commission depends on the relevant government rules
        and lottery scheme. Agents should follow the official procedures when submitting commission claims and maintain
        appropriate records.
      </P>
      <P>
        The commission structure should not be confused with the prize amount received by the winner. The winner&apos;s
        entitlement and the agent&apos;s commission are separate matters governed by applicable rules. See{" "}
        <InlineLink href={getBlogPath("kerala-lottery-agent-commission-on-winning-tickets")}>
          how Kerala lottery agent commission works
        </InlineLink>
        .
      </P>
    </Section>

    <Section id="claim-documents" title="What Documents Are Required to Claim a Kerala Lottery Prize?">
      <P>
        Winning a lottery prize is exciting, but claiming the prize requires proper documentation and verification.
        Incomplete applications or incorrect documents can delay the payment process. Depending on the prize amount and
        applicable claim procedure, the following documents may be required:
      </P>
      <StepList steps={CLAIM_DOCUMENTS} />
      <P>
        The requirements can vary according to the prize category and the method used to submit the claim. The official
        department&apos;s current instructions should always be checked before submitting documents.
      </P>
      <Callout tone="info">
        Under the amended Kerala lottery rules, prize claims generally need to be submitted within{" "}
        <strong>90 days from the draw date</strong>, subject to the applicable provisions and exceptions. See the full{" "}
        <InlineLink href={getBlogPath("documents-required-to-claim-kerala-lottery-prize")}>claim documents checklist</InlineLink>
        .
      </Callout>
    </Section>

    <Section id="risks" title="Common Risks of Sharing Unverified Lottery Information Online">
      <P>
        Although digital platforms provide convenient access to information, irresponsible publishing can expose users to
        several risks:
      </P>
      <CheckList items={UNVERIFIED_RISKS} tone="bad" />
      <P>
        Never pay an unknown individual to release a lottery prize. Avoid sharing photographs of complete tickets or
        sensitive identity documents on public social media platforms. Learn{" "}
        <InlineLink href={getBlogPath("how-to-find-fake-kerala-lottery-tickets")}>how to spot fake Kerala lottery tickets</InlineLink>
        .
      </P>
    </Section>

    <Section id="promote-awareness" title="How Websites Can Promote Responsible Lottery Awareness">
      <P>
        Websites that publish lottery-related information have an important role in maintaining reader confidence. Their
        responsibility should extend beyond publishing winning numbers and attracting website traffic:
      </P>
      <CheckList items={AWARENESS_PRACTICES} />
    </Section>

    <Section id="future" title="The Future of Responsible Online Lottery Information Sharing">
      <P>
        As internet usage continues to increase, digital platforms will become even more important sources of
        lottery-related information. Responsible publishers should focus on improving information accuracy, website
        security, content transparency and user education.
      </P>
      <P>
        Search engine optimisation can help users discover useful information, but SEO strategies should never encourage
        misleading statements or exaggerated winning claims. Websites that prioritise trustworthy information can
        develop stronger relationships with their readers.
      </P>
    </Section>

    <Section id="conclusion" title="Conclusion">
      <P>
        Responsible online lottery information sharing is essential for protecting readers from misinformation,
        fraudulent activities and unrealistic expectations. As more people depend on digital platforms for lottery
        results and related updates, publishers must provide accurate, transparent and useful information.
      </P>
      <P>
        Ultimately, responsible information sharing is not just about publishing results. It is about helping people
        access trustworthy information, understand relevant rules and make informed decisions.
      </P>
    </Section>
  </>
);

export default ResponsibleSharingGuideContent;
