const { test, expect } = require('@playwright/test');
const { ApiClient } = require('../../utils/apiClient');

test.describe('Use Case 2: Learning Instance API Flow @usecase2', () => {
  let api;
  let createdInstanceId;

  test.beforeAll(async ({ playwright }) => {
    const { ENV } = require('../../config/env');
    const request = await playwright.request.newContext({
      baseURL: ENV.API_BASE_URL,
    });
    api = new ApiClient(request);
  });

  test('Step 1: Authenticate and capture a valid token @usecase2', async () => {
    const { res, body } = await api.authenticate();
    expect(res.status()).toBe(200);
    expect(body).toHaveProperty('token');
    expect(typeof body.token).toBe('string');
    expect(body.token.length).toBeGreaterThan(0);
  });

  test('Step 3: Create a Learning Instance with document type Invoice @usecase2', async () => {
    // Authenticate first (depends on previous test's token in real flow)
    if (!api.token) {
      await api.authenticate();
    }

    const { res, body, elapsedMs } = await api.createLearningInstance({
      name: `Invoice-Instance-${Date.now()}`,
      documentType: 'Invoice',
    });

    // Expect 200 or 201 success
    expect([200, 201]).toContain(res.status());

    // Schema / field-level checks
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('name');
    expect(body).toHaveProperty('status');

    // Functional accuracy — document type should be Invoice
    const docType = body.documentType || body.type;
    if (docType) {
      expect(docType).toBe('Invoice');
    }

    // Response time check (optional but preferred)
    expect(elapsedMs).toBeLessThan(5000);

    createdInstanceId = body.id;
  });

  test('Step 4: Validate the created instance can be retrieved @usecase2', async () => {
    test.skip(!createdInstanceId, 'No instance was created in the previous test.');

    if (!api.token) {
      await api.authenticate();
    }

    const { res, body } = await api.getLearningInstance(createdInstanceId);
    expect(res.status()).toBe(200);
    expect(body.id).toBe(createdInstanceId);
    expect(body.status).toBeTruthy();
  });
});
