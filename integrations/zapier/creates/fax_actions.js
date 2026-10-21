const { API, sampleFax, faxOutputFields } = require('../common');

const faxIdField = { key: 'fax_id', label: 'Fax ID', type: 'integer', required: true, helpText: 'The Fax ID returned by "Send Fax".' };

const resendFax = {
  key: 'resend_fax',
  noun: 'Fax',
  display: { label: 'Resend Fax', description: 'Sends a previous fax again. Costs prepaid credit.' },
  operation: {
    inputFields: [faxIdField],
    perform: async (z, bundle) => (await z.request({ url: `${API}/fax/${bundle.inputData.fax_id}/resend`, method: 'POST', body: {} })).data,
    sample: { ...sampleFax, status: 'sent' },
    outputFields: faxOutputFields,
  },
};

const cancelScheduledFax = {
  key: 'cancel_scheduled_fax',
  noun: 'Fax',
  display: { label: 'Cancel Scheduled Fax', description: 'Cancels a scheduled fax before it is sent (full refund).' },
  operation: {
    inputFields: [faxIdField],
    perform: async (z, bundle) => (await z.request({ url: `${API}/fax/${bundle.inputData.fax_id}/cancel`, method: 'POST', body: {} })).data,
    sample: { ...sampleFax, status: 'cancelled' },
    outputFields: faxOutputFields,
  },
};

const saveContact = {
  key: 'save_contact',
  noun: 'Contact',
  display: { label: 'Save Contact', description: 'Saves a fax contact to the address book.' },
  operation: {
    inputFields: [
      { key: 'name', label: 'Name', required: true },
      { key: 'fax_number', label: 'Fax Number', required: true },
      { key: 'note', label: 'Note', required: false },
    ],
    perform: async (z, bundle) => {
      const body = { name: bundle.inputData.name, fax_number: bundle.inputData.fax_number };
      if (bundle.inputData.note) body.note = bundle.inputData.note;
      return (await z.request({ url: `${API}/contacts`, method: 'POST', body })).data;
    },
    sample: { contact_id: 7, name: 'Tax office', fax: '+49301234567', note: '' },
  },
};

module.exports = { resendFax, cancelScheduledFax, saveContact };
