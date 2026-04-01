export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Missing query param" });

  const apiKey = process.env.NEWSDATA_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "NEWS_API_KEY not configured" });

  try {
    const url = new URL("https://newsdata.io/api/1/news");
    url.searchParams.set("apikey", apiKey);
    url.searchParams.set("q", q);
    url.searchParams.set("language", "en");
    url.searchParams.set("country", "gb");

    const response = await fetch(url.toString());
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.message || `Error ${response.status}` });
    }

    const data = await response.json();
    const articles = (data.results || []).map(a => ({
      title:       a.title,
      description: a.description,
      url:         a.link,
      urlToImage:  a.image_url,
      publishedAt: a.pubDate,
      source:      { name: a.source_name || "" },
    }));

    return res.status(200).json({ status: "ok", totalResults: articles.length, articles });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
```

Then go to **Vercel → Settings → Environment Variables** → edit `NEWSDATA_API_KEY` → replace the value with:
`pub_48f49fd969cf4f478f868c53a8efdcb3` → **Save** → **Redeploy**.

Then test this in your browser:
```
https://uk-living-markets-app.vercel.app/api/news?q=UK+housing
