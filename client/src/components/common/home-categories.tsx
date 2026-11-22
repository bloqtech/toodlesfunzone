import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { useLocalMedia, type LocalMediaItem } from "@/lib/local-media";

const cards: Array<{
  category: LocalMediaItem["category"];
  title: string;
  description: string;
  cta: string;
  href: string;
}> = [
  {
    category: "play",
    title: "Explore Our Play Zone",
    description: "Discover exciting play zones, fun activities, and adventures designed for little explorers.",
    cta: "Explore Play Area",
    href: "/gallery?category=play",
  },
  {
    category: "birthday",
    title: "Celebrate Birthdays at Toodles",
    description: "Make every birthday special with laughter, play, celebrations, and unforgettable memories.",
    cta: "Plan Your Birthday",
    href: "/gallery?category=birthday",
  },
  {
    category: "decor",
    title: "Make Every Celebration Magical",
    description: "Discover beautiful celebration setups and decoration ideas for your little one's special day.",
    cta: "Explore Decorations",
    href: "/gallery?category=decor",
  },
  {
    category: "school",
    title: "Fun Adventures for School Groups",
    description: "A fun-filled destination for school outings, group activities, and memorable experiences.",
    cta: "Explore School Visits",
    href: "/gallery?category=school",
  },
];

function coverFor(items: LocalMediaItem[]) {
  return items.find((item) => item.mediaType === "photo") || items[0];
}

export function HomeCategories() {
  const { data: media = [], isLoading } = useLocalMedia();
  if (isLoading || media.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="font-display text-3xl leading-tight text-toodles-text md:text-5xl">
            Step inside <span className="text-gradient-sunset">Toodles</span>
          </h2>
          <p className="mt-3 text-base text-muted-foreground md:text-lg">
            Real moments from the play floor, birthday celebrations, decorations, and school visits.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {cards.map((card) => {
            const photos = media.filter((item) => item.category === card.category && item.mediaType === "photo");
            const cover = coverFor(photos);
            if (!cover) return null;
            const side = photos.filter((item) => item.id !== cover.id).slice(0, 2);
            return (
              <Link key={card.category} href={card.href} className="group block">
                <article className="overflow-hidden rounded-[1.5rem] bg-card shadow-md">
                  <div className={`grid h-56 gap-1 bg-muted md:h-64 ${side.length ? "grid-cols-3" : "grid-cols-1"}`}>
                    <div className={`relative min-h-0 overflow-hidden ${side.length ? "col-span-2" : ""}`}>
                      <img
                        src={cover.src}
                        alt={card.title}
                        className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    {side.length > 0 && (
                      <div className={`grid min-h-0 gap-1 ${side.length > 1 ? "grid-rows-2" : "grid-rows-1"}`}>
                        {side.map((item) => (
                          <div key={item.id} className="relative min-h-0 overflow-hidden">
                            <img src={item.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="p-5 md:p-6">
                    <h3 className="font-display text-2xl leading-tight text-toodles-text">{card.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">{card.description}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 font-accent text-base font-semibold text-toodles-primary">
                      {card.cta}
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
