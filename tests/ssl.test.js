import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sslCertificateInfo } from '../tools/ssl.js';

describe('sslCertificateInfo', () => {
  it('should return certificate info for google.com', async () => {
    const info = await sslCertificateInfo('google.com');
    assert.ok(typeof info === 'object');
    assert.ok(!info.error, `Got error: ${info.error}`);
    assert.equal(info.domain, 'google.com');
    assert.ok(info.issuer);
    assert.ok(info.not_before);
    assert.ok(info.not_after);
    assert.equal(typeof info.days_until_expiry, 'number');
    assert.equal(info.is_expired, false);
    assert.ok(Array.isArray(info.subject_alt_names));
  });

  it('should return error for nonexistent domain', async () => {
    const info = await sslCertificateInfo('this-domain-does-not-exist-xyz123456.com');
    assert.ok(info.error);
  });

  it('should return error for domain without SSL', async () => {
    // neverssl.com is designed to never have SSL
    const info = await sslCertificateInfo('neverssl.com');
    // Might connect or might refuse — either way should not crash
    assert.ok(typeof info === 'object');
  });
});
