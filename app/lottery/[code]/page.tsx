import { redirect } from "next/navigation";
import { getLotteryUrl } from "@/lib/supabase";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function LegacyLotteryCodeRedirect({ params }: PageProps) {
  const resolvedParams = await params;
  const targetUrl = getLotteryUrl(resolvedParams.code);
  redirect(targetUrl);
}
