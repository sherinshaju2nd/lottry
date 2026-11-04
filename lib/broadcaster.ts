import {
  StructuredDrawResult,
  getLotterySlug,
  getCronConfigFromSupabase,
  updateCronConfigInSupabase,
  ALL_LOTTERIES,
} from "./supabase";

export interface BroadcastLogItem {
  chatId?: string;
  to?: string;
  ok: boolean;
  response?: unknown;
  error?: string;
}

export interface BroadcastResult<T = unknown> {
  success: boolean;
  results?: BroadcastLogItem[];
  data?: T;
  error?: string;
}

export interface BroadcastExecutionReport {
  success: boolean;
  broadcastTriggered: boolean;
  skipped?: boolean;
  reason?: string;
  telegram?: BroadcastResult;
  whatsapp?: BroadcastResult;
}

/**
 * Get estimated or canonical first prize amount for a lottery
 */
const getFirstPrizeAmount = (draw: StructuredDrawResult): string => {
  if (draw.prizes?.amounts?.["1st"]) {
    return draw.prizes.amounts["1st"];
  }
  if (draw.prizes?.amounts?.["first"]) {
    return draw.prizes.amounts["first"];
  }

  // Check if bumper lottery
  const matched = ALL_LOTTERIES.find(
    (l) => l.code === draw.lottery_code || l.name.toLowerCase() === draw.draw_name.toLowerCase()
  );
  if (matched && "jackpot" in matched && typeof matched.jackpot === "string") {
    return matched.jackpot;
  }

  return "₹75,00,000 (₹75 Lakhs)";
};

/**
 * Format the official 1st Prize broadcast announcement message
 */
export const formatFirstPrizeMessage = (
  draw: StructuredDrawResult,
  baseAppUrl?: string
): { text: string; directUrl: string } => {
  const appUrl = (baseAppUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://www.keralalotteryresultstoday.in").replace(/\/$/, "");
  const slug = getLotterySlug(draw.lottery_code || draw.draw_name);
  const directUrl = `${appUrl}/${slug}/${encodeURIComponent(draw.draw_date)}`;
  const prizeAmount = getFirstPrizeAmount(draw);
  const winningTicket = (draw.first?.ticket ?? "").trim().toUpperCase();

  const text = `🎉 *KERALA LOTTERY 1st PRIZE RESULT* 🎉
━━━━━━━━━━━━━━━━━━━━━━
🎫 *Lottery:* ${draw.draw_name} (${draw.draw_code})
📅 *Draw Date:* ${draw.draw_date}
💰 *1st Prize Amount:* ${prizeAmount}

🏆 *1st PRIZE WINNING NUMBER:*
👉 🔴 *${winningTicket}* 🔴 👈
━━━━━━━━━━━━━━━━━━━━━━

🔍 *Check 2nd to 8th Prizes & Verify Your Ticket Number:*
👉 ${directUrl}

📲 Open on Web or Mobile App to check complete results and search your ticket series!`;

  return { text, directUrl };
};

/**
 * Send 1st prize broadcast to Telegram Channels or Groups
 * Reads TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID strictly from process.env
 */
export const sendTelegramBroadcast = async (
  text: string,
  directUrl?: string
): Promise<BroadcastResult> => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const rawChatIds = process.env.TELEGRAM_CHAT_ID;
  const isEnabled = process.env.TELEGRAM_BROADCAST_ENABLED !== "false";

  if (!isEnabled) {
    return { success: false, error: "Telegram broadcast is disabled in .env (TELEGRAM_BROADCAST_ENABLED=false)" };
  }

  if (!botToken || !rawChatIds) {
    return {
      success: false,
      error: "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in environment variables (.env)",
    };
  }

  const chatIds = rawChatIds
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  if (chatIds.length === 0) {
    return { success: false, error: "No valid Telegram chat/channel IDs found in TELEGRAM_CHAT_ID" };
  }

  const results: BroadcastLogItem[] = [];
  let hasSuccess = false;

  for (const chatId of chatIds) {
    try {
      const payload: Record<string, unknown> = {
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
        disable_web_page_preview: false,
      };

      if (directUrl) {
        payload.reply_markup = {
          inline_keyboard: [
            [
              {
                text: "🔍 Check All Prizes & Ticket Checker",
                url: directUrl,
              },
            ],
          ],
        };
      }

      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      results.push({ chatId, ok: Boolean(json.ok), response: json });
      if (json.ok) {
        hasSuccess = true;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ chatId, ok: false, error: msg });
    }
  }

  return {
    success: hasSuccess,
    results,
    error: hasSuccess ? undefined : "Failed to broadcast to any Telegram destination",
  };
};

/**
 * Send 1st prize broadcast to WhatsApp Groups / Channels / Numbers
 * Reads WHATSAPP_API_URL, WHATSAPP_API_TOKEN, WHATSAPP_PHONE_NUMBER_ID from process.env
 */
