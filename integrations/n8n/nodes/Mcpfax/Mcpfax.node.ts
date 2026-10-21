import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { BASE_URL, mcpfaxRequest } from './GenericFunctions';

const documentFields = (operation: string[]) => [
	{
		displayName: 'Fax Number',
		name: 'faxNumber',
		type: 'string' as const,
		default: '',
		required: true,
		placeholder: '+49 30 1234567',
		description:
			'Recipient fax number in international format. National numbers are interpreted for your account country.',
		displayOptions: { show: { resource: ['fax'], operation } },
	},
	{
		displayName: 'Document Source',
		name: 'documentSource',
		type: 'options' as const,
		default: 'binary',
		options: [
			{ name: 'Binary File', value: 'binary', description: 'A file from a previous node (PDF, DOCX, JPG, PNG, TXT)' },
			{ name: 'Text', value: 'text', description: 'Plain text or Markdown, rendered as clean A4 pages' },
			{ name: 'URL', value: 'url', description: 'Public HTTPS URL of the document' },
		],
		displayOptions: { show: { resource: ['fax'], operation } },
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string' as const,
		default: 'data',
		required: true,
		description: 'Name of the binary property that contains the document (max. 15 MB)',
		displayOptions: { show: { resource: ['fax'], operation, documentSource: ['binary'] } },
	},
	{
		displayName: 'Text',
		name: 'content',
		type: 'string' as const,
		typeOptions: { rows: 6 },
		default: '',
		required: true,
		description: 'Text of the fax. Markdown headings, lists and bold text are supported.',
		displayOptions: { show: { resource: ['fax'], operation, documentSource: ['text'] } },
	},
	{
		displayName: 'Text Format',
		name: 'contentFormat',
		type: 'options' as const,
		default: 'markdown',
		options: [
			{ name: 'Markdown', value: 'markdown' },
			{ name: 'Plain Text', value: 'text' },
		],
		displayOptions: { show: { resource: ['fax'], operation, documentSource: ['text'] } },
	},
	{
		displayName: 'Document URL',
		name: 'fileUrl',
		type: 'string' as const,
		default: '',
		required: true,
		placeholder: 'https://example.com/letter.pdf',
		displayOptions: { show: { resource: ['fax'], operation, documentSource: ['url'] } },
	},
];

