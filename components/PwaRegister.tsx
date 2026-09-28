"use client";

import { useEffect } from "react";

// Global declaration for BeforeInstallPromptEvent
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
      outcome: "accepted" | "dismissed";
      platform: string;
    }>;
    prompt(): Promise<void>;
  }
}

export default function PwaRegister() {
  useEffect(() => {
    // 1. Register Service Worker in production only. In development, unregister any existing service worker to prevent Turbopack/Next.js chunk caching issues
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (process.env.NODE_ENV !== "production") {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
        if ("caches" in window) {
          caches.keys().then((names) => {
            for (const name of names) {
              caches.delete(name);
            }
          });
        }
      } else {
        const registerSW = () => {
          navigator.serviceWorker
            .register("/sw.js")
            .then((registration) => {
              console.log("[PWA] Service Worker registered with scope:", registration.scope);
            })
            .catch((error) => {
              console.warn("[PWA] Service Worker registration failed:", error);
            });
        };

        if (document.readyState === "complete") {
          registerSW();
        } else {
          window.addEventListener("load", registerSW);
        }
      }
    }

    // 2. Capture BeforeInstallPromptEvent for Chrome / Edge / Desktop / Android
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      // Store event on window for direct 1-click install triggers
      (window as unknown as { deferredPwaPrompt?: BeforeInstallPromptEvent }).deferredPwaPrompt = e;
      // Dispatch custom event to notify components that direct install is ready
      window.dispatchEvent(new CustomEvent("pwa-install-ready"));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  return null;
}
