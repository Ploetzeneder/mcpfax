const addAuth = (request, z, bundle) => {
  if (bundle.authData && bundle.authData.apiKey && String(request.url).startsWith('https://mcpfax.de/')) {
    request.headers = request.headers || {};
    request.headers.Authorization = `Bearer ${bundle.authData.apiKey}`;
    request.headers['X-Mcpfax-Client'] = 'zapier';
  }
  return request;
};

const handleErrors = (response, z) => {
  if (response.status === 401) {
    throw new z.errors.RefreshAuthError('Invalid or revoked mcpfax API key.');
  }
  if (response.status >= 400 && String(response.request.url).startsWith('https://mcpfax.de/')) {
    let msg = response.content;
    try {
      const j = JSON.parse(response.content);
      msg = `${j.message || j.error}`;
      if (response.status === 402) msg += ' Top up at https://mcpfax.de/buy.php';
    } catch (e) { /* not json */ }
    throw new z.errors.Error(msg, 'mcpfax_error', response.status);
  }
  return response;
};

module.exports = { befores: [addAuth], afters: [handleErrors] };
