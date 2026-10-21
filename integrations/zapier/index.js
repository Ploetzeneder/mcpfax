const authentication = require('./authentication');
const middleware = require('./middleware');
const sendFax = require('./creates/send_fax');
const getFaxPrice = require('./creates/get_fax_price');
const { resendFax, cancelScheduledFax, saveContact } = require('./creates/fax_actions');
const { findFax, findContact } = require('./searches/find_fax');
const { faxDelivered, faxFailed, recentFaxes } = require('./triggers/fax_status');

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,
  authentication,
  beforeRequest: middleware.befores,
  afterResponse: middleware.afters,
  triggers: { [faxDelivered.key]: faxDelivered, [faxFailed.key]: faxFailed, [recentFaxes.key]: recentFaxes },
  searches: { [findFax.key]: findFax, [findContact.key]: findContact },
  creates: {
    [sendFax.key]: sendFax,
    [getFaxPrice.key]: getFaxPrice,
    [resendFax.key]: resendFax,
    [cancelScheduledFax.key]: cancelScheduledFax,
    [saveContact.key]: saveContact,
  },
  searchOrCreates: {},
};
