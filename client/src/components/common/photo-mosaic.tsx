import { useState } from "react";
import { Play } from "lucide-react";
import { mosaicSpan, useLocalMedia, type LocalMediaItem } from "@/lib/local-media";
import { PhotoLightbox } from "@/components/common/photo-lightbox";

type PhotoMosaicProps = {
  category?: LocalMediaItem["category"];
  className?: string;
  photosOnly?: boolean;
};

export function PhotoMosaic({ category, className = "", photosOnly = false }: PhotoMosaicProps) {
  const { data: media = [], isLoading } = useLocalMedia();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const items = media.filter((item) => {
    if (category && item.category !== category) return false;
    if (photosOnly && item.mediaType !== "photo") return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className={`grid grid-cols-2 gap-3 md:grid-cols-4 ${className}`}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="min-h-[180px] animate-pulse rounded-[1.5rem] bg-muted" />
        ))}
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <>
      <div className={`grid grid-cols-2 items-start gap-3 md:grid-cols-4 ${className}`}>
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`group relative overflow-hidden rounded-[1.5rem] bg-muted text-left shadow-md ${mosaicSpan(index, items.length)}`}
            aria-label={`Open ${item.title || item.categoryLabel}`}
            onClick={() => setOpenIndex(index)}
          >
            {item.mediaType === "video" && !item.poster ? (
              <video src={`${item.src}#t=1`} muted playsInline preload="auto" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <img
                src={item.mediaType === "video" ? item.poster || item.src : item.src}
                alt={item.title || item.categoryLabel}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-toodles-text">
              {item.categoryLabel}
            </span>
            {item.mediaType === "video" && (
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-white/90 text-toodles-primary shadow-elev">
                  <Play className="h-5 w-5 fill-current" />
                </span>
              </span>
            )}
            {item.title && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 pb-3 pt-8 text-sm font-medium text-white">
                {item.title}
              </span>
            )}
          </button>
        ))}
      </div>
      {openIndex !== null && (
        <PhotoLightbox
          items={items}
          index={openIndex}
          onIndex={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  );
}
