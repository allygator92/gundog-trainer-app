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
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  const size = 44;
  return (
    <span className={cn("flex min-w-0 max-w-full items-center gap-2 sm:gap-2.5", className)}>
      <span
        className="site-logo-mark relative block shrink-0 overflow-hidden rounded-md"
        style={{ width: size, height: size }}
      >
        <Image
          src="/brand/logo.jpg"
          alt=""
          fill
          priority={priority}
          className="object-contain"
          sizes={`${size}px`}
        />
      </span>
      <span className="site-logo whitespace-nowrap font-display text-base font-semibold tracking-tight sm:text-lg">
        {site.name}
      </span>
    </span>
  );
}
