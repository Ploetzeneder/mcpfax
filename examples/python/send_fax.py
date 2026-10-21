"""Send a fax with the mcpfax REST API (https://mcpfax.de).

pip install requests
MCPFAX_API_KEY=mfx_... python send_fax.py invoice.pdf "+49 30 1234567"
"""
import base64, os, sys, time, uuid
import requests

API = "https://mcpfax.de/api/v1"
HEADERS = {"Authorization": f"Bearer {os.environ['MCPFAX_API_KEY']}"}


def call(method, path, **kw):
    r = requests.request(method, API + path, headers=HEADERS, timeout=120, **kw)
    data = r.json()
    if r.status_code >= 400:
        raise SystemExit(f"Error {r.status_code}: {data.get('error')} – {data.get('message')}")
    return data


def main(path, number):
    doc = {
        "recipient_fax_number": number,
        "file_base64": base64.b64encode(open(path, "rb").read()).decode(),
        "file_name": os.path.basename(path),
    }
    quote = call("POST", "/fax/price", json=doc)
    print(f"{quote['to']}: {quote['pages']} page(s), {quote['currency']} {quote['cost']:.2f}")
    if not quote.get("sufficient"):
        raise SystemExit(f"Balance too low – top up at {quote.get('top_up_url')}")
    if input("Send now? [y/N] ").lower() != "y":
        return

    fax = call("POST", "/fax/send", json={**doc, "idempotency_key": str(uuid.uuid4()),
                                         "max_cost": quote["cost"]})
    print(f"Fax #{fax['fax_id']}: {fax['status']}")

    while fax["status"] not in ("delivered", "failed", "cancelled"):
        time.sleep(30)
        fax = call("GET", f"/fax/{fax['fax_id']}")
        print("status:", fax["status"])

    if fax["status"] == "delivered":
        pdf = requests.get(f"{API}/fax/{fax['fax_id']}/report", headers=HEADERS, timeout=60)
        open(f"send-report-{fax['fax_id']}.pdf", "wb").write(pdf.content)
        print("Send report saved.")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
