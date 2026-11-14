"use client";

import React, { useEffect, useRef, useState, type ComponentType } from "react";

/**
 * Site-wide widgets that are not needed for the first paint: the AI assistant, the ticket
 * scanner dialog and the iOS / Windows install guides. Loading them after hydration keeps
 * ~3,000 lines of component code (and their MUI dependencies) out of the initial bundle,
 * which was the main cause of PageSpeed's "Total Blocking Time" / "Reduce unused JavaScript".
 *
 * They are opened elsewhere with window events (e.g. the bottom nav "Scan" button). Any such
 * event fired before the widgets finish loading is remembered and replayed once they mount,
 * so no tap is lost on a slow phone.
 */

/** Window events these widgets listen for (see each component's addEventListener). */
const OPEN_EVENTS = [
  "open-ai-voice-assistant",
  "open-ai-ticket-scanner",
  "open-barcode-scanner",
  "open-ios-install-guide",
  "open-windows-install-guide",
] as const;

interface LoadedWidgets {
  AiVoiceAssistantModal: ComponentType;
  AiTicketScanner: ComponentType<{ variant?: "dialog-only" }>;
  IosInstallGuideModal: ComponentType;
  WindowsInstallGuideModal: ComponentType;
}

const loadWidgets = async (): Promise<LoadedWidgets> => {
  const [voice, scanner, ios, windows] = await Promise.all([
    import("@/components/AiVoiceAssistantModal"),
    import("@/components/AiTicketScanner"),
    import("@/components/IosInstallGuideModal"),
    import("@/components/WindowsInstallGuideModal"),
  ]);
  return {
    AiVoiceAssistantModal: voice.default,
    AiTicketScanner: scanner.default as ComponentType<{ variant?: "dialog-only" }>,
    IosInstallGuideModal: ios.default as ComponentType,
    WindowsInstallGuideModal: windows.default as ComponentType,
  };
};

export default function LazyGlobalWidgets() {
  const [widgets, setWidgets] = useState<LoadedWidgets | null>(null);
  /** Open events received before the widgets mounted, replayed in order afterwards. */
  const pending = useRef<Event[]>([]);
  /** Once the widgets are mounted they handle events themselves; stop buffering. */
  const mountedRef = useRef(false);

  useEffect(() => {
    let active = true;
    const remember = (event: Event) => {
      if (!mountedRef.current) pending.current.push(event);
    };
    OPEN_EVENTS.forEach((name) => window.addEventListener(name, remember));

    loadWidgets()
      .then((loaded) => {
        if (active) setWidgets(loaded);
      })
      .catch((err: unknown) => {
        console.error("[LazyGlobalWidgets] failed to load widgets:", err instanceof Error ? err.message : String(err));
      });

    return () => {
      active = false;
      OPEN_EVENTS.forEach((name) => window.removeEventListener(name, remember));
    };
  }, []);

  // Children's effects (their own event listeners) run before this one, so replaying here is safe.
  useEffect(() => {
    if (!widgets) return;
    mountedRef.current = true;
    const queued = pending.current;
    pending.current = [];
    queued.forEach((event) => {
      window.dispatchEvent(new CustomEvent(event.type, { detail: (event as CustomEvent).detail }));
    });
  }, [widgets]);

  if (!widgets) return null;
  const { AiVoiceAssistantModal, AiTicketScanner, IosInstallGuideModal, WindowsInstallGuideModal } = widgets;
  return (
    <>
      <AiVoiceAssistantModal />
      <AiTicketScanner variant="dialog-only" />
      <IosInstallGuideModal />
      <WindowsInstallGuideModal />
    </>
  );
}
