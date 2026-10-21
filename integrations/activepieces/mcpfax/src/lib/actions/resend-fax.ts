import { createAction } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { mcpfaxAuth } from '../auth';
import { mcpfaxClient, mcpfaxProps } from '../common';

export const resendFax = createAction({
  auth: mcpfaxAuth,
  name: 'resend_fax',
  classification: 'WRITE',
  displayName: 'Resend Fax',
  description: 'Send a previous fax again. Costs prepaid credit.',
  audience: 'both',
  aiMetadata: {
    description: 'Sends an earlier fax again as a new fax and charges the balance.',
    idempotent: false,
  },
  props: {
    fax_id: mcpfaxProps.faxId,
  },
  async run({ auth, propsValue }) {
    return await mcpfaxClient.request({
      apiKey: auth.secret_text,
      method: HttpMethod.POST,
      path: `/fax/${propsValue.fax_id}/resend`,
      body: {},
    });
  },
});
