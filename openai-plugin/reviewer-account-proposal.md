# Proposal: reviewer test account (NOT created)

Goal: reviewer logs in via OAuth without MFA / e-mail code, can run all 8 test cases, and no real fax is sent and no real money is charged.

Findings in the existing code (inc/fax.php `provider_is_simulated`, inc/quick.php, login.php):
- Password login works without any code: a user with `has_password=1` and `email_verified=1` signs in with e-mail + password (the e-mail code is only used for accounts without a password).
- Simulation already exists: accounts listed in config `app.review_emails` (or `users.app_sandbox=1`) get faxes simulated by the provider layer: nothing goes to the fax network.
- `create-review-user.php` (one-off script, already used for `review@mcpfax.de`) shows how accounts are created, with 20 EUR of admin credit (`credits_change(..., 'admin_credit')`), i.e. no payment involved.
- Existing `review@mcpfax.de` is used by the Claude/ChatGPT-connector reviewers WITH real faxes (see comment in config.sample.php); do not reuse it for this.

Proposal
1. New account `openai-review@mcpfax.de`: verified, password set (strong, only entered in the OpenAI "Review details" form, not in the repo), country AT, sender "Review Account", lang en, `signup_source='review'`, admin_note "ChatGPT directory review".
2. Add that e-mail to `app.review_emails` in config.php (or set `app_sandbox=1`): every fax is simulated (status goes pending → delivered without transmission). Test numbers like +49 30 1234567 are therefore harmless.
3. Admin credit of 10-20 EUR (virtual balance; sufficient for all test cases incl. schedule + cancel + resend).
4. Optionally pre-seed 2-3 sample faxes (delivered/failed) and 1 address-book contact so history/status/find_contact show data right away.
5. Keep account and password stable for later reviews; optionally top the balance up from the admin area if it runs low.
6. Review details form text: login URL https://mcpfax.de/login.php (reached automatically through the OAuth sign-in screen), e-mail + password, note "Sandbox account: faxes are simulated, no real transmission, no real charge. No MFA, no e-mail code."
7. Check before submission: sign in via the real ChatGPT OAuth flow once and run the 5 positive cases.
Needs Andreas' go: account creation, config.php edit (add to review_emails), password handover.
