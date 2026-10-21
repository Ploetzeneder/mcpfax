import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { mcpfaxAuth } from '../auth';
import { mcpfaxClient } from '../common';

export const findContact = createAction({
  auth: mcpfaxAuth,
  name: 'find_contact',
  classification: 'SEARCH',
  displayName: 'Find Contact',
  description: 'Search the fax address book.',
  audience: 'both',
  aiMetadata: {
    description: 'Searches saved fax contacts by name or number.',
    idempotent: true,
  },
  props: {
    q: Property.ShortText({
      displayName: 'Search Term',
      description: 'Name or part of the number.',
      required: false,
    }),
  },
  async run({ auth, propsValue }) {
    return await mcpfaxClient.request({
      apiKey: auth.secret_text,
      method: HttpMethod.GET,
      path: '/contacts',
      queryParams: { q: propsValue.q ?? '', limit: '50' },
    });
  },
});
