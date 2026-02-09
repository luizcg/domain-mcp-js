export async function dnsLookup(domain, recordType = 'A') {
  try {
    const url = new URL('https://cloudflare-dns.com/dns-query');
    url.searchParams.set('name', domain);
    url.searchParams.set('type', recordType);

    const resp = await fetch(url, {
      headers: { Accept: 'application/dns-json' },
    });

    if (resp.ok) {
      const data = await resp.json();
      if (data.Answer) {
        return data.Answer.map((a) => a.data);
      }
    }
    return [];
  } catch (e) {
    return [`Error: ${e.message}`];
  }
}

export async function getAllDnsRecords(domain) {
  const types = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME', 'SOA'];
  const results = {};

  for (const type of types) {
    const records = await dnsLookup(domain, type);
    if (records.length && !records.some((r) => String(r).includes('Error'))) {
      results[type] = records;
    }
  }

  return results;
}
