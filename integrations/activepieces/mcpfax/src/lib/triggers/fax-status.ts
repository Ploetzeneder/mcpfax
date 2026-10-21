import {
  AppConnectionValueForAuthProperty,
  createTrigger,
  TriggerStrategy,
} from '@activepieces/pieces-framework';
import { DedupeStrategy, HttpMethod, Polling, pollingHelper } from '@activepieces/pieces-common';
import { mcpfaxAuth } from '../auth';
import { Fax, mcpfaxRequest, sampleFax } from '../common';

function makePolling(
  status: 'delivered' | 'failed',
): Polling<AppConnectionValueForAuthProperty<typeof mcpfaxAuth>, Record<string, never>> {
  return {
    strategy: DedupeStrategy.LAST_ITEM,
    async items({ auth }) {
      const res = await mcpfaxRequest<{ faxes?: Fax[] }>(auth.secret_text, HttpMethod.GET, '/faxes', undefined, {
        status,
        limit: '50',
      });
      const faxes = (res.faxes ?? []).sort((a, b) => b.fax_id - a.fax_id);
      return faxes.map((fax) => ({ id: fax.fax_id, data: fax }));
    },
  };
}

function makeTrigger(status: 'delivered' | 'failed') {
  const polling = makePolling(status);
  const delivered = status === 'delivered';
  return createTrigger({
    auth: mcpfaxAuth,
    name: delivered ? 'fax_delivered' : 'fax_failed',
    displayName: delivered ? 'Fax Delivered' : 'Fax Failed',
    description: delivered
      ? 'Triggers when a fax was transmitted successfully.'
      : 'Triggers when a fax could not be delivered (the amount is refunded automatically).',
    classification: 'READ',
    aiMetadata: {
      description: delivered
        ? 'Fires once per fax that reached the status delivered.'
        : 'Fires once per fax that ended with status failed after all retries.',
    },
    props: {},
    sampleData: delivered ? sampleFax : { ...sampleFax, status: 'failed', error: 'No answer', cost: 0 },
    type: TriggerStrategy.POLLING,
    async onEnable(context) {
      await pollingHelper.onEnable(polling, { auth: context.auth, store: context.store, propsValue: context.propsValue });
    },
    async onDisable(context) {
      await pollingHelper.onDisable(polling, { auth: context.auth, store: context.store, propsValue: context.propsValue });
    },
    async test(context) {
      return await pollingHelper.test(polling, context);
    },
    async run(context) {
      return await pollingHelper.poll(polling, context);
    },
  });
}

export const faxDelivered = makeTrigger('delivered');
export const faxFailed = makeTrigger('failed');
