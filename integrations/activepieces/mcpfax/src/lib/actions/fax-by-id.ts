import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { mcpfaxAuth } from '../auth';
import { mcpfaxRequest } from '../common';

const faxId = Property.Number({
  displayName: 'Fax ID',
  description: 'The fax_id returned by Send Fax.',
  required: true,
});

export const getFaxStatus = createAction({
  auth: mcpfaxAuth,
  name: 'get_fax_status',
  displayName: 'Get Fax Status',
  description: 'Get the delivery status of a fax.',
  classification: 'READ',
  audience: 'both',
  aiMetadata: { description: 'Returns status (pending, sent, delivered, failed, scheduled …), pages and cost of one fax.', idempotent: true },
  props: { fax_id: faxId },
  async run({ auth, propsValue }) {
    return await mcpfaxRequest(auth.secret_text, HttpMethod.GET, `/fax/${propsValue.fax_id}`);
  },
});

export const resendFax = createAction({
  auth: mcpfaxAuth,
  name: 'resend_fax',
  displayName: 'Resend Fax',
  description: 'Send a previous fax again. Costs prepaid credit.',
  classification: 'WRITE',
  audience: 'both',
  aiMetadata: { description: 'Sends an earlier fax again as a new fax and charges the balance.', idempotent: false },
  props: { fax_id: faxId },
  async run({ auth, propsValue }) {
    return await mcpfaxRequest(auth.secret_text, HttpMethod.POST, `/fax/${propsValue.fax_id}/resend`, {});
  },
});

export const cancelScheduledFax = createAction({
  auth: mcpfaxAuth,
  name: 'cancel_scheduled_fax',
  displayName: 'Cancel Scheduled Fax',
  description: 'Cancel a scheduled fax before it is sent (full refund).',
  classification: 'DESTRUCTIVE',
  audience: 'both',
  aiMetadata: { description: 'Cancels a fax with status scheduled and refunds the reserved amount.', idempotent: true },
  props: { fax_id: faxId },
  async run({ auth, propsValue }) {
    return await mcpfaxRequest(auth.secret_text, HttpMethod.POST, `/fax/${propsValue.fax_id}/cancel`, {});
  },
});

export const downloadSendReport = createAction({
  auth: mcpfaxAuth,
  name: 'download_send_report',
  displayName: 'Download Send Report',
  description: 'Download the PDF send report of a fax as proof of transmission.',
  classification: 'READ',
  audience: 'both',
  aiMetadata: { description: 'Returns the PDF send report of one fax as a file.', idempotent: true },
  props: { fax_id: faxId },
  async run({ auth, propsValue, files }) {
    const res = await fetch(`https://mcpfax.de/api/v1/fax/${propsValue.fax_id}/report`, {
      headers: { Authorization: `Bearer ${auth.secret_text}` },
    });
    if (!res.ok) throw new Error(`mcpfax: send report not available (HTTP ${res.status})`);
    const data = Buffer.from(await res.arrayBuffer());
    const fileName = `send-report-fax-${propsValue.fax_id}.pdf`;
    return { fax_id: propsValue.fax_id, file: await files.write({ fileName, data }) };
  },
});
