// Send a fax with the mcpfax REST API (https://mcpfax.de) – Node.js 18+, no dependencies.
// MCPFAX_API_KEY=mfx_... node send_fax.mjs "+49 30 1234567" "Hello from Node.js"
import { randomUUID } from "node:crypto";

const API = "https://mcpfax.de/api/v1";
const headers = { Authorization: `Bearer ${process.env.MCPFAX_API_KEY}`, "Content-Type": "application/json" };
const [number, text = "Hello from mcpfax"] = process.argv.slice(2);

async function call(method, path, body) {
  const r = await fetch(API + path, { method, headers, body: body && JSON.stringify(body) });
  const data = await r.json();
  if (!r.ok) throw new Error(`${r.status} ${data.error}: ${data.message}`);
  return data;
}

const doc = { recipient_fax_number: number, content: `# Fax\n\n${text}`, content_format: "markdown" };
const quote = await call("POST", "/fax/price", doc);
console.log(`${quote.to}: ${quote.pages} page(s), ${quote.currency} ${quote.cost}`);

const fax = await call("POST", "/fax/send", { ...doc, idempotency_key: randomUUID(), max_cost: quote.cost });
console.log(`Fax #${fax.fax_id}: ${fax.status}`);
