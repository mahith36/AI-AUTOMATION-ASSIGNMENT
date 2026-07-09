const { BasePage } = require('./BasePage');
const { login } = require('../config/selectors');
const { ENV } = require('../config/env');
const { mockAppHtml } = require('../utils/mockApp');

class LoginPage extends BasePage {
  async login(email = ENV.LOGIN_EMAIL, password = ENV.LOGIN_PASSWORD) {
    if (ENV.USE_MOCK) {
      await this.page.setContent(mockAppHtml(), { waitUntil: 'domcontentloaded' });
      return;
    }

    if (!email || !password) {
      throw new Error(
        'Missing AA_EMAIL / AA_PASSWORD. Set them in .env (see .env.example).'
      );
    }
    await this.goto('/');
    await login.emailInput(this.page).fill(email);
    await login.passwordInput(this.page).fill(password);
    await login.submitButton(this.page).click();
    // TODO: replace with an assertion on a real post-login element
    // (e.g. dashboard heading) once you've seen the real app.
    await this.page.waitForLoadState('networkidle');
  }
}

module.exports = { LoginPage };
