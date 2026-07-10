const { BasePage } = require('./BasePage');
const { login } = require('../config/selectors');
const { ENV } = require('../config/env');

class LoginPage extends BasePage {
  /**
   * Logs into Automation Anywhere Community Edition through the real login page.
   * Note: AA CE allows a single active session per user — logging in here
   * invalidates any other session (UI or API) for the same account.
   */
  async login(email = ENV.LOGIN_EMAIL, password = ENV.LOGIN_PASSWORD) {
    if (!email || !password) {
      throw new Error(
        'Missing AA_EMAIL / AA_PASSWORD. Set them in .env (see .env.example).'
      );
    }

    await this.page.goto(ENV.APP_BASE_URL + ENV.LOGIN_PATH, {
      waitUntil: 'domcontentloaded',
    });

    await login.usernameInput(this.page).fill(email);
    await login.passwordInput(this.page).fill(password);
    await login.submitButton(this.page).click();

    // Successful login lands on #/home (Explore) or #/dashboard.
    await this.page.waitForURL(/#\/(home|dashboard)/, { timeout: 45_000 });
  }
}

module.exports = { LoginPage };
