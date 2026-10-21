import { createAction } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { mcpfaxAuth } from '../auth';
import { mcpfaxClient, mcpfaxProps } from '../common';

export const cancelScheduledFax = createAction({
  auth: mcpfaxAuth,
  name: 'cancel_scheduled_fax',
  classification: 'DESTRUCTIVE',
  displayName: 'Cancel Scheduled Fax',
  description: 'Cancel a scheduled fax before it is sent (full refund).',
  audience: 'both',
  aiMetadata: {
    description: 'Cancels a fax with status scheduled and refunds the reserved amount.',
    idempotent: true,
  },
  props: {
    fax_id: mcpfaxProps.faxId,
  },
  async run({ auth, propsValue }) {
    return await mcpfaxClient.request({
      apiKey: auth.secret_text,
      method: HttpMethod.POST,
      path: `/fax/${propsValue.fax_id}/cancel`,
      body: {},
    });
  },
});
