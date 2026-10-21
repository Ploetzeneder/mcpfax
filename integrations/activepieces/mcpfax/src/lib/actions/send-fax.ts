import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { mcpfaxAuth } from '../auth';
import { mcpfaxClient, mcpfaxProps } from '../common';

export const sendFax = createAction({
  auth: mcpfaxAuth,
  name: 'send_fax',
  classification: 'WRITE',
  displayName: 'Send Fax',
  description: 'Send a document or text as a real fax. Costs prepaid credit.',
  audience: 'both',
  aiMetadata: {
    description:
      'Sends a real fax to a fax number and charges the prepaid balance; cannot be undone. Accepts exactly one document source: an uploaded file, Markdown text, or a public URL. Use Get Fax Price first to show the cost. A unique idempotency key prevents duplicates on retries.',
    idempotent: false,
  },
  props: {
    recipient_fax_number: mcpfaxProps.faxNumber,
    ...mcpfaxProps.document,
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
    return await mcpfaxClient.request({
      apiKey: auth.secret_text,
      method: HttpMethod.POST,
      path: '/fax/send',
      body: {
        recipient_fax_number: propsValue.recipient_fax_number,
        ...mcpfaxClient.documentBody({
          file: propsValue.file,
          content: propsValue.content,
          fileUrl: propsValue.file_url,
        }),
        ...mcpfaxClient.withoutEmpty({
          recipient_name: propsValue.recipient_name,
          cover_page: propsValue.cover_page,
          subject: propsValue.subject,
          send_at: propsValue.send_at,
          max_cost: propsValue.max_cost,
          idempotency_key: propsValue.idempotency_key,
        }),
      },
    });
  },
});
