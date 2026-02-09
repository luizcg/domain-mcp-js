import { whoisLookup } from './whois.js';

export async function domainAgeCheck(domain) {
  try {
    const whoisData = await whoisLookup(domain);

    const result = {
      domain,
      registered: false,
      age: 'Unknown',
      created: 'Unknown',
      expires: 'Unknown',
      registrar: 'Unknown',
    };

    if (whoisData.events) {
      for (const event of whoisData.events) {
        if (event.eventAction === 'registration') {
          result.created = event.eventDate || 'Unknown';
          result.registered = true;
          try {
            const createdDate = new Date(event.eventDate);
            const ageDays = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
            result.age = `${ageDays} days (${Math.floor(ageDays / 365)} years)`;
          } catch { /* ignore */ }
        } else if (event.eventAction === 'expiration') {
          result.expires = event.eventDate || 'Unknown';
        }
      }
    }

    if (whoisData.entities) {
      for (const entity of whoisData.entities) {
        if (entity.roles?.includes('registrar')) {
          const vcard = entity.vcardArray;
          if (Array.isArray(vcard) && vcard.length > 1 && Array.isArray(vcard[1])) {
            for (const entry of vcard[1]) {
              if (Array.isArray(entry) && entry.length >= 4 && entry[0] === 'fn') {
                result.registrar = entry[3];
                break;
              }
            }
          }
        }
      }
    }

    return result;
  } catch (e) {
    return { domain, error: e.message };
  }
}
