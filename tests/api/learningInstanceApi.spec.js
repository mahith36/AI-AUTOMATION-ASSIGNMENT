const { test, expect } = require('@playwright/test');
const { ApiClient } = require('../../utils/apiClient');

test.describe('Use Case 2: Learning Instance API Flow @usecase2', () => {
  let api;
  let createdInstanceId;

  test.beforeAll(async ({ playwright }) => {
    const { ENV } = require('../../config/env');
    const request = await playwright.request.newContext({ baseURL: ENV.API_BASE_URL });
    api = new ApiClient(request);
  });

  test('authenticates and captures a valid token', async () => {
    const { res, body } = await api.authenticate();
    expect(res.status()).toBe(200);
    expect(body).toHaveProperty('token');
    expect(typeof body.token).toBe('string');
    expect(body.token.length).toBeGreaterThan(0);
  });

  test('creates a Learning Instance with document type Invoice — status, schema, timing', async () => {
    const { res, body, elapsedMs } = await api.createLearningInstance({
      name: `Invoice-Instance-${Date.now()}`,
      documentType: 'Invoice',
    });

    expect([200, 201]).toContain(res.status());

    // Schema / field-level checks
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('name');
    expect(body).toHaveProperty('status');

    // Functional accuracy
    expect(body.documentType ?? body.type).toBe('Invoice');

    // Response time — optional but preferred per assignment
    expect(elapsedMs).toBeLessThan(5000);

    createdInstanceId = body.id;
  });

  test('validates the created instance can be retrieved with correct data and status', async () => {
    test.skip(!createdInstanceId, 'No instance was created in the previous test.');

    const { res, body } = await api.getLearningInstance(createdInstanceId);
    expect(res.status()).toBe(200);
    expect(body.id).toBe(createdInstanceId);
    expect(body.status).toBeTruthy();
    expect(body.documentType ?? body.type).toBe('Invoice');
  });
});
