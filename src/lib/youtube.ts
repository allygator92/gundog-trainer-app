import { videosContent, type TrainingVideo } from "@content/videos";

const CHANNEL_ID = /^UC[\w-]{22}$/;

export type VideoSource = "channel" | "sample" | "fallback";

export function parseYouTubeFeed(xml: string, limit = 6): TrainingVideo[] {
  const videos: TrainingVideo[] = [];

  for (const entry of xml.split("<entry>").slice(1)) {
    const id = entry.match(/<yt:videoId>([\w-]{11})<\/yt:videoId>/)?.[1];
    if (!id) continue;

    const rawTitle = entry.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
    videos.push({
      id,
      title: decodeXml(rawTitle).trim() || "YouTube video",
      watchUrl: `https://www.youtube.com/watch?v=${id}`,
    });

    if (videos.length >= limit) break;
  }

  return videos;
}

export async function getTrainingVideos(): Promise<{
  videos: TrainingVideo[];
  source: VideoSource;
  channelUrl?: string;
}> {
  const channelId = process.env.YOUTUBE_CHANNEL_ID?.trim() ?? "";
  if (!CHANNEL_ID.test(channelId)) {
    return { videos: videosContent.placeholders, source: "sample" };
  }

  try {
    const response = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      { next: { revalidate: 3600 } },
    );
    if (!response.ok) {
      return { videos: videosContent.placeholders, source: "fallback" };
    }

    const videos = parseYouTubeFeed(await response.text());
    if (videos.length === 0) {
      return { videos: videosContent.placeholders, source: "fallback" };
    }

    return {
      videos,
      source: "channel",
      channelUrl: `https://www.youtube.com/channel/${channelId}`,
    };
  } catch {
    return { videos: videosContent.placeholders, source: "fallback" };
  }
}

function decodeXml(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}
