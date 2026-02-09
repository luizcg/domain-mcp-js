import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { whoisLookup } from '../tools/whois.js';

describe('whoisLookup', () => {
  it('should return RDAP data for google.com', async () => {
    const data = await whoisLookup('google.com');
    assert.ok(typeof data === 'object');
    assert.ok(!data.error, `Got error: ${data.error}`);
    assert.ok(data.ldhName || data.handle || data.events, 'Expected RDAP fields');
  });

  it('should return RDAP data for a .net domain', async () => {
    const data = await whoisLookup('example.net');
    assert.ok(typeof data === 'object');
    assert.ok(!data.error, `Got error: ${data.error}`);
  });

  it('should return RDAP data for a .br domain', async () => {
    const data = await whoisLookup('registro.br');
    assert.ok(typeof data === 'object');
    assert.ok(!data.error, `Got error: ${data.error}`);
  });

  it('should handle nonexistent domain gracefully', async () => {
    const data = await whoisLookup('this-domain-does-not-exist-xyz123456.com');
    assert.ok(typeof data === 'object');
    // Should either have error or empty RDAP response
  });
});
