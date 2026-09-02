export const THEME_COOKIE = "gundog-theme";

export const siteThemes = [
  {
    id: "heath",
    label: "Heath",
    description: "Warm countryside greens and rounded cards",
  },
  {
    id: "field",
    label: "Field",
    description: "Ink and brass sporting look",
  },
] as const;

export type SiteTheme = (typeof siteThemes)[number]["id"];

export function parseSiteTheme(value?: string | null): SiteTheme {
  return value === "field" ? "field" : "heath";
}

export function themeCookie(theme: SiteTheme) {
  return `${THEME_COOKIE}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
