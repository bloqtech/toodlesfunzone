import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useLocalMedia, type LocalMediaItem } from "@/lib/local-media";
import { PhotoLightbox } from "@/components/common/photo-lightbox";

export function isCustomerFeedback(item: LocalMediaItem) {
  return item.group === "feedback" || /\/feedback\//i.test(item.src);
}

export function partyVideos(items: LocalMediaItem[]) {
  return items.filter((item) => item.category === "birthday" && item.mediaType === "video" && (item.group === "celebration" || (!item.group && !isCustomerFeedback(item))));
}

export function feedbackVideos(items: LocalMediaItem[]) {
  return items.filter((item) => item.category === "birthday" && item.mediaType === "video" && isCustomerFeedback(item));
}

export function VideoCards({ videos, label = "Play video" }: { videos: LocalMediaItem[]; label?: string }) {
  const scroller = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (videos.length < 2) return;
    const timer = window.setInterval(() => {
      const row = scroller.current;
      if (!row || paused.current || openIndex !== null) return;
      const card = row.querySelector<HTMLElement>("[data-reel-card]");
      const step = (card?.offsetWidth || 220) + 16;
      const atEnd = row.scrollLeft + row.clientWidth >= row.scrollWidth - 8;
      row.scrollTo({ left: atEnd ? 0 : row.scrollLeft + step, behavior: "smooth" });
    }, 3200);
    return () => window.clearInterval(timer);
  }, [videos.length, openIndex]);

  if (videos.length === 0) return null;

  const nudge = (direction: number) => {
    const row = scroller.current;
    if (!row) return;
    const card = row.querySelector<HTMLElement>("[data-reel-card]");
    const step = (card?.offsetWidth || 220) + 16;
    row.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <>
      <div
        className="relative"
        onMouseEnter={() => {
          paused.current = true;
        }}
        onMouseLeave={() => {
          paused.current = false;
        }}
      >
        {videos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => nudge(-1)}
              className="absolute left-0 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-toodles-text shadow-elev"
              aria-label="Previous video"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => nudge(1)}
              className="absolute right-0 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-toodles-text shadow-elev"
              aria-label="Next video"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
        <div
          ref={scroller}
          className="overflow-x-auto scroll-smooth px-12 [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex w-max gap-4">
            {videos.map((item, index) => (
              <button
                key={item.id}
                type="button"
                data-reel-card
                className="group relative w-44 shrink-0 snap-start overflow-hidden rounded-[1.25rem] bg-white/15 text-left shadow-md sm:w-52"
                aria-label={item.title || label}
                onClick={() => setOpenIndex(index)}
              >
                {item.poster ? (
                  <img src={item.poster} alt="" className="aspect-[9/16] w-full object-cover" />
                ) : (
                  <video
                    src={`${item.src}#t=1`}
                    muted
                    playsInline
                    preload="auto"
                    className="aspect-[9/16] w-full object-cover"
                  />
                )}
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-white/90 text-toodles-primary shadow-elev">
                    <Play className="h-5 w-5 fill-current" />
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {openIndex !== null && (
        <PhotoLightbox
          items={videos}
          index={openIndex}
          onIndex={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  );
}

export function BirthdayMedia() {
  const { data: media = [] } = useLocalMedia();
  return <VideoCards videos={partyVideos(media)} label="Play party video" />;
}

export function BirthdayFeedback() {
  const { data: media = [] } = useLocalMedia();
  const videos = feedbackVideos(media);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (videos.length === 0) return null;

  return (
    <section className="pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-6 font-display text-3xl text-toodles-text md:text-4xl">Families at the party</h2>
        <div className="mx-auto grid w-full max-w-3xl grid-cols-2 gap-4">
          {videos.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className="group relative w-full max-w-[16.5rem] overflow-hidden rounded-[1.25rem] bg-muted text-left shadow-md"
              onClick={() => setOpenIndex(index)}
            >
              {item.poster ? (
                <img src={item.poster} alt="" className="aspect-[9/16] w-full object-cover" />
              ) : (
                <video
                  src={`${item.src}#t=1`}
                  muted
                  playsInline
                  preload="auto"
                  className="aspect-[9/16] w-full object-cover"
                />
              )}
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-white/90 text-toodles-primary shadow-elev">
                  <Play className="h-5 w-5 fill-current" />
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
      {openIndex !== null && (
        <PhotoLightbox
          items={videos}
          index={openIndex}
          onIndex={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </section>
  );
}