export class Mcpfax implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'mcpfax',
		name: 'mcpfax',
		icon: 'file:mcpfax.svg',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Send real faxes worldwide with mcpfax (prepaid, no subscription)',
		defaults: { name: 'mcpfax' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [{ name: 'mcpfaxApi', required: true }],
		requestDefaults: { baseURL: BASE_URL },
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				default: 'fax',
				options: [
					{ name: 'Fax', value: 'fax' },
					{ name: 'Contact', value: 'contact' },
					{ name: 'Account', value: 'account' },
				],
			},
			// ---------------- Fax ----------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['fax'] } },
				default: 'send',
				options: [
					{ name: 'Cancel Scheduled', value: 'cancel', action: 'Cancel a scheduled fax', description: 'Cancel a scheduled fax with full refund' },
					{ name: 'Download Send Report', value: 'report', action: 'Download the PDF send report', description: 'Download the PDF send report of a fax' },
					{ name: 'Get', value: 'get', action: 'Get the status of a fax', description: 'Get the status of a fax' },
					{ name: 'Get Many', value: 'getAll', action: 'Get many faxes', description: 'List recent faxes' },
					{ name: 'Get Price', value: 'price', action: 'Get the price of a fax', description: 'Validate the number, count pages and return the exact cost – sends nothing' },
					{ name: 'Resend', value: 'resend', action: 'Resend a fax', description: 'Send a previous fax again (costs credit)' },
					{ name: 'Send', value: 'send', action: 'Send a fax', description: 'Send a document as a real fax (costs credit)' },
				],
			},
			...documentFields(['send', 'price']),
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['fax'], operation: ['send', 'price'] } },
				options: [
					{ displayName: 'Cover Message', name: 'cover_message', type: 'string', typeOptions: { rows: 3 }, default: '', description: 'Message on the cover page (only with Cover Page)' },
					{ displayName: 'Cover Page', name: 'cover_page', type: 'boolean', default: false, description: 'Whether to add a cover page (counts as one extra page)' },
					{ displayName: 'Idempotency Key', name: 'idempotency_key', type: 'string', default: '', description: 'Unique key (e.g. order ID). Retries with the same key never send the fax twice. Only used by Send.' },
					{ displayName: 'Max Cost', name: 'max_cost', type: 'number', typeOptions: { numberPrecision: 2, minValue: 0 }, default: 0, description: 'Safety limit in your account currency – the fax is not sent if it would cost more. Only used by Send.' },
					{ displayName: 'Recipient Name', name: 'recipient_name', type: 'string', default: '', description: 'Recipient name, shown on the cover page and in the history' },
					{ displayName: 'Send At', name: 'send_at', type: 'dateTime', default: '', description: 'Schedule the fax for later (up to 365 days). The amount is reserved now and refunded if cancelled.' },
					{ displayName: 'Subject', name: 'subject', type: 'string', default: '' },
					{ displayName: 'Timezone', name: 'timezone', type: 'string', default: '', placeholder: 'Europe/Berlin', description: 'IANA time zone for Send At without offset' },
				],
			},
			{
				displayName: 'Fax ID',
				name: 'faxId',
				type: 'number',
				default: 0,
				required: true,
				displayOptions: { show: { resource: ['fax'], operation: ['get', 'resend', 'cancel', 'report'] } },
			},
			{
				displayName: 'Put Output File in Field',
				name: 'binaryPropertyOutput',
				type: 'string',
				default: 'data',
				displayOptions: { show: { resource: ['fax'], operation: ['report'] } },
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 50 },
				default: 10,
				description: 'Max number of results to return',
				displayOptions: { show: { resource: ['fax'], operation: ['getAll'] } },
			},
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: { show: { resource: ['fax'], operation: ['getAll'] } },
				options: [
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						default: 'delivered',
						options: [
							{ name: 'Cancelled', value: 'cancelled' },
							{ name: 'Delivered', value: 'delivered' },
							{ name: 'Failed', value: 'failed' },
							{ name: 'Pending', value: 'pending' },
							{ name: 'Retrying', value: 'retrying' },
							{ name: 'Scheduled', value: 'scheduled' },
							{ name: 'Sent', value: 'sent' },
						],
					},
					{ displayName: 'Since', name: 'since', type: 'dateTime', default: '', description: 'Only faxes created on or after this day' },
				],
			},
			// ---------------- Contact ----------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['contact'] } },
				default: 'search',
				options: [
					{ name: 'Save', value: 'save', action: 'Save a contact', description: 'Create or update a fax contact' },
					{ name: 'Search', value: 'search', action: 'Search contacts', description: 'Search the fax address book' },
				],
			},
			{
				displayName: 'Search Term',
				name: 'query',
				type: 'string',
				default: '',
				description: 'Name or part of the name/number. Leave empty to list contacts.',
				displayOptions: { show: { resource: ['contact'], operation: ['search'] } },
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['contact'], operation: ['save'] } },
			},
			{
				displayName: 'Fax Number',
				name: 'contactFax',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['contact'], operation: ['save'] } },
			},
			{
				displayName: 'Note',
				name: 'note',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['contact'], operation: ['save'] } },
			},
			// ---------------- Account ----------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['account'] } },
				default: 'balance',
				options: [{ name: 'Get Balance', value: 'balance', action: 'Get the account balance', description: 'Prepaid balance and current prices' }],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const out: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				let res: IDataObject | IDataObject[] = {};

				if (resource === 'fax') {
					if (operation === 'send' || operation === 'price') {
						const body: IDataObject = {
							recipient_fax_number: this.getNodeParameter('faxNumber', i) as string,
						};
						const source = this.getNodeParameter('documentSource', i) as string;
						if (source === 'binary') {
							const prop = this.getNodeParameter('binaryPropertyName', i) as string;
							const bin = this.helpers.assertBinaryData(i, prop);
							const buf = await this.helpers.getBinaryDataBuffer(i, prop);
							body.file_base64 = buf.toString('base64');
							body.file_name = bin.fileName || `document.${bin.fileExtension || 'pdf'}`;
						} else if (source === 'text') {
							body.content = this.getNodeParameter('content', i) as string;
							body.content_format = this.getNodeParameter('contentFormat', i) as string;
						} else {
							body.file_url = this.getNodeParameter('fileUrl', i) as string;
						}
						const add = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
						for (const [k, v] of Object.entries(add)) {
							if (v === '' || v === null || v === undefined) continue;
							if (k === 'max_cost' && !v) continue;
							if (operation === 'price' && (k === 'idempotency_key' || k === 'max_cost')) continue;
							body[k] = v;
						}
						res = await mcpfaxRequest.call(this, 'POST', operation === 'send' ? '/fax/send' : '/fax/price', body);
					} else if (operation === 'get') {
						res = await mcpfaxRequest.call(this, 'GET', `/fax/${this.getNodeParameter('faxId', i)}`);
					} else if (operation === 'resend') {
						res = await mcpfaxRequest.call(this, 'POST', `/fax/${this.getNodeParameter('faxId', i)}/resend`, {});
					} else if (operation === 'cancel') {
						res = await mcpfaxRequest.call(this, 'POST', `/fax/${this.getNodeParameter('faxId', i)}/cancel`, {});
					} else if (operation === 'getAll') {
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
						const qs: IDataObject = { limit: this.getNodeParameter('limit', i) };
						if (filters.status) qs.status = filters.status;
						if (filters.since) qs.since = String(filters.since).slice(0, 10);
						const data = await mcpfaxRequest.call(this, 'GET', '/faxes', undefined, qs);
						res = (data.faxes ?? []) as IDataObject[];
					} else if (operation === 'report') {
						const faxId = this.getNodeParameter('faxId', i) as number;
						const pdf = (await mcpfaxRequest.call(this, 'GET', `/fax/${faxId}/report`, undefined, undefined, {
							json: false,
							encoding: 'arraybuffer',
						})) as ArrayBuffer;
						const field = this.getNodeParameter('binaryPropertyOutput', i) as string;
						const binary = await this.helpers.prepareBinaryData(
							Buffer.from(pdf),
							`send-report-fax-${faxId}.pdf`,
							'application/pdf',
						);
						out.push({ json: { fax_id: faxId }, binary: { [field]: binary }, pairedItem: { item: i } });
						continue;
					}
				} else if (resource === 'contact') {
					if (operation === 'search') {
						const data = await mcpfaxRequest.call(this, 'GET', '/contacts', undefined, {
							q: this.getNodeParameter('query', i) as string,
							limit: 50,
						});
						res = (data.contacts ?? []) as IDataObject[];
					} else {
						const body: IDataObject = {
							name: this.getNodeParameter('name', i) as string,
							fax_number: this.getNodeParameter('contactFax', i) as string,
						};
						const note = this.getNodeParameter('note', i) as string;
						if (note) body.note = note;
						res = await mcpfaxRequest.call(this, 'POST', '/contacts', body);
					}
				} else if (resource === 'account') {
					res = await mcpfaxRequest.call(this, 'GET', '/balance');
				} else {
					throw new NodeOperationError(this.getNode(), `Unknown resource ${resource}`, { itemIndex: i });
				}

				const arr = Array.isArray(res) ? res : [res];
				for (const r of arr) out.push({ json: r, pairedItem: { item: i } });
			} catch (error) {
				if (this.continueOnFail()) {
					out.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				throw error;
			}
		}
		return [out];
	}
}
