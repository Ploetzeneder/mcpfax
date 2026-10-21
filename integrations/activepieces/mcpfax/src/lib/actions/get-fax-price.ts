import { createAction } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { mcpfaxAuth } from '../auth';
import { mcpfaxClient, mcpfaxProps } from '../common';

export const getFaxPrice = createAction({
  auth: mcpfaxAuth,
  name: 'get_fax_price',
  classification: 'READ',
  displayName: 'Get Fax Price',
  description: 'Validate the fax number, count pages and get the exact cost. Sends nothing.',
  audience: 'both',
  aiMetadata: {
    description:
      'Returns a price quote for a fax: normalized number, destination country, page count, cost and whether the balance is sufficient. Read-only and free.',
    idempotent: true,
  },
  props: {
    recipient_fax_number: mcpfaxProps.faxNumber,
    ...mcpfaxProps.document,
  },
  async run({ auth, propsValue }) {
    return await mcpfaxClient.request({
      apiKey: auth.secret_text,
      method: HttpMethod.POST,
      path: '/fax/price',
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
          send_at: propsValue.send_at,
        }),
      },
    });
  },
});
