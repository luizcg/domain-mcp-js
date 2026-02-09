import { dnsLookup } from './dns.js';

export async function checkDomainAvailability(domain) {
  try {
    const aRecords = await dnsLookup(domain, 'A');
    if (aRecords.length && !aRecords.some((r) => String(r).includes('Error'))) {
      return false;
    }

    const nsRecords = await dnsLookup(domain, 'NS');
    if (nsRecords.length && !nsRecords.some((r) => String(r).includes('Error'))) {
      return false;
    }

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
