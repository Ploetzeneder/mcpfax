import { ApFile, Property } from '@activepieces/pieces-framework';
import { httpClient, HttpMethod, HttpMessageBody } from '@activepieces/pieces-common';

export const MCPFAX_API = 'https://mcpfax.de/api/v1';

export async function mcpfaxRequest<T extends HttpMessageBody = Record<string, unknown>>(
  apiKey: string,
  method: HttpMethod,
  path: string,
  body?: Record<string, unknown>,
  queryParams?: Record<string, string>,
): Promise<T> {
  const res = await httpClient.sendRequest<T>({
    method,
    url: `${MCPFAX_API}${path}`,
    headers: { Authorization: `Bearer ${apiKey}`, 'X-Mcpfax-Client': 'activepieces' },
    body,
    queryParams,
  });
  return res.body;
}

export const faxNumberProp = Property.ShortText({
  displayName: 'Fax Number',
  description: 'Recipient fax number in international format, e.g. +49 30 1234567.',
  required: true,
});

export const documentProps = {
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
  subject: Property.ShortText({ displayName: 'Subject', required: false }),
  send_at: Property.DateTime({
    displayName: 'Send At',
    description: 'Optional: schedule the fax for later (up to 365 days). The amount is reserved now.',
    required: false,
  }),
};

export function documentBody(props: {
  file?: ApFile | null;
  content?: string | null;
  file_url?: string | null;
}): Record<string, unknown> {
  if (props.file) {
    return { file_base64: props.file.base64, file_name: props.file.filename };
  }
  if (props.content) return { content: props.content, content_format: 'markdown' };
  if (props.file_url) return { file_url: props.file_url };
  throw new Error('Please provide a document, a text or a document URL.');
}

export function optional(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== false),
  );
}

export type Fax = {
  fax_id: number;
  to: string;
  status: string;
  pages: number;
  cost: number;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
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
