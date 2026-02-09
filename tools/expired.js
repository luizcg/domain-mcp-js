export async function searchExpiredDomains(keyword = '', tld = '') {
  const domains = [];

  // Method 1: DomainsDB API
  try {
    const params = new URLSearchParams({ isDead: 'true', limit: '50' });
    if (keyword) params.set('domain', keyword);
    if (tld) params.set('zone', tld);

    const resp = await fetch(
      `https://api.domainsdb.info/v1/domains/search?${params}`,
      { signal: AbortSignal.timeout(15000) }
    );

    if (resp.ok) {
      const data = await resp.json();
      for (const info of data.domains || []) {
        const name = info.domain || '';
        if (!name || !name.includes('.')) continue;
        if (keyword && !name.toLowerCase().includes(keyword.toLowerCase())) continue;
        if (tld && !name.endsWith(`.${tld}`)) continue;

        domains.push({
          domain: name,
          status: info.isDead === 'True' ? 'expired' : 'unknown',
          source: 'DomainsDB',
          created: info.create_date || '',
          updated: info.update_date || '',
        });

        if (domains.length >= 10) break;
      }
    }
  } catch { /* continue */ }

  // Method 2: Dynadot CSV
  if (domains.length < 10) {
    try {
      const resp = await fetch(
        'https://www.dynadot.com/market/backorder/backorders.csv',
        {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Domain-MCP/1.0)' },
          signal: AbortSignal.timeout(15000),
        }
      );

      if (resp.ok) {
        const lines = (await resp.text()).trim().split('\n').slice(1);
        for (const line of lines) {
          if (!line.trim()) continue;
          const parts = line.split(',').map((p) => p.trim());
          if (parts.length < 2) continue;
          const name = parts[0];
          if (!name || !name.includes('.')) continue;
          if (keyword && !name.toLowerCase().includes(keyword.toLowerCase())) continue;
          if (tld && !name.endsWith(`.${tld}`)) continue;

          domains.push({
            domain: name,
            status: 'pending delete',
            source: 'Dynadot',
            end_time: parts[1] || '',
            appraisal: parts[3] || '',
          });

          if (domains.length >= 10) break;
        }
      }
    } catch { /* continue */ }
  }

  // Deduplicate
  const seen = new Set();
  const unique = [];
  for (const d of domains) {
    if (d.domain && !seen.has(d.domain)) {
      seen.add(d.domain);
      unique.push(d);
    }
  }

  if (unique.length) return unique.slice(0, 10);
  return [{ error: 'No expired domains found matching your criteria. Try different keywords or check back later.' }];
}
