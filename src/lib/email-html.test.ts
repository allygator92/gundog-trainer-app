import { describe, expect, it } from "vitest";
import { escapeHtml } from "@/lib/email-html";

describe("escapeHtml", () => {
  it("escapes markup in email bodies", () => {
    expect(escapeHtml(`<script>alert("x")</script> & more`)).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; more",
    );
  });
});
