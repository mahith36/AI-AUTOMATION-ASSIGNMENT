const { BasePage } = require('./BasePage');
const { nav, formBuilder } = require('../config/selectors');
const { ENV } = require('../config/env');

class FormBuilderPage extends BasePage {
  /**
   * Navigates to Automation, creates a new Form via Create → Form…,
   * and waits for the form editor iframe to load.
   * @returns {string} the created form's name
   */
  async createNewForm(baseName = 'AutoTestForm') {
    // Unique name — AA rejects duplicate file names in the repository.
    const formName = `${baseName}-${Date.now()}`;

    await this.page.goto(ENV.APP_BASE_URL + ENV.REPOSITORY_PATH, {
      waitUntil: 'domcontentloaded',
    });
    await nav.createButton(this.page).waitFor({ state: 'visible', timeout: 30_000 });
    // The repository table keeps loading briefly after the header renders.
    await this.page.waitForTimeout(1500);

    await nav.createButton(this.page).click();
    await nav.createFormOption(this.page).click();

    await nav.dialogNameInput(this.page).waitFor({ state: 'visible' });
    await nav.dialogNameInput(this.page).fill(formName);
    await nav.dialogCreateEditButton(this.page).click();

    await nav.editorIframe(this.page).waitFor({ state: 'visible', timeout: 45_000 });
    // Let the editor SPA inside the iframe finish booting.
    await this.waitForEditorFrame();
    await this.frameLocatorReady();

    this._formName = formName;
    return formName;
  }

  /**
   * The form editor iframe's Frame object. Resolves the CURRENT frame each time
   * (it is replaced on reload). The editor iframe lives at
   * modules/attended/#/file/form/{id}/edit — distinct from the outer SPA hash
   * URL which contains the singular "module/attended".
   */
  get frame() {
    const frame = this.page.frames().find((f) => /modules\/attended/.test(f.url()));
    if (!frame) {
      throw new Error(
        `Form editor iframe not found. Frames: ${this.page.frames().map((f) => f.url()).join(', ')}`
      );
    }
    return frame;
  }

  /**
   * Waits until the editor iframe's Frame object has attached and navigated to
   * the attended editor URL. The <iframe> element can be visible before its
   * Frame commits navigation, so poll page.frames() rather than assume it.
   */
  async waitForEditorFrame(timeout = 45_000) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      const frame = this.page.frames().find((f) => /modules\/attended/.test(f.url()));
      if (frame) return frame;
      await this.page.waitForTimeout(500);
    }
    throw new Error(
      `Editor iframe never attached. Frames: ${this.page.frames().map((f) => f.url()).join(', ')}`
    );
  }

  async frameLocatorReady() {
    await formBuilder
      .paletteItem(this.frame, 'Text Box')
      .waitFor({ state: 'attached', timeout: 45_000 });
    await this.page.waitForTimeout(1000);
  }

  /**
   * Drags a palette element onto the canvas with real mouse events.
   * IMPORTANT: locator.boundingBox() coordinates are already relative to the
   * main-frame viewport (even for elements inside the iframe) — do NOT add
   * the iframe's own offset.
   */
  async addTextboxToCanvas() {
    const frame = this.frame;
    const palette = formBuilder.paletteItem(frame, 'Text Box');
    await palette.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(400);

    const before = await formBuilder.canvasRows(frame).count();

    const from = await palette.boundingBox();
    const canvas = await formBuilder.canvas(frame).boundingBox();
    if (!from || !canvas) throw new Error('Cannot resolve drag coordinates');

    const sx = from.x + from.width / 2;
    const sy = from.y + from.height / 2;
    const ex = canvas.x + canvas.width / 2;
    let ey;
    if (before > 0) {
      const lastRow = await formBuilder.canvasRows(frame).last().boundingBox();
      ey = lastRow.y + lastRow.height + 25; // drop below the last element
    } else {
      ey = canvas.y + 60;
    }

    await this.page.mouse.move(sx, sy);
    await this.page.mouse.down();
    for (let i = 1; i <= 12; i++) {
      await this.page.mouse.move(sx + ((ex - sx) * i) / 12, sy + ((ey - sy) * i) / 12);
      await this.page.waitForTimeout(50);
    }
    await this.page.mouse.up();
    await this.page.waitForTimeout(1500);

    const after = await formBuilder.canvasRows(frame).count();
    if (after !== before + 1) {
      throw new Error(`Drag-and-drop failed: canvas rows ${before} -> ${after}`);
    }
  }

  async textboxCount() {
    return formBuilder.canvasRows(this.frame).count();
  }

  /** Element IDs on canvas, e.g. ["TextBox0", "TextBox1"]. */
  async canvasElementIds() {
    const ids = await formBuilder.canvasElementLabels(this.frame).evaluateAll((nodes) =>
      nodes.map((e) => e.id)
    );
    return ids.map((id) => id.replace('__label-non-editable', ''));
  }

  /**
   * Selects the nth canvas element and sets its properties.
   * Supported: label, minLength, maxLength, hintText, toolTip, defaultValue.
   */
  async setTextboxProperties(index, props) {
    const frame = this.frame;
    await formBuilder.canvasRows(frame).nth(index).click();
    if (!(await formBuilder.propLabel(frame).isVisible().catch(() => false))) {
      await formBuilder.propertiesTab(frame).click();
    }
    await formBuilder.propLabel(frame).waitFor({ state: 'visible', timeout: 10_000 });

    if (props.label !== undefined) await formBuilder.propLabel(frame).fill(props.label);
    if (props.minLength !== undefined) await formBuilder.propMinLength(frame).fill(String(props.minLength));
    if (props.maxLength !== undefined) await formBuilder.propMaxLength(frame).fill(String(props.maxLength));
    if (props.hintText !== undefined) await formBuilder.propHintText(frame).fill(props.hintText);
    if (props.toolTip !== undefined) await formBuilder.propToolTip(frame).fill(props.toolTip);
    if (props.defaultValue !== undefined) await formBuilder.propDefaultValue(frame).fill(props.defaultValue);
  }

  /** Reads back the selected element's property values for assertions. */
  async readSelectedProperties() {
    const frame = this.frame;
    return {
      label: await formBuilder.propLabel(frame).inputValue(),
      minLength: await formBuilder.propMinLength(frame).inputValue(),
      maxLength: await formBuilder.propMaxLength(frame).inputValue(),
      hintText: await formBuilder.propHintText(frame).inputValue(),
      toolTip: await formBuilder.propToolTip(frame).inputValue(),
      defaultValue: await formBuilder.propDefaultValue(frame).inputValue(),
    };
  }

  async save() {
    await formBuilder.saveButton(this.frame).click();
    await this.page.waitForTimeout(3000);
  }

  async goToRulesTab() {
    await formBuilder.rulesTab(this.frame).click();
    await this.page.waitForTimeout(800);
  }

  /** Text of the rules tab, e.g. "Form rules (3)". */
  async rulesTabText() {
    return (await formBuilder.rulesTab(this.frame).textContent()).trim();
  }

  /** Reloads the editor page (used to verify persistence after save). */
  async reloadEditor() {
    await this.page.reload();
    await nav.editorIframe(this.page).waitFor({ state: 'visible', timeout: 45_000 });
    await this.waitForEditorFrame();
    await this.frameLocatorReady();
  }
}

module.exports = { FormBuilderPage };
