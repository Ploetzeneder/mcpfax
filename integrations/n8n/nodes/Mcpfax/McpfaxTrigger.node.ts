import type {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IPollFunctions,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { mcpfaxRequest } from './GenericFunctions';

export class McpfaxTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'mcpfax Trigger',
		name: 'mcpfaxTrigger',
		icon: 'file:mcpfax.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Starts the workflow when a fax was delivered or failed',
		defaults: { name: 'mcpfax Trigger' },
		polling: true,
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'mcpfaxApi', required: true }],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				default: 'delivered',
				options: [
					{ name: 'Fax Delivered', value: 'delivered', description: 'A fax was transmitted successfully' },
					{ name: 'Fax Failed', value: 'failed', description: 'A fax could not be delivered (amount refunded)' },
				],
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const event = this.getNodeParameter('event') as string;
		const state = this.getWorkflowStaticData('node') as IDataObject;
		const data = await mcpfaxRequest.call(this, 'GET', '/faxes', undefined, { status: event, limit: 50 });
		const faxes = ((data.faxes ?? []) as IDataObject[]).sort((a, b) => (a.fax_id as number) - (b.fax_id as number));

		if (this.getMode() === 'manual') {
			const last = faxes[faxes.length - 1];
			return last ? [this.helpers.returnJsonArray([last])] : null;
		}

		const seen = (state.lastFaxId as number | undefined) ?? undefined;
		const maxId = faxes.length ? (faxes[faxes.length - 1].fax_id as number) : 0;
		if (seen === undefined) {
			state.lastFaxId = maxId; // first activation: do not replay history
			return null;
		}
		const fresh = faxes.filter((f) => (f.fax_id as number) > seen);
		if (!fresh.length) return null;
		state.lastFaxId = maxId;
		return [this.helpers.returnJsonArray(fresh)];
	}
}
