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
      queryParams: { status: 'delivered', limit: '50' },
    });
    return [...(response.faxes ?? [])]
      .sort((a, b) => b.fax_id - a.fax_id)
      .map((fax) => ({ id: fax.fax_id, data: fax }));
  },
};

export const faxDelivered = createTrigger({
  auth: mcpfaxAuth,
  name: 'fax_delivered',
  classification: 'READ',
  displayName: 'Fax Delivered',
  description: 'Triggers when a fax was transmitted successfully.',
  aiMetadata: {
    description: 'Fires once per fax that reached the status delivered.',
  },
  props: {},
  sampleData: sampleFax,
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
