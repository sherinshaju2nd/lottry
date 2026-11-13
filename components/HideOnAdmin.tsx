"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Hides public-site chrome (mobile bottom nav, AI assistant bubble, install prompts, footer)
 * on /admin. Those are fixed to the screen edges and, on phones, covered the admin's own
 * save bar and action buttons, so admins could not save from mobile.
 */
export default function HideOnAdmin({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return pathname?.startsWith("/admin") ? null : <>{children}</>;
}
