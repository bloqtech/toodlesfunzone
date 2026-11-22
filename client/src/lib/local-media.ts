import { useQuery } from "@tanstack/react-query";

export type LocalMediaItem = {
  id: string;
  src: string;
  category: "play" | "birthday" | "decor" | "school";
  categoryLabel: string;
  mediaType: "photo" | "video";
  title: string | null;
  group?: "celebration" | "feedback" | null;
  collection?: "schoolvisit" | "events" | "summercamp" | null;
  poster?: string | null;
};

export const mediaFilters = [
  { id: "all", name: "All Photos" },
  { id: "play", name: "Play Area" },
  { id: "birthday", name: "Birthday Parties" },
  { id: "decor", name: "Decorations" },
  { id: "school", name: "School Trips" },
  { id: "video", name: "Videos" },
] as const;

export function mediaCollection(item: { src: string; collection?: string | null }) {
  if (item.collection === "schoolvisit" || item.collection === "events" || item.collection === "summercamp") return item.collection;
  const path = item.src.toLowerCase();
  if (path.includes("/summercamp/")) return "summercamp";
  if (path.includes("/events/")) return "events";
  if (path.includes("/schoolvisit/")) return "schoolvisit";
  return null;
}

export function useLocalMedia() {
  return useQuery<LocalMediaItem[]>({
    queryKey: ["/api/media/library"],
  });
}

export function mosaicSpan(index: number, total: number) {
  if (total <= 1) return "col-span-2 md:col-span-4 aspect-[4/3] md:aspect-[16/9]";
  if (total === 2) return "col-span-1 md:col-span-2 aspect-[4/3]";
  const pattern = index % 7;
  if (pattern === 0) return "col-span-2 aspect-[16/10]";
  if (pattern === 3) return "col-span-2 aspect-[2/1]";
  return "col-span-1 aspect-square";
}
