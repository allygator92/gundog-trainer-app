import type { Metadata } from "next";
import { videosContent } from "@content/videos";
import { PageHeader } from "@/components/marketing/page-header";
import { VideoList } from "@/components/marketing/video-list";
import { getTrainingVideos } from "@/lib/youtube";

export const metadata: Metadata = {
  title: videosContent.title,
  description: videosContent.intro,
};

export default async function VideosPage() {
  const { videos, source, channelUrl } = await getTrainingVideos();
  const showingCrufts = source !== "channel";

  return (
    <>
      <PageHeader
        title={showingCrufts ? videosContent.headline : videosContent.channelHeadline}
        description={showingCrufts ? videosContent.intro : videosContent.channelIntro}
      />
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 pb-16 sm:px-6">
        {showingCrufts ? (
          <div className="max-w-3xl space-y-4">
            {videosContent.body.map((paragraph) => (
              <p key={paragraph} className="text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}
        {channelUrl ? (
          <a
            href={channelUrl}
            className="inline-block text-sm text-primary underline-offset-4 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            {videosContent.channelLinkLabel}
          </a>
        ) : null}
        <VideoList videos={videos} />
      </div>
    </>
  );
}
