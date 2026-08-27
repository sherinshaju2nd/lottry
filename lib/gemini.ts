/**
 * Google Gemini API Client for Kerala Lottery Platform
 * Supports Multimodal Vision (Ticket Scanning), Text Generation (Voice Chat / Digests), and Structured JSON Extraction.
 */

import { StructuredDrawResult } from "./supabase";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export interface TicketScanResult {
  lottery_name?: string;
  lottery_code?: string;
  draw_date?: string; // YYYY-MM-DD
  series?: string;     // 2 uppercase letters e.g. "KN" or "WA"
  ticket_number?: string; // 6 digits e.g. "482910"
  last_digits?: string;   // 4 digits e.g. "2910"
  barcode_data?: string;
  confidence?: number;
  detected_text?: string;
}

/**
 * Scan a Kerala Lottery ticket image using Gemini Vision (multimodal)
 * @param base64Image Base64 encoded image string (with or without data URI prefix)
 * @param mimeType image/jpeg, image/png, or image/webp
 */
export async function scanTicketWithGemini(
  base64Image: string,
  mimeType: string = "image/jpeg"
): Promise<TicketScanResult> {
  const cleanBase64 = base64Image.replace(/^data:[^;]+;base64,/, "");

  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }

  const prompt = `
You are an expert Kerala State Lottery ticket scanner and OCR parser.
Analyze this image of a Kerala State Lottery ticket. Extract the following details with precision:

1. "lottery_name": The exact name of the Kerala lottery (e.g. "Karunya", "Karunya Plus", "Sthree Sakthi", "Bhagyathara", "Dhanalekshmi", "Suvarna Keralam", "Samrudhi", "Fifty Fifty", "Nirmal", "Win-Win", "Thiruvonam Bumper", "Christmas New Year Bumper", "Vishu Bumper", "Pooja Bumper", "Monsoon Bumper", "Summer Bumper").
2. "lottery_code": 2-letter standard code if recognizable (e.g. "KR", "KN", "SS", "BT", "DL", "SK", "SM", "TH", "XN", "VB", "BR", "MB", "SB").
3. "draw_date": The draw date formatted strictly as YYYY-MM-DD (e.g. 2026-03-15).
4. "series": The 2-letter ticket alphabetical series prefix (e.g. "WA", "WB", "KN", "PA").
5. "ticket_number": The exact 6-digit number printed on the ticket (e.g. "482910" or "123456").
6. "last_digits": The last 4 digits of the ticket number (e.g. "2910").
7. "barcode_data": Any barcode or QR numbers if readable.
8. "detected_text": Brief raw text summary of the ticket numbers seen.

Return ONLY a valid JSON object strictly matching this format without markdown code blocks:
{
  "lottery_name": "Karunya Plus",
  "lottery_code": "KN",
  "draw_date": "2026-03-15",
  "series": "KN",
  "ticket_number": "482910",
  "last_digits": "2910",
  "barcode_data": "",
  "confidence": 0.95,
  "detected_text": "KN 482910"
}
`;

  const models = [
    "gemini-3.6-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.5-flash",
  ];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: cleanBase64,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              response_mime_type: "application/json",
              temperature: 0.1,
            },
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`Gemini model ${model} returned error ${response.status}:`, errText);
        lastError = new Error(`Gemini API error (${response.status}): ${errText}`);
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";
      const cleanedJson = rawText.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
      const parsed: TicketScanResult = JSON.parse(cleanedJson);
      return parsed;
    } catch (err) {
      lastError = err;
      console.warn(`Error trying Gemini model ${model}:`, err);
    }
  }

  throw lastError || new Error("Failed to scan ticket with Gemini Vision.");
}

/**
 * Parse an official Kerala Government Gazette PDF or result sheet image with Gemini Multimodal AI.
 * Extracts all prize categories into a structured StructuredDrawResult object.
 */
