import type { TrainingVideo } from "@content/videos";
import { videosContent } from "@content/videos";

export function VideoList({ videos }: { videos: TrainingVideo[] }) {
  return (
    <ul className="grid gap-8 md:grid-cols-2">
      {videos.map((video) => (
        <li key={video.id} className="space-y-3">
          <div className="aspect-video overflow-hidden rounded-lg border border-border bg-muted">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${video.id}`}
              title={video.title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
          <div className="space-y-1">
            <h2 className="font-display text-lg font-semibold tracking-tight">{video.title}</h2>
            <a
              href={video.watchUrl}
              className="text-sm text-primary underline-offset-4 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              {videosContent.watchLabel}
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
