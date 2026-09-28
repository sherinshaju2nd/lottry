import React from "react";
import type { Metadata } from "next";
import SupportClient from "../support/SupportClient";

export const metadata: Metadata = {
  title: "Buy Me a Coffee | Support Kerala Lottery Development",
  description:
    "Buy us a coffee to support the ongoing development of Kerala Lottery Results Today. Help fuel 3:00 PM zero-lag live servers, AI Ticket Scanner OCR improvements, and keep the app 100% ad-free.",
  alternates: {
    canonical: "https://www.keralalotteryresultstoday.in/support",
  },
};

export default function BuyMeACoffeePage() {
  return <SupportClient />;
}
