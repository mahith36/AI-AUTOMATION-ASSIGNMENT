# Automation Anywhere Community Edition — Test Automation

Playwright automation covering:
- **Use Case 1 (UI):** Form Builder → drag/drop textboxes → configure properties → Rules Builder (Rule1/Rule2/Rule3, conditions, AND/OR mode, Set Value action, Add Rule Below context menu).
- **Use Case 2 (API):** Authenticate → create a Learning Instance (document type `Invoice`) → validate status codes, response schema, and functional correctness.

## Test Execution Output

GitHub Actions runs all Playwright test cases on every push to `main`.

Open **Actions** -> **Playwright Tests** -> latest run to see:
- passed/failed test status
- full execution logs
- downloadable `playwright-html-report` artifact

## Framework & Tools
- **Playwright** (JavaScript) — `@playwright/test`
- Page Object Model: `pages/` (UI) + `utils/apiClient.js` (API)
- Central config: `config/env.js` (URLs/endpoints/credentials) and `config/selectors.js` (locators)

## ⚠️ Before you run anything — 2 things need real values

I built this framework against the assignment spec, but I don't have a way to log into Automation Anywhere Community Edition myself (it requires personal registration) or open its browser Network tab. So two files have placeholder values you need to fill in after registering:

1. **`config/env.js` / `.env`** — real base URL, auth endpoint path, and Learning Instance endpoint path (identify these via DevTools → Network while you log in and while you create a Learning Instance in the UI).
2. **`config/selectors.js`** — every locator marked `// TODO verify`. Right-click the real element → Inspect, and confirm the actual attribute/role/label. Everything is centralized here so you only edit this one file, not the tests.

Everything else — test structure, assertions, flow logic, POM pattern — is already wired up to the spec's steps and expectations.

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env   # optional: fill in real AA values for live execution
```

By default, the suite runs against deterministic local mocks when `AA_EMAIL`
and `AA_PASSWORD` are not set. To run against a real Automation Anywhere tenant,
set the values in `.env` and add `AA_USE_MOCK=false`.

## Running tests

```bash
npm test                # everything
npm run test:usecase1   # UI: Form + Rules Builder
npm run test:usecase2   # API: Learning Instance
npm run test:ui         # UI tests, headed (useful while fixing selectors)
npm run report          # open the HTML report after a run
```

## Project structure

```
config/
  env.js            # base URLs, endpoints, credentials (via .env)
  selectors.js       # all UI locators, one place to fix per app version
pages/
  BasePage.js
  LoginPage.js
  FormBuilderPage.js  # canvas, drag/drop, textbox properties
  RulesPage.js        # rule cards, conditions, AND/OR, actions, context menu
utils/
  apiClient.js        # auth + Learning Instance API wrapper
tests/
  ui/formRulesBuilder.spec.js   # @usecase1
  api/learningInstanceApi.spec.js # @usecase2
```

## Environment / configuration notes
- Tests are tagged `@usecase1` / `@usecase2` per the submission guideline to organize by use case.
- UI project runs Chromium headed/headless via `playwright.config.js`; API project runs against `API_BASE_URL` with no browser.
- Trace, screenshot, and video capture on failure are enabled by default for debugging (`playwright-report/`, `test-results/`).
- Credentials are read from `.env` (not committed) — never hardcode real credentials in `config/env.js`.
