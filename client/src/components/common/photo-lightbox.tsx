import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { LocalMediaItem } from "@/lib/local-media";

type PhotoLightboxProps = {
  items: LocalMediaItem[];
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
};

export function PhotoLightbox({ items, index, onIndex, onClose }: PhotoLightboxProps) {
  const item = items[index];
  const touchStart = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onIndex((index + 1) % items.length);
      if (event.key === "ArrowLeft") onIndex((index - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, items.length, onClose, onIndex]);

  if (!item) return null;

  const go = (direction: number) => {
    onIndex((index + direction + items.length) % items.length);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
    >
      <button
        type="button"
        className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-white text-toodles-text shadow-elev sm:right-5 sm:top-5"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>

      {items.length > 1 && (
        <>
          <button
            type="button"
            className="absolute left-2 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/95 text-toodles-text shadow-elev sm:left-5"
            onClick={(event) => {
              event.stopPropagation();
              go(-1);
            }}
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="absolute right-2 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/95 text-toodles-text shadow-elev sm:right-5"
            onClick={(event) => {
              event.stopPropagation();
              go(1);
            }}
            aria-label="Next photo"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <div
        className={`relative flex max-h-[100dvh] max-w-6xl flex-col items-center px-12 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={(event) => event.stopPropagation()}
        onTouchStart={(event) => {
          touchStart.current = event.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          const start = touchStart.current;
          const end = event.changedTouches[0]?.clientX;
          if (start == null || end == null || items.length < 2) return;
          const delta = end - start;
          if (delta > 50) go(-1);
          if (delta < -50) go(1);
        }}
      >
        {item.mediaType === "video" ? (
          <video
            key={item.id}
            src={item.src}
            controls
            playsInline
            autoPlay
            muted
            className="h-auto max-h-[calc(100dvh-6.5rem)] w-auto max-w-[min(100%,28rem)] bg-black object-contain"
          />
        ) : (
          <img
            key={item.id}
            src={item.src}
            alt={item.title || item.categoryLabel}
            className="max-h-[calc(100dvh-6.5rem)] max-w-full object-contain"
          />
        )}
        <p className="mt-3 text-sm font-medium text-white/90">
          {index + 1} / {items.length}
          <span className="ml-2 text-white/70">{item.title || item.categoryLabel}</span>
        </p>
      </div>
    </div>
  );
}
