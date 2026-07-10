/**
 * Central locator registry for Automation Anywhere Community Edition.
 *
 * The form builder loads inside an iframe at modules/attended/,
 * so form-builder selectors target the iframe frameLocator.
 *
 * All selectors verified against real AA CE UI as of 2026-07-10.
 */

const login = {
  usernameInput: (page) => page.locator('input[name="username"]'),
  passwordInput: (page) => page.locator('input[name="password"]'),
  submitButton: (page) => page.getByRole("button", { name: /^log in$/i }),
};

const nav = {
  // Main nav — Automation link opens bots repository  
  automationLink: (page) => page.locator('a[href*="bots/repository"]').first(),
  // Create button in Automation page header (there are two; use aria-label)
  createDropdownButton: (page) =>
    page.locator('button[aria-label="Create"][name="createOptions"]').first(),
  // "Form…" in the Create dropdown — use :has-text for flexible matching
  createFormOption: (page) =>
    page.locator('button, a').filter({ hasText: 'Form' }).first(),
};

/**
 * Form Builder (inside the iframe at modules/attended/#/file/form/{id}/edit)
 * Use frame.locator() to target elements inside the iframe.
 */
const formBuilder = {
  // Create Form dialog (outside iframe)
  dialogFormNameInput: (page) =>
    page.locator('[role="dialog"] input[name="name"]'),
  dialogCreateEditButton: (page) =>
    page.locator('[role="dialog"] button:has-text("Create & edit")'),

  // Palette — all draggable items are button[name="item-button"]
  paletteItem: (frame, label) =>
    frame.locator('button[name="item-button"]').filter({ hasText: label }),

  // Canvas area — the left pane is the real drop target
  canvasLeftPane: (frame) => frame.locator(".formcanvas__leftpane"),
  // Drop target for drag-and-drop onto the canvas
  canvasDropTarget: (frame) => frame.locator(".formcanvas__leftpane"),

  // Fields on canvas — each added element creates a [data-item-type="row"]
  canvasRows: (frame) =>
    frame.locator('.formcanvas__leftpane [data-item-type="row"]'),

  // Properties panel (right side)
  propertiesTab: (frame) => frame.getByRole("tab", { name: /^properties$/i }),
  propLabel: (frame) => frame.locator('input[name="title"]'),
  propMinLength: (frame) => frame.getByLabel(/min.*length/i),
  propMaxLength: (frame) => frame.getByLabel(/max.*length/i),
  propHintText: (frame) => frame.getByLabel(/hint below field/i),
  propTooltip: (frame) => frame.getByLabel(/tool tip/i),
  propDefaultValue: (frame) => frame.getByLabel(/default value/i),

  // Save & Close buttons in the form editor header
  saveButton: (frame) => frame.getByRole("button", { name: /^save$/i }),
  closeButton: (frame) => frame.getByRole("button", { name: /^close$/i }),

  // Rules tab
  rulesTab: (frame) => frame.getByRole("tab", { name: /form rules/i }),
};

const rulesBuilder = {
  // Add Rule button in the rules panel
  addRuleButton: (frame) => frame.getByRole("button", { name: /^add rule$/i }),

  // Rule card — identified by aria-label or containing text
  ruleCard: (frame, ruleName) =>
    frame.locator('[class*="rule"]').filter({ hasText: ruleName }).first(),

  // Rule card header area
  ruleCardHeader: (frame, ruleName) =>
    rulesBuilder
      .ruleCard(frame, ruleName)
      .locator("text=" + ruleName)
      .first(),

  // Edit button on rule card
  ruleEditButton: (frame) => frame.getByRole("button", { name: /^edit$/i }),

  // Enabled/disabled toggle
  ruleEnabledToggle: (frame) =>
    frame.getByRole("button", { name: /^enabled$/i }),

  // More/Context menu button on rule card
  ruleMoreButton: (frame) => frame.getByRole("button", { name: /^more$/i }),

  // "Add Rule Below" in context menu
  addRuleBelowOption: (page) =>
    page.getByRole("menuitem", { name: /add rule below/i }),

  // Condition section
  conditionElementDropdown: (frame) =>
    frame
      .locator(
        '[class*="rule"] input[placeholder="Select element"], [class*="rule"] [role="combobox"]',
      )
      .first(),

  conditionTypeDropdown: (frame) =>
    frame
      .locator('[class*="rule"]')
      .locator('select, [role="combobox"]')
      .first(),

  conditionValueInput: (frame) =>
    frame.locator('[class*="rule"]').locator('input[type="text"]').last(),

  addConditionButton: (frame) =>
    frame.getByRole("button", { name: /add condition/i }),

  // AND/OR group toggle
  conditionModeToggle: (frame) =>
    frame.locator('select, [role="combobox"]').filter({ hasText: /AND|OR/ }),

  // Action section
  addActionButton: (frame) =>
    frame.getByRole("button", { name: /add action/i }),

  actionTypeDropdown: (frame) =>
    frame
      .locator('[class*="rule"]')
      .locator('select, [role="combobox"]')
      .last(),

  actionTargetDropdown: (frame) =>
    frame
      .locator('[class*="rule"]')
      .locator('select, [role="combobox"]')
      .nth(1),

  actionValueInput: (frame) =>
    frame.locator('[class*="rule"]').locator('input[type="text"]').last(),

  // Full list of rule card names
  ruleNamesInList: async (frame) => {
    const cards = frame.locator('[class*="rule"]');
    const count = await cards.count();
    const names = [];
    for (let i = 0; i < count; i++) {
      const text = await cards.nth(i).textContent();
      names.push(text);
    }
    return names;
  },
};

module.exports = { login, nav, formBuilder, rulesBuilder };
