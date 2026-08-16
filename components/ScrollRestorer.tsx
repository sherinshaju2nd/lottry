"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollRestorer() {
  const pathname = usePathname();

  useEffect(() => {
    // 1. Force browser to manual scroll restoration so reloads don't jump down
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    // 2. Reset scroll to top (0, 0) on every route navigation
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname]);

  return null;
}
