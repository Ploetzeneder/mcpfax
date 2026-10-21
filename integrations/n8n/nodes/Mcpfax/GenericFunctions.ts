import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	IPollFunctions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export const BASE_URL = 'https://mcpfax.de/api/v1';

export async function mcpfaxRequest(
	this: IExecuteFunctions | IPollFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
	qs?: IDataObject,
	extra: Partial<IHttpRequestOptions> = {},
): Promise<any> {
	const options: IHttpRequestOptions = {
		method,
		url: BASE_URL + endpoint,
		json: true,
		headers: { 'X-Mcpfax-Client': 'n8n' },
		...extra,
	};
	if (body && Object.keys(body).length) options.body = body;
	if (qs && Object.keys(qs).length) options.qs = qs;
	try {
		return await this.helpers.httpRequestWithAuthentication.call(this, 'mcpfaxApi', options);
	} catch (error) {
		const data = (error as JsonObject)?.response as JsonObject | undefined;
		const apiBody = (data?.body ?? (error as JsonObject)?.description) as IDataObject | undefined;
		const message =
			apiBody && typeof apiBody === 'object' && apiBody.message
				? `${apiBody.error ?? 'error'}: ${apiBody.message}`
				: undefined;
		throw new NodeApiError(this.getNode(), error as JsonObject, message ? { message } : undefined);
	}
}
