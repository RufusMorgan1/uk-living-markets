export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Missing query param" });

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "NEWS_API_KEY not configured" });

  try {
    const url = new URL("https://gnews.io/api/v4/search");
    url.searchParams.set("q", q);
    url.searchParams.set("lang", "en");
    url.searchParams.set("country", "gb");
    url.searchParams.set("max", "10");
    url.searchParams.set("sortby", "publishedAt");
    url.searchParams.set("apikey", apiKey);

    const response = await fetch(url.toString());

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.errors?.[0] || `GNews error ${response.status}` });
    }

    const data = await response.json();
    const articles = (data.articles || []).map(a => ({
      title:       a.title,
      description: a.description,
      url:         a.url,
      urlToImage:  a.image,
      publishedAt: a.publishedAt,
      source:      { name: a.source?.name || "" },
    }));

    return res.status(200).json({ status: "ok", totalResults: articles.length, articles });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
```

Then go to Vercel → **Settings** → **Environment Variables** → edit `NEWS_API_KEY` → replace the value with your GNews key: `8e77a36bec2b5a845580050f2c96b4b4` → **Save** → **Redeploy**.

Once done, test this in your browser:
```
https://uk-living-markets-app.vercel.app/api/news?q=UK+housing
