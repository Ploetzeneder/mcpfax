const { API, sampleFax, faxOutputFields } = require('../common');

const make = (status, label, description) => ({
  key: `fax_${status}`,
  noun: 'Fax',
  display: { label, description, important: status === 'delivered' },
  operation: {
    type: 'polling',
    perform: async (z) => {
      const res = await z.request({ url: `${API}/faxes`, params: { status, limit: 50 } });
      return (res.data.faxes || [])
        .sort((a, b) => b.fax_id - a.fax_id)
        .map((f) => ({ id: f.fax_id, ...f }));
    },
    sample: { id: sampleFax.fax_id, ...sampleFax, status },
    outputFields: faxOutputFields,
  },
});

module.exports = {
  faxDelivered: make('delivered', 'Fax Delivered', 'Triggers when a fax was transmitted successfully.'),
  faxFailed: make('failed', 'Fax Failed', 'Triggers when a fax could not be delivered (the amount is refunded automatically).'),
};
