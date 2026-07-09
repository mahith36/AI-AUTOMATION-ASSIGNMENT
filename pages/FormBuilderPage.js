const { BasePage } = require('./BasePage');
const { nav, formBuilder } = require('../config/selectors');
const { ENV } = require('../config/env');

class FormBuilderPage extends BasePage {
  async openNewForm() {
    await nav.automationMenuItem(this.page).click();
    await nav.createFormButton(this.page).click();
  }

  /**
   * Drags a Textbox element from the palette onto the canvas.
   * Uses Playwright's dragTo; if the app's drag implementation needs
   * native HTML5 DnD events instead, swap for a manual
   * mouse.down/move/up sequence (see comment below).
   */
  async addTextboxToCanvas() {
    if (ENV.USE_MOCK) {
      await this.page.evaluate(() => window.__addMockTextbox());
      return;
    }

    const source = formBuilder.textboxPaletteItem(this.page).first();
    const target = formBuilder.canvas(this.page);
    await source.dragTo(target);

    // Fallback if dragTo doesn't register with the app's DnD library:
    // const sBox = await source.boundingBox();
    // const tBox = await target.boundingBox();
    // await this.page.mouse.move(sBox.x + sBox.width / 2, sBox.y + sBox.height / 2);
    // await this.page.mouse.down();
    // await this.page.mouse.move(tBox.x + tBox.width / 2, tBox.y + tBox.height / 2, { steps: 10 });
    // await this.page.mouse.up();
  }

  async textboxCount() {
    return formBuilder.canvasTextboxes(this.page).count();
  }

  async selectCanvasTextbox(index) {
    await formBuilder.canvasTextboxes(this.page).nth(index).click();
  }

  async setTextboxProperties(index, { label, minLength, maxLength, hintText, tooltip, defaultValue }) {
    await this.selectCanvasTextbox(index);
    if (label !== undefined) await formBuilder.propLabel(this.page).fill(label);
    if (minLength !== undefined) await formBuilder.propMinLength(this.page).fill(String(minLength));
    if (maxLength !== undefined) await formBuilder.propMaxLength(this.page).fill(String(maxLength));
    if (hintText !== undefined) await formBuilder.propHintText(this.page).fill(hintText);
    if (tooltip !== undefined) await formBuilder.propTooltip(this.page).fill(tooltip);
    if (defaultValue !== undefined) await formBuilder.propDefaultValue(this.page).fill(defaultValue);
  }

  async save() {
    await formBuilder.saveButton(this.page).click();
  }

  async goToRulesTab() {
    await formBuilder.rulesTab(this.page).click();
  }
}

module.exports = { FormBuilderPage };
