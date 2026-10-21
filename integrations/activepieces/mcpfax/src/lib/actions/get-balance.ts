import { createAction } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { mcpfaxAuth } from '../auth';
import { mcpfaxClient } from '../common';

export const getBalance = createAction({
  auth: mcpfaxAuth,
  name: 'get_balance',
  classification: 'READ',
  displayName: 'Get Balance',
  description: 'Get the prepaid balance and current prices.',
  audience: 'both',
  aiMetadata: {
    description: 'Returns the prepaid balance, currency and per-page prices.',
    idempotent: true,
  },
  props: {},
  async run({ auth }) {
    return await mcpfaxClient.request({ apiKey: auth.secret_text, method: HttpMethod.GET, path: '/balance' });
  },
});
