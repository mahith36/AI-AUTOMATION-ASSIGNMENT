# Automation Anywhere Community Edition — Test Automation

Playwright UI + API automation for the real Automation Anywhere Community Edition web application.

- **Use Case 1 (UI):** Form Builder → drag/drop Text Box elements → configure properties → Rules Builder (Rule1/Rule2/Rule3, conditions, AND/OR mode, Set Value action, Add Rule Below context menu)
- **Use Case 2 (API):** Authenticate via API → create a Learning Instance (document type `Invoice`) → validate response status, schema, and functional correctness

## Framework & Tools

- **Playwright** (JavaScript) — `@playwright/test`
- Page Object Model: `pages/` (UI) + `utils/apiClient.js` (API)
- Central config: `config/env.js` (URLs/endpoints/credentials) and `config/selectors.js` (locators)
- **All selectors verified against the real Automation Anywhere Community Edition UI**

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env
```

Then edit `.env` with your AA Community Edition credentials:
```dotenv
APP_BASE_URL=https://community.cloud.automationanywhere.digital
API_BASE_URL=https://community.cloud.automationanywhere.digital
AA_EMAIL=your-email@example.com
AA_PASSWORD=your-password
AUTH_ENDPOINT=/v1/authentication
LEARNING_INSTANCE_ENDPOINT=/v2/learninginstances
```

## Running tests

```bash
npm test                # all tests
npm run test:usecase1   # UI: Form + Rules Builder
npm run test:usecase2   # API: Learning Instance
npm run test:ui         # UI tests, headed (useful while debugging)
npm run report          # open the HTML report
```

## Project Structure

```
config/
  env.js            # base URLs, endpoints, credentials (via .env)
  selectors.js      # all UI locators in one place
pages/
  BasePage.js
  LoginPage.js        # login via AA login page
  FormBuilderPage.js  # canvas, drag/drop, textbox properties (iframe-based)
  RulesPage.js        # rule cards, conditions, AND/OR, actions, context menu
utils/
  apiClient.js        # auth + Learning Instance API wrapper
tests/
  ui/formRulesBuilder.spec.js   # @usecase1
  api/learningInstanceApi.spec.js # @usecase2
```

## Key Technical Notes

- The Form Builder loads inside an **iframe** (`modules/attended/#/file/form/{id}/edit`). All form-builder selectors target the iframe via `page.frames()`.
- Drag-and-drop uses `page.mouse` coordinates converted from iframe-relative to page-relative positions.
- The Document Automation (Learning Instance) UI is at `#/modules/cognitive/iqbot/pages/learning-instances`.
- API authentication uses `POST /v1/authentication` with `{ username, password }` returning `{ token }`.