export async function parseLotteryPdfWithGemini(
  base64File: string,
  mimeType: string = "application/pdf"
): Promise<StructuredDrawResult> {
  const cleanBase64 = base64File.replace(/^data:[^;]+;base64,/, "");

  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }

  const prompt = `
You are an expert Kerala State Lottery Gazette document parser.
Extract all lottery draw result data from this official Kerala State Lottery Gazette PDF or result sheet image.

Required Fields:
1. "draw_date": Formatted strictly as YYYY-MM-DD (e.g. 2026-03-28).
2. "draw_name": Official lottery name (e.g. "Karunya", "Karunya Plus", "Sthree Sakthi", "Bhagyathara", "Dhanalekshmi", "Suvarna Keralam", "Samrudhi", "Fifty Fifty", "Nirmal", "Win-Win", "Thiruvonam Bumper", etc.).
3. "draw_code": Exact draw code number (e.g. "KR-682", "KN-541", "SS-412", "TH-99").
4. "lottery_code": 2-letter standard code:
   - Bhagyathara / Win-Win -> "BT"
   - Sthree Sakthi -> "SS"
   - Dhanalekshmi / Fifty-Fifty -> "DL"
   - Karunya Plus -> "KN"
   - Suvarna Keralam / Nirmal -> "SK"
   - Karunya -> "KR"
   - Samrudhi / Akshaya -> "SM"
   - Thiruvonam Bumper -> "TH"
   - Christmas Bumper -> "XN"
   - Vishu Bumper -> "VB"
   - Pooja Bumper -> "PB"
   - Monsoon Bumper -> "MB"
   - Summer Bumper -> "SB"
5. "first": Object containing:
   - "ticket": Winning 1st prize series and number (e.g. "WA 123456" or "123456")
   - "location": District/location of the winning agent if listed (e.g. "Palakkad", "Kottayam")
   - "agent": Agent name if listed
   - "agency_no": Agency number if listed
6. "prizes": Object containing array of winning strings for each prize tier:
   - "consolation": string[] (e.g. ["WB 123456", "WC 123456"])
   - "2nd": string[]
   - "3rd": string[]
   - "4th": string[]
   - "5th": string[]
   - "6th": string[]
   - "7th": string[]
   - "8th": string[]
   - "amounts": Record<string, string> with prize amounts (e.g. {"1st": "₹80 Lakhs", "2nd": "₹10 Lakhs", "3rd": "₹1 Lakh", "4th": "₹5,000", "5th": "₹1,000", "6th": "₹500", "7th": "₹200", "8th": "₹100", "consolation": "₹8,000"})

Return ONLY a valid JSON object matching the exact structure below with NO markdown formatting:
{
  "draw_date": "2026-03-28",
  "draw_name": "Karunya",
  "draw_code": "KR-682",
  "lottery_code": "KR",
  "first": {
    "ticket": "WA 654321",
    "location": "Kottayam",
    "agent": "Soman K",
    "agency_no": "K 1234"
  },
  "prizes": {
    "consolation": ["WB 654321", "WC 654321"],
    "2nd": ["WD 987654"],
    "3rd": ["1234", "5678"],
    "4th": ["4321", "8765"],
    "5th": ["1111", "2222"],
    "6th": ["3333", "4444"],
    "7th": ["5555", "6666"],
    "8th": ["7777", "8888"],
    "amounts": {
      "1st": "80,00,000/-",
      "consolation": "8,000/-",
      "2nd": "5,00,000/-",
      "3rd": "1,00,000/-",
      "4th": "5,000/-",
      "5th": "1,000/-",
      "6th": "500/-",
      "7th": "200/-",
      "8th": "100/-"
    }
  }
}
`;

  const models = [
    "gemini-3.6-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.5-flash",
  ];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: cleanBase64,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              response_mime_type: "application/json",
              temperature: 0.1,
            },
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`Gemini model ${model} PDF error ${response.status}:`, errText);
        lastError = new Error(`Gemini PDF API error (${response.status}): ${errText}`);
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";
      const cleanedJson = rawText.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
      const parsed: StructuredDrawResult = JSON.parse(cleanedJson);
      return parsed;
    } catch (err) {
      lastError = err;
      console.warn(`Error trying Gemini model ${model} for PDF:`, err);
    }
  }

  throw lastError || new Error("Failed to parse Gazette PDF with Gemini.");
}

/**
 * Interactive Malayalam & English AI Voice and Chat Assistant
 */
