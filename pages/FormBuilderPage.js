const { BasePage } = require("./BasePage");
const { formBuilder } = require("../config/selectors");
const { ENV } = require("../config/env");

class FormBuilderPage extends BasePage {
  async openNewForm(formName = "AutoTestForm") {
    // Navigate to Automation using direct URL
    await this.page.goto(ENV.APP_BASE_URL + "/#/bots/repository", {
      waitUntil: "domcontentloaded",
    });
    await this.page.waitForTimeout(3000);

    // Click Create to open dropdown — use aria-label
    const createBtn = this.page.locator('button[aria-label="Create"]').first();
    await createBtn.waitFor({ state: "visible", timeout: 10_000 });
    await createBtn.click();
    await this.page.waitForTimeout(2000);

    // The dropdown is open — find "Form…" button by text
    const formOption = this.page.locator("button").filter({ hasText: /^\s*Form/ }).first();
    await formOption.waitFor({ state: "visible", timeout: 5_000 }).catch(() => {});
    await formOption.click({ force: true });
    await this.page.waitForTimeout(1500);

    // Fill the "Create form" dialog
    const nameInput = this.page.locator('[role="dialog"] input[name="name"]');
    await nameInput.waitFor({ state: "visible", timeout: 5_000 });
    await nameInput.clear();
    await nameInput.fill(formName);

    // Click "Create & edit"
    const createEditBtn = this.page.locator('[role="dialog"] button').filter({ hasText: "Create & edit" });
    await createEditBtn.click();
    await this.page.waitForTimeout(2000);

    // Wait for the form editor iframe to appear
    await this.page.waitForSelector('iframe[src*="file/form"], iframe[src*="attended"]', {
      timeout: 15_000,
    });
    await this.page.waitForTimeout(3000);

    // Extract form ID for cleanup
    const url = this.page.url();
    const match = url.match(/files\/(\d+)\//);
    this._formId = match ? match[1] : null;
    return this._formId;
  }

  _getFormEditorFrame() {
    const frames = this.page.frames();
    const formFrame = frames.find(
      (f) => f.url().includes("file/form") || f.url().includes("/form/edit")
    );
    if (!formFrame) {
      throw new Error(
        `Form editor iframe not found. Available frames: ${frames.map((f) => f.url()).join(", ")}`
      );
    }
    return formFrame;
  }

  get frame() {
    if (!this._frame) this._frame = this._getFormEditorFrame();
    return this._frame;
  }

  async addTextboxToCanvas() {
    const frame = this.frame;
    const paletteItem = formBuilder.paletteItem(frame, "Text Box");
    const dropTarget = formBuilder.canvasDropTarget(frame);

    await paletteItem.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);

    const iframeEl = this.page.locator('iframe[src*="file/form"]');
    const iframeBox = await iframeEl.boundingBox();
    if (!iframeBox) throw new Error("Cannot locate form editor iframe");

    const tbBox = await paletteItem.boundingBox();
    if (!tbBox) throw new Error("Cannot locate Text Box palette item");
    const dzBox = await dropTarget.boundingBox();
    if (!dzBox) throw new Error("Cannot locate canvas drop target");

    const startX = iframeBox.x + tbBox.x + tbBox.width / 2;
    const startY = iframeBox.y + tbBox.y + tbBox.height / 2;
    const endX = iframeBox.x + dzBox.x + 50;
    const endY = iframeBox.y + dzBox.y + 30;

    await this.page.mouse.move(startX, startY);
    await this.page.waitForTimeout(100);
    await this.page.mouse.down();
    await this.page.waitForTimeout(200);

    const steps = 10;
    for (let i = 1; i <= steps; i++) {
      await this.page.mouse.move(
        startX + ((endX - startX) * i) / steps,
        startY + ((endY - startY) * i) / steps,
        { steps: 2 }
      );
      await this.page.waitForTimeout(80);
    }
    await this.page.waitForTimeout(200);
    await this.page.mouse.up();
    await this.page.waitForTimeout(1500);
  }

  async textboxCount() {
    return formBuilder.canvasRows(this.frame).count();
  }

  async setTextboxProperties(index, props) {
    const frame = this.frame;
    const rows = formBuilder.canvasRows(frame);
    await rows.nth(index).click();
    await this.page.waitForTimeout(1000);

    if (props.label !== undefined) {
      const el = formBuilder.propLabel(frame);
      await el.click();
      await el.fill(props.label);
    }
    if (props.tooltip !== undefined) {
      const el = formBuilder.propTooltip(frame);
      if (await el.isVisible().catch(() => false)) await el.fill(props.tooltip);
    }
    if (props.defaultValue !== undefined) {
      const el = formBuilder.propDefaultValue(frame);
      if (await el.isVisible().catch(() => false)) await el.fill(props.defaultValue);
    }
    if (props.hintText !== undefined) {
      const el = formBuilder.propHintText(frame);
      if (await el.isVisible().catch(() => false)) await el.fill(props.hintText);
    }
  }

  async save() {
    await formBuilder.saveButton(this.frame).click();
    await this.page.waitForTimeout(2000);
  }

  async goToRulesTab() {
    await formBuilder.rulesTab(this.frame).click();
    await this.page.waitForTimeout(1000);
  }

  async close() {
    await formBuilder.closeButton(this.frame).click();
    await this.page.waitForTimeout(1500);
  }
}

module.exports = { FormBuilderPage };
