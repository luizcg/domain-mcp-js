const RDAP_KNOWN_URLS = {
  com: 'https://rdap.verisign.com/com/v1',
  net: 'https://rdap.verisign.com/net/v1',
  org: 'https://rdap.publicinterestregistry.org/rdap',
  info: 'https://rdap.afilias.net/rdap',
  io: 'https://rdap.nic.io',
  co: 'https://rdap.nic.co',
  me: 'https://rdap.nic.me',
  tv: 'https://rdap.nic.tv',
  br: 'https://rdap.registro.br',
  app: 'https://rdap.nic.google',
  dev: 'https://rdap.nic.google',
  cloud: 'https://rdap.nic.google',
};

let bootstrapCache = null;
let bootstrapCacheTime = 0;
const BOOTSTRAP_TTL = 1000 * 60 * 60; // 1 hour

async function getBootstrapUrls() {
  if (bootstrapCache && Date.now() - bootstrapCacheTime < BOOTSTRAP_TTL) {
    return bootstrapCache;
  }

  const resp = await fetch('https://data.iana.org/rdap/dns.json', {
    signal: AbortSignal.timeout(10000),
  });

  if (!resp.ok) return null;

  const data = await resp.json();
  const map = {};

  for (const [tlds, urls] of data.services || []) {
    for (const tld of tlds) {
      map[tld.toLowerCase()] = urls[0].replace(/\/$/, '');
    }
  }

  bootstrapCache = map;
  bootstrapCacheTime = Date.now();
  return map;
}

async function fetchRdap(baseUrl, domain) {
  const url = `${baseUrl}/domain/${domain}`;
  const resp = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (resp.ok) return await resp.json();
  return null;
}

export async function whoisLookup(domain) {
  try {
    const tld = domain.split('.').pop().toLowerCase();

    // 1. Try hardcoded known URLs first (fast path)
    if (RDAP_KNOWN_URLS[tld]) {
      const result = await fetchRdap(RDAP_KNOWN_URLS[tld], domain);
      if (result) return result;
    }

    // 2. Try IANA bootstrap registry (covers virtually all TLDs)
    try {
      const bootstrap = await getBootstrapUrls();
      if (bootstrap?.[tld]) {
        const result = await fetchRdap(bootstrap[tld], domain);
        if (result) return result;
      }
    } catch { /* continue to fallback */ }

    // 3. Fallback: ARIN redirect service
    try {
      const resp = await fetch(
        `https://rdap-bootstrap.arin.net/bootstrap/domain/${domain}`,
        { signal: AbortSignal.timeout(10000) }
      );
      if (resp.ok) {
        const data = await resp.json();
        if (data.ldhName || data.handle || data.events) return data;
        if (data.links?.length) {
          const result = await fetchRdap(
            data.links[0].href.replace(/\/domain\/.*$/, ''),
            domain
          );
          if (result) return result;
        }
      }
    } catch { /* continue */ }

    return { error: `RDAP lookup failed for .${tld} — this TLD may not support RDAP` };
  } catch (e) {
    return { error: `WHOIS lookup failed: ${e.message}` };
  }
}
