// Fetch Open Graph metadata for a URL with basic SSRF guards
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PRIVATE_RE = /^(127\.|10\.|192\.168\.|169\.254\.|0\.|::1|fc00:|fe80:|localhost$)/i;
const BLOCKED_HOSTS = ['metadata.google.internal', 'metadata', 'localhost'];

function isPrivate(host: string) {
  if (BLOCKED_HOSTS.includes(host.toLowerCase())) return true;
  if (PRIVATE_RE.test(host)) return true;
  // Block 172.16.0.0 – 172.31.255.255
  const m = host.match(/^172\.(\d+)\./);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= 16 && n <= 31) return true;
  }
  return false;
}

function pickMeta(html: string, prop: string) {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i');
  const m = html.match(re);
  if (m) return m[1];
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, 'i');
  const m2 = html.match(re2);
  return m2 ? m2[1] : null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ error: 'url required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    let parsed: URL;
    try { parsed = new URL(url); } catch {
      return new Response(JSON.stringify({ error: 'invalid url' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return new Response(JSON.stringify({ error: 'http(s) only' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (isPrivate(parsed.hostname)) {
      return new Response(JSON.stringify({ error: 'host not allowed' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 8000);
    const resp = await fetch(parsed.toString(), {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'LyceeAIBot/1.0 (+og)', Accept: 'text/html' },
    });
    clearTimeout(timeout);

    const html = (await resp.text()).slice(0, 200_000);
    const title = pickMeta(html, 'og:title') || pickMeta(html, 'twitter:title') || (html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? null);
    const description = pickMeta(html, 'og:description') || pickMeta(html, 'twitter:description') || pickMeta(html, 'description');
    let image = pickMeta(html, 'og:image') || pickMeta(html, 'twitter:image');
    if (image && image.startsWith('/')) image = `${parsed.origin}${image}`;
    const favicon = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`;

    return new Response(JSON.stringify({
      url: parsed.toString(),
      domain: parsed.hostname,
      title: title?.trim() ?? parsed.hostname,
      description: description?.trim() ?? null,
      image: image ?? favicon,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
