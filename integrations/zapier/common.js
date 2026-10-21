const API = 'https://mcpfax.de/api/v1';

const sampleFax = {
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

const faxOutputFields = [
  { key: 'fax_id', label: 'Fax ID', type: 'integer' },
  { key: 'to', label: 'Fax Number' },
  { key: 'status', label: 'Status' },
  { key: 'status_description', label: 'Status Description' },
  { key: 'pages', label: 'Pages', type: 'integer' },
  { key: 'cost', label: 'Cost', type: 'number' },
  { key: 'currency', label: 'Currency' },
  { key: 'scheduled_at', label: 'Scheduled For' },
  { key: 'created_at', label: 'Created At' },
];

const documentFields = [
  {
    key: 'recipient_fax_number',
    label: 'Fax Number',
    required: true,
    helpText: 'Recipient fax number in international format, e.g. `+49 30 1234567`.',
  },
  {
    key: 'file',
    label: 'Document',
    type: 'file',
    required: false,
    helpText: 'PDF, DOCX, JPG, PNG or TXT (max. 15 MB). Leave empty to fax the text below instead.',
  },
  {
    key: 'content',
    label: 'Text',
    type: 'text',
    required: false,
    helpText: 'Text of the fax if no document is given. Markdown (headings, lists, **bold**) is supported.',
  },
  { key: 'recipient_name', label: 'Recipient Name', required: false, helpText: 'Shown on the cover page and in the fax history.' },
  { key: 'cover_page', label: 'Cover Page', type: 'boolean', required: false, default: 'false' },
  { key: 'subject', label: 'Subject', required: false },
  {
    key: 'send_at',
    label: 'Send At',
    type: 'datetime',
    required: false,
    helpText: 'Optional: schedule the fax for later (up to 365 days). The amount is reserved now and refunded if cancelled.',
  },
];

async function documentBody(z, bundle) {
  const d = bundle.inputData;
  const body = { recipient_fax_number: d.recipient_fax_number };
  if (d.file) {
    const res = await z.request({ url: d.file, raw: true, skipThrowForStatus: false });
    const buf = Buffer.from(await res.buffer());
    let name = 'document.pdf';
    const cd = res.headers.get('content-disposition') || '';
    const m = cd.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
    if (m) name = decodeURIComponent(m[1]);
    else {
      const path = String(d.file).split('?')[0].split('/').pop();
      if (path && path.includes('.')) name = path;
    }
    body.file_base64 = buf.toString('base64');
    body.file_name = name;
  } else if (d.content) {
    body.content = d.content;
    body.content_format = 'markdown';
  } else {
    throw new z.errors.Error('Please provide a document or a text.', 'MissingDocument', 400);
  }
  for (const k of ['recipient_name', 'subject', 'send_at']) if (d[k]) body[k] = d[k];
  if (d.cover_page === true || d.cover_page === 'true') body.cover_page = true;
  return body;
}

module.exports = { API, sampleFax, faxOutputFields, documentFields, documentBody };