export const sendWhatsAppBroadcast = async (
  text: string,
  directUrl?: string
): Promise<BroadcastResult> => {
  const isEnabled = process.env.WHATSAPP_BROADCAST_ENABLED !== "false";
  if (!isEnabled) {
    return { success: false, error: "WhatsApp broadcast is disabled in .env (WHATSAPP_BROADCAST_ENABLED=false)" };
  }

  const apiUrl = process.env.WHATSAPP_API_URL;
  const apiToken = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const recipient = process.env.WHATSAPP_RECIPIENT_ID;

  // 1. Meta Official Cloud API
  if (phoneNumberId && apiToken && recipient) {
    try {
      const recipients = recipient.split(",").map((r) => r.trim()).filter(Boolean);
      const results: BroadcastLogItem[] = [];

      for (const to of recipients) {
        const payload = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "text",
          text: {
            preview_url: true,
            body: text,
          },
        };

        const res = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
          },
          body: JSON.stringify(payload),
        });

        const json = await res.json();
        results.push({ to, ok: res.ok, response: json });
      }

      return { success: true, results };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: `WhatsApp Meta Cloud API error: ${msg}` };
    }
  }

  // 2. WhatsApp Webhook / Gateway
  if (apiUrl) {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (apiToken) {
        headers["Authorization"] = `Bearer ${apiToken}`;
        headers["token"] = apiToken;
        headers["x-api-key"] = apiToken;
      }

      const payload = {
        to: recipient || undefined,
        chatId: recipient || undefined,
        phone: recipient || undefined,
        message: text,
        text,
        body: text,
        url: directUrl,
        preview_url: true,
      };

      const res = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({ status: res.status, statusText: res.statusText }));
      return { success: res.ok, data: json };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: `WhatsApp Gateway webhook error: ${msg}` };
    }
  }

  return {
    success: false,
    error: "No WhatsApp configuration found in .env (Set WHATSAPP_API_URL or WHATSAPP_PHONE_NUMBER_ID + WHATSAPP_API_TOKEN)",
  };
};

/**
 * Main Broadcast Engine
 * Checks 1st Prize validity, handles smart deduplication, and broadcasts to Telegram and WhatsApp
 */
export const broadcastFirstPrizeResult = async (
  draw: StructuredDrawResult,
  options?: { force?: boolean }
): Promise<BroadcastExecutionReport> => {
  const ticket = (draw.first?.ticket ?? "").trim().toUpperCase();

  // Validate ticket exists and is not a placeholder
  if (!ticket || ticket.length < 4 || ticket.includes("XXXX") || ticket === "PENDING") {
    return {
      success: true,
      broadcastTriggered: false,
      skipped: true,
      reason: "No valid 1st prize winning ticket found in draw payload yet.",
    };
  }

  const broadcastKey = `${draw.draw_date}_${draw.lottery_code.toUpperCase()}_${ticket}`;

  // Smart Deduplication check
  if (!options?.force) {
    try {
      const config = await getCronConfigFromSupabase();
      if (config.last_broadcast_key === broadcastKey) {
        return {
          success: true,
          broadcastTriggered: false,
          skipped: true,
          reason: `1st prize result for ${broadcastKey} has already been broadcasted.`,
        };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("Deduplication check note:", msg);
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.keralalotteryresultstoday.in";
  const { text, directUrl } = formatFirstPrizeMessage(draw, appUrl);

  console.log(`[Broadcaster] Broadcasting 1st Prize for ${draw.draw_name} (${draw.draw_date}) ticket: ${ticket}...`);

  // Execute Telegram and WhatsApp broadcasts in parallel
  const [tgRes, waRes] = await Promise.allSettled([
    sendTelegramBroadcast(text, directUrl),
    sendWhatsAppBroadcast(text, directUrl),
  ]);

  const telegram: BroadcastResult = tgRes.status === "fulfilled" 
    ? tgRes.value 
    : { success: false, error: tgRes.reason instanceof Error ? tgRes.reason.message : String(tgRes.reason) };
  const whatsapp: BroadcastResult = waRes.status === "fulfilled" 
    ? waRes.value 
    : { success: false, error: waRes.reason instanceof Error ? waRes.reason.message : String(waRes.reason) };

  const isBroadcastSuccess = telegram.success || whatsapp.success;

  // If at least one broadcast succeeded or was attempted, save the deduplication key
  if (isBroadcastSuccess || (!telegram.error?.includes("Missing") && !whatsapp.error?.includes("No WhatsApp"))) {
    try {
      await updateCronConfigInSupabase({
        last_broadcast_key: broadcastKey,
        last_broadcast_time: new Date().toISOString(),
        last_broadcast_draw: `${draw.draw_name} (${draw.draw_code}) - ${ticket}`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("Failed to persist broadcast key in app_config:", msg);
    }
  }

  return {
    success: isBroadcastSuccess,
    broadcastTriggered: true,
    telegram,
    whatsapp,
  };
};

/**
 * Send test broadcast message to Telegram
 */
export const testTelegramBroadcast = async (): Promise<BroadcastResult> => {
  const testMessage = `🔔 *Kerala Lottery Results - Telegram Broadcast Test*
━━━━━━━━━━━━━━━━━━━━━━
✅ Your Telegram Bot and Channel connection is working perfectly!
🕒 Time: ${new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata" })} IST
🌐 Website: ${process.env.NEXT_PUBLIC_APP_URL ?? "https://www.keralalotteryresultstoday.in"}

This channel will automatically receive instant 1st Prize alerts when daily lottery results are announced!`;

  return sendTelegramBroadcast(testMessage, process.env.NEXT_PUBLIC_APP_URL ?? "https://www.keralalotteryresultstoday.in");
};

/**
 * Send test broadcast message to WhatsApp
 */
export const testWhatsAppBroadcast = async (): Promise<BroadcastResult> => {
  const testMessage = `🔔 *Kerala Lottery Results - WhatsApp Broadcast Test*
━━━━━━━━━━━━━━━━━━━━━━
✅ Your WhatsApp connection is working properly!
🕒 Time: ${new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata" })} IST
🌐 Website: ${process.env.NEXT_PUBLIC_APP_URL ?? "https://www.keralalotteryresultstoday.in"}

This group/channel will automatically receive instant 1st Prize alerts when daily Kerala lottery draws are published!`;

  return sendWhatsAppBroadcast(testMessage, process.env.NEXT_PUBLIC_APP_URL ?? "https://www.keralalotteryresultstoday.in");
};
