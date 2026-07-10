const { BasePage } = require('./BasePage');
const { rulesBuilder } = require('../config/selectors');

class RulesPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);
    this._frame = null;
  }

  /**
   * Sets the iframe Frame reference for form editor operations.
   */
  setFrame(frame) {
    this._frame = frame;
  }

  get frame() {
    if (!this._frame) {
      const frames = this.page.frames();
      this._frame = frames.find((f) => f.url().includes('file/form'));
    }
    return this._frame;
  }

  async addRuleButtonVisible() {
    return rulesBuilder.addRuleButton(this.frame).isVisible();
  }

  async clickAddRule() {
    await rulesBuilder.addRuleButton(this.frame).click();
    await this.page.waitForTimeout(1500);
  }

  async ruleIsExpanded(ruleName) {
    // Rule cards show conditions/actions when expanded
    const card = rulesBuilder.ruleCard(this.frame, ruleName);
    const text = await card.textContent();
    return text.includes('If') && text.includes('Then');
  }

  async editButtonPresent() {
    return rulesBuilder.ruleEditButton(this.frame).isVisible().catch(() => false);
  }

  /**
   * Adds a condition to the currently expanded rule.
   */
  async addCondition({ index, element, conditionType, value }) {
    const frame = this.frame;
    await rulesBuilder.addConditionButton(frame).click();
    await this.page.waitForTimeout(1000);

    // Select the element
    await rulesBuilder.conditionElementDropdown(frame).click();
    await this.page.waitForTimeout(500);
    await this.page.keyboard.type(element, { delay: 50 });
    await this.page.keyboard.press('Enter');

    // Select condition type
    if (await rulesBuilder.conditionTypeDropdown(frame).isVisible().catch(() => false)) {
      await rulesBuilder.conditionTypeDropdown(frame).click();
      await this.page.waitForTimeout(500);
      await this.page.keyboard.type(conditionType, { delay: 50 });
      await this.page.keyboard.press('Enter');
    }

    // Fill value if provided
    if (value !== undefined) {
      await rulesBuilder.conditionValueInput(frame).fill(value);
    }
    await this.page.waitForTimeout(500);
  }

  async setConditionMode(mode) {
    await rulesBuilder.conditionModeToggle(this.frame).click({ force: true });
    await this.page.waitForTimeout(300);
    if (mode === 'AND') await this.page.keyboard.press('ArrowUp');
    if (mode === 'OR') await this.page.keyboard.press('ArrowDown');
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(500);
  }

  async addSetValueAction({ targetElement, value }) {
    const frame = this.frame;
    await rulesBuilder.addActionButton(frame).click();
    await this.page.waitForTimeout(1000);

    // Select action type
    await rulesBuilder.actionTypeDropdown(frame).click();
    await this.page.waitForTimeout(500);
    await this.page.keyboard.type('Set Value', { delay: 50 });
    await this.page.keyboard.press('Enter');

    // Select target
    await rulesBuilder.actionTargetDropdown(frame).click();
    await this.page.waitForTimeout(500);
    await this.page.keyboard.type(targetElement, { delay: 50 });
    await this.page.keyboard.press('Enter');

    // Fill value
    await rulesBuilder.actionValueInput(frame).fill(value);
    await this.page.waitForTimeout(500);
  }

  async addRuleBelow(existingRuleName) {
    const frame = this.frame;
    // Click the "More" button on the rule card
    const moreBtn = rulesBuilder.ruleMoreButton(frame);
    await moreBtn.click();
    await this.page.waitForTimeout(500);

    // Click "Add Rule Below" in the context menu (this menu is in the main page DOM)
    await this.page.getByRole('menuitem', { name: /add rule below/i }).click();
    await this.page.waitForTimeout(1500);
  }

  async ruleNamesInList() {
    return rulesBuilder.ruleNamesInList(this.frame);
  }
}

module.exports = { RulesPage };
