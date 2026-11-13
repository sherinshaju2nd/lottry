/**
 * Single source of truth for the site's founder / editor identity (E-E-A-T).
 * Used by /about, the author bio box on every blog & news post, and Person JSON-LD.
 */

export const SITE_URL = "https://www.keralalotteryresultstoday.in";

/** Public contact inbox (same address as /contact). */
export const CONTACT_EMAIL = "keralalotteryresultstoday@gmail.com";

export const FOUNDER = {
  name: "Ajo mon John",
  role: "Founder & Editor",
  expertise: "SEO Expert · React Developer",
  location: "Idukki, Kerala, India",
  locality: "Idukki",
  region: "Kerala",
  photo: "/team/ajo-mon-john.webp",
  photoLarge: "/team/ajo-mon-john.jpg",
  avatar: "/team/ajo-mon-john-160.webp",
  profileUrl: `${SITE_URL}/about#founder`,
  shortBio:
    "Ajo mon John is the founder and editor of Kerala Lottery Result Today, based in Idukki, Kerala. An SEO specialist and React developer, Ajo built this site and checks published results against the official Kerala Government Gazette.",
  bio: [
    "Ajo mon John founded Kerala Lottery Result Today and runs it from Idukki, Kerala. As an SEO specialist and React developer, Ajo designed and built the website, its ticket checker and its results archive.",
    "The site was started to give lottery ticket holders in Kerala a fast, clean way to check results in English and Malayalam, along with plain-language guides on claiming prizes, tax deductions and ticket safety.",
    "As editor, Ajo reviews every guide before publication and is responsible for corrections. Ajo is not employed by, or affiliated with, the Kerala State Lotteries Department.",
  ],
} as const;

/** True when a post's stored author name is the founder (case/spacing-insensitive). */
export const isFounderAuthor = (authorName?: string | null): boolean =>
  authorName?.trim().replace(/\s+/g, " ").toLowerCase() === FOUNDER.name.toLowerCase();

/** schema.org Person for the founder; reuse as `author` / `reviewedBy` in article schema. */
export const founderPersonSchema = {
  "@type": "Person",
  "@id": `${SITE_URL}/about#founder`,
  name: FOUNDER.name,
  jobTitle: FOUNDER.role,
  description: FOUNDER.shortBio,
  image: `${SITE_URL}${FOUNDER.photoLarge}`,
  url: FOUNDER.profileUrl,
  email: `mailto:${CONTACT_EMAIL}`,
  knowsAbout: ["Search engine optimisation", "React", "Kerala State Lottery results"],
  homeLocation: {
    "@type": "Place",
    name: FOUNDER.location,
    address: {
      "@type": "PostalAddress",
      addressLocality: FOUNDER.locality,
      addressRegion: FOUNDER.region,
      addressCountry: "IN",
    },
  },
  worksFor: {
    "@type": "Organization",
    name: "Kerala Lottery Result Today",
    url: SITE_URL,
  },
} as const;
