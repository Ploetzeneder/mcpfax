const { API, sampleFax, faxOutputFields } = require('../common');

const make = (status, label, description) => ({
  key: `fax_${status}`,
  noun: 'Fax',
  display: { label, description },
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

const recentFaxes = {
  key: 'recent_faxes',
  noun: 'Fax',
  display: { label: 'Recent Faxes', description: 'Lists recent faxes for dropdowns.', hidden: true },
  operation: {
    type: 'polling',
    perform: async (z) => {
      const res = await z.request({ url: `${API}/faxes`, params: { limit: 50 } });
      return (res.data.faxes || [])
        .sort((a, b) => b.fax_id - a.fax_id)
        .map((f) => ({ id: f.fax_id, label: `#${f.fax_id} to ${f.to} (${f.status}, ${String(f.created_at).slice(0, 10)})`, ...f }));
    },
    sample: { id: sampleFax.fax_id, label: '#1234 to +49301234567 (delivered, 2026-10-21)', ...sampleFax },
  },
};

module.exports = {
  recentFaxes,
  faxDelivered: make('delivered', 'Fax Delivered', 'Triggers when a fax was transmitted successfully.'),
  faxFailed: make('failed', 'Fax Failed', 'Triggers when a fax could not be delivered (the amount is refunded automatically).'),
};
