import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BirthdayMedia, VideoCards } from "@/components/common/birthday-media";
import { HomeDynamic } from "@/components/common/home-dynamic";
import { PhotoLightbox } from "@/components/common/photo-lightbox";
import { Testimonials } from "@/components/common/testimonials";
import { mediaCollection, mediaFilters, mosaicSpan, useLocalMedia, type LocalMediaItem } from "@/lib/local-media";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Gift,
  MapPin,
  MessageCircle,
  Phone,
  Play,
  Star,
} from "lucide-react";

const MAPS_URL = "https://maps.google.com/?q=Toodles+Funzone+Sarjapur+Main+Road+Kodathi+Bengaluru";
const GOOGLE_REVIEWS_URL = "https://www.google.com/maps/search/?api=1&query=Toodles+Funzone+Sarjapur+Road+Kodathi";
const WHATSAPP_URL = "https://wa.me/919901218980?text=" + encodeURIComponent("Hello Toodles Funzone, I would like to know more.");

const playStories = [
  {
    match: "playareaslide",
    title: "Slides",
    description: "Side-by-side slides inside the indoor play structure.",
  },
  {
    match: "constructionlivingroom",
    title: "Pretend play",
    description: "Living room, makeup room, and a construction zone for role play.",
  },
  {
    match: "playareacoveragecomplete",
    title: "Ball play",
    description: "A ball pool on the play floor, with slides and rides around it.",
  },
];

function rupees(value: string | number) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return `₹${value}`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

function playLength(pkg: { name?: string; duration?: number }) {
  const named = pkg.name?.match(/(\d+)\s*hours?/i);
  if (named) return `${named[1]} hours`;
  if (!pkg.duration) return null;
  return `${pkg.duration} hour${Number(pkg.duration) === 1 ? "" : "s"}`;
}

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 900);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target]);
  return value;
}

function PhotoFrame({ item, alt, className = "" }: { item?: LocalMediaItem; alt: string; className?: string }) {
  if (!item) return null;
  const src = item.mediaType === "video" ? item.poster || "" : item.src;
  if (!src) return null;
  return <img src={src} alt={alt} className={`h-full w-full object-cover ${className}`} />;
}

