#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { whoisLookup } from './tools/whois.js';
import { dnsLookup, getAllDnsRecords } from './tools/dns.js';
import { sslCertificateInfo } from './tools/ssl.js';
import { checkDomainAvailability, bulkDomainCheck } from './tools/availability.js';
import { searchExpiredDomains } from './tools/expired.js';
import { domainAgeCheck } from './tools/age.js';

const server = new McpServer({
  name: 'domain-mcp',
  version: '1.0.0',
});

// --- Tool registrations ---

server.tool(
  'whois_lookup',
  'Get WHOIS information for a domain using RDAP protocol',
  { domain: z.string().describe('The domain name to lookup (e.g., example.com)') },
  async ({ domain }) => ({
    content: [{ type: 'text', text: JSON.stringify(await whoisLookup(domain), null, 2) }],
  })
);

server.tool(
  'dns_lookup',
  'Get DNS records for a domain',
  {
    domain: z.string().describe('The domain name to lookup'),
    record_type: z
      .enum(['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME', 'SOA'])
      .default('A')
      .describe('DNS record type'),
  },
  async ({ domain, record_type }) => ({
    content: [
      {
        type: 'text',
        text: JSON.stringify({ domain, record_type, records: await dnsLookup(domain, record_type) }, null, 2),
      },
    ],
  })
);

server.tool(
  'check_domain_availability',
  'Check if a domain is available for registration',
  { domain: z.string().describe('The domain name to check') },
  async ({ domain }) => {
    const available = await checkDomainAvailability(domain);
    return {
      content: [
        { type: 'text', text: JSON.stringify({ domain, available, status: available ? 'available' : 'registered' }, null, 2) },
      ],
    };
  }
);

server.tool(
  'ssl_certificate_info',
  'Get SSL certificate information for a domain',
  { domain: z.string().describe('The domain name to check SSL certificates') },
  async ({ domain }) => ({
    content: [{ type: 'text', text: JSON.stringify(await sslCertificateInfo(domain), null, 2) }],
  })
);

server.tool(
  'search_expired_domains',
  'Search for expired or deleted domains',
  {
    keyword: z.string().default('').describe('Keyword to search for in domain names'),
    tld: z.string().default('').describe('Top-level domain to filter by (e.g., com, net, org)'),
  },
  async ({ keyword, tld }) => {
    const results = await searchExpiredDomains(keyword, tld);
    return {
      content: [
        { type: 'text', text: JSON.stringify({ search_params: { keyword, tld }, results, count: results.length }, null, 2) },
      ],
    };
  }
);

server.tool(
  'domain_age_check',
  'Check domain age and registration dates',
  { domain: z.string().describe('The domain name to check') },
  async ({ domain }) => ({
    content: [{ type: 'text', text: JSON.stringify(await domainAgeCheck(domain), null, 2) }],
  })
);

server.tool(
  'bulk_domain_check',
  'Check availability of multiple domains at once (max 10)',
  { domains: z.array(z.string()).describe('List of domain names to check') },
  async ({ domains }) => {
    const results = await bulkDomainCheck(domains);
    return {
      content: [{ type: 'text', text: JSON.stringify({ checked: results.length, results }, null, 2) }],
    };
  }
);

server.tool(
  'get_dns_records',
  'Get all DNS records for a domain (A, AAAA, MX, TXT, NS, CNAME, SOA)',
  { domain: z.string().describe('The domain name to get all DNS records') },
  async ({ domain }) => ({
    content: [{ type: 'text', text: JSON.stringify({ domain, records: await getAllDnsRecords(domain) }, null, 2) }],
  })
);

// --- Start server ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
