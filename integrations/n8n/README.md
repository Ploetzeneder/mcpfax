# n8n-nodes-mcpfax

[n8n](https://n8n.io) community node for **[mcpfax](https://mcpfax.de)** – send real faxes to fax numbers worldwide from your workflows. Prepaid, no subscription, PDF send report as proof.

## Installation

In n8n: **Settings → Community Nodes → Install** → `n8n-nodes-mcpfax`.

## Credentials

1. Create an account at [mcpfax.de](https://mcpfax.de) and top up credit.
2. Create an API key under **Account → API keys** (starts with `mfx_`).
3. In n8n create a credential of type **mcpfax API** and paste the key.

## Operations

**Fax**: Send · Get Price · Get (status) · Get Many · Resend · Cancel Scheduled · Download Send Report (PDF)
**Contact**: Search · Save
**Account**: Get Balance

Document sources for *Send* / *Get Price*: binary file from a previous node (PDF, DOCX, JPG, PNG, TXT – max. 15 MB), text/Markdown, or a public URL. Optional: cover page, subject, scheduled sending (`Send At`), `Max Cost` safety limit and `Idempotency Key` (retries never send twice).

## Trigger

**mcpfax Trigger** (polling): *Fax Delivered* or *Fax Failed*.

## Pricing

EU, US, UK and other zone-1 countries: EUR 1.00 first page + EUR 0.20 per additional page (incl. VAT). Failed faxes are refunded automatically. Unsolicited advertising faxes are not allowed.

## Resources

- API documentation: https://mcpfax.de/api.php
- Support: support@mcpfax.de

## License

MIT
