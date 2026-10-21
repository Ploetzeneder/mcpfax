import { createAction } from '@activepieces/pieces-framework';
import { mcpfaxAuth } from '../auth';
import { mcpfaxClient, mcpfaxProps } from '../common';

export const downloadSendReport = createAction({
  auth: mcpfaxAuth,
  name: 'download_send_report',
  classification: 'READ',
  displayName: 'Download Send Report',
  description: 'Download the PDF send report of a fax as proof of transmission.',
  audience: 'both',
  aiMetadata: {
    description: 'Returns the PDF send report of one fax as a file.',
    idempotent: true,
  },
  props: {
    fax_id: mcpfaxProps.faxId,
  },
  async run({ auth, propsValue, files }) {
    const data = await mcpfaxClient.downloadReport({ apiKey: auth.secret_text, faxId: propsValue.fax_id });
    const fileName = `send-report-fax-${propsValue.fax_id}.pdf`;
    return {
      fax_id: propsValue.fax_id,
      file_name: fileName,
      file: await files.write({ fileName, data }),
    };
  },
});
