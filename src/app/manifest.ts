import type { MetadataRoute } from "next";
import { site } from "@content/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: "Gundog",
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#1e3d32",
    theme_color: "#1e3d32",
    lang: "en-GB",
    icons: [
      {
        src: "/brand/logo.jpg",
        sizes: "any",
        type: "image/jpeg",
        purpose: "any",
      },
    ],
  };
}
