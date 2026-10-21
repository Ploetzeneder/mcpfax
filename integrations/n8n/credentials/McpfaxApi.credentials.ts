import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class McpfaxApi implements ICredentialType {
	name = 'mcpfaxApi';

	displayName = 'mcpfax API';

	documentationUrl = 'https://mcpfax.de/api.php';

	icon = 'file:mcpfax.svg' as const;

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			placeholder: 'mfx_…',
			description: 'Create an API key at https://mcpfax.de/account.php#keys',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://mcpfax.de/api/v1',
			url: '/balance',
		},
	};
}
