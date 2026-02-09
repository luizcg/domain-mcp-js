async function fetchDomainsDB(keyword, tld) {
  const params = new URLSearchParams({ isDead: 'true', limit: '50' });
  if (keyword) params.set('domain', keyword);
  if (tld) params.set('zone', tld);

  const resp = await fetch(
    `https://api.domainsdb.info/v1/domains/search?${params}`,
    { signal: AbortSignal.timeout(15000) }
  );

  if (!resp.ok) return [];

  const data = await resp.json();
  const results = [];

  for (const info of data.domains || []) {
    const name = info.domain || '';
    if (!name || !name.includes('.')) continue;
    if (keyword && !name.toLowerCase().includes(keyword.toLowerCase())) continue;
    if (tld && !name.endsWith(`.${tld}`)) continue;

    results.push({
      domain: name,
      status: info.isDead === 'True' ? 'expired' : 'unknown',
      source: 'DomainsDB',
      created: info.create_date || '',
      updated: info.update_date || '',
    });

    if (results.length >= 10) break;
  }

  return results;
}

async function fetchDynadot(keyword, tld) {
  const resp = await fetch(
    'https://www.dynadot.com/market/backorder/backorders.csv',
    {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Domain-MCP/1.0)' },
      signal: AbortSignal.timeout(15000),
    }
  );

  if (!resp.ok) return [];

  const lines = (await resp.text()).trim().split('\n').slice(1);
  const results = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split(',').map((p) => p.trim());
    if (parts.length < 2) continue;
    const name = parts[0];
    if (!name || !name.includes('.')) continue;
    if (keyword && !name.toLowerCase().includes(keyword.toLowerCase())) continue;
    if (tld && !name.endsWith(`.${tld}`)) continue;

    results.push({
      domain: name,
      status: 'pending delete',
      source: 'Dynadot',
      end_time: parts[1] || '',
      appraisal: parts[3] || '',
    });

    if (results.length >= 10) break;
  }

  return results;
}

export async function searchExpiredDomains(keyword = '', tld = '') {
  const errors = [];

  // Run both sources in parallel for speed
  const [domainsDB, dynadot] = await Promise.all([
    fetchDomainsDB(keyword, tld).catch((e) => { errors.push(`DomainsDB: ${e.message}`); return []; }),
    fetchDynadot(keyword, tld).catch((e) => { errors.push(`Dynadot: ${e.message}`); return []; }),
  ]);

  const domains = [...domainsDB, ...dynadot];

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

  const msg = errors.length
    ? `No expired domains found. Source errors: ${errors.join('; ')}`
    : 'No expired domains found matching your criteria. Try different keywords or check back later.';
  return [{ error: msg }];
}
