import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAdmin } from "@/lib/admin-auth";
import { getAlertRecipients, isMailerConfigured } from "@/lib/mailer";
import { sendTestSourceAlert } from "@/lib/sourceAlerts";

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

/** Admin: is alert email set up, and who receives it. */
export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers: noStore });
  }
  return NextResponse.json({ success: true, configured: isMailerConfigured(), recipients: getAlertRecipients() }, { headers: noStore });
}

/** Admin "Send test email": sends a sample API-failure alert to the alert recipients. */
export async function POST(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401, headers: noStore });
  }
  const result = await sendTestSourceAlert();
  return NextResponse.json(
    { success: result.sent, ...result, recipients: getAlertRecipients() },
    { status: result.sent ? 200 : result.skipped ? 400 : 502, headers: noStore },
  );
}
