import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAdmin } from "@/lib/admin-auth";
import {
  broadcastFirstPrizeResult,
  testTelegramBroadcast,
  testWhatsAppBroadcast,
  formatFirstPrizeMessage,
} from "@/lib/broadcaster";
import { getDrawResultFromSupabase, getCronConfigFromSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Admin session required" },
      { status: 401 }
    );
  }

  try {
    const config = await getCronConfigFromSupabase();

    const status = {
      telegram: {
        configured: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
        bot_token_set: Boolean(process.env.TELEGRAM_BOT_TOKEN),
        chat_id_set: Boolean(process.env.TELEGRAM_CHAT_ID),
        chat_id: process.env.TELEGRAM_CHAT_ID || "Not configured in .env",
        enabled: process.env.TELEGRAM_BROADCAST_ENABLED !== "false",
      },
      whatsapp: {
        configured: Boolean(
          process.env.WHATSAPP_API_URL ||
          (process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_API_TOKEN)
        ),
        provider: process.env.WHATSAPP_PHONE_NUMBER_ID ? "meta_cloud_api" : process.env.WHATSAPP_API_URL ? "webhook_gateway" : "none",
        api_url: process.env.WHATSAPP_API_URL || (process.env.WHATSAPP_PHONE_NUMBER_ID ? "Meta Cloud API" : "Not configured in .env"),
        recipient: process.env.WHATSAPP_RECIPIENT_ID || "Not configured in .env",
        enabled: process.env.WHATSAPP_BROADCAST_ENABLED !== "false",
      },
      last_broadcast: {
        key: (config as any).last_broadcast_key || null,
        draw: (config as any).last_broadcast_draw || null,
        time: (config as any).last_broadcast_time || null,
      },
      env_guide: {
        telegram: ["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID", "TELEGRAM_BROADCAST_ENABLED"],
        whatsapp: ["WHATSAPP_API_URL", "WHATSAPP_API_TOKEN", "WHATSAPP_RECIPIENT_ID", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_BROADCAST_ENABLED"],
      },
    };

    return NextResponse.json({ success: true, status });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Admin session required" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const action = body.action;

    // 1. Test Telegram
    if (action === "test_telegram") {
      const res = await testTelegramBroadcast();
      return NextResponse.json(res, { status: res.success ? 200 : 400 });
    }

    // 2. Test WhatsApp
    if (action === "test_whatsapp") {
      const res = await testWhatsAppBroadcast();
      return NextResponse.json(res, { status: res.success ? 200 : 400 });
    }

    // 3. Preview 1st Prize Message for any draw
    if (action === "preview_message") {
      const { draw_date, lottery_code } = body;
      const draw = await getDrawResultFromSupabase(draw_date, lottery_code);
      if (!draw) {
        return NextResponse.json({ success: false, error: "Draw result not found" }, { status: 404 });
      }
      const preview = formatFirstPrizeMessage(draw);
      return NextResponse.json({ success: true, preview });
    }

    // 4. Manually broadcast a draw result now
    if (action === "broadcast_draw") {
      const { draw_date, lottery_code, force } = body;
      const draw = await getDrawResultFromSupabase(draw_date, lottery_code);
      if (!draw) {
        return NextResponse.json({ success: false, error: "Draw result not found" }, { status: 404 });
      }

      const broadcastRes = await broadcastFirstPrizeResult(draw, { force: Boolean(force) });
      return NextResponse.json({ success: true, result: broadcastRes });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
