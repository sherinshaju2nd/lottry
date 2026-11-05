import { llmsTextResponse } from "@/lib/llmsText";

// Static text from content/, with announced bumper draws filled in from the DB hourly
export const dynamic = "force-static";
export const revalidate = 3600;

export const GET = () => llmsTextResponse("llms-full.txt");
