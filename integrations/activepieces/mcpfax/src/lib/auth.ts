import { PieceAuth } from '@activepieces/pieces-framework';
import { httpClient, HttpMethod } from '@activepieces/pieces-common';
import { MCPFAX_API } from './common';

export const mcpfaxAuth = PieceAuth.SecretText({
  displayName: 'API Key',
  description: `To get your API key:
1. Sign in at [mcpfax.de](https://mcpfax.de) (create an account and top up credit if you have none).
2. Open **Account → API keys** and click **Create**.
3. Copy the key (it starts with \`mfx_\`).`,
  required: true,
  validate: async ({ auth }) => {
    try {
      await httpClient.sendRequest({
        method: HttpMethod.GET,
        url: `${MCPFAX_API}/balance`,
        headers: { Authorization: `Bearer ${auth}` },
      });
      return { valid: true };
    } catch {
      return { valid: false, error: 'Invalid API key. Create one at mcpfax.de → Account → API keys.' };
    }
  },
});
