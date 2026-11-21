# ChatGPT Plugin Directory package (mcpfax)

- `package/` – sources (Agent Plugins format: `plugin.json`, `mcp.json`, `skills/mcpfax/SKILL.md`, `assets/logo.png`)
- `mcpfax-openai-plugin-1.0.4.zip` – current ZIP (plugin files at archive root); 1.0.3 and 1.0.2b kept for history

Rebuild: `cd package && zip -X -r ../mcpfax-openai-plugin-<version>.zip plugin.json mcp.json skills assets`

Still needed in the OpenAI dashboard (not part of the ZIP): demo recording URL, reviewer credentials (Review details form), domain verification token (`https://mcpfax.de/.well-known/openai-apps-challenge`, plain text, token only), tool annotation justifications (see `annotations.md`).
