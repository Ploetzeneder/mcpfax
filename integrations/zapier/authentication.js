const { API } = require('./common');

module.exports = {
  type: 'custom',
  fields: [
    {
      key: 'apiKey',
      label: 'API Key',
      type: 'password',
      required: true,
      helpText:
        'Create an API key at [mcpfax.de → Account → API keys](https://mcpfax.de/account.php#keys). It starts with `mfx_`.',
    },
  ],
  test: { url: `${API}/balance`, method: 'GET' },
  connectionLabel: (z, bundle) => `mcpfax (${bundle.inputData.currency || 'balance'} ${bundle.inputData.balance ?? ''})`.trim(),
};
