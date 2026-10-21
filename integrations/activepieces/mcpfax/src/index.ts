import { createCustomApiCallAction } from '@activepieces/pieces-common';
import { createPiece, PieceCategory } from '@activepieces/pieces-framework';
import { mcpfaxAuth } from './lib/auth';
import { mcpfaxClient } from './lib/common';
import { sendFax } from './lib/actions/send-fax';
import { getFaxPrice } from './lib/actions/get-fax-price';
import { getFaxStatus } from './lib/actions/get-fax-status';
import { resendFax } from './lib/actions/resend-fax';
import { cancelScheduledFax } from './lib/actions/cancel-scheduled-fax';
import { downloadSendReport } from './lib/actions/download-send-report';
import { getBalance } from './lib/actions/get-balance';
import { findContact } from './lib/actions/find-contact';
import { saveContact } from './lib/actions/save-contact';
import { faxDelivered } from './lib/triggers/fax-delivered';
import { faxFailed } from './lib/triggers/fax-failed';

export const mcpfax = createPiece({
  displayName: 'mcpfax',
  description: 'Send real faxes worldwide – prepaid, no subscription, with PDF send report.',
  auth: mcpfaxAuth,
  minimumSupportedRelease: '0.36.1',
  logoUrl: 'https://cdn.activepieces.com/pieces/mcpfax.png',
  categories: [PieceCategory.COMMUNICATION],
  authors: ['Ploetzeneder'],
  actions: [
    sendFax,
    getFaxPrice,
    getFaxStatus,
    resendFax,
    cancelScheduledFax,
    downloadSendReport,
    getBalance,
    findContact,
    saveContact,
    createCustomApiCallAction({
      baseUrl: () => mcpfaxClient.apiUrl,
      auth: mcpfaxAuth,
      authMapping: async (auth) => ({ Authorization: `Bearer ${auth.secret_text}` }),
    }),
  ],
  triggers: [faxDelivered, faxFailed],
});
