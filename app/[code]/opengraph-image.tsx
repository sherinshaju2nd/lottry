import { ImageResponse } from "next/og";
import { ALL_LOTTERIES, getLotteryCodeFromSlug } from "@/lib/supabase";
import { getLotteryEditorialContent } from "@/lib/lotteryEditorialData";

export const runtime = "nodejs";
export const alt = "Kerala State Lottery Result Today - Official Winning Numbers";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const resolvedParams = await params;
  const rawCode = resolvedParams.code;
  const lotteryCode = getLotteryCodeFromSlug(rawCode);
  const lotteryInfo = ALL_LOTTERIES.find((l) => l.code === lotteryCode);

  const name = lotteryInfo?.name || "Kerala Lottery";
  const nameMl = lotteryInfo?.nameMl || "കേരള ലോട്ടറി";
  const code = lotteryInfo?.code || lotteryCode.toUpperCase();
  const day = lotteryInfo?.day || "Weekly Draw";
  const jackpot = lotteryInfo?.jackpot || (lotteryInfo?.is_bumper ? "₹25 Crore" : "₹1 Crore");
  const ticketPrice = lotteryInfo?.ticket_price || (lotteryInfo?.is_bumper ? "₹500" : "₹50");

  const editorial = getLotteryEditorialContent(code, name, nameMl, day, jackpot, ticketPrice);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 70px",
          background: "linear-gradient(135deg, #061A2B 0%, #0B3C5D 50%, #16537E 100%)",
          color: "#FFFFFF",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle decorative background circle */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 450,
            height: 450,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(217, 119, 6, 0.25) 0%, rgba(0,0,0,0) 70%)",
          }}
        />

        {/* Top Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "14px",
                background: "#D97706",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                fontWeight: 900,
                color: "#FFFFFF",
                boxShadow: "0 4px 14px rgba(217, 119, 6, 0.4)",
              }}
            >
              KL
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  color: "#FDE68A",
                  textTransform: "uppercase",
                }}
              >
                Government of Kerala
              </div>
              <div
                style={{
                  fontSize: 15,
                  color: "#93C5FD",
                  fontWeight: 600,
                }}
              >
                State Lotteries Department • Official Draw Results
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 20px",
              borderRadius: "30px",
              background: "rgba(255, 255, 255, 0.12)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              fontSize: 16,
              fontWeight: 700,
              color: "#FDE68A",
            }}
          >
            Draw Code: {code}
          </div>
        </div>

        {/* Center Main Card Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
          <div
            style={{
              fontSize: 20,
              color: "#60A5FA",
              fontWeight: 800,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Official Lottery Result Today
          </div>

          <div
            style={{
              fontSize: 54,
              fontWeight: 900,
              lineHeight: 1.1,
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span>{name} ({code})</span>
            {nameMl && (
              <span style={{ fontSize: 40, color: "#FDE68A", fontWeight: 700 }}>
                {nameMl}
              </span>
            )}
          </div>

          <div
            style={{
              fontSize: 22,
              color: "#E2E8F0",
              fontWeight: 500,
              lineHeight: 1.4,
              maxWidth: 960,
            }}
          >
            1st Prize: <strong style={{ color: "#FDE68A", fontWeight: 900 }}>{jackpot}</strong> • Draw Day: <strong style={{ color: "#FFFFFF" }}>{day} at 3:00 PM</strong> • Venue: Gorky Bhavan, Thiruvananthapuram
          </div>
        </div>

        {/* Bottom Bar with Stats and Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 24,
            borderTop: "1px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          <div style={{ display: "flex", gap: 32 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 13, color: "#93C5FD", fontWeight: 600, textTransform: "uppercase" }}>
                Ticket Price
              </span>
              <span style={{ fontSize: 24, fontWeight: 800, color: "#FFFFFF" }}>
                {ticketPrice} (incl. GST)
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 13, color: "#93C5FD", fontWeight: 600, textTransform: "uppercase" }}>
                Series Issued
              </span>
              <span style={{ fontSize: 24, fontWeight: 800, color: "#FFFFFF" }}>
                {editorial.ticketPriceDetails?.seriesCount || 12} Series
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 13, color: "#93C5FD", fontWeight: 600, textTransform: "uppercase" }}>
                Verification
              </span>
              <span style={{ fontSize: 24, fontWeight: 800, color: "#10B981" }}>
                Official Gazette PDF
              </span>
            </div>
          </div>

          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#93C5FD",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            keralalotteryresultstoday.in
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
