import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".webm", ".m4v"]);

const FOLDERS = [
  { folder: "playarea", category: "play", label: "Play Area" },
  { folder: "birthdayparties", category: "birthday", label: "Birthday Parties" },
  { folder: "decoration", category: "decor", label: "Decorations" },
  { folder: "schooltrip", category: "school", label: "School Trips" },
] as const;

export type LocalMediaItem = {
  id: string;
  src: string;
  category: (typeof FOLDERS)[number]["category"];
  categoryLabel: string;
  mediaType: "photo" | "video";
  title: string | null;
  group: "celebration" | "feedback" | null;
  collection: "schoolvisit" | "events" | "summercamp" | null;
  poster: string | null;
};

const FEATURED_FIRST: Record<string, string[]> = {
  playarea: [
    "playareaslide.jpeg",
    "ConstructionLivingRoomPlayArea.jpg",
    "IMG-20251207-WA0029.jpg",
    "IMG-20251207-WA0014.jpg",
    "PlayAreaCoverageComplete.jpg",
  ],
  birthdayparties: [
    "cocomelonbirthday.mp4",
    "birthdayPic123.jpeg",
    "WhatsApp Image 2026-11-22 at 13.09.44.jpeg",
    "IMG-20251207-WA0033.jpg",
    "customerFeedback1.mp4",
    "ciustomerFeedback2.mp4",
  ],
  schooltrip: ["haloweenParty.mp4", "IMG20260430105419.jpg"],
  decoration: [
    "StandardDecoration.jpg",
    "PremiumDecoration.jpeg",
    "PremiumDecorationSupermen.jpeg",
    "WhatsApp Image 2026-08-29 at 17.59.39.jpeg",
  ],
};

const TITLES: Record<string, string> = {
  cocomelonbirthday: "Cocomelon birthday",
  birthdaycelebrations: "Birthday celebration",
  birthdaycelebration2: "Birthday celebration 2",
  customerfeedback1: "Customer feedback",
  ciustomerfeedback2: "Customer feedback",
  haloweenparty: "Halloween party",
};

function mediaCollection(relativePath: string): "schoolvisit" | "events" | "summercamp" | null {
  const parts = relativePath.toLowerCase().split("/");
  if (parts.includes("summercamp") || parts.includes("summercamps")) return "summercamp";
  if (parts.includes("events") || parts.includes("event")) return "events";
  if (parts.includes("schoolvisit") || parts.includes("schoolvisits")) return "schoolvisit";
  return null;
}

function mediaGroup(relativePath: string): "celebration" | "feedback" | null {
  const parts = relativePath.toLowerCase().split("/");
  if (parts.includes("feedback")) return "feedback";
  if (parts.includes("celebration") || parts.includes("celebrations")) return "celebration";
  return null;
}

function collectFiles(dir: string, prefix = ""): string[] {
  if (!fs.existsSync(dir)) return [];
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...collectFiles(path.join(dir, entry.name), relative));
    else if (entry.isFile()) files.push(relative);
  }
  return files;
}

function posterSrc(root: string, videoPath: string) {
  const posterName = `${path.basename(videoPath)}.png`;
  const posterDir = path.join(root, "_posters");
  const posterPath = path.join(posterDir, posterName);
  try {
    const videoStat = fs.statSync(videoPath);
    const posterStat = fs.existsSync(posterPath) ? fs.statSync(posterPath) : null;
    if (!posterStat || posterStat.mtimeMs < videoStat.mtimeMs) {
      fs.mkdirSync(posterDir, { recursive: true });
      execFileSync("qlmanage", ["-t", "-s", "720", "-o", posterDir, videoPath], { stdio: "ignore" });
    }
  } catch {
    // Poster tools are optional. The card still falls back to the video frame.
  }
  if (!fs.existsSync(posterPath)) return null;
  return `/uploads/_posters/${encodeURIComponent(posterName)}`;
}

function readableTitle(filename: string) {
  const base = path.basename(filename, path.extname(filename));
  const known = TITLES[base.toLowerCase()];
  if (known) return known;
  if (/whatsapp|img[-_]?\d|wa\d{3,}|image-\d/i.test(base)) return null;
  const title = base
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\d{5,}/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return title || null;
}

export function listLocalMedia(): LocalMediaItem[] {
  const root = path.join(process.cwd(), "uploads");
  const items: LocalMediaItem[] = [];

  for (const spec of FOLDERS) {
    const dir = path.join(root, spec.folder);
    if (!fs.existsSync(dir)) continue;

    const files = collectFiles(dir).sort((a, b) => {
      const featured = FEATURED_FIRST[spec.folder] || [];
      const rank = (name: string) => {
        const base = path.basename(name);
        const index = featured.findIndex((item) => item === name || item === base);
        return index === -1 ? featured.length : index;
      };
      const byFeature = rank(a) - rank(b);
      if (byFeature !== 0) return byFeature;
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
    });

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      const mediaType = IMAGE_EXTENSIONS.has(ext) ? "photo" : VIDEO_EXTENSIONS.has(ext) ? "video" : null;
      if (!mediaType) continue;
      const encoded = file.split("/").map((part) => encodeURIComponent(part)).join("/");

      items.push({
        id: `${spec.folder}/${file}`,
        src: `/uploads/${spec.folder}/${encoded}`,
        category: spec.category,
        categoryLabel: spec.label,
        mediaType,
        title: readableTitle(file),
        group: mediaGroup(file),
        collection: mediaCollection(file),
        poster: mediaType === "video" ? posterSrc(root, path.join(dir, file)) : null,
      });
    }
  }

  return items;
}
