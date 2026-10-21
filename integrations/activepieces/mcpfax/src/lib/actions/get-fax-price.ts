import { createAction } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { mcpfaxAuth } from '../auth';
import { documentBody, documentProps, faxNumberProp, mcpfaxRequest, optional } from '../common';

export const getFaxPrice = createAction({
  auth: mcpfaxAuth,
  name: 'get_fax_price',
  displayName: 'Get Fax Price',
  description: 'Validate the fax number, count pages and get the exact cost. Sends nothing.',
  classification: 'READ',
  audience: 'both',
  aiMetadata: {
    description:
      'Returns a price quote for a fax: normalized number, destination country, page count, cost and whether the balance is sufficient. Read-only and free.',
    idempotent: true,
  },
  props: { recipient_fax_number: faxNumberProp, ...documentProps },
  async run({ auth, propsValue }) {
    const p = propsValue;
    return await mcpfaxRequest(auth.secret_text, HttpMethod.POST, '/fax/price', {
      recipient_fax_number: p.recipient_fax_number,
      ...documentBody(p),
      ...optional({ recipient_name: p.recipient_name, cover_page: p.cover_page, send_at: p.send_at }),
    });
  },
});
