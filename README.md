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

## Example Prompts

Once the MCP is configured, you can use prompts like these in Claude Code, Claude Desktop, or any MCP-compatible client:

**Naming a new product:**
> I'm building a task management app for freelancers. Suggest 10 creative product names and check which .com domains are available.

**Deep dive on a specific name:**
> I like the name "taskflow". Check domain availability for taskflow.com, taskflow.io, taskflow.app, and taskflow.dev. Also check who owns the ones that are taken and when they expire.

**Expired domain hunting:**
> Search for expired domains related to "finance". Show me the best options and check their history.

**Competitive research:**
> Look up the WHOIS info, DNS setup, and SSL certificate for linear.app. I want to understand their infrastructure.

**Bulk availability check:**
> Check if these domains are available: acmehq.com, acmehq.io, acmeapp.com, getacme.com, useacme.com, tryacme.dev

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
