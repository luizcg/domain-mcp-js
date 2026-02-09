const RDAP_BASE_URLS = {
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

export async function whoisLookup(domain) {
  try {
    const tld = domain.split('.').pop();

    if (RDAP_BASE_URLS[tld]) {
      const resp = await fetch(`${RDAP_BASE_URLS[tld]}/domain/${domain}`);
      if (resp.ok) return await resp.json();
    } else {
      const bootstrap = await fetch(
        `https://rdap-bootstrap.arin.net/bootstrap/domain/${domain}`
      );
      if (bootstrap.ok) {
        const data = await bootstrap.json();
        if (data.links?.length) {
          const rdapUrl = data.links[0].href;
          const resp = await fetch(rdapUrl);
          if (resp.ok) return await resp.json();
        }
      }
    }

    return { error: 'RDAP lookup failed, limited WHOIS data available' };
  } catch (e) {
    return { error: `WHOIS lookup failed: ${e.message}` };
  }
}
