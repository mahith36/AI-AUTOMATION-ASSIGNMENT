const { BasePage } = require('./BasePage');
const { rulesBuilder } = require('../config/selectors');

/**
 * Page object for the Form rules (Rules Builder) tab, which lives inside the
 * form-editor iframe.
 *
 * Interaction model captured from the real AA CE app:
 *  - Each rule card is a `.rules-widget`; its title is `.rule-name`.
 *  - A fresh rule pre-creates ONE empty condition row and ONE empty action row.
 *  - Every dropdown (element / condition type / action type) is a `rio-select`
 *    opened by clicking its query input, then picking a
 *    `.rio-select-input-dropdown-option`.
 *  - The condition-type / action-type combo only APPEARS after its element is
 *    chosen (element-first). So the empty condition's element combo is the
 *    FIRST "Select element" input, and the action's element combo is the LAST.
 *  - The condition value field appears only for value-based types (e.g.
 *    Contains) as an input with placeholder "Enter value".
 *  - AND/OR is a segmented `rio-mode-input` with radio buttons name="AND"/"OR".
 *  - The card "More" menu → "Add rule below" is button[name="action-add-rule-below"].
 */
class RulesPage extends BasePage {
  /** The form-editor iframe Frame. */
  get frame() {
    const frame = this.page.frames().find((f) => /modules\/attended/.test(f.url()));
    if (!frame) throw new Error('Form editor iframe not found (rules).');
    return frame;
  }

  addRuleButton() {
    return rulesBuilder.addRuleButton(this.frame);
  }

  async clickAddRule() {
    await this.addRuleButton().click();
    await this.page.waitForTimeout(1200);
  }

  /** Names of all rule cards, in order, e.g. ["Rule1","Rule2","Rule3"]. */
  async ruleNames() {
    return rulesBuilder.ruleNames(this.frame).allTextContents();
  }

  card(ruleName) {
    return rulesBuilder.ruleCard(this.frame, ruleName);
  }

  /** Full visible text of a rule card (for asserting configured content). */
  async ruleCardText(ruleName) {
    return (await this.card(ruleName).textContent()) || '';
  }

  /**
   * A rule is "expanded" when its If/Then sections are visible — i.e. the card
   * exposes the Add condition / Add action controls.
   */
  async ruleIsExpanded(ruleName) {
    const card = this.card(ruleName);
    const hasAddCondition = await rulesBuilder
      .addConditionButton(card)
      .isVisible()
      .catch(() => false);
    const hasAddAction = await rulesBuilder
      .addActionButton(card)
      .isVisible()
      .catch(() => false);
    return hasAddCondition && hasAddAction;
  }

  async editButtonPresentOn(ruleName) {
    return rulesBuilder.editButton(this.card(ruleName)).isVisible().catch(() => false);
  }

  // ---- internal dropdown helpers ----
  async _pickOption(text) {
    const opt = rulesBuilder.dropdownOption(this.frame, text);
    await opt.waitFor({ state: 'visible', timeout: 10_000 });
    await opt.click();
    await this.page.waitForTimeout(700);
  }

  async _closeDropdownIfOpen() {
    const open = await rulesBuilder
      .dropdownOptions(this.frame)
      .first()
      .isVisible()
      .catch(() => false);
    if (open) {
      await this.frame.locator('body').press('Escape');
      await this.page.waitForTimeout(300);
    }
  }

  // ---- conditions ----
  /** Selects the element for the first empty condition row. */
  async setConditionElement(elementLabel) {
    await rulesBuilder.selectElementInputs(this.frame).first().click();
    await this._pickOption(elementLabel);
    await this._closeDropdownIfOpen();
  }

  /** Selects the condition type for the first empty "Select condition" combo. */
  async setConditionType(conditionType) {
    await rulesBuilder.selectConditionInputs(this.frame).first().click();
    await this._pickOption(new RegExp(`^${conditionType}$`, 'i'));
    await this._closeDropdownIfOpen();
  }

  /** Adds another (empty) condition row to the current rule. */
  async addCondition() {
    await rulesBuilder.addConditionButton(this.frame).first().click();
    await this.page.waitForTimeout(1000);
  }

  conditionValueInput() {
    // Value field for value-based condition/action types.
    return rulesBuilder.valueInputs(this.frame);
  }

  async conditionValueInputVisible() {
    return this.conditionValueInput().first().isVisible().catch(() => false);
  }

  async fillConditionValue(value) {
    await this.conditionValueInput().last().fill(value);
    await this.page.waitForTimeout(300);
  }

  // ---- AND / OR mode ----
  _modeInput() {
    return rulesBuilder.conditionModeInput(this.frame);
  }

  async setConditionMode(mode) {
    const value = mode.toUpperCase() === 'OR' ? 'OR' : 'AND';
    await rulesBuilder.conditionModeRadio(this._modeInput(), value).click();
    await this.page.waitForTimeout(400);
  }

  /** Returns 'AND' or 'OR' — whichever radio is currently selected. */
  async currentConditionMode() {
    const selected = rulesBuilder.conditionModeSelected(this._modeInput());
    return ((await selected.getAttribute('data-value')) || '').toUpperCase();
  }

  // ---- actions ----
  /** Selects the action's target element (the last "Select element" combo). */
  async setActionElement(elementLabel) {
    await rulesBuilder.selectElementInputs(this.frame).last().click();
    await this._pickOption(elementLabel);
    await this._closeDropdownIfOpen();
  }

  /** Selects the action type (e.g. "Set value") from the "Select action" combo. */
  async setActionType(actionType) {
    await rulesBuilder.selectActionInputs(this.frame).first().click();
    await this._pickOption(new RegExp(`^${actionType}$`, 'i'));
    await this._closeDropdownIfOpen();
  }

  async fillActionValue(value) {
    await this.conditionValueInput().last().fill(value);
    await this.page.waitForTimeout(300);
  }

  // ---- context menu: Add rule below ----
  async addRuleBelow(existingRuleName) {
    const card = this.card(existingRuleName);
    await rulesBuilder.moreButton(card).click();
    await this.page.waitForTimeout(700);
    // The menu renders inside the iframe (portal).
    await rulesBuilder.addRuleBelowItem(this.frame).click();
    await this.page.waitForTimeout(1200);
  }
}

module.exports = { RulesPage };
