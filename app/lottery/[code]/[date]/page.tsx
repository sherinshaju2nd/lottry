import { redirect } from "next/navigation";
import { getLotteryUrl } from "@/lib/supabase";

interface PageProps {
  params: Promise<{ code: string; date: string }>;
}

export default async function LegacyLotteryDateRedirect({ params }: PageProps) {
  const resolvedParams = await params;
  const targetUrl = getLotteryUrl(resolvedParams.code, resolvedParams.date);
  redirect(targetUrl);
}
