// Vercel serverless function — proxies NewsAPI so the key stays secret
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { q, page = 1 } = req.query;
  if (!q) return res.status(400).json({ error: "Missing query param" });

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "NEWS_API_KEY not configured" });

  try {
    const url = new URL("https://newsapi.org/v2/everything");
    url.searchParams.set("q", q);
    url.searchParams.set("language", "en");
    url.searchParams.set("sortBy", "publishedAt");
    url.searchParams.set("pageSize", "30");
    url.searchParams.set("page", String(page));
    // No domain filter — search all sources for maximum coverage

    const response = await fetch(url.toString(), {
      headers: { "X-Api-Key": apiKey },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.message || `NewsAPI error ${response.status}` });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
