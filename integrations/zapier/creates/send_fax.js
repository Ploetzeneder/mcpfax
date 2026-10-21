const { API, sampleFax, faxOutputFields, documentFields, documentBody } = require('../common');

module.exports = {
  key: 'send_fax',
  noun: 'Fax',
  display: {
    label: 'Send Fax',
    description: 'Sends a document or text as a real fax. Costs prepaid credit.',
    important: true,
  },
  operation: {
    inputFields: [
      ...documentFields,
      { key: 'max_cost', label: 'Max Cost', type: 'number', required: false, helpText: 'Safety limit in your account currency – the fax is not sent if it would cost more.' },
      { key: 'idempotency_key', label: 'Idempotency Key', required: false, helpText: 'Unique key (e.g. order ID). Retries with the same key never send the fax twice.' },
    ],
    perform: async (z, bundle) => {
      const body = await documentBody(z, bundle);
      if (bundle.inputData.max_cost) body.max_cost = Number(bundle.inputData.max_cost);
      if (bundle.inputData.idempotency_key) body.idempotency_key = bundle.inputData.idempotency_key;
      const res = await z.request({ url: `${API}/fax/send`, method: 'POST', body });
      return res.data;
    },
    sample: { ...sampleFax, status: 'sent' },
    outputFields: faxOutputFields,
  },
};
