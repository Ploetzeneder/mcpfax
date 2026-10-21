import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { mcpfaxAuth } from '../auth';
import { documentBody, documentProps, faxNumberProp, mcpfaxRequest, optional } from '../common';

export const sendFax = createAction({
  auth: mcpfaxAuth,
  name: 'send_fax',
  displayName: 'Send Fax',
  description: 'Send a document or text as a real fax. Costs prepaid credit.',
  classification: 'WRITE',
  audience: 'both',
  aiMetadata: {
    description:
      'Sends a real fax to a fax number and charges the prepaid balance; cannot be undone. Accepts exactly one document source: an uploaded file, Markdown text, or a public URL. Use Get Fax Price first to show the cost. A unique idempotency key prevents duplicates on retries.',
    idempotent: false,
  },
  props: {
    recipient_fax_number: faxNumberProp,
    ...documentProps,
    max_cost: Property.Number({
      displayName: 'Max Cost',
      description: 'Safety limit in your account currency – the fax is not sent if it would cost more.',
      required: false,
    }),
    idempotency_key: Property.ShortText({
      displayName: 'Idempotency Key',
      description: 'Unique key (e.g. order ID). Retries with the same key never send the fax twice.',
      required: false,
    }),
  },
  async run({ auth, propsValue }) {
    const p = propsValue;
    return await mcpfaxRequest(auth.secret_text, HttpMethod.POST, '/fax/send', {
      recipient_fax_number: p.recipient_fax_number,
      ...documentBody(p),
      ...optional({
        recipient_name: p.recipient_name,
        cover_page: p.cover_page,
        subject: p.subject,
        send_at: p.send_at,
        max_cost: p.max_cost,
        idempotency_key: p.idempotency_key,
      }),
    });
  },
});
