/**
 * Central locator registry.
 *
 * Playwright locators here favor role/label/text (getByRole, getByLabel,
 * getByText) over brittle CSS/data-testid guesses, since those are more
 * likely to still work even if exact attribute names differ from what's
 * guessed below. Anywhere marked TODO, open DevTools on the real app,
 * inspect the element, and adjust — you should rarely need to touch
 * anything outside this file and env.js once selectors are correct.
 */

const login = {
  emailInput: (page) => page.getByLabel(/email/i),
  passwordInput: (page) => page.getByLabel(/password/i),
  submitButton: (page) => page.getByRole('button', { name: /log ?in|sign ?in/i }),
};

const nav = {
  automationMenuItem: (page) => page.getByRole('link', { name: /automation/i }),
  createFormButton: (page) => page.getByRole('button', { name: /create.*form|new form/i }),
  aiTabMenuItem: (page) => page.getByRole('link', { name: /^ai$/i }),
  learningInstanceMenuItem: (page) => page.getByRole('link', { name: /learning instance/i }),
};

const formBuilder = {
  canvas: (page) => page.locator('[data-testid="form-canvas"], .form-canvas'), // TODO verify
  textboxPaletteItem: (page) => page.locator('[data-testid="palette-textbox"], .palette-item-textbox'), // TODO verify
  canvasTextboxes: (page) => page.locator('[data-testid="canvas-textbox"], .canvas-field-textbox'), // TODO verify

  // Property panel fields shown when a textbox is selected on canvas
  propLabel: (page) => page.getByLabel(/^label$/i),
  propMinLength: (page) => page.getByLabel(/min.*length/i),
  propMaxLength: (page) => page.getByLabel(/max.*length/i),
  propHintText: (page) => page.getByLabel(/hint/i),
  propTooltip: (page) => page.getByLabel(/tooltip/i),
  propDefaultValue: (page) => page.getByLabel(/default value/i),

  saveButton: (page) => page.getByRole('button', { name: /^save$/i }),
  rulesTab: (page) => page.getByRole('tab', { name: /rules/i }),
};

const rulesBuilder = {
  addRuleButton: (page) => page.getByRole('button', { name: /add rule/i }),
  ruleCard: (page, ruleName) => page.locator('[data-testid="rule-card"]', { hasText: ruleName }), // TODO verify
  ruleCardExpanded: (page, ruleName) => rulesBuilder.ruleCard(page, ruleName).locator('[data-expanded="true"], .expanded'), // TODO verify
  ruleEditButton: (page, ruleName) => rulesBuilder.ruleCard(page, ruleName).getByRole('button', { name: /edit/i }),

  addConditionButton: (page) => page.getByRole('button', { name: /add condition/i }),
  conditionElementDropdown: (page, index) => page.locator(`[data-testid="condition-element-${index}"]`), // TODO verify
  conditionTypeDropdown: (page, index) => page.locator(`[data-testid="condition-type-${index}"]`), // TODO verify
  conditionValueInput: (page, index) => page.locator(`[data-testid="condition-value-${index}"]`), // TODO verify
  conditionModeToggle: (page) => page.locator('[data-testid="condition-mode-and-or"]'), // TODO verify (AND/OR)

  addActionButton: (page) => page.getByRole('button', { name: /add action/i }),
  actionTypeDropdown: (page) => page.locator('[data-testid="action-type"]'), // TODO verify
  actionTargetElementDropdown: (page) => page.locator('[data-testid="action-target-element"]'), // TODO verify
  actionValueInput: (page) => page.locator('[data-testid="action-value"]'), // TODO verify

  ruleCardContextMenuButton: (page, ruleName) => rulesBuilder.ruleCard(page, ruleName).locator('[data-testid="context-menu"], .rule-context-menu-trigger'), // TODO verify
  addRuleBelowMenuOption: (page) => page.getByRole('menuitem', { name: /add rule below/i }),

  rulesList: (page) => page.locator('[data-testid="rules-list"], .rules-list'), // TODO verify
  rulesListItems: (page) => page.locator('[data-testid="rule-card"]'), // TODO verify
};

module.exports = { login, nav, formBuilder, rulesBuilder };
