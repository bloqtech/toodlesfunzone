import { useMemo } from "react";

interface FestiveAmbientProps {
  /** Number of confetti pieces. Defaults to 8. */
  confetti?: number;
  /** Render decorative blobs. Defaults to true. */
  blobs?: boolean;
  /** Optional className passed to wrapper. */
  className?: string;
}

const CONFETTI_COLORS = [
  "var(--toodles-primary)",
  "var(--toodles-secondary)",
  "var(--toodles-accent)",
  "var(--toodles-purple)",
  "var(--toodles-orange)",
];

/**
 * A calm, intentional ambient layer:
 * - 3 soft blurred color blobs that drift slowly
 * - A handful of confetti pieces falling at varied speeds
 *
 * Decoration is purely cosmetic, behind content (z-index 0), and disabled
 * by `prefers-reduced-motion` via the global CSS rules.
 */
export function FestiveAmbient({
  confetti = 8,
  blobs = true,
  className = "",
}: FestiveAmbientProps) {
  const pieces = useMemo(
    () =>
      Array.from({ length: confetti }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 6,
        duration: 7 + Math.random() * 6,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rotate: Math.random() * 360,
      })),
    [confetti],
  );

  return (
    <div
      aria-hidden="true"
      className={`festive-ambient ${className}`.trim()}
    >
      {blobs && (
        <>
          <span className="ambient-blob ambient-blob-1" />
          <span className="ambient-blob ambient-blob-2" />
          <span className="ambient-blob ambient-blob-3" />
        </>
      )}
      {pieces.map((p) => (
        <span
          key={p.id}
          className="ambient-confetti"
          style={{
            left: `${p.left}%`,
            top: "-20px",
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export default FestiveAmbient;
