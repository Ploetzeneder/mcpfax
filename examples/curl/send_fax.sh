#!/usr/bin/env bash
# Send a PDF as a fax with the mcpfax REST API.
# Usage: MCPFAX_API_KEY=mfx_... ./send_fax.sh document.pdf "+49 30 1234567"
set -euo pipefail
FILE="${1:?PDF file}"; NUMBER="${2:?fax number}"
API="https://mcpfax.de/api/v1"; AUTH="Authorization: Bearer ${MCPFAX_API_KEY:?set MCPFAX_API_KEY}"
B64=$(base64 < "$FILE" | tr -d '\n')
BODY=$(printf '{"recipient_fax_number":"%s","file_base64":"%s","file_name":"%s"}' "$NUMBER" "$B64" "$(basename "$FILE")")

echo "Price quote:"
echo "$BODY" | curl -s "$API/fax/price" -H "$AUTH" -H "Content-Type: application/json" --data-binary @-
echo
read -r -p "Send this fax now? [y/N] " OK
[ "$OK" = "y" ] || { echo "Cancelled."; exit 0; }

KEY="cli-$(date +%s)-$RANDOM"
BODY=${BODY%\}}",\"idempotency_key\":\"$KEY\"}"
echo "$BODY" | curl -s "$API/fax/send" -H "$AUTH" -H "Content-Type: application/json" --data-binary @-
echo
