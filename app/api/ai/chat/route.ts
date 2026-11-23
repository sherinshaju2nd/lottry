import { NextRequest, NextResponse } from "next/server";
import { chatWithGeminiAssistant, chatWithGeminiAudio } from "@/lib/gemini";
import { getCachedDrawsForLatestDates } from "@/lib/drawCache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, audio, mimeType = "audio/m4a", history = [] } = body;

    if (!message?.trim() && !audio) {
      return NextResponse.json(
        { success: false, error: "Either message or audio is required." },
        { status: 400 }
      );
    }

    // Ground the AI with the exact winning numbers of the latest 2 draw dates (not the whole table)
    let drawContext = "";
    try {
      const { data: recentDraws } = await getCachedDrawsForLatestDates(2);
      if (recentDraws && recentDraws.length > 0) {
        drawContext = recentDraws
          .slice(0, 3)
          .map(
            (d) =>
              `Draw: ${d.draw_name} (${d.draw_code}) on ${d.draw_date}, 1st Prize Ticket: ${d.first?.ticket || "N/A"} (${d.first?.location || "Kerala"}), 2nd Prize: ${(d.prizes?.["2nd"] || []).join(", ") || "N/A"}, 3rd Prize: ${(d.prizes?.["3rd"] || []).slice(0, 5).join(", ")}`
          )
          .join("\n");
      }
    } catch (e) {
      console.warn("Could not fetch draw context for chat:", e);
    }

    // Audio-based chat request
    if (audio) {
      const audioResult = await chatWithGeminiAudio(
        audio,
        mimeType,
        history,
        drawContext
      );
      return NextResponse.json({
        success: true,
        user_transcript: audioResult.user_transcript,
        reply: audioResult.reply,
      });
    }

    // Text-based chat request
    const reply = await chatWithGeminiAssistant(message, history, drawContext);

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to process chat message.";
    console.error("AI Chat Route Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: msg,
      },
      { status: 500 }
    );
  }
}