export function HomeExperience({
  onBook,
  onBirthday,
}: {
  onBook: () => void;
  onBirthday: () => void;
}) {
  const { data: media = [] } = useLocalMedia();
  const { data: packages = [] } = useQuery<any[]>({ queryKey: ["/api/packages"] });
  const { data: reviews = [] } = useQuery<any[]>({ queryKey: ["/api/reviews"] });
  const photos = (category: LocalMediaItem["category"]) => media.filter((item) => item.category === category && item.mediaType === "photo");
  const playPhotos = photos("play");
  const birthdayPhotos = photos("birthday");
  const decorPhotos = photos("decor");
  const schoolPhotos = photos("school");
  const hero = playPhotos.find((item) => /coveragecomplete/i.test(item.id)) || playPhotos[0];

  const stories = playStories
    .map((story) => ({ ...story, photo: playPhotos.find((item) => item.id.toLowerCase().includes(story.match)) }))
    .filter((story) => story.photo);

  const playPackages = packages.filter((pkg) => pkg.type === "walk_in" || pkg.type === "monthly");
  const birthdayPackage = packages.find((pkg) => pkg.type === "birthday");

  return (
    <>
      <section className="relative overflow-hidden bg-toodles-hero">
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-12 lg:px-8">
          <div className="text-center lg:col-span-5 lg:text-left">
            <p className="mb-4 font-accent text-lg text-white/90">Indoor play in Bengaluru</p>
            <h1 className="mb-5 font-display text-4xl leading-[1.05] text-white md:text-6xl">
              Little feet. Big adventures. <span className="text-toodles-accent">Endless fun.</span>
            </h1>
            <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-white/90 md:text-lg lg:mx-0">
              From exciting play zones and imaginative adventures to unforgettable birthday celebrations, there is something for every little explorer at Toodles Funzone.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <a href="#explore">
                <Button size="lg" variant="accent">
                  Explore Play Area
                </Button>
              </a>
              <a href="#birthday">
                <Button size="lg" variant="outline" className="border-white/70 bg-white/10 text-white hover:border-white hover:bg-white/20 hover:text-white">
                  <Gift className="h-5 w-5" />
                  Celebrate a Birthday
                </Button>
              </a>
            </div>
          </div>
          <div className="lg:col-span-7">
            {hero && (
              <div className="overflow-hidden rounded-[1.75rem] shadow-elev ring-4 ring-white/30">
                <img src={hero.src} alt="The Toodles Funzone play floor" className="aspect-[4/3] w-full object-cover" />
              </div>
            )}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[var(--toodles-background)]" />
      </section>

      <section id="explore" className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="font-display text-3xl text-toodles-text md:text-5xl">Explore the fun</h2>
            <p className="mt-3 text-muted-foreground md:text-lg">
              Real corners of the play floor. A booked session includes the zones listed on the current play packages.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {stories.map((story) => (
              <Link key={story.title} href="/gallery?category=play" className="group block">
                <article className="overflow-hidden rounded-[1.5rem] bg-card shadow-md">
                  <div className="relative h-64 overflow-hidden">
                    <img src={story.photo!.src} alt={story.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-2xl text-toodles-text">{story.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{story.description}</p>
                    <span className="mt-4 inline-flex items-center gap-1 font-accent font-semibold text-toodles-primary">
                      Explore <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HomeGallery media={media} />

      <section id="birthday" className="bg-toodles-hero py-16 text-white md:py-24">
        <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl leading-tight md:text-5xl">Make their big day extra magical.</h2>
              <p className="mt-4 max-w-xl text-lg text-white/90">
                From laughter-filled play to unforgettable celebrations, create birthday memories your little one will cherish.
              </p>
              {birthdayPackage && (
                <ul className="mt-6 space-y-2 text-white/95">
                  {(birthdayPackage.features || []).map((feature: string) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-toodles-accent" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" variant="accent" onClick={onBirthday}>
                  <Gift className="h-5 w-5" />
                  Plan Your Birthday
                </Button>
                <Link href="/birthday">
                  <Button size="lg" variant="outline" className="border-white/70 bg-white/10 text-white hover:border-white hover:bg-white/20 hover:text-white">
                    See party packages
                  </Button>
                </Link>
              </div>
              {birthdayPackage && (
                <p className="mt-4 text-sm text-white/80">
                  {birthdayPackage.name} · {rupees(birthdayPackage.price)}
                  {playLength(birthdayPackage) ? ` · ${playLength(birthdayPackage)}` : ""}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {birthdayPhotos.slice(0, 3).map((item, index) => (
                <div key={item.id} className={`overflow-hidden rounded-[1.25rem] ${index === 0 ? "col-span-2 h-64" : "h-40"}`}>
                  <PhotoFrame item={item} alt="Birthday celebration at Toodles Funzone" />
                </div>
              ))}
            </div>
          </div>
          <BirthdayMedia />
        </div>
      </section>

      <section id="decorations" className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl text-toodles-text md:text-5xl">Celebrate in your own style.</h2>
              <p className="mt-3 text-muted-foreground">Decoration setups from parties already hosted at Toodles.</p>
            </div>
            <Link href="/gallery?category=decor">
              <Button variant="festive">Explore Party Setups</Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {decorPhotos.slice(0, 4).map((item) => (
              <Link key={item.id} href="/gallery?category=decor" className="block overflow-hidden rounded-[1.25rem]">
                <img src={item.src} alt="Party decoration at Toodles Funzone" className="aspect-[3/4] w-full object-cover transition-transform duration-500 hover:scale-[1.03]" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="school" className="bg-gradient-to-b from-transparent via-[hsl(320,55%,97%)] to-transparent py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="overflow-hidden rounded-[1.5rem] shadow-md">
            {schoolPhotos[0] ? (
              <img src={schoolPhotos[0].src} alt="A school visit at Toodles Funzone" className="aspect-[4/3] w-full object-cover" />
            ) : (
              <div className="aspect-[4/3] bg-muted" />
            )}
          </div>
          <div>
            <h2 className="font-display text-3xl text-toodles-text md:text-5xl">Big adventures for little explorers.</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Make school outings more exciting with a day filled with play, activities, laughter, and shared memories. Halloween, Christmas, and summer camp enquiries sit with school visits.
            </p>
            <Link href="/school-trips" className="mt-6 inline-block">
              <Button variant="festive" size="lg">Plan a School Visit</Button>
            </Link>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
          <VideoCards
            videos={media.filter((item) => item.category === "school" && item.mediaType === "video" && mediaCollection(item) === "schoolvisit")}
            label="Play school video"
          />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="font-display text-3xl text-toodles-text md:text-5xl">Made for little ones. Loved by parents.</h2>
            <p className="mt-4 text-muted-foreground">
              Toodles is an indoor play space on Sarjapur Main Road. Sessions are supervised, and the venue is open all seven days.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Indoor play, open every day from 11:00 AM to 8:30 PM",
                "Supervised play sessions",
                "Play packages include the zones listed on each card",
                "Birthday bookings include a party hall and seating for guests",
              ].map((point) => (
                <li key={point} className="flex items-start gap-3 border-b border-border/70 pb-3 text-toodles-text">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-toodles-primary" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="overflow-hidden rounded-[1.5rem] shadow-md">
            {playPhotos[0] && <img src={playPhotos[0].src} alt="Children in the Toodles play area" className="aspect-[4/3] w-full object-cover" />}
          </div>
        </div>
      </section>

      <section id="packages" className="bg-gradient-to-b from-transparent via-[hsl(320,55%,97%)] to-transparent py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="font-display text-3xl text-toodles-text md:text-5xl">Pick your playtime.</h2>
            <p className="mt-3 text-muted-foreground">Simple options for fun-filled adventures. Prices are the current packages.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {playPackages.map((pkg) => (
              <Card key={pkg.id} variant="elevated" className="h-full">
                <CardContent className="flex h-full flex-col p-6">
                  <h3 className="font-display text-2xl text-toodles-text">{pkg.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{pkg.description}</p>
                  <div className="mt-5 font-display text-4xl text-gradient-sunset">{rupees(pkg.price)}</div>
                  {playLength(pkg) && <p className="mt-1 text-xs text-muted-foreground">{playLength(pkg)}</p>}
                  <ul className="my-6 space-y-2">
                    {(pkg.features || []).slice(0, 6).map((feature: string) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-toodles-success" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="festive" className="mt-auto w-full" onClick={onBook}>
                    Book {pkg.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <HomeDynamic showGroup={false} />

      <StatsBand />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-display text-3xl text-toodles-text md:text-5xl">Loved by families. Rated by parents.</h2>
          <p className="mt-3 text-muted-foreground">
            Little smiles, happy memories, and wonderful experiences shared by families at Toodles Funzone.
          </p>
          <div className="mt-8 inline-flex flex-col items-center rounded-[1.5rem] bg-card px-8 py-6 shadow-md">
            <div className="flex items-center gap-1 text-toodles-accent">
              {Array.from({ length: 5 }, (_, index) => (
                <Star key={index} className="h-5 w-5 fill-current" />
              ))}
            </div>
            <p className="mt-3 font-display text-5xl text-toodles-text">4.9</p>
            <p className="mt-1 text-sm text-muted-foreground">About 4.9 on Google, from about 520 reviews</p>
            <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noreferrer" className="mt-4 inline-block">
              <Button variant="outline">Read more reviews on Google</Button>
            </a>
          </div>
        </div>
        <Testimonials reviews={reviews} />
      </section>

      <section id="visit" className="pb-8">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Card variant="glass" className="p-6 md:p-8">
            <h2 className="font-display text-3xl text-toodles-text">Visit us</h2>
            <ul className="mt-5 space-y-3 text-toodles-text">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-toodles-primary" />
                <span>Sarjapur Main Road, opposite Vishnu Leela Veg, Kodathi, Bengaluru 560035</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-toodles-primary" />
                <span>Open all seven days, 11:00 AM – 8:30 PM</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-toodles-primary" />
                <a href="tel:+919901218980">+91 99012 18980</a>
              </li>
            </ul>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <a href={MAPS_URL} target="_blank" rel="noreferrer"><Button variant="festive"><MapPin className="h-4 w-4" /> Get Directions</Button></a>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer"><Button variant="outline"><MessageCircle className="h-4 w-4" /> WhatsApp Us</Button></a>
              <Link href="/contact"><Button variant="outline">Contact Us</Button></Link>
            </div>
          </Card>
          <div className="relative overflow-hidden rounded-[1.5rem]">
            {hero && <img src={hero.src} alt="" className="absolute inset-0 h-full w-full object-cover" />}
            <div className="relative flex min-h-72 flex-col justify-end bg-black/45 p-8 text-white">
              <h2 className="font-display text-3xl md:text-4xl">Let’s make today a little more fun.</h2>
              <p className="mt-2 max-w-md text-white/90">Bring the little ones for a day of play, laughter, adventures, and happy memories.</p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Link href="/contact"><Button variant="accent"><Calendar className="h-4 w-4" /> Visit Toodles</Button></Link>
                <Button variant="outline" className="border-white/70 bg-white/10 text-white hover:bg-white/20 hover:text-white" onClick={onBirthday}>
                  Plan a Birthday
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function HomeGallery({ media }: { media: LocalMediaItem[] }) {
  const [filter, setFilter] = useState("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const hasVideos = media.some((item) => item.mediaType === "video");
  const filters = mediaFilters.filter((item) => item.id !== "video" || hasVideos);
  const items = media.filter((item) => {
    if (filter === "all") return item.mediaType === "photo";
    if (filter === "video") return item.mediaType === "video";
    return item.category === filter && item.mediaType === "photo";
  }).slice(0, 8);
  if (media.length === 0) return null;

  return (
    <section id="gallery" className="pb-16 md:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="font-display text-3xl text-toodles-text md:text-5xl">Photos and videos</h2>
            <p className="mt-2 text-muted-foreground">Play, parties, decorations, and school visits. Tap a picture to open it.</p>
          </div>
          <Link href="/gallery" className="font-accent font-semibold text-toodles-primary">Open the full gallery</Link>
        </div>
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${filter === item.id ? "bg-toodles-primary text-white" : "bg-white text-toodles-text shadow-sm"}`}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 items-start gap-3 md:grid-cols-4">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`group relative overflow-hidden rounded-[1.5rem] bg-muted text-left shadow-md ${mosaicSpan(index, items.length)}`}
              onClick={() => setOpenIndex(index)}
            >
              {item.mediaType === "video" && !item.poster ? (
                <video src={`${item.src}#t=1`} muted playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <img
                  src={item.mediaType === "video" ? item.poster || item.src : item.src}
                  alt={item.title || item.categoryLabel}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              {item.mediaType === "video" && (
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-white/90 text-toodles-primary shadow-elev">
                    <Play className="h-5 w-5 fill-current" />
                  </span>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      {openIndex !== null && (
        <PhotoLightbox items={items} index={openIndex} onIndex={setOpenIndex} onClose={() => setOpenIndex(null)} />
      )}
    </section>
  );
}

function StatsBand() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const visits = useCountUp(5000, visible);
  const birthdays = useCountUp(180, visible);
  const reviews = useCountUp(520, visible);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { threshold: 0.4 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const stats = [
    { value: visits.toLocaleString("en-IN"), label: "Visits" },
    { value: String(birthdays), label: "Birthdays celebrated" },
    { value: "4.9", label: "Google rating" },
    { value: String(reviews), label: "Google reviews, about" },
    { value: "7 days", label: "Open through the week" },
    { value: "11–8:30", label: "Daily play hours" },
  ];

  return (
    <section ref={ref} className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="font-display text-3xl text-toodles-text md:text-5xl">Happy moments, in real numbers</h2>
          <p className="mt-2 text-muted-foreground">5,000 visits and 180 birthdays celebrated, alongside about 4.9 from about 520 Google reviews.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label} variant="elevated" className="text-center">
              <CardContent className="p-6">
                <div className="font-display text-3xl text-gradient-sunset md:text-4xl">{stat.value}</div>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
