# mcpfax – send real faxes from AI assistants and code

<img src="https://mcpfax.de/assets/app-icon-1024.png" width="96" align="right" alt="mcpfax logo">

**mcpfax** is a hosted [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server and REST API that sends **real faxes to fax numbers worldwide** – from Claude, ChatGPT, Cursor, VS Code or your own code.

- 📠 Real fax delivery worldwide (outbound), with a **PDF send report** as proof
- 💶 **Prepaid, no subscription** – EUR 1.00 first page + EUR 0.20 per extra page (EU, US, UK and other zone-1 countries, incl. VAT)
- 📄 PDF, DOCX, JPG, PNG, TXT – or just plain text / Markdown
- ⏰ Scheduled sending, automatic retries on busy lines, address book, team accounts
- 🔐 OAuth 2.1 (PKCE) or API key · GDPR · operated by PIT Webservices GmbH, Austria

Website: **https://mcpfax.de** · Docs: https://mcpfax.de/connect.php?lang=en · OpenAPI: https://mcpfax.de/openapi.json

> This repository contains integration examples and client configs. The server itself is hosted – there is nothing to install or run.

---

## 1. Use it in an AI assistant (MCP)

MCP endpoint (Streamable HTTP): `https://mcpfax.de/mcp` – sign-in via OAuth happens automatically on first use.

| Client | How to connect |
|---|---|
| **Claude** (claude.ai / Desktop) | Settings → Connectors → *Add custom connector* → `https://mcpfax.de/mcp` |
| **ChatGPT** | Settings → Apps & Connectors → *Create* → `https://mcpfax.de/mcp` (OAuth) |
| **Claude Code** | `claude mcp add --transport http mcpfax https://mcpfax.de/mcp` |
| **Cursor** | copy [`clients/cursor-mcp.json`](clients/cursor-mcp.json) into `~/.cursor/mcp.json` |
| **VS Code** | copy [`clients/vscode-mcp.json`](clients/vscode-mcp.json) into `.vscode/mcp.json` |
| **Other clients / API key** | header `Authorization: Bearer mfx_…` – see [`clients/generic-mcp.json`](clients/generic-mcp.json) |

Then just ask: *"Fax this PDF to +49 30 1234567"* – the assistant shows pages and price first and sends only after you confirm.

### Tools

| Tool | What it does |
|---|---|
| `get_fax_price` | Validates the number, counts pages, returns exact cost – sends nothing |
| `send_fax` | Sends a document or text as a fax (optionally scheduled with `send_at`) |
| `get_fax_status` | Status of a fax (`queued`, `sent`, `delivered`, `failed`, `scheduled`, …) |
| `get_fax_history` | Recent faxes |
| `resend_fax` | Sends a previous fax again |
| `cancel_scheduled_fax` | Cancels a scheduled fax with full refund |
| `get_account_balance` | Prepaid balance |
| `find_contact` / `save_contact` | Fax address book |

---

## 2. Use the REST API

Base URL: `https://mcpfax.de/api/v1` · Auth: `Authorization: Bearer <API key>`

1. Create an account at https://mcpfax.de and top up credit (no subscription).
2. Create an API key under **Account → API keys** (starts with `mfx_`).
3. `export MCPFAX_API_KEY=mfx_...`

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/fax/price` | Price quote (no cost) |
| `POST` | `/fax/send` | Send a fax |
| `GET` | `/fax/{id}` | Fax status |
| `GET` | `/fax/{id}/report` | PDF send report |
| `POST` | `/fax/{id}/resend` | Resend |
| `POST` | `/fax/{id}/cancel` | Cancel a scheduled fax |
| `GET` | `/faxes?limit=20` | History |
| `GET` | `/balance` | Balance |
| `GET` / `POST` | `/contacts` | Search / save contacts |

**Document sources** (exactly one per fax): `content` (text or Markdown), `file_base64` + `file_name`, or `file_url` (public https URL). Max 15 MB.

### Quick start (curl)

```bash
# 1) price quote – nothing is sent
curl -s https://mcpfax.de/api/v1/fax/price \
  -H "Authorization: Bearer $MCPFAX_API_KEY" -H "Content-Type: application/json" \
  -d '{"recipient_fax_number":"+49 30 1234567","content":"# Hello\nThis is a test fax."}'

# 2) send
curl -s https://mcpfax.de/api/v1/fax/send \
  -H "Authorization: Bearer $MCPFAX_API_KEY" -H "Content-Type: application/json" \
  -d '{"recipient_fax_number":"+49 30 1234567","content":"# Hello\nThis is a test fax.","idempotency_key":"my-unique-id-1"}'
```

More examples:

- [`examples/curl/send_fax.sh`](examples/curl/send_fax.sh) – send a PDF from the shell
- [`examples/python/send_fax.py`](examples/python/send_fax.py) – Python (requests)
- [`examples/node/send_fax.mjs`](examples/node/send_fax.mjs) – Node.js 18+ (no dependencies)
- [`examples/php/send_fax.php`](examples/php/send_fax.php) – PHP (curl)

**Good practice:** always pass a unique `idempotency_key` (retries never send twice), use `max_cost` as a safety limit, and poll `/fax/{id}` until the status is `delivered` or `failed`. Failed faxes are refunded automatically.

**Test number:** the public test fax receiver of test-fax.de, `+49 1805 237077000`, is allowed for trying things out (costs a normal fax).

---

## Pricing

| Destination | First page | Each additional page |
|---|---|---|
| Zone 1: EU/EEA, CH, UK, US, CA, AU, NZ, JP, KR, SG, IL, HK, TW | EUR 1.00 | EUR 0.20 |
| All other countries | EUR 2.00 | EUR 0.40 |

Final prices incl. VAT. Prepaid credit, no subscription, no monthly fee. Balances in EUR, CHF, GBP, USD, CAD, AUD, SEK, DKK, NOK, PLN, CZK, JPY.

## Not allowed

Unsolicited advertising faxes are illegal in the EU and are not permitted.

## Deutsch

**mcpfax** versendet echte Faxe aus Claude, ChatGPT & Co. oder per REST-API – weltweit, **ohne Abo**, mit PDF-Sendebericht. Connector-URL: `https://mcpfax.de/mcp`. Anleitung: https://mcpfax.de

## Support

support@mcpfax.de · PIT Webservices GmbH, Richard-Wagner-Gasse 16, 2301 Groß-Enzersdorf, Austria

The example code in this repository is MIT licensed. mcpfax is a hosted commercial service.
