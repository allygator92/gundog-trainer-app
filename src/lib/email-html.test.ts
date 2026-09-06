import { describe, expect, it } from "vitest";
import { site } from "@content/site";
import { escapeHtml, paragraphsToHtml, wrapEmailHtml } from "@/lib/email-html";

describe("escapeHtml", () => {
  it("escapes markup in email bodies", () => {
    expect(escapeHtml(`<script>alert("x")</script> & more`)).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; more",
    );
  });
});

describe("paragraphsToHtml", () => {
  it("turns booking manage URLs into clickable links", () => {
    const html = paragraphsToHtml([
      "Need to cancel or pick another time? https://example.com/booking/abc",
    ]);
    expect(html).toContain('href="https://example.com/booking/abc"');
    expect(html).toContain("Need to cancel or pick another time?");
  });
});

describe("wrapEmailHtml", () => {
  it("escapes the title and includes the site name", () => {
    const html = wrapEmailHtml("Booking <confirmed>", "<p>Hello</p>");
    expect(html).toContain(site.name);
    expect(html).toContain("Booking &lt;confirmed&gt;");
    expect(html).not.toContain("Booking <confirmed>");
    expect(html).toContain("<p>Hello</p>");
  });
});
