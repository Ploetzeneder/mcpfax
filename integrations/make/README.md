# mcpfax – Make (Integromat) custom app

IML definitions for the Make Developer Platform. Each folder under `modules/` contains the
communication, parameters, interface, samples (and epoch for triggers) of one module;
`meta.json` lists module type, label and description.

| Module | Type |
|---|---|
| Send a Fax · Get a Fax Price · Get a Fax · Resend a Fax · Cancel a Scheduled Fax · Download a Send Report · Get Balance · Save a Contact | Action |
| Search Faxes · Search Contacts | Search |
| Watch Delivered Faxes · Watch Failed Faxes | Polling trigger |

Connection: API key (`Authorization: Bearer mfx_…`), verified with `GET /balance`.
Base URL: `https://mcpfax.de/api/v1` · Icon: `icon.png` (512×512) · Theme color `#0071fe`.
