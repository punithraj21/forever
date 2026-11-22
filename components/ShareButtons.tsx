"use client";

// Share controls for the invitation page: WhatsApp (wa.me with a prefilled
// message + this page's URL), the phone's native share sheet when available,
// and Copy link. Uses the URL the visitor is actually on, so it works the same
// on forever.devshark.site and wedding.devshark.site.

import { useEffect, useState } from "react";

type Labels = {
  whatsapp: string;
  copy: string;
  copied: string;
  native: string;
  message: string;
};

type Short = { whatsapp: string; native: string; copy: string; copied: string };

// `short` switches to the "gold medallion" look (round gold-ringed buttons with
// a small caption underneath) used on /invite2; without it the original pill
// buttons render (used on /invite).
export default function ShareButtons({
  labels,
  short,
}: {
  labels: Labels;
  short?: Short;
}) {
  const [url, setUrl] = useState("");
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.origin + window.location.pathname);
    setCanNativeShare(typeof navigator.share === "function");
  }, []);

  const text = `${labels.message}\n\n${url}`;
  const waHref = `https://wa.me/?text=${encodeURIComponent(text)}`;

  // Copies the whole invitation message + link (same text as the WhatsApp
  // button), so whatever app it's pasted into gets the caption too.
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // older browsers: fall back to a hidden textarea
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  async function nativeShare() {
    try {
      await navigator.share({ text: labels.message, url });
    } catch {
      /* user cancelled */
    }
  }

  const pill =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition";

  if (short) {
    const medal =
      "flex h-14 w-14 items-center justify-center rounded-full border-[1.5px] border-[#d9a441] bg-[radial-gradient(circle_at_35%_30%,#fffaf0,#f6e6c4)] text-[#7a1f2b] shadow-[inset_0_0_0_4px_#fdf3e6,inset_0_0_0_5px_rgba(217,164,65,0.5),0_8px_18px_-8px_rgba(122,31,43,0.45)] transition group-hover:scale-105 group-active:scale-95";
    const cap =
      "text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[#7a1f2b]";
    return (
      <div className="flex items-start justify-center gap-7">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={labels.whatsapp}
          className="group flex flex-col items-center gap-2"
        >
          <span className={medal}>
            <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6 fill-current">
              <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.9-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.2-.2-.2-.4-.3Z" />
            </svg>
          </span>
          <span className={cap}>{short.whatsapp}</span>
        </a>
        {canNativeShare && (
          <button
            type="button"
            onClick={nativeShare}
            aria-label={labels.native}
            className="group flex flex-col items-center gap-2"
          >
            <span className={`${medal} text-2xl`}>↗</span>
            <span className={cap}>{short.native}</span>
          </button>
        )}
        <button
          type="button"
          onClick={copy}
          aria-label={labels.copy}
          aria-live="polite"
          className="group flex flex-col items-center gap-2"
        >
          <span className={`${medal} text-xl`}>{copied ? "✓" : "⧉"}</span>
          <span className={cap}>{copied ? short.copied : short.copy}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`${pill} bg-[#1f8f4e] text-white shadow-sm hover:bg-[#187a41]`}
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-current">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.9-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.2-.2-.2-.4-.3Z" />
        </svg>
        {labels.whatsapp}
      </a>
      {canNativeShare && (
        <button
          type="button"
          onClick={nativeShare}
          className={`${pill} bg-[#7a1f2b] text-[#fdf2dc] shadow-sm hover:bg-[#5e1520]`}
        >
          <span aria-hidden>↗</span>
          {labels.native}
        </button>
      )}
      <button
        type="button"
        onClick={copy}
        className={`${pill} border border-amber-400/80 bg-white/70 text-[#7a1f2b] hover:bg-amber-50`}
        aria-live="polite"
      >
        <span aria-hidden>{copied ? "✓" : "🔗"}</span>
        {copied ? labels.copied : labels.copy}
      </button>
    </div>
  );
}
