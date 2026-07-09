class BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  async goto(path = '/') {
    await this.page.goto(path);
  }

  async waitForVisible(locator, timeout = 10_000) {
    await locator.waitFor({ state: 'visible', timeout });
  }
}

module.exports = { BasePage };
