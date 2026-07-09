const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');
const { rulesBuilder } = require('../config/selectors');

class RulesPage extends BasePage {
  async addRuleButtonVisible() {
    return rulesBuilder.addRuleButton(this.page).isVisible();
  }

  async clickAddRule() {
    await rulesBuilder.addRuleButton(this.page).click();
  }

  async ruleIsExpanded(ruleName) {
    return rulesBuilder.ruleCardExpanded(this.page, ruleName).isVisible();
  }

  async editButtonPresent(ruleName) {
    return rulesBuilder.ruleEditButton(this.page, ruleName).isVisible();
  }

  /**
   * Adds a condition: element + condition type (+ value if the
   * condition type requires an input, e.g. "Contains" vs "Is Not Empty").
   */
  async addCondition({ index, element, conditionType, value }) {
    await rulesBuilder.addConditionButton(this.page).click();
    await rulesBuilder.conditionElementDropdown(this.page, index).selectOption({ label: element });
    await rulesBuilder.conditionTypeDropdown(this.page, index).selectOption({ label: conditionType });

    const valueInput = rulesBuilder.conditionValueInput(this.page, index);
    if (value !== undefined) {
      await expect(valueInput).toBeVisible();
      await valueInput.fill(value);
    }
  }

  async setConditionMode(mode /* 'AND' | 'OR' */) {
    await rulesBuilder.conditionModeToggle(this.page).selectOption({ label: mode });
  }

  async addSetValueAction({ targetElement, value }) {
    await rulesBuilder.addActionButton(this.page).click();
    await rulesBuilder.actionTypeDropdown(this.page).selectOption({ label: 'Set Value' });
    await rulesBuilder.actionTargetElementDropdown(this.page).selectOption({ label: targetElement });
    await rulesBuilder.actionValueInput(this.page).fill(value);
  }

  async addRuleBelow(existingRuleName) {
    await rulesBuilder.ruleCardContextMenuButton(this.page, existingRuleName).click();
    await rulesBuilder.addRuleBelowMenuOption(this.page).click();
  }

  async ruleNamesInList() {
    return rulesBuilder.rulesListItems(this.page).allTextContents();
  }
}

module.exports = { RulesPage };
