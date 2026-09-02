import type { MetadataRoute } from "next";
import { site } from "@content/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: "Gundog",
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f7f3ea",
    theme_color: "#24344d",
    lang: "en-GB",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
