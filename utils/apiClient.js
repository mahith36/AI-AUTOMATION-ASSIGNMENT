const { ENV } = require('../config/env');

class MockResponse {
  constructor(status, body) {
    this.statusCode = status;
    this.body = body;
  }

  status() {
    return this.statusCode;
  }

  async json() {
    return this.body;
  }
}

class ApiClient {
  /** @param {import('@playwright/test').APIRequestContext} request */
  constructor(request) {
    this.request = request;
    this.token = null;
    this.createdInstances = new Map();
  }

  /**
   * TODO: confirm the real payload shape and response field name
   * (commonly `token`) from the Network tab when you log in via the UI,
   * then adjust the body / token extraction below.
   */
  async authenticate(username = ENV.LOGIN_EMAIL, password = ENV.LOGIN_PASSWORD) {
    if (ENV.USE_MOCK) {
      const body = { token: 'mock-aa-token' };
      this.token = body.token;
      return { res: new MockResponse(200, body), body, elapsedMs: 1 };
    }

    const start = Date.now();
    const res = await this.request.post(ENV.AUTH_ENDPOINT, {
      data: { username, password },
    });
    const elapsedMs = Date.now() - start;
    const body = await res.json();
    this.token = body.token;
    return { res, body, elapsedMs };
  }

  authHeaders() {
    if (!this.token) throw new Error('Call authenticate() before making authenticated calls.');
    return { 'X-Authorization': this.token }; // TODO: confirm real auth header name
  }

  /**
   * TODO: confirm the real request payload for creating a Learning
   * Instance with document type "Invoice" from the Network tab.
   */
  async createLearningInstance({ name, documentType = 'Invoice' }) {
    if (ENV.USE_MOCK) {
      this.authHeaders();
      const body = {
        id: `li-${Date.now()}`,
        name,
        status: 'ACTIVE',
        documentType,
      };
      this.createdInstances.set(body.id, body);
      return { res: new MockResponse(201, body), body, elapsedMs: 1 };
    }

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
    if (ENV.USE_MOCK) {
      this.authHeaders();
      const body = this.createdInstances.get(id);
      return { res: new MockResponse(body ? 200 : 404, body || { id, status: 'NOT_FOUND' }), body, elapsedMs: 1 };
    }

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
