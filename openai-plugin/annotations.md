# Tool annotations (text for the review form)

Live on `https://mcpfax.de/mcp` (`tools/list`, verified 21.11.2026). All 10 tools declare `title`, `readOnlyHint`, `destructiveHint`, `openWorldHint` and `idempotentHint`.

| Tool | title | readOnly | destructive | openWorld | idempotent |
|---|---|---|---|---|---|
| get_fax_price | Preview fax | true | false | true | true |
| send_fax | Send fax | false | true | true | false |
| create_upload_link | Create upload link | false | false | false | false |
| get_fax_status | Get fax status | true | false | false | true |
| get_fax_history | Fax history | true | false | false | true |
| resend_fax | Resend fax | false | true | true | false |
| cancel_scheduled_fax | Cancel scheduled fax | false | true | false | true |
| find_contact | Find fax contact | true | false | false | true |
| save_contact | Save fax contact | false | true | false | true |
| get_account_balance | Account balance | true | false | false | true |

## Notes per tool

- **get_fax_price** (readOnly, not destructive): validates the number and counts pages to prepare a preview. Sends nothing and changes no data. openWorld is set to true as a conservative choice; it contacts no fax machine.
- **send_fax** (destructive, openWorld): transmits a real fax to a third-party fax number and debits the account balance. Once handed to the fax network it cannot be recalled, so destructiveHint is true. The assistant must get the user's explicit confirmation first. Retries: a repeated `idempotency_key` for the same account never sends a second fax.
- **resend_fax** (destructive, openWorld): sends the stored document again to the same third-party number and debits the balance again. Requires explicit confirmation.
- **cancel_scheduled_fax** (destructive): discards a scheduled fax before it is sent (irreversible); the reserved amount is refunded to the account. Only the user's own account is affected.
- **save_contact** (destructive): creates or updates an address-book entry. Passing `contact_id` overwrites the stored name and number of that entry, so destructiveHint is true. No external party is contacted.
- **create_upload_link**: creates a private 24-hour upload link in the user's own account. Nothing is deleted or sent.
- **get_fax_status**, **get_fax_history**, **find_contact**, **get_account_balance**: read-only queries on the user's own account data.

openWorldHint is true only for the tools that transmit to third-party fax machines (send_fax, resend_fax) and for get_fax_price (conservative).
