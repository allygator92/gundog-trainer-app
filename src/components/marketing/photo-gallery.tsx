import Image from "next/image";
import { cn } from "@/lib/utils";

export type GalleryPhoto = {
  src: string;
  alt: string;
  caption: string;
  setting: "field" | "urban";
  objectPosition?: string;
};

export function PhotoGallery({
  photos,
  heading,
  intro,
}: {
  photos: readonly GalleryPhoto[];
  heading: string;
  intro?: string;
}) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{heading}</h2>
        {intro ? <p className="mt-3 text-muted-foreground">{intro}</p> : null}
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {photos.map((photo, index) => (
          <figure
            key={photo.src + photo.caption}
            className={cn(
              "group relative overflow-hidden rounded-2xl bg-muted",
              index === 0 ? "sm:col-span-2 lg:row-span-2" : "",
            )}
          >
            <div className={cn("relative", index === 0 ? "aspect-[4/3] sm:aspect-auto sm:h-full sm:min-h-[22rem]" : "aspect-[4/3]")}>
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover motion-safe:transition motion-safe:duration-300 motion-safe:group-hover:scale-[1.03]"
                style={{ objectPosition: photo.objectPosition ?? "50% 30%" }}
                sizes={index === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
              />
            </div>
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-3 pb-3 pt-14 text-sm text-white [text-shadow:0_1px_2px_rgb(0_0_0_/_70%)]">
              <span className="mb-1 block text-[0.65rem] font-medium uppercase tracking-[0.16em] text-white">
                {photo.setting === "field" ? "Field" : "Urban"}
              </span>
              {photo.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
