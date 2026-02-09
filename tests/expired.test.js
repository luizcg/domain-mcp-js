import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { searchExpiredDomains } from '../tools/expired.js';

describe('searchExpiredDomains', () => {
  it('should return an array of results', async () => {
    const results = await searchExpiredDomains();
    assert.ok(Array.isArray(results));
    assert.ok(results.length > 0);
  });

  it('should return max 10 results', async () => {
    const results = await searchExpiredDomains();
    assert.ok(results.length <= 10);
  });

  it('should filter by keyword when provided', async () => {
    const results = await searchExpiredDomains('tech');
    assert.ok(Array.isArray(results));
    // Either results match keyword or we get the "no results" error object
    if (!results[0]?.error) {
      for (const r of results) {
        assert.ok(
          r.domain.toLowerCase().includes('tech'),
          `Expected "${r.domain}" to contain "tech"`
        );
      }
    }
  });

  it('should have expected fields in results', async () => {
    const results = await searchExpiredDomains();
    if (!results[0]?.error) {
      const first = results[0];
      assert.ok(first.domain);
      assert.ok(first.status);
      assert.ok(first.source);
    }
  });
});
