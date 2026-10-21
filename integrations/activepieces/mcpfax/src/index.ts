import { createCustomApiCallAction } from '@activepieces/pieces-common';
import { createPiece, PieceCategory } from '@activepieces/pieces-framework';
import { mcpfaxAuth } from './lib/auth';
import { MCPFAX_API } from './lib/common';
import { sendFax } from './lib/actions/send-fax';
import { getFaxPrice } from './lib/actions/get-fax-price';
import { cancelScheduledFax, downloadSendReport, getFaxStatus, resendFax } from './lib/actions/fax-by-id';
import { findContact, getBalance, saveContact } from './lib/actions/account';
import { faxDelivered, faxFailed } from './lib/triggers/fax-status';

export { mcpfaxAuth };

export const mcpfax = createPiece({
  displayName: 'mcpfax',
  description: 'Send real faxes worldwide – prepaid, no subscription, with PDF send report.',
  auth: mcpfaxAuth,
  minimumSupportedRelease: '0.36.1',
  logoUrl: 'https://mcpfax.de/assets/app-icon-1024.png',
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
      baseUrl: () => MCPFAX_API,
      auth: mcpfaxAuth,
      authMapping: async (auth) => ({ Authorization: `Bearer ${auth.secret_text}` }),
    }),
  ],
  triggers: [faxDelivered, faxFailed],
});
