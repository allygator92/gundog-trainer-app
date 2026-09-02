import { site } from "@content/site";

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function wrapEmailHtml(title: string, bodyHtml: string) {
  return `<!DOCTYPE html>
<html lang="en-GB">
  <body style="margin:0;background:#f4f1ea;font-family:Georgia,serif;color:#1e2a4a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#fffaf3;border:1px solid #e4d9c5;padding:28px;">
            <tr>
              <td>
                <p style="margin:0 0 8px;letter-spacing:0.16em;font-size:11px;text-transform:uppercase;color:#8a6d2f;">${escapeHtml(site.name)}</p>
                <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;">${escapeHtml(title)}</h1>
                ${bodyHtml}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function paragraphsToHtml(lines: string[]) {
  return lines
    .filter((line) => line.length > 0)
    .map((line) => `<p style="margin:0 0 12px;font-size:16px;line-height:1.5;">${escapeHtml(line)}</p>`)
    .join("");
}
