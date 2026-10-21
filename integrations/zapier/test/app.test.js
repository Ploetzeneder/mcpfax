/* Run with: MCPFAX_API_KEY=mfx_... npm test   (read-only: balance + price, sends no fax) */
const zapier = require('zapier-platform-core');
const App = require('../index');
const appTester = zapier.createAppTester(App);
zapier.tools.env.inject();

const authData = { apiKey: process.env.MCPFAX_API_KEY };

describe('mcpfax', () => {
  it('authenticates', async () => {
    const res = await appTester(App.authentication.test, { authData });
    expect(res.data.currency).toBeDefined();
  });
  it('quotes a text fax without sending', async () => {
    const res = await appTester(App.creates.get_fax_price.operation.perform, {
      authData,
      inputData: { recipient_fax_number: '+49 1805 237077000', content: '# Test\nHello' },
    });
    expect(res.pages).toBeGreaterThan(0);
  });
  it('lists delivered faxes', async () => {
    const res = await appTester(App.triggers.fax_delivered.operation.perform, { authData });
    expect(Array.isArray(res)).toBe(true);
  });
});
