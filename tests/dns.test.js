import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { dnsLookup, getAllDnsRecords } from '../tools/dns.js';

describe('dnsLookup', () => {
  it('should return A records for google.com', async () => {
    const records = await dnsLookup('google.com', 'A');
    assert.ok(Array.isArray(records));
    assert.ok(records.length > 0, 'Expected at least one A record');
    assert.ok(!records.some((r) => String(r).includes('Error')));
  });

  it('should return NS records for google.com', async () => {
    const records = await dnsLookup('google.com', 'NS');
    assert.ok(records.length > 0);
  });

  it('should return MX records for google.com', async () => {
    const records = await dnsLookup('google.com', 'MX');
    assert.ok(records.length > 0);
  });

  it('should default to A record type', async () => {
    const records = await dnsLookup('google.com');
    assert.ok(records.length > 0);
  });

  it('should return empty array for nonexistent domain', async () => {
    const records = await dnsLookup('this-domain-does-not-exist-xyz123456.com', 'A');
    assert.ok(Array.isArray(records));
    assert.equal(records.length, 0);
  });
});

describe('getAllDnsRecords', () => {
  it('should return multiple record types for google.com', async () => {
    const records = await getAllDnsRecords('google.com');
    assert.ok(typeof records === 'object');
    assert.ok('A' in records, 'Expected A records');
    assert.ok('NS' in records, 'Expected NS records');
  });
});
