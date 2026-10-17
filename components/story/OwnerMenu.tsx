"use client";

import { useEffect, useRef, useState } from "react";
import { Dots, Pencil, Trash } from "./icons";

// Touch-friendly replacement for the old hover-only edit/delete buttons.
// Delete confirms inside the menu instead of a browser confirm() dialog.
export default function OwnerMenu({
  onEdit,
  onDelete,
  tone = "light",
}: {
  onEdit: () => void;
  onDelete: () => void;
  tone?: "light" | "dark";
}) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = () => {
      setOpen(false);
      setConfirming(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) close();
    };
    // Capture phase + stopPropagation so Esc closes just the menu and doesn't
    // also reach a parent dialog's own Esc handler.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  const item =
    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition";

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setConfirming(false);
        }}
        aria-label="Chapter options"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`rounded-full p-2.5 transition ${
          tone === "dark"
            ? "text-white/80 hover:bg-white/10 hover:text-white"
            : "text-[#9a7080] hover:bg-white/70 hover:text-rose-600"
        }`}
      >
        <Dots />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 w-52 rounded-2xl border border-rose-100 bg-white p-1.5 shadow-xl"
        >
          {confirming ? (
            <div className="p-2">
              <p className="mb-2.5 text-sm text-[#3a2030]">
                Delete this chapter?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="flex-1 rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-[#7a5560] transition hover:bg-rose-50"
                >
                  Keep
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setConfirming(false);
                    onDelete();
                  }}
                  className="flex-1 rounded-full bg-rose-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-rose-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onEdit();
                }}
                className={`${item} text-[#3a2030] hover:bg-rose-50`}
              >
                <Pencil size={15} /> Edit chapter
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => setConfirming(true)}
                className={`${item} text-rose-600 hover:bg-rose-50`}
              >
                <Trash size={15} /> Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
