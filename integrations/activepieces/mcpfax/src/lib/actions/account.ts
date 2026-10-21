import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { mcpfaxAuth } from '../auth';
import { mcpfaxRequest } from '../common';

export const getBalance = createAction({
  auth: mcpfaxAuth,
  name: 'get_balance',
  displayName: 'Get Balance',
  description: 'Get the prepaid balance and current prices.',
  classification: 'READ',
  audience: 'both',
  aiMetadata: { description: 'Returns the prepaid balance, currency and per-page prices.', idempotent: true },
  props: {},
  async run({ auth }) {
    return await mcpfaxRequest(auth.secret_text, HttpMethod.GET, '/balance');
  },
});

export const findContact = createAction({
  auth: mcpfaxAuth,
  name: 'find_contact',
  displayName: 'Find Contact',
  description: 'Search the fax address book.',
  classification: 'SEARCH',
  audience: 'both',
  aiMetadata: { description: 'Searches saved fax contacts by name or number.', idempotent: true },
  props: {
    q: Property.ShortText({ displayName: 'Search Term', description: 'Name or part of the number.', required: false }),
  },
  async run({ auth, propsValue }) {
    return await mcpfaxRequest(auth.secret_text, HttpMethod.GET, '/contacts', undefined, {
      q: propsValue.q ?? '',
      limit: '50',
    });
  },
});

export const saveContact = createAction({
  auth: mcpfaxAuth,
  name: 'save_contact',
  displayName: 'Save Contact',
  description: 'Create a fax contact in the address book.',
  classification: 'WRITE',
  audience: 'both',
  aiMetadata: { description: 'Saves a name and fax number to the address book.', idempotent: false },
  props: {
    name: Property.ShortText({ displayName: 'Name', required: true }),
    fax_number: Property.ShortText({ displayName: 'Fax Number', required: true }),
    note: Property.ShortText({ displayName: 'Note', required: false }),
  },
  async run({ auth, propsValue }) {
    const body: Record<string, unknown> = { name: propsValue.name, fax_number: propsValue.fax_number };
    if (propsValue.note) body['note'] = propsValue.note;
    return await mcpfaxRequest(auth.secret_text, HttpMethod.POST, '/contacts', body);
  },
});
