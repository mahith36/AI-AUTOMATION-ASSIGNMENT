/**
 * Use Case 1: Form with Rules Builder (UI Automation)
 *
 * Automates the full assignment flow against the real Automation Anywhere
 * Community Edition app:
 *   1. Log in
 *   2. Navigate to Automation, create a new Form
 *   3. Drag & drop two Text Box elements onto the canvas
 *   4. Set properties (label, min/max length, hint, tooltip, default value)
 *   5. Save, open the Form rules tab
 *   6. Create Rule1, verify it appears expanded
 *   7. Add a condition (First Name / Is not empty)
 *   8. Add a second condition (First Name / Contains "Jo") with AND mode
 *   9. Add a Set value action targeting the other textbox
 *  10. Context menu → Add rule below → Rule2, Rule3
 *  11. Save and verify all rules persist
 *
 * The whole use case is one continuous journey in the app, so the tests run
 * serially and share one page/session (AA CE allows only one session per
 * user — a fresh login per test would also kill the previous session).
 */
const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/LoginPage');
const { FormBuilderPage } = require('../../pages/FormBuilderPage');
const { RulesPage } = require('../../pages/RulesPage');

test.describe.configure({ mode: 'serial' });

test.describe('Use Case 1: Form with Rules Builder @usecase1', () => {
  /** @type {import('@playwright/test').Page} */
  let page;
  let loginPage;
  let formBuilder;
  let rules;

  const FIRST = { label: 'First Name', minLength: 2, maxLength: 30, hintText: 'Enter first name', toolTip: 'Your first name', defaultValue: 'John' };
  const SECOND = { label: 'Last Name', minLength: 2, maxLength: 40, hintText: 'Enter last name', toolTip: 'Your last name', defaultValue: 'Doe' };

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    loginPage = new LoginPage(page);
    formBuilder = new FormBuilderPage(page);
    rules = new RulesPage(page);
  });

  test.afterAll(async () => {
    await page?.close();
  });

  test('Steps 1-2: logs in and creates a new Form from Automation @usecase1', async () => {
    await test.step('Log in to Community Edition', async () => {
      await loginPage.login();
      expect(page.url()).toMatch(/#\/(home|dashboard)/);
    });

    await test.step('Create a new Form via Create → Form…', async () => {
      const name = await formBuilder.createNewForm('AutoTestForm');
      expect(name).toContain('AutoTestForm');
      // The editor iframe is loaded with the palette visible
      expect(await formBuilder.textboxCount()).toBe(0);
    });
  });

  test('Steps 3-4: drags two Text Boxes onto the canvas and sets their properties @usecase1', async () => {
    await test.step('Drag & drop two Text Box elements', async () => {
      await formBuilder.addTextboxToCanvas();
      await formBuilder.addTextboxToCanvas();
      expect(await formBuilder.textboxCount()).toBe(2);
      expect(await formBuilder.canvasElementIds()).toEqual(['TextBox0', 'TextBox1']);
    });

    await test.step('Set properties on both textboxes', async () => {
      await formBuilder.setTextboxProperties(0, FIRST);
      await formBuilder.setTextboxProperties(1, SECOND);
    });

    await test.step('Verify the properties were applied', async () => {
      // Re-select each element and read the values back from the panel
      await formBuilder.setTextboxProperties(0, {});
      const p0 = await formBuilder.readSelectedProperties();
      expect(p0.label).toBe(FIRST.label);
      expect(p0.minLength).toBe(String(FIRST.minLength));
      expect(p0.maxLength).toBe(String(FIRST.maxLength));
      expect(p0.hintText).toBe(FIRST.hintText);
      expect(p0.toolTip).toBe(FIRST.toolTip);
      expect(p0.defaultValue).toBe(FIRST.defaultValue);

      await formBuilder.setTextboxProperties(1, {});
      const p1 = await formBuilder.readSelectedProperties();
      expect(p1.label).toBe(SECOND.label);
      expect(p1.defaultValue).toBe(SECOND.defaultValue);
    });
  });

  test('Steps 5-6: saves the form; Add rule button creates Rule1 in expanded mode @usecase1', async () => {
    await test.step('Save the form and open the Form rules tab', async () => {
      await formBuilder.save();
      await formBuilder.goToRulesTab();
      expect(await formBuilder.rulesTabText()).toMatch(/Form rules \(0\)/i);
    });

    await test.step('Add rule button is visible and functional', async () => {
      await expect(rules.addRuleButton()).toBeVisible();
      await rules.clickAddRule();
    });

    await test.step('Rule1 appears in the list, expanded (If/Then sections visible)', async () => {
      expect(await rules.ruleNames()).toEqual(['Rule1']);
      expect(await rules.ruleIsExpanded('Rule1')).toBe(true);
    });

    await test.step('Edit button is present on the rule card', async () => {
      expect(await rules.editButtonPresentOn('Rule1')).toBe(true);
    });
  });

  test('Steps 7-8: configures two conditions on Rule1 with AND mode @usecase1', async () => {
    await test.step('Condition 1: First Name / Is not empty', async () => {
      await rules.setConditionElement('First Name');
      await rules.setConditionType('Is not empty');
      expect(await rules.conditionValueInputVisible()).toBe(false);
    });

    await test.step('Condition 2: First Name / Contains "Jo" (value input appears)', async () => {
      await rules.addCondition();
      await rules.setConditionElement('First Name');
      await rules.setConditionType('Contains');
      expect(await rules.conditionValueInputVisible()).toBe(true);
      await rules.fillConditionValue('Jo');
    });

    await test.step('Condition mode can be switched between AND and OR', async () => {
      await rules.setConditionMode('or');
      expect(await rules.currentConditionMode()).toMatch(/or/i);
      await rules.setConditionMode('and');
      expect(await rules.currentConditionMode()).toMatch(/and/i);
    });
  });

  test('Step 9: adds a Set value action targeting Last Name @usecase1', async () => {
    await test.step('Pick the action target element (Last Name)', async () => {
      await rules.setActionElement('Last Name');
    });

    await test.step('Choose the Set value action and give it a value', async () => {
      await rules.setActionType('Set value');
      await rules.fillActionValue('AutoFilled');
    });

    await test.step('Action is properly assigned', async () => {
      const summary = await rules.ruleCardText('Rule1');
      expect(summary).toContain('Last Name');
      expect(summary).toContain('Set value');
    });
  });

  test('Step 10: context menu Add rule below creates Rule2 and Rule3 @usecase1', async () => {
    await test.step('Add rule below Rule1 → Rule2', async () => {
      await rules.addRuleBelow('Rule1');
      expect(await rules.ruleNames()).toEqual(['Rule1', 'Rule2']);
    });

    await test.step('Add rule below Rule2 → Rule3', async () => {
      await rules.addRuleBelow('Rule2');
      expect(await rules.ruleNames()).toEqual(['Rule1', 'Rule2', 'Rule3']);
    });

    await test.step('Every rule card shows an Edit button', async () => {
      for (const name of ['Rule1', 'Rule2', 'Rule3']) {
        expect(await rules.editButtonPresentOn(name)).toBe(true);
      }
    });
  });

  test('Step 11: saves the form and verifies all rules persist @usecase1', async () => {
    await test.step('Save the form', async () => {
      await formBuilder.save();
    });

    await test.step('Reload the editor and re-open Form rules', async () => {
      await formBuilder.reloadEditor();
      await formBuilder.goToRulesTab();
    });

    await test.step('Rule1, Rule2 and Rule3 are all still in the rules list', async () => {
      const names = await rules.ruleNames();
      expect(names).toEqual(expect.arrayContaining(['Rule1', 'Rule2', 'Rule3']));
      expect(await formBuilder.rulesTabText()).toMatch(/Form rules \(3\)/i);
    });
  });
});
