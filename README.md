# Domain MCP (JavaScript)

MCP server for domain research — WHOIS, DNS, SSL certificates, availability checks, expired domains and more.

No API keys needed. Everything uses free public APIs.

## Tools

- **whois_lookup** — WHOIS info via RDAP protocol
- **dns_lookup** — DNS records by type (A, AAAA, MX, TXT, NS, CNAME, SOA)
- **get_dns_records** — All DNS records at once
- **check_domain_availability** — Check if a domain is available
- **bulk_domain_check** — Check multiple domains at once (max 10)
- **ssl_certificate_info** — SSL certificate details and expiration
- **domain_age_check** — Domain age, creation date, registrar
- **search_expired_domains** — Find expired/deleted domains

## Quick Start

```bash
npm install
node index.js
```

## Using with Claude Desktop

Add to your Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "domain-mcp": {
      "command": "node",
      "args": ["/path/to/domain-mcp-js/index.js"]
    }
  }
}
```

## Using with Windsurf

Add to your MCP config:

```json
{
  "mcpServers": {
    "domain-mcp": {
      "command": "node",
      "args": ["/path/to/domain-mcp-js/index.js"]
    }
  }
}
```

## Running Tests

```bash
npm test
```

## How it works

- **RDAP** for WHOIS data (no auth needed)
- **Cloudflare DNS over HTTPS** for DNS lookups
- **Node.js TLS** for SSL certificate inspection
- **DomainsDB API** for expired domain search

## License

MIT
