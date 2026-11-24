"use client";
import { useEffect, useRef } from "react";

type Tone = "success" | "error" | "info";
const eventName = "listry:notice";

export function notify(message: string, tone: Tone = "success") {
  window.dispatchEvent(new CustomEvent(eventName, { detail: { message, tone } }));
}

export function Spinner() {
  return <span className="spinner" aria-hidden="true"/>;
}

export function ToastHost({ accountId }: { accountId?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const previous = useRef(accountId);
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    let timer: number;
    function show(event: Event) {
      if (!host) return;
      const { message, tone } = (event as CustomEvent<{ message: string; tone: Tone }>).detail;
      window.clearTimeout(timer);
      if (host.matches(":popover-open")) host.hidePopover();
      host.dataset.tone = tone;
      host.textContent = message;
      host.showPopover();
      timer = window.setTimeout(() => host.hidePopover(), 5000);
    }
    window.addEventListener(eventName, show);
    return () => { window.removeEventListener(eventName, show); window.clearTimeout(timer); };
  }, []);
  useEffect(() => {
    if (previous.current !== accountId) notify(accountId ? "Você entrou na sua conta." : "Você saiu da conta.");
    previous.current = accountId;
  }, [accountId]);
  return <div ref={ref} popover="manual" className="toast" role="status" aria-live="polite" aria-atomic="true"/>;
}
