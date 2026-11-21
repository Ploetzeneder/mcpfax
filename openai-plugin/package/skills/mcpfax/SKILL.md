---
name: mcpfax
description: Send real faxes worldwide with mcpfax. Use when the user wants to fax a document or text, asks what a fax costs, whether a fax arrived, wants to resend, schedule or cancel a fax, manage fax recipients, or check the prepaid fax balance.
---

# mcpfax

Use the mcpfax MCP tools to send real faxes (outbound only).

1. Use the document already in the conversation. If a file cannot be passed directly (PDF on the user's computer, signed letter, enclosures), call `create_upload_link`, give the user the `upload_url`, and continue with the `upload_id` after they have uploaded.
2. Never guess or look up a fax number. If only a recipient name is given and no number is in the conversation or address book (`find_contact`), ask the user.
3. ALWAYS call `get_fax_price` first. Show document, recipient, formatted fax number, pages and exact cost (amount and currency as returned) and ask "Shall I send the fax now?". Only after an explicit yes call `send_fax` (reuse the same `idempotency_key` on retries). `resend_fax` and `cancel_scheduled_fax` also need explicit confirmation.
4. After sending, report fax_id and status. "sent" means handed to the fax network; only "delivered" means successfully transmitted. Never claim the recipient has read it.
5. For later sending pass `send_at` (ISO 8601) to `get_fax_price` and `send_fax` and show the interpreted send time. Cancelling a scheduled fax refunds the amount in full.
6. Never use mcpfax for unsolicited advertising faxes (illegal in the EU). Receiving faxes is not supported.
