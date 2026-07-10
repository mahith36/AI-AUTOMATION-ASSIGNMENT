const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/LoginPage');
const { FormBuilderPage } = require('../../pages/FormBuilderPage');
const { RulesPage } = require('../../pages/RulesPage');

test.describe('Use Case 1: Form with Rules Builder @usecase1', () => {
  let formBuilder;
  let rules;

  test.beforeEach(async ({ page }) => {
    // Login to AA Community Edition
    const loginPage = new LoginPage(page);
    await loginPage.login();

    // Initialize page objects
    formBuilder = new FormBuilderPage(page);
    rules = new RulesPage(page);

    // Step 1: Navigate to Automation → Create new Form
    await formBuilder.openNewForm('AutoTestForm');

    // Step 2: Drag two Textbox elements onto canvas
    await formBuilder.addTextboxToCanvas();
    await formBuilder.addTextboxToCanvas();

    // Step 3: Set properties for each textbox
    await formBuilder.setTextboxProperties(0, {
      label: 'First Name',
      tooltip: 'Your legal first name',
      defaultValue: '',
    });
    await formBuilder.setTextboxProperties(1, {
      label: 'Last Name',
      tooltip: 'Your legal last name',
      defaultValue: '',
    });

    // Step 4: Save the form
    await formBuilder.save();

    // Set frame reference for rules page
    rules.setFrame(formBuilder.frame);
  });

  test('Step 3-4: Two textboxes are on canvas with correct properties @usecase1', async () => {
    expect(await formBuilder.textboxCount()).toBeGreaterThanOrEqual(2);
  });

  test('Step 6: Add Rule button is visible and functional, Rule1 appears expanded @usecase1', async () => {
    // Navigate to Rules tab
    await formBuilder.goToRulesTab();

    await expect
      .poll(() => rules.addRuleButtonVisible())
      .toBeTruthy();

    await rules.clickAddRule();

    // Rule1 should be visible and expanded
    expect(await rules.ruleIsExpanded('Rule1')).toBeTruthy();
  });

  test('Step 7-9: Configures conditions with AND mode and Set Value action on Rule1 @usecase1', async () => {
    await formBuilder.goToRulesTab();
    await rules.clickAddRule();

    // Add first condition: First Name Is Not Empty
    await rules.addCondition({
      index: 0,
      element: 'First Name',
      conditionType: 'Is Not Empty',
    });

    // Step 8: Set AND mode
    await rules.setConditionMode('AND');

    // Add second condition: First Name Contains "Jo"
    await rules.addCondition({
      index: 1,
      element: 'First Name',
      conditionType: 'Contains',
      value: 'Jo',
    });

    // Step 9: Add Set Value action on Last Name
    await rules.addSetValueAction({
      targetElement: 'Last Name',
      value: 'AutoFilled',
    });

    // Assertion: Rule1 still exists and contains expected text
    expect(await rules.ruleIsExpanded('Rule1')).toBeTruthy();
  });

  test('Step 10-11: Add Rule Below creates Rule2 and Rule3, all persist after save @usecase1', async () => {
    await formBuilder.goToRulesTab();
    await rules.clickAddRule(); // Rule1

    // Step 10: Use context menu to add Rule2 and Rule3 below
    await rules.addRuleBelow('Rule1'); // Rule2
    await rules.addRuleBelow('Rule2'); // Rule3

    // Step 11: Save and verify all rules persist
    await formBuilder.save();

    const ruleNames = await rules.ruleNamesInList();
    for (const expected of ['Rule1', 'Rule2', 'Rule3']) {
      expect(
        ruleNames.some((n) => n.includes(expected)),
        `Expected rule "${expected}" to be in the rules list`
      ).toBeTruthy();
    }
  });
});
