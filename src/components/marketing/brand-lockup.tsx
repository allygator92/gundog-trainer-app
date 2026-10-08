import Image from "next/image";
import { site } from "@content/site";
import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  size = 40,
  priority = false,
}: {
  className?: string;
  size?: number;
  priority?: boolean;
}) {
  return (
    <Image
      src="/brand/logo.jpg"
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={cn("rounded-md object-cover", className)}
      priority={priority}
    />
  );
}

export function BrandLockup({
  className,
  compact = false,
  priority = false,
}: {
  className?: string;
  compact?: boolean;
  priority?: boolean;
}) {
  const height = compact ? 36 : 40;
  const width = compact ? 48 : 56;
  return (
    <span className={cn("flex min-w-0 max-w-full items-center gap-2 sm:gap-2.5", className)}>
      <span
        className="site-logo-mark relative block shrink-0 overflow-hidden rounded-md"
        style={{ width, height }}
      >
        <Image
          src="/brand/logo.jpg"
          alt=""
          fill
          priority={priority}
          className="object-cover"
          style={{ objectPosition: "center 16%" }}
          sizes={`${width}px`}
        />
      </span>
      <span className="site-logo whitespace-nowrap font-display text-base font-semibold tracking-tight sm:text-lg">
        {site.name}
      </span>
    </span>
  );
}
