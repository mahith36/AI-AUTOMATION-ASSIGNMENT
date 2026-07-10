const { BasePage } = require('./BasePage');
const { login } = require('../config/selectors');
const { ENV } = require('../config/env');

class LoginPage extends BasePage {
  /**
   * Logs into Automation Anywhere Community Edition.
   * Navigates to login page, fills credentials, clicks login.
   */
  async login(email = ENV.LOGIN_EMAIL, password = ENV.LOGIN_PASSWORD) {
    if (!email || !password) {
      throw new Error(
        'Missing AA_EMAIL / AA_PASSWORD. Set them in .env (see .env.example).'
      );
    }

    // Navigate to the login page
    await this.page.goto(ENV.APP_BASE_URL + ENV.LOGIN_PATH, { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(2000);

    // Fill credentials
    await login.usernameInput(this.page).fill(email);
    await login.passwordInput(this.page).fill(password);
    await login.submitButton(this.page).click();

    // Wait for login to complete — the dashboard or home page should load
    await this.page.waitForURL(/\/#\/(home|dashboard)/, { timeout: 15_000 });
    await this.page.waitForTimeout(2000);
  }
}

module.exports = { LoginPage };
