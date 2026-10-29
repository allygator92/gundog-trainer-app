import { describe, expect, it } from "vitest";
import { parseYouTubeFeed } from "@/lib/youtube";

const feed = `<?xml version="1.0"?>
<feed>
  <entry>
    <yt:videoId>Euognak71A8</yt:videoId>
    <title>Group Judging (Gundog) | Crufts 2026</title>
  </entry>
  <entry>
    <yt:videoId>not-a-valid-id</yt:videoId>
    <title>Skipped</title>
  </entry>
  <entry>
    <yt:videoId>YH6l3v1eXhg</yt:videoId>
    <title>Gundog &amp; Group</title>
  </entry>
</feed>`;

describe("parseYouTubeFeed", () => {
  it("reads video ids and titles from a channel feed", () => {
    expect(parseYouTubeFeed(feed)).toEqual([
      {
        id: "Euognak71A8",
        title: "Group Judging (Gundog) | Crufts 2026",
        watchUrl: "https://www.youtube.com/watch?v=Euognak71A8",
      },
      {
        id: "YH6l3v1eXhg",
        title: "Gundog & Group",
        watchUrl: "https://www.youtube.com/watch?v=YH6l3v1eXhg",
      },
    ]);
  });
});
