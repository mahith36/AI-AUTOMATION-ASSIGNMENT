# Automation Anywhere Community Edition — Test Automation

Playwright (JavaScript) UI + API automation for the **real** Automation Anywhere
Community Edition web application, following the Page Object Model.

Both use cases run against the live app at
`https://community.cloud.automationanywhere.digital` — there are no mocks.

- **Use Case 1 (UI):** Log in → create a Form → drag two Text Box elements onto
  the canvas → set their properties → save → Form rules: create Rule1, add two
  conditions with AND mode, add a *Set value* action, then use the rule card
  context menu (*Add rule below*) to create Rule2 and Rule3 → save and verify
  the rules persist after a reload.
- **Use Case 2 (API):** Authenticate → discover the Invoices domain → create a
  Learning Instance (document type **Invoice**) → validate it (status codes,
  response schema, functional correctness) → delete it (cleanup).

## Framework & Tools

- **Playwright Test** (`@playwright/test`) — JavaScript / CommonJS
- **Page Object Model** for the UI: `pages/` + a central locator registry in
  `config/selectors.js`
- **API client** wrapper: `utils/apiClient.js`
- **Config**: `config/env.js` (URLs, endpoints, credentials via `.env`)
- Node 18+ recommended

Every selector and every API endpoint/payload in this repo was captured live
from the real AA CE app (DOM inspection + the browser Network tab) and verified
by a passing end-to-end run — not guessed.

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env
```

Then edit `.env` with your Community Edition credentials:

```dotenv
APP_BASE_URL=https://community.cloud.automationanywhere.digital
API_BASE_URL=https://community.cloud.automationanywhere.digital
AA_EMAIL=your-community-edition-email@example.com
AA_PASSWORD=your-password
```

Register for a free account at
<https://www.automationanywhere.com/products/enterprise/community-edition>.

## Running the tests

```bash
npm test                # run everything (UC1 UI + UC2 API)
npm run test:usecase1   # UC1 only (UI: Form + Rules Builder)
npm run test:usecase2   # UC2 only (API: Learning Instance)
npm run test:ui         # UC1 headed (useful while debugging)
npm run test:api        # UC2 only, by folder
npm run report          # open the last HTML report
```

## Project Structure

```
config/
  env.js            # base URLs, endpoints, credentials (from .env)
  selectors.js      # all UI locators in one place (captured from the live app)
pages/
  BasePage.js
  LoginPage.js        # real AA CE login page
  FormBuilderPage.js  # Create Form, iframe editor, drag & drop, properties
  RulesPage.js        # rule cards, conditions, AND/OR, Set value, context menu
utils/
  apiClient.js        # auth + domains + learning-instance API wrapper
tests/
  ui/formRulesBuilder.spec.js     # @usecase1
  api/learningInstanceApi.spec.js # @usecase2
.github/workflows/
  playwright-tests.yml            # CI (needs AA_EMAIL / AA_PASSWORD secrets)
```

## How the app actually works (key technical notes)

These are the non-obvious realities that make the automation reliable; they were
all confirmed against the live tenant.

**Single active session.** The auth token carries `multipleLogin: false`, so AA
CE allows only **one** active session per user. Any new login — UI *or* API —
invalidates the previous one. The suite therefore runs strictly serially
(`workers: 1`, `fullyParallel: false`), the UI use case shares one page/session
across its steps, and the API use case runs in its own project after the UI one.

**Form editor is an iframe.** The form builder loads inside an iframe at
`modules/attended/#/file/form/{id}/edit`. All form/rules selectors target that
iframe's `Frame`. The outer SPA URL contains the singular `module/attended`
while the iframe URL contains `modules/attended` (plural) — the frame is matched
on the plural form. The `<iframe>` element can be visible before its `Frame`
commits navigation, so the page object polls `page.frames()` until it attaches.

**Drag & drop is coordinate-based.** Palette items are dragged onto the canvas
with real `page.mouse` events. `boundingBox()` coordinates are already relative
to the main-frame viewport (even for elements inside the iframe), so no iframe
offset is added. Each drop is verified by asserting the canvas row count grew.

**Rules Builder interaction model.** A fresh rule pre-creates one empty
condition row and one empty action row. Every element / condition-type /
action-type selector is a `rio-select` combobox opened by clicking its query
input and picking a `.rio-select-input-dropdown-option`. The condition-type and
action-type combos appear only *after* the element is chosen (element-first).
The value field (placeholder `Enter value`) appears only for value-based types
such as *Contains*. AND/OR is a segmented `rio-mode-input` with
`button[role="radio"][name="AND"|"OR"]`. *Add rule below* is
`button[name="action-add-rule-below"]` in the card's *More* menu.

## API endpoints (identified via the browser Network tab)

| Purpose | Method & path |
|---|---|
| Authenticate | `POST /v2/authentication` → `{ token, user }` (v1 returns 404 on CE) |
| Authorize | header `X-Authorization: <token>` |
| List domains | `GET /cognitive/v3/domains` → find the *Invoices* domain |
| Domain detail | `GET /cognitive/v3/domains/{id}?language={languageId}&provider={providerId}` → `domainLanguageProviderId` + `domainObjects` |
| Create instance | `POST /cognitive/v3/learninginstances` `{ name, domainId, domainLanguageProviderId, fields[] }` |
| Get instance | `GET /cognitive/v3/learninginstances/{id}` |
| List instances | `POST /cognitive/v3/learninginstances/list` |
| Delete instance | `DELETE /cognitive/v3/learninginstances/{id}` → `204` |

Notes on the create contract:
- The document type (**Invoice**) is a reference to the *Invoices* system
  domain, not a free-text string.
- `fields` must be the domain's enabled **KEY_VALUE** extraction fields, each
  carrying `domainObjectId` + `isCustom: false` + `name`. `TABLE_HEADER` domain
  objects are table columns, not standalone fields, and are excluded.
- Community Edition is capped at **5** learning instances, so the test deletes
  the instance it creates in a dedicated final step, with an `afterAll` hook as
  a fallback in case an earlier step fails before the delete runs.
- AA CE returns the instance id lowercased from *create* but uppercased from
  *get*/*list*, so id comparisons are case-insensitive.

## Continuous Integration

`.github/workflows/playwright-tests.yml` runs the full suite on push and pull
requests to `main` (and via manual dispatch). Because the tests hit the live
app, add repository **secrets** `AA_EMAIL` and `AA_PASSWORD`; the workflow passes
them through as env vars. The HTML report is uploaded as an artifact and
published to GitHub Pages on `main`.

Traces, videos, and screenshots are disabled under CI (`process.env.CI`) because
Playwright traces capture network request bodies — including the login request —
and the report is published to a public location. They remain enabled locally,
where the report is private, for debugging.
