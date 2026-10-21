const { API, sampleFax, faxOutputFields } = require('../common');

const findFax = {
  key: 'find_fax',
  noun: 'Fax',
  display: { label: 'Find Fax (Status)', description: 'Gets the current status of a fax by its ID.' },
  operation: {
    inputFields: [{ key: 'fax_id', label: 'Fax ID', type: 'integer', required: true }],
    perform: async (z, bundle) => {
      const res = await z.request({ url: `${API}/fax/${bundle.inputData.fax_id}`, skipThrowForStatus: true });
      if (res.status === 404) return [];
      res.throwForStatus();
      return [res.data];
    },
    sample: sampleFax,
    outputFields: faxOutputFields,
  },
};

const findContact = {
  key: 'find_contact',
  noun: 'Contact',
  display: { label: 'Find Contact', description: 'Searches the fax address book by name or number.' },
  operation: {
    inputFields: [{ key: 'q', label: 'Search Term', required: true }],
    perform: async (z, bundle) => {
      const res = await z.request({ url: `${API}/contacts`, params: { q: bundle.inputData.q, limit: 10 } });
      return res.data.contacts || [];
    },
    sample: { contact_id: 7, name: 'Tax office', fax: '+49301234567', note: '' },
  },
};

const getBalance = {
  key: 'get_balance',
  noun: 'Balance',
  display: { label: 'Get Balance', description: 'Returns the prepaid balance and current prices.' },
  operation: {
    inputFields: [],
    perform: async (z) => {
      const res = await z.request({ url: `${API}/balance` });
      return [{ id: 'balance', ...res.data }];
    },
    sample: { id: 'balance', currency: 'EUR', balance: 25.4, balance_formatted: '€25.40' },
  },
};

module.exports = { findFax, findContact, getBalance };
