# Tool annotations (text for the review form)

All 10 tools are declared on the production server (`https://mcpfax.de/mcp`, `tools/list`) with `title`, `readOnlyHint`, `destructiveHint`, `openWorldHint` (plus `idempotentHint`).

| Tool | title | readOnly | destructive | openWorld | Justification |
|---|---|---|---|---|---|
| get_fax_price | Check fax price | true | false | false | Only validates the number and counts pages to compute a quote. Sends nothing, charges nothing, changes no data, contacts no external party. |
| send_fax | Send fax | false | false | true | Sends a real fax to an arbitrary third-party fax number via the fax network (open world) and charges the prepaid balance. It only adds a new fax and does not delete or overwrite existing data, so not destructive; the assistant must get the user's explicit confirmation with price first. |
| create_upload_link | Create upload link | false | false | false | Creates a private, 24-hour upload link inside the user's own account (a new record, nothing deleted). No external party is contacted. |
| get_fax_status | Get fax status | true | false | false | Reads the delivery status of one of the user's own faxes from mcpfax's own records. No changes, no external side effects. |
| get_fax_history | Fax history | true | false | false | Lists the user's own faxes from mcpfax's own records. Read-only. |
| resend_fax | Resend fax | false | false | true | Sends the stored original document again to the same third-party fax number (open world) and charges the balance again. Adds a new fax, deletes nothing; requires explicit user confirmation. |
| cancel_scheduled_fax | Cancel scheduled fax | false | true | false | Cancels a fax that is still scheduled: the pending fax is discarded (irreversible) and the reserved amount is refunded. Only affects the user's own account; no third party is contacted. |
| find_contact | Find fax contact | true | false | false | Searches the user's own address book. Read-only. |
| save_contact | Save fax contact | false | false | false | Creates or updates an entry in the user's own address book (free). Updating via contact_id overwrites only the fields of that entry the user asked to change; no external party. Not treated as destructive (no data loss beyond the edited entry). |
| get_account_balance | Account balance | true | false | false | Reads the user's own prepaid balance, prices and today's limit. Read-only. |

Notes
- No tool renders external iframes, so no frame-domain explanation is needed (the confirmation card widget is served from mcpfax's own MCP resource).
- Open world = true only for send_fax and resend_fax (they transmit data to third-party fax machines).
