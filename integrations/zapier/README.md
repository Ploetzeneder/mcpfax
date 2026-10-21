# mcpfax – Zapier integration

Zapier app for [mcpfax](https://mcpfax.de): send real faxes worldwide from any Zap.

**Actions:** Send Fax · Get Fax Price · Resend Fax · Cancel Scheduled Fax · Save Contact
**Searches:** Find Fax (status) · Find Contact
**Triggers:** Fax Delivered · Fax Failed

## Deploy (Zapier Platform CLI)

```bash
npm install -g zapier-platform-cli
npm install
zapier login            # Zapier developer account
zapier register "mcpfax"  # first time only – creates the integration
zapier push
```

Test (read-only, sends no fax): `MCPFAX_API_KEY=mfx_... npm test`
