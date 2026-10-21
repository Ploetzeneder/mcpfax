import { createAction } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { mcpfaxAuth } from '../auth';
import { mcpfaxClient, mcpfaxProps } from '../common';

export const getFaxStatus = createAction({
  auth: mcpfaxAuth,
  name: 'get_fax_status',
  classification: 'READ',
  displayName: 'Get Fax Status',
  description: 'Get the delivery status of a fax.',
  audience: 'both',
  aiMetadata: {
    description: 'Returns status (pending, sent, delivered, failed, scheduled …), pages and cost of one fax.',
    idempotent: true,
  },
  props: {
    fax_id: mcpfaxProps.faxId,
  },
  async run({ auth, propsValue }) {
    return await mcpfaxClient.request({
      apiKey: auth.secret_text,
      method: HttpMethod.GET,
      path: `/fax/${propsValue.fax_id}`,
    });
  },
});
