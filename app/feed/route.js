import { posts } from "@/content/posts";

export async function GET() {
  const site = "https://ghostai.solutions";
  const items = posts.map(p => `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${site}/blog/${p.slug}</link>
      <guid>${site}/blog/${p.slug}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description><![CDATA[${p.excerpt}]]></description>
    </item>`).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0">
    <channel>
      <title>Ghost AI Solutions — Blog</title>
      <link>${site}</link>
      <description>Practical posts on AI agents, governance, and ROI.</description>
      ${items}
    </channel>
  </rss>`;

  return new Response(xml, { status: 200, headers: { "content-type": "application/rss+xml; charset=utf-8" }});
}
