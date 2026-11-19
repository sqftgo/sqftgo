import Link from "next/link";

type BrandLogoProps = {
  /** Visual height in px. */
  height?: number;
  className?: string;
  priority?: boolean;
};

/** Source aspect from the transparent wordmark (~920×350). */
const LOGO_ASPECT = 920 / 350;

/**
 * Responsive WebP (+ PNG fallback) so we do not download the full 920×350 PNG
 * for a ~40–65px-tall navbar/footer mark.
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
      <picture>
        <source
          type="image/webp"
          srcSet="/brand/sqftgo-logo-342w.webp 342w, /brand/sqftgo-logo-513w.webp 513w"
          sizes={`${width}px`}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/sqftgo-logo-342w.png"
          srcSet="/brand/sqftgo-logo-342w.png 342w, /brand/sqftgo-logo-513w.png 513w"
          sizes={`${width}px`}
          alt="SqftGo"
          height={height}
          width={width}
          decoding="async"
          {...(priority ? { fetchPriority: "high" as const } : {})}
          className="block bg-transparent object-contain"
          style={{ height, width: "auto", maxWidth: "100%" }}
        />
      </picture>
    </Link>
  );
}
