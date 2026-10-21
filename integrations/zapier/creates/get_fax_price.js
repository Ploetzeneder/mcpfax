const { API, documentFields, documentBody } = require('../common');

module.exports = {
  key: 'get_fax_price',
  noun: 'Price',
  display: { label: 'Get Fax Price', description: 'Validates the number, counts pages and returns the exact cost. Sends nothing.' },
  operation: {
    inputFields: documentFields,
    perform: async (z, bundle) => {
      const res = await z.request({ url: `${API}/fax/price`, method: 'POST', body: await documentBody(z, bundle) });
      return res.data;
    },
    sample: { to: '+49301234567', country: 'DE', pages: 2, cost: 1.2, currency: 'EUR', sufficient: true, document: 'invoice.pdf' },
    outputFields: [
      { key: 'to', label: 'Fax Number' },
      { key: 'pages', label: 'Pages', type: 'integer' },
      { key: 'cost', label: 'Cost', type: 'number' },
      { key: 'currency', label: 'Currency' },
      { key: 'sufficient', label: 'Balance Sufficient', type: 'boolean' },
    ],
  },
};
