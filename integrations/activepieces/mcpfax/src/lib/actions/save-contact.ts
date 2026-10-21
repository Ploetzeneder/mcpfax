import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { mcpfaxAuth } from '../auth';
import { mcpfaxClient } from '../common';

export const saveContact = createAction({
  auth: mcpfaxAuth,
  name: 'save_contact',
  classification: 'WRITE',
  displayName: 'Save Contact',
  description: 'Create a fax contact in the address book.',
  audience: 'both',
  aiMetadata: {
    description: 'Saves a name and fax number to the address book.',
    idempotent: false,
  },
  props: {
    name: Property.ShortText({ displayName: 'Name', required: true }),
    fax_number: Property.ShortText({ displayName: 'Fax Number', required: true }),
    note: Property.ShortText({ displayName: 'Note', required: false }),
  },
  async run({ auth, propsValue }) {
    return await mcpfaxClient.request({
      apiKey: auth.secret_text,
      method: HttpMethod.POST,
      path: '/contacts',
      body: {
        name: propsValue.name,
        fax_number: propsValue.fax_number,
        ...mcpfaxClient.withoutEmpty({ note: propsValue.note }),
      },
    });
  },
});
