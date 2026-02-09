import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { checkDomainAvailability, bulkDomainCheck } from '../tools/availability.js';

describe('checkDomainAvailability', () => {
  it('should report google.com as registered', async () => {
    const available = await checkDomainAvailability('google.com');
    assert.equal(available, false);
  });

  it('should report a random nonexistent domain as likely available', async () => {
    const available = await checkDomainAvailability('xyznonexistent99887766.com');
    assert.equal(available, true);
  });
});

describe('bulkDomainCheck', () => {
  it('should check multiple domains', async () => {
    const results = await bulkDomainCheck(['google.com', 'xyznonexistent99887766.com']);
    assert.equal(results.length, 2);
    assert.equal(results[0].domain, 'google.com');
    assert.equal(results[0].available, false);
    assert.equal(results[1].available, true);
  });

  it('should limit to 10 domains', async () => {
    const domains = Array.from({ length: 15 }, (_, i) => `test${i}.com`);
    const results = await bulkDomainCheck(domains);
    assert.ok(results.length <= 10);
  });
});
