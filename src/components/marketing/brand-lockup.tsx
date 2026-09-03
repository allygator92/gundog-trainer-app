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
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark size={compact ? 36 : 44} className="site-logo-mark shrink-0" priority={priority} />
      <span className="site-logo font-display text-lg font-semibold tracking-tight sm:text-xl">{site.name}</span>
    </span>
  );
}
