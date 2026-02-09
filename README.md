# Domain MCP

MCP server for domain research — WHOIS, DNS, SSL certificates, availability checks, expired domains and more.

No API keys needed. Everything uses free public APIs.

## Tools

| Tool | Description |
|------|-------------|
| `whois_lookup` | WHOIS info via RDAP protocol (supports all TLDs via IANA bootstrap) |
| `dns_lookup` | DNS records by type (A, AAAA, MX, TXT, NS, CNAME, SOA) |
| `get_dns_records` | All DNS records at once |
| `check_domain_availability` | Check if a domain is available (DNS + RDAP) |
| `bulk_domain_check` | Check multiple domains at once (max 10) |
| `ssl_certificate_info` | SSL certificate details, expiration, and self-signed detection |
| `domain_age_check` | Domain age, creation date, registrar |
| `search_expired_domains` | Find expired/deleted domains |

## Setup

```bash
git clone https://github.com/luizcg/domain-mcp-js.git
cd domain-mcp-js
npm install
```

### Claude Code

```bash
claude mcp add domain-mcp -- node /path/to/domain-mcp-js/index.js
```

### Claude Desktop

Add to your config file (`claude_desktop_config.json`):

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

### Windsurf

Add to your MCP config (`~/.codeium/windsurf/mcp_config.json`):

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

### Cursor

Add to your MCP config (`~/.cursor/mcp.json`):

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

- **RDAP** for WHOIS data — uses the [IANA bootstrap registry](https://data.iana.org/rdap/dns.json) to resolve RDAP servers for any TLD, with hardcoded fast-path URLs for common TLDs and ARIN fallback
- **Cloudflare DNS over HTTPS** for DNS lookups — fast, reliable, no local resolver needed
- **Node.js TLS** for SSL certificate inspection — connects directly to port 443, detects self-signed certs
- **DomainsDB + Dynadot** for expired domain search — queries both sources in parallel

## License

MIT
