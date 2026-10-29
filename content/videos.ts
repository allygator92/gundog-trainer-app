export type TrainingVideo = {
  id: string;
  title: string;
  watchUrl: string;
};

export const videosContent = {
  title: "Videos",
  headline: "The gundog group at Crufts",
  intro: "A look at the gundog group in the ring, from the official Crufts films.",
  body: [
    "Crufts judges the gundog group once a year: the same three working groups you meet on a shoot or in the house. Retrievers bred to mark and fetch, spaniels bred to hunt close and flush, and HPRs bred to range, point, and retrieve. These films are the group judging from 2024, 2025, and 2026, and a gundog display from 2024, all from the official Crufts channel.",
    "They are worth watching for the dogs themselves. You can see how a spaniel covers ground, how a retriever stands and waits, and how an HPR carries itself in a big ring. Press play here, or open the film on YouTube.",
  ],
  channelHeadline: "Films",
  channelIntro: "The latest films. Press play here, or open them on YouTube.",
  channelLinkLabel: "Open the channel on YouTube",
  watchLabel: "Open on YouTube",
  placeholders: [
    {
      id: "Euognak71A8",
      title: "Group Judging (Gundog) | Crufts 2026",
      watchUrl: "https://www.youtube.com/watch?v=Euognak71A8",
    },
    {
      id: "YH6l3v1eXhg",
      title: "Gundog Group | Crufts 2025",
      watchUrl: "https://www.youtube.com/watch?v=YH6l3v1eXhg",
    },
    {
      id: "aoKnC0InNkc",
      title: "Gundog Display | Crufts 2024",
      watchUrl: "https://www.youtube.com/watch?v=aoKnC0InNkc",
    },
    {
      id: "ArSiCE21qxM",
      title: "Gundog Group Judging | Crufts 2024",
      watchUrl: "https://www.youtube.com/watch?v=ArSiCE21qxM",
    },
  ] satisfies TrainingVideo[],
} as const;
