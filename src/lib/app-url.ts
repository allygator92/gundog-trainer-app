const LOCAL_APP_URL = "http://localhost:3000";

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function withHttps(hostOrUrl: string) {
  return hostOrUrl.startsWith("http://") || hostOrUrl.startsWith("https://")
    ? hostOrUrl
    : `https://${hostOrUrl}`;
}

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getAppUrl(env: Record<string, string | undefined> = process.env): string {
  const configured = env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured && isHttpUrl(configured)) {
    return stripTrailingSlash(configured);
  }

  const vercelHost = env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || env.VERCEL_URL?.trim();
  if (vercelHost) {
    const vercelUrl = withHttps(vercelHost);
    if (isHttpUrl(vercelUrl)) {
      return stripTrailingSlash(vercelUrl);
    }
  }

  return LOCAL_APP_URL;
}
