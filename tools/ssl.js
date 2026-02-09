import tls from 'node:tls';

export function sslCertificateInfo(domain) {
  return new Promise((resolve) => {
    const socket = tls.connect(443, domain, { servername: domain, timeout: 10000 }, () => {
      try {
        const cert = socket.getPeerCertificate();
        if (!cert || !cert.subject) {
          socket.destroy();
          return resolve({ error: `No certificate found for ${domain}` });
        }

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
          serial_number: cert.serialNumber || 'Unknown',
          subject_alt_names: san,
        });
      } catch (e) {
        socket.destroy();
        resolve({ error: `SSL parsing failed: ${e.message}` });
      }
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ error: `Connection timeout for ${domain}` });
    });

    socket.on('error', (e) => {
      socket.destroy();
      if (e.code === 'ENOTFOUND') {
        resolve({ error: `Domain ${domain} not found` });
      } else if (e.code === 'ECONNREFUSED') {
        resolve({ error: `Connection refused to ${domain}:443` });
      } else {
        resolve({ error: `SSL lookup failed: ${e.message}` });
      }
    });
  });
}
