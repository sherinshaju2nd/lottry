import type { ReactNode } from "react";
import Link from "next/link";
import { getBlogPath, getTranslatedSlug } from "@/data/blogs";
import type { BlogLanguage } from "@/data/blogTranslations/types";
import { LINK_STYLE } from "./GuideBlocks";

/**
 * Inline markup for translatable guide copy (data/blogTranslations/**):
 *   **bold text**
 *   [link text](/path)              → internal page
 *   [link text](guide:some-slug)    → that guide, in the reader's language
 *   [link text](https://…)          → external, opens in a new tab
 * Anything else is plain text, so translators only need to keep the markers intact.
 */
const TOKEN = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;

const resolveHref = (href: string, language: BlogLanguage): string =>
  href.startsWith("guide:") ? getBlogPath(getTranslatedSlug(href.slice("guide:".length), language)) : href;

interface Props {
  text: string;
  language?: BlogLanguage;
}

const RichText = ({ text, language = "en" }: Props) => {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(TOKEN)) {
    const [whole, bold, linkText, href] = match;
    const index = match.index ?? 0;
    if (index > last) parts.push(text.slice(last, index));
    if (bold !== undefined) {
      parts.push(<strong key={index}>{bold}</strong>);
    } else if (href.startsWith("http")) {
      parts.push(
        <a key={index} href={href} target="_blank" rel="noopener noreferrer" style={LINK_STYLE}>
          {linkText}
        </a>,
      );
    } else {
      parts.push(
        <Link key={index} href={resolveHref(href, language)} style={LINK_STYLE}>
          {linkText}
        </Link>,
      );
    }
    last = index + whole.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
};

export default RichText;
