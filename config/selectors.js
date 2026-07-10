/**
 * Central locator registry for Automation Anywhere Community Edition.
 *
 * Every selector here was captured live against the real AA CE tenant
 * (community.cloud.automationanywhere.digital) by driving the app and
 * inspecting the DOM — not guessed.
 *
 * The form editor loads inside an iframe (modules/attended/#/file/form/{id}/edit).
 * Locators marked (frame) must be called with the iframe's Frame object.
 */

const login = {
  usernameInput: (page) => page.locator('input[name="username"]'),
  passwordInput: (page) => page.locator('input[name="password"]'),
  submitButton: (page) => page.getByRole('button', { name: /^log in$/i }),
};

const nav = {
  // "Create" button in the Automation (bots repository) page header
  createButton: (page) => page.locator('button[aria-label="Create"]').first(),
  // "Form…" entry in the Create dropdown — stable name attribute
  createFormOption: (page) => page.locator('button[name="create-attended-form"]'),
  // Create-form dialog
  dialogNameInput: (page) => page.locator('[role="dialog"] input[name="name"]'),
  dialogCreateEditButton: (page) =>
    page.locator('[role="dialog"] button', { hasText: 'Create & edit' }),
  // The form editor iframe element (page-level)
  editorIframe: (page) => page.locator('iframe[src*="attended"]'),
};

const formBuilder = {
  // Palette item (frame) — e.g. paletteItem(frame, 'Text Box').
  // NOTE: must scrollIntoViewIfNeeded() before drag; the list is long.
  paletteItem: (frame, label) =>
    frame.locator('button[name="item-button"]', { hasText: label }),

  // Canvas + dropped rows (frame)
  canvas: (frame) => frame.locator('.formcanvas__leftpane'),
  canvasRows: (frame) =>
    frame.locator('.formcanvas__leftpane [data-item-type="row"]'),
  // Each element's label node carries its element id, e.g. "TextBox0__label-non-editable".
  canvasElementLabels: (frame) =>
    frame.locator('.formcanvas__leftpane [id$="-non-editable"]'),

  // Properties panel (frame) — real name attributes from the live DOM
  propertiesTab: (frame) =>
    frame.locator('[role="tab"]', { hasText: /^properties$/i }),
  propElementId: (frame) => frame.locator('input[name="id"]'), // readonly
  propLabel: (frame) => frame.locator('input[name="label"]'),
  propDefaultValue: (frame) => frame.locator('input[name="defaultValue"]'),
  propMinLength: (frame) => frame.locator('input[name="minLength"]'),
  propMaxLength: (frame) => frame.locator('input[name="maxLength"]'),
  propHintText: (frame) => frame.locator('input[name="hintText"]'),
  propToolTip: (frame) => frame.locator('textarea[name="toolTip"]'),

  // Header buttons (frame)
  saveButton: (frame) => frame.locator('button[name="save"]'),

  // Rules tab (frame) — its text is "Form rules (N)"; aria-label is broken
  // in the app ("[object Object]"), so match by text.
  rulesTab: (frame) => frame.locator('[role="tab"]', { hasText: /form rules/i }),
};

const rulesBuilder = {
  // "Add rule" button in the Form rules panel (frame)
  addRuleButton: (frame) => frame.locator('button[aria-label="Add rule"]'),

  // Rule cards (frame). Each card is a .rules-widget; its title is .rule-name.
  ruleCards: (frame) => frame.locator('.rules-widget'),
  ruleCard: (frame, ruleName) =>
    frame.locator('.rules-widget').filter({
      has: frame.locator('.rule-name', { hasText: ruleName }),
    }),
  ruleNames: (frame) => frame.locator('.rule-name'),

  // Per-card header buttons (frame, scoped to a card locator)
  editButton: (card) => card.locator('button[aria-label="edit"]').first(),
  enabledToggle: (card) => card.locator('button[aria-label="Enabled"]'),
  moreButton: (card) => card.locator('button[aria-label="More"]'),

  // Condition / action section buttons (frame or card scope)
  addConditionButton: (scope) => scope.locator('button[aria-label="Add condition"]'),
  addGroupButton: (scope) => scope.locator('button[aria-label="Add Group"]'),
  addActionButton: (scope) => scope.locator('button[aria-label="Add action"]'),

  // rio-select comboboxes are opened by clicking their query input, then an
  // option is picked from the dropdown portal.
  selectElementInputs: (scope) => scope.locator('input[placeholder="Select element"]'),
  selectConditionInputs: (scope) => scope.locator('input[placeholder="Select condition"]'),
  selectActionInputs: (scope) => scope.locator('input[placeholder="Select action"]'),
  dropdownOption: (frame, text) =>
    frame.locator('.rio-select-input-dropdown-option', { hasText: text }).first(),
  dropdownOptions: (frame) => frame.locator('.rio-select-input-dropdown-option'),

  // Value field for value-based condition/action types (e.g. Contains, Set value).
  valueInputs: (frame) => frame.locator('.rules-widget input[placeholder="Enter value"]'),

  // AND/OR segmented control (rio-mode-input) and its radio buttons.
  conditionModeInput: (frame) =>
    frame.locator('.rio-condition-input-operator .rio-mode-input').first(),
  conditionModeRadio: (modeInput, value) =>
    modeInput.locator(`button[role="radio"][name="${value}"]`),
  conditionModeSelected: (modeInput) =>
    modeInput.locator('button[role="radio"][aria-selected="true"]'),

  // "Add rule below" item inside a rule card's More menu (renders in the iframe).
  addRuleBelowItem: (frame) => frame.locator('button[name="action-add-rule-below"]'),

  // Generic combo containers within a rule card (used for the and/or selector)
  combos: (scope) => scope.locator('.rio-select-input'),
};

module.exports = { login, nav, formBuilder, rulesBuilder };
