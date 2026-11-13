import Link from "next/link";
import { CONTACT_EMAIL, FOUNDER } from "@/lib/siteAuthor";

interface AuthorBioProps {
  /** "Written by" for the founder's own guides, "Reviewed by" for posts by other contributors. */
  label?: "Written by" | "Reviewed by";
  /** Last-reviewed date shown under the bio (ISO yyyy-mm-dd), if known. */
  reviewedDate?: string;
}

const formatDate = (iso?: string): string | undefined =>
  iso
    ? new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      })
    : undefined;

/** Author / editor bio box shown at the end of every blog and news post. */
const AuthorBio = ({ label = "Written by", reviewedDate }: AuthorBioProps) => {
  const reviewed = formatDate(reviewedDate);

  return (
    <aside
      aria-label={`${label} ${FOUNDER.name}`}
      className="mx-auto my-8 flex max-w-3xl flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-slate-800 sm:flex-row sm:p-6"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- small static avatar, works in server & client trees */}
      <img
        src={FOUNDER.avatar}
        alt={`Photo of ${FOUNDER.name}`}
        width={80}
        height={80}
        loading="lazy"
        className="h-20 w-20 shrink-0 rounded-full border border-slate-200 object-cover"
      />
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="text-lg font-extrabold text-slate-900">
          <Link href="/about#founder" className="hover:underline">
            {FOUNDER.name}
          </Link>
        </p>
        <p className="mb-2 text-sm font-semibold text-sky-800">
          {FOUNDER.role} · {FOUNDER.expertise} · {FOUNDER.location}
        </p>
        <p className="mb-2 text-sm leading-relaxed text-slate-700">{FOUNDER.shortBio}</p>
        <p className="text-xs leading-relaxed text-slate-500">
          {reviewed ? `Last reviewed ${reviewed}. ` : ""}Spotted an error?{" "}
          <a href={`mailto:${CONTACT_EMAIL}?subject=Correction%20request`} className="font-semibold text-sky-800 underline">
            Email a correction
          </a>{" "}
          · <Link href="/about#corrections" className="font-semibold text-sky-800 underline">Corrections policy</Link>
        </p>
      </div>
    </aside>
  );
};

export default AuthorBio;
