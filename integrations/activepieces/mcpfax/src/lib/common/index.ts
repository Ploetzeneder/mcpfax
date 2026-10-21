import { ApFile, Property } from '@activepieces/pieces-framework';
import { AuthenticationType, httpClient, HttpMessageBody, HttpMethod } from '@activepieces/pieces-common';

const MCPFAX_API = 'https://mcpfax.de/api/v1';

async function request<T extends HttpMessageBody>({
  apiKey,
  method,
  path,
  body,
  queryParams,
}: RequestParams): Promise<T> {
  const response = await httpClient.sendRequest<T>({
    method,
    url: `${MCPFAX_API}${path}`,
    authentication: { type: AuthenticationType.BEARER_TOKEN, token: apiKey },
    headers: { 'X-Mcpfax-Client': 'activepieces' },
    body,
    queryParams,
  });
  return response.body;
}

async function downloadReport({ apiKey, faxId }: { apiKey: string; faxId: number }): Promise<Buffer> {
  const response = await httpClient.sendRequest<Buffer>({
    method: HttpMethod.GET,
    url: `${MCPFAX_API}/fax/${faxId}/report`,
    authentication: { type: AuthenticationType.BEARER_TOKEN, token: apiKey },
    responseType: 'arraybuffer',
  });
  return response.body;
}

function documentBody({ file, content, fileUrl }: DocumentInput): Record<string, unknown> {
  if (file) {
    return { file_base64: file.base64, file_name: file.filename };
  }
  if (content) {
    return { content, content_format: 'markdown' };
  }
  if (fileUrl) {
    return { file_url: fileUrl };
  }
  throw new Error('Please provide a document, a text or a document URL.');
}

function withoutEmpty(values: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== undefined && value !== null && value !== '' && value !== false),
  );
}

export const mcpfaxClient = { apiUrl: MCPFAX_API, request, downloadReport, documentBody, withoutEmpty };

export const mcpfaxProps = {
  faxNumber: Property.ShortText({
    displayName: 'Fax Number',
    description: 'Recipient fax number in international format, e.g. +49 30 1234567.',
    required: true,
  }),
  faxId: Property.Number({
    displayName: 'Fax ID',
    description: 'The fax ID returned by Send Fax.',
    required: true,
  }),
  document: {
    file: Property.File({
      displayName: 'Document',
      description: 'PDF, DOCX, JPG, PNG or TXT (max. 15 MB). Leave empty to fax the text below instead.',
      required: false,
    }),
    content: Property.LongText({
      displayName: 'Text',
      description: 'Text of the fax if no document is given. Markdown (headings, lists, bold) is supported.',
      required: false,
    }),
    file_url: Property.ShortText({
      displayName: 'Document URL',
      description: 'Alternative: public HTTPS URL of the document.',
      required: false,
    }),
    recipient_name: Property.ShortText({
      displayName: 'Recipient Name',
      description: 'Shown on the cover page and in the fax history.',
      required: false,
    }),
    cover_page: Property.Checkbox({
      displayName: 'Cover Page',
      description: 'Add a cover page (counts as one extra page).',
      required: false,
      defaultValue: false,
    }),
    subject: Property.ShortText({
      displayName: 'Subject',
      description: 'Shown on the cover page and in the fax history.',
      required: false,
    }),
    send_at: Property.DateTime({
      displayName: 'Send At',
      description: 'Optional: schedule the fax for later (up to 365 days). The amount is reserved now.',
      required: false,
    }),
  },
};

export const sampleFax: Fax = {
  fax_id: 1234,
  to: '+49301234567',
  country: 'DE',
  pages: 2,
  cost: 1.2,
  status: 'delivered',
  status_description: 'Transmitted successfully.',
  error: null,
  document: 'invoice.pdf',
  cover_page: false,
  created_at: '2026-10-21T10:00:00+02:00',
  updated_at: '2026-10-21T10:01:30+02:00',
  can_resend: true,
};

type RequestParams = {
  apiKey: string;
  method: HttpMethod;
  path: string;
  body?: Record<string, unknown>;
  queryParams?: Record<string, string>;
};

type DocumentInput = {
  file?: ApFile | null;
  content?: string | null;
  fileUrl?: string | null;
};

export type Fax = {
  fax_id: number;
  to: string;
  country: string;
  pages: number;
  cost: number;
  status: string;
  status_description: string;
  error: string | null;
  document: string | null;
  cover_page: boolean;
  created_at: string;
  updated_at: string;
  can_resend: boolean;
};
