const { ENV } = require('../config/env');

class ApiClient {
  /** @param {import('@playwright/test').APIRequestContext} request */
  constructor(request) {
    this.request = request;
    this.token = null;
  }

  /**
   * Authenticate with the AA API to obtain a token.
   * Endpoint identified from Network tab on login.
   */
  async authenticate(username = ENV.LOGIN_EMAIL, password = ENV.LOGIN_PASSWORD) {
    const start = Date.now();
    const res = await this.request.post(ENV.AUTH_ENDPOINT, {
      data: { username, password },
    });
    const elapsedMs = Date.now() - start;
    const body = await res.json().catch(() => ({}));
    if (body.token) {
      this.token = body.token;
    }
    // Some AA APIs use different header names — try common variants
    return { res, body, elapsedMs };
  }

  authHeaders() {
    if (!this.token) throw new Error('Call authenticate() before making authenticated API calls.');
    return {
      'X-Authorization': this.token,
      Authorization: `Bearer ${this.token}`,
    };
  }

  /**
   * Create a Learning Instance with document type "Invoice".
   * Endpoint identified from Network tab when creating via Document Automation UI.
   */
  async createLearningInstance({ name, documentType = 'Invoice' }) {
    const start = Date.now();
    const res = await this.request.post(ENV.LEARNING_INSTANCE_ENDPOINT, {
      headers: this.authHeaders(),
      data: { name, documentType },
    });
    const elapsedMs = Date.now() - start;
    const body = await res.json().catch(() => null);
    return { res, body, elapsedMs };
  }

  async getLearningInstance(id) {
    const start = Date.now();
    const res = await this.request.get(`${ENV.LEARNING_INSTANCE_ENDPOINT}/${id}`, {
      headers: this.authHeaders(),
    });
    const elapsedMs = Date.now() - start;
    const body = await res.json().catch(() => null);
    return { res, body, elapsedMs };
  }
}

module.exports = { ApiClient };
