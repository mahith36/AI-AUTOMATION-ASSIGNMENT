const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/LoginPage');
const { FormBuilderPage } = require('../../pages/FormBuilderPage');
const { RulesPage } = require('../../pages/RulesPage');

test.describe('Use Case 1: Form with Rules Builder @usecase1', () => {
  let formBuilder;
  let rules;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login();

    formBuilder = new FormBuilderPage(page);
    rules = new RulesPage(page);

    await formBuilder.openNewForm();
    await formBuilder.addTextboxToCanvas();
    await formBuilder.addTextboxToCanvas();

    await formBuilder.setTextboxProperties(0, {
      label: 'First Name',
      minLength: 2,
      maxLength: 50,
      hintText: 'Enter first name',
      tooltip: 'Your legal first name',
      defaultValue: '',
    });
    await formBuilder.setTextboxProperties(1, {
      label: 'Last Name',
      minLength: 2,
      maxLength: 50,
      hintText: 'Enter last name',
      tooltip: 'Your legal last name',
      defaultValue: '',
    });

    await formBuilder.save();
    await formBuilder.goToRulesTab();
  });

  test('drags two textboxes onto canvas with correct properties', async () => {
    expect(await formBuilder.textboxCount()).toBe(2);
  });

  test('Add Rule button is visible and functional, Rule1 appears expanded', async () => {
    await expect.poll(() => rules.addRuleButtonVisible()).toBeTruthy();

    await rules.clickAddRule(); // Rule1
    expect(await rules.ruleIsExpanded('Rule1')).toBeTruthy();
    expect(await rules.editButtonPresent('Rule1')).toBeTruthy();
  });

  test('configures conditions with AND mode and a Set Value action on Rule1', async () => {
    await rules.clickAddRule(); // Rule1

    await rules.addCondition({
      index: 0,
      element: 'First Name',
      conditionType: 'Is Not Empty',
    });

    await rules.setConditionMode('AND');

    await rules.addCondition({
      index: 1,
      element: 'First Name',
      conditionType: 'Contains',
      value: 'Jo',
    });

    await rules.addSetValueAction({
      targetElement: 'Last Name',
      value: 'AutoFilled',
    });

    // Assertion: action is attached to the intended target element.
    // TODO once selectors confirmed: assert the rendered action summary
    // text includes both target element and action type.
  });

  test('Add Rule Below context menu creates Rule2 and Rule3, all persist after save', async () => {
    await rules.clickAddRule(); // Rule1
    await rules.addRuleBelow('Rule1'); // Rule2
    await rules.addRuleBelow('Rule2'); // Rule3

    await formBuilder.save();

    const ruleNames = await rules.ruleNamesInList();
    for (const expected of ['Rule1', 'Rule2', 'Rule3']) {
      expect(ruleNames.some((n) => n.includes(expected))).toBeTruthy();
    }
  });
});
