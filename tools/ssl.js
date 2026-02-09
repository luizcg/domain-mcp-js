import tls from 'node:tls';

function cleanDomain(domain) {
  return domain
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/:.*$/, '')
    .trim()
    .toLowerCase();
}

export function sslCertificateInfo(rawDomain) {
  const domain = cleanDomain(rawDomain);

  return new Promise((resolve) => {
    const socket = tls.connect(
      443,
      domain,
      { servername: domain, timeout: 10000, rejectUnauthorized: false },
      () => {
        try {
          const cert = socket.getPeerCertificate();
          if (!cert || !cert.subject) {
            socket.destroy();
            return resolve({ domain, error: `No certificate found for ${domain}` });
          }

          const authorized = socket.authorized;
          const notBefore = new Date(cert.valid_from);
          const notAfter = new Date(cert.valid_to);
          const now = new Date();
          const daysUntilExpiry = Math.floor((notAfter - now) / (1000 * 60 * 60 * 24));

          const san = cert.subjectaltname
            ? cert.subjectaltname.split(', ').map((s) => s.replace('DNS:', ''))
            : [];

          socket.destroy();
          resolve({
            domain,
            common_name: cert.subject?.CN || 'Unknown',
            issuer: cert.issuer?.O || 'Unknown',
            issuer_cn: cert.issuer?.CN || 'Unknown',
            not_before: notBefore.toISOString(),
            not_after: notAfter.toISOString(),
            days_until_expiry: daysUntilExpiry,
            is_expired: daysUntilExpiry < 0,
            is_expiring_soon: daysUntilExpiry >= 0 && daysUntilExpiry <= 30,
            is_self_signed: !authorized,
            serial_number: cert.serialNumber || 'Unknown',
            subject_alt_names: san,
          });
        } catch (e) {
          socket.destroy();
          resolve({ domain, error: `SSL parsing failed: ${e.message}` });
        }
      }
    );

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ domain, error: `Connection timeout — ${domain}:443 did not respond` });
    });

    socket.on('error', (e) => {
      socket.destroy();
      const errors = {
        ENOTFOUND: `Domain ${domain} could not be resolved (DNS lookup failed)`,
        ECONNREFUSED: `Connection refused — ${domain} is not accepting connections on port 443`,
        ECONNRESET: `Connection reset by ${domain} — server closed the connection`,
        EHOSTUNREACH: `Host ${domain} is unreachable`,
        DEPTH_ZERO_SELF_SIGNED_CERT: `${domain} uses a self-signed certificate`,
        CERT_HAS_EXPIRED: `${domain} has an expired SSL certificate`,
      };
      resolve({ domain, error: errors[e.code] || `SSL lookup failed: ${e.message}` });
    });
  });
}
