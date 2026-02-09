import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { domainAgeCheck } from '../tools/age.js';

describe('domainAgeCheck', () => {
  it('should return age info for google.com', async () => {
    const info = await domainAgeCheck('google.com');
    assert.ok(typeof info === 'object');
    assert.equal(info.domain, 'google.com');
    assert.equal(info.registered, true);
    assert.ok(info.created !== 'Unknown', 'Expected a creation date');
    assert.ok(info.age !== 'Unknown', 'Expected an age value');
    assert.ok(info.age.includes('years'));
  });

  it('should handle nonexistent domain', async () => {
    const info = await domainAgeCheck('this-domain-does-not-exist-xyz123456.com');
    assert.ok(typeof info === 'object');
    assert.equal(info.domain, 'this-domain-does-not-exist-xyz123456.com');
  });
});
