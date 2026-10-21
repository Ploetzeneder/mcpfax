import { AppConnectionValueForAuthProperty, createTrigger, TriggerStrategy } from '@activepieces/pieces-framework';
import { DedupeStrategy, HttpMethod, Polling, pollingHelper } from '@activepieces/pieces-common';
import { mcpfaxAuth } from '../auth';
import { Fax, mcpfaxClient, sampleFax } from '../common';

const polling: Polling<AppConnectionValueForAuthProperty<typeof mcpfaxAuth>, Record<string, never>> = {
  strategy: DedupeStrategy.LAST_ITEM,
  items: async ({ auth }) => {
    const response = await mcpfaxClient.request<{ faxes?: Fax[] }>({
      apiKey: auth.secret_text,
      method: HttpMethod.GET,
      path: '/faxes',
      queryParams: { status: 'failed', limit: '50' },
    });
    return [...(response.faxes ?? [])]
      .sort((a, b) => b.fax_id - a.fax_id)
      .map((fax) => ({ id: fax.fax_id, data: fax }));
  },
};

export const faxFailed = createTrigger({
  auth: mcpfaxAuth,
  name: 'fax_failed',
  classification: 'READ',
  displayName: 'Fax Failed',
  description: 'Triggers when a fax could not be delivered (the amount is refunded automatically).',
  aiMetadata: {
    description: 'Fires once per fax that ended with status failed after all retries.',
  },
  props: {},
  sampleData: { ...sampleFax, status: 'failed', status_description: 'Not delivered.', error: 'No answer', cost: 0 },
  type: TriggerStrategy.POLLING,
  async test(context) {
    return await pollingHelper.test(polling, context);
  },
  async onEnable(context) {
    await pollingHelper.onEnable(polling, context);
  },
  async onDisable(context) {
    await pollingHelper.onDisable(polling, context);
  },
  async run(context) {
    return await pollingHelper.poll(polling, context);
  },
});