export async function chatWithGeminiAssistant(
  userMessage: string,
  history: Array<{ role: "user" | "model"; text: string }> = [],
  contextData?: string
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const systemInstruction = `
You are the Official Kerala State Lottery AI Assistant on https://www.keralalotteryresultstoday.in.
You help users with live lottery results, ticket verification, claim procedures, prize breakdown tables, taxation, and bumper draw dates.

Guidelines:
1. Multilingual: If the user asks in Malayalam (or Manglish), respond in natural, friendly, accurate Malayalam (മലയാളം). If in English, respond in English.
2. Official Data:
   - Daily draw time: 3:00 PM IST from Gorky Bhavan, Thiruvananthapuram.
   - Claim validity: Within 30 days of the draw.
   - Tax: Flat 30% TDS under Section 194B for prizes > ₹10,000 + 10% agent commission.
   - Claim offices: Up to ₹5,000 at local agents; ₹5,000 to ₹1 Lakh at District Lottery Offices; above ₹1 Lakh at Directorate of State Lotteries, Thiruvananthapuram.
3. Keep answers concise, clear, helpful, and formatted with bullet points where appropriate.

Grounding Context / Recent Draw Data:
${contextData || "No extra context provided."}
`;

  // Ensure history properly starts with 'user' and alternates roles (Gemini requirement)
  const validHistory: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];
  for (const h of history) {
    if (!h.text || !h.text.trim()) continue;
    // Skip leading 'model' greeting messages
    if (validHistory.length === 0 && h.role === "model") continue;

    // Avoid consecutive same-role messages
    if (validHistory.length > 0 && validHistory[validHistory.length - 1].role === h.role) {
      validHistory[validHistory.length - 1].parts[0].text += `\n${h.text}`;
    } else {
      validHistory.push({
        role: h.role,
        parts: [{ text: h.text }],
      });
    }
  }

  const contents = [
    ...validHistory,
    {
      role: "user",
      parts: [{ text: userMessage }],
    },
  ];

  const models = [
    "gemini-3.6-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.5-flash",
  ];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemInstruction }],
            },
            contents,
            generationConfig: {
              temperature: 0.4,
              max_output_tokens: 800,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } else {
        const errText = await response.text();
        console.warn(`Gemini Chat model ${model} returned ${response.status}:`, errText);
        lastError = new Error(`Gemini API (${model}) error ${response.status}: ${errText}`);
      }
    } catch (e) {
      console.warn(`Chat model ${model} error:`, e);
      lastError = e;
    }
  }

  throw lastError || new Error("Gemini AI Chat Assistant unavailable.");
}

export interface SocialMediaDigest {
  whatsapp_malayalam: string;
  whatsapp_english: string;
  telegram_post: string;
  short_audio_script_ml: string;
}

/**
 * Generate viral WhatsApp Status & Telegram Digest text for today's lottery result
 */
export async function generateSocialMediaDigests(
  draw: StructuredDrawResult
): Promise<SocialMediaDigest> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const prompt = `
Generate viral, beautifully formatted daily lottery result sharing text for WhatsApp Status and Telegram based on this draw result:

Draw Name: ${draw.draw_name} (${draw.draw_code})
Draw Date: ${draw.draw_date}
1st Prize: ${draw.first?.ticket || "N/A"} (${draw.first?.location || "Kerala"})
2nd Prize: ${(draw.prizes?.["2nd"] || []).join(", ") || "N/A"}
3rd Prize: ${(draw.prizes?.["3rd"] || []).slice(0, 4).join(", ") || "N/A"}
Consolation: ${(draw.prizes?.consolation || []).slice(0, 4).join(", ") || "N/A"}
Website: https://www.keralalotteryresultstoday.in

Create:
1. "whatsapp_malayalam": WhatsApp status text with emojis in Malayalam including website link.
2. "whatsapp_english": WhatsApp status text in English with emojis and link.
3. "telegram_post": Clean Telegram channel post with hashtags and live search link.
4. "short_audio_script_ml": A 15-second conversational script in Malayalam suitable for audio podcast/voice announcement.

Return ONLY a JSON object:
{
  "whatsapp_malayalam": "...",
  "whatsapp_english": "...",
  "telegram_post": "...",
  "short_audio_script_ml": "..."
}
`;

  const models = [
    "gemini-3.6-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.5-flash",
  ];
  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              response_mime_type: "application/json",
              temperature: 0.3,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";
        const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
        return JSON.parse(cleaned);
      }
    } catch (e) {
      console.warn(`Digest model ${model} error:`, e);
    }
  }

  throw new Error("Failed to generate social digests.");
}

