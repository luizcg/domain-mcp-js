import { dnsLookup } from './dns.js';
import { whoisLookup } from './whois.js';

export async function checkDomainAvailability(domain) {
  try {
    // 1. Check DNS records (fast path)
    const [aRecords, nsRecords] = await Promise.all([
      dnsLookup(domain, 'A'),
      dnsLookup(domain, 'NS'),
    ]);

    const hasA = aRecords.length && !aRecords.some((r) => String(r).includes('Error'));
    const hasNS = nsRecords.length && !nsRecords.some((r) => String(r).includes('Error'));

    if (hasA || hasNS) return false;

    // 2. Check RDAP — catches registered domains with no DNS
    try {
      const whois = await whoisLookup(domain);
      if (whois && !whois.error) {
        const status = whois.status || [];
        if (status.some((s) => s.includes('active') || s.includes('registered'))) {
          return false;
        }
        if (whois.events?.length || whois.ldhName || whois.handle) {
          return false;
        }
      }
    } catch { /* RDAP unavailable, rely on DNS result */ }

    return true;
  } catch {
    return true;
  }
}

export async function bulkDomainCheck(domains) {
  const limited = domains.slice(0, 10);
  const results = await Promise.all(
    limited.map(async (domain) => {
      const available = await checkDomainAvailability(domain);
      return {
        domain,
        available,
        status: available ? 'available' : 'registered',
      };
    })
  );
  return results;
}
