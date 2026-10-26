import Link from "next/link";

type BrandLogoProps = {
  /** Visual height in px. */
  height?: number;
  className?: string;
  priority?: boolean;
};

/** Transparent horizontal wordmark (≈920×350). */
const LOGO_SRC = "/brand/sqftgo-logo.png";
const LOGO_ASPECT = 920 / 350;

/**
 * Uses a plain <img> (not next/image) so the transparent PNG is never
 * rewritten by the image optimizer / cache into a white-backed asset.
 */
export function BrandLogo({
  height = 40,
  className = "",
  priority = false,
}: BrandLogoProps) {
  const width = Math.round(height * LOGO_ASPECT);

  return (
    <Link
      href="/"
      className={`inline-flex items-center shrink-0 bg-transparent transition-opacity hover:opacity-90 ${className}`}
      aria-label="SqftGo home"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO_SRC}
        alt="SqftGo"
        height={height}
        width={width}
        decoding="async"
        {...(priority ? { fetchPriority: "high" as const } : {})}
        className="block bg-transparent object-contain"
        style={{ height, width: "auto", maxWidth: "100%" }}
      />
    </Link>
  );
}
