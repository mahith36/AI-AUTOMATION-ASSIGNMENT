/**
 * Use Case 2: Learning Instance API Flow (API Automation)
 *
 * Against the real Automation Anywhere Community Edition API:
 *   1. Authenticate via API and capture the auth token.
 *   2. Identify the Learning Instance endpoints (done via the browser Network
 *      tab; encoded in utils/apiClient.js and config/env.js).
 *   3. Create a Learning Instance with document type Invoice via API.
 *   4. Validate the created instance (status codes, schema, functional data).
 *
 * The instance created in step 3 is deleted in afterAll so the account stays
 * clean (Community Edition is capped at 5 learning instances).
 */
const { test, expect } = require('@playwright/test');
const { ApiClient } = require('../../utils/apiClient');
const { ENV } = require('../../config/env');

test.describe.configure({ mode: 'serial' });

test.describe('Use Case 2: Learning Instance API Flow @usecase2', () => {
  /** @type {ApiClient} */
  let api;
  /** @type {import('@playwright/test').APIRequestContext} */
  let request;
  let invoiceDomain;
  let createdInstanceId;

  test.beforeAll(async ({ playwright }) => {
    request = await playwright.request.newContext({ baseURL: ENV.API_BASE_URL });
    api = new ApiClient(request);
  });

  test.afterAll(async () => {
    // Clean up the instance we created (best effort — never fail the suite here).
    if (createdInstanceId) {
      try {
        await api.deleteLearningInstance(createdInstanceId);
      } catch (err) {
        console.warn(`Cleanup: could not delete instance ${createdInstanceId}:`, err.message);
      }
    }
    await request?.dispose();
  });

  test('Step 1: authenticates via API and captures a valid token @usecase2', async () => {
    const { res, body, elapsedMs } = await api.authenticate();

    expect(res.status()).toBe(200);
    expect(body).toHaveProperty('token');
    expect(typeof body.token).toBe('string');
    expect(body.token.length).toBeGreaterThan(0);
    // Functional check: token belongs to the account we logged in as.
    expect(body.user?.username).toBe(ENV.LOGIN_EMAIL);
    expect(elapsedMs).toBeLessThan(10_000);
  });

  test('Step 2: identifies the Invoices domain via the domains endpoint @usecase2', async () => {
    const { res, body } = await api.getDomains();
    expect(res.status()).toBe(200);
    expect(Array.isArray(body)).toBe(true);

    invoiceDomain = await api.resolveInvoiceDomain();
    expect(invoiceDomain.domainName).toMatch(/invoice/i);
    expect(invoiceDomain.domainId).toBeTruthy();
    expect(invoiceDomain.domainLanguageProviderId).toBeTruthy();
    expect(invoiceDomain.fields.length).toBeGreaterThan(0);
  });

  test('Step 3: creates a Learning Instance with document type Invoice @usecase2', async () => {
    const name = `Invoice-Instance-${Date.now()}`;
    const { res, body, elapsedMs } = await api.createLearningInstance({
      name,
      domainId: invoiceDomain.domainId,
      domainLanguageProviderId: invoiceDomain.domainLanguageProviderId,
      fields: invoiceDomain.fields,
    });

    // Status code (200 OK / 201 Created)
    expect([200, 201]).toContain(res.status());

    // Response body schema / field-level checks
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('name', name);
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('domain');

    // Functional accuracy — instance is for the Invoices domain, with fields
    expect(body.domain?.name).toMatch(/invoice/i);
    expect(Array.isArray(body.fields)).toBe(true);
    expect(body.fields.length).toBe(invoiceDomain.fields.length);

    // Response time (optional but preferred)
    expect(elapsedMs).toBeLessThan(15_000);

    createdInstanceId = body.id;
  });

  test('Step 4: validates the created instance can be retrieved @usecase2', async () => {
    expect(createdInstanceId, 'no instance id from the create step').toBeTruthy();

    const { res, body } = await api.getLearningInstance(createdInstanceId);
    expect(res.status()).toBe(200);
    // AA CE returns the id lowercased from create but uppercased from get/list,
    // so compare case-insensitively.
    expect(body.id.toLowerCase()).toBe(createdInstanceId.toLowerCase());
    expect(body.status).toBeTruthy();
    expect(body.domain?.name).toMatch(/invoice/i);

    // Functional accuracy: the instance also shows up in the list endpoint.
    const { res: listRes, body: listBody } = await api.listLearningInstances();
    expect(listRes.status()).toBe(200);
    const ids = (listBody.list || []).map((li) => li.id.toLowerCase());
    expect(ids).toContain(createdInstanceId.toLowerCase());
  });

  test('Step 5: deletes the instance to keep the account clean @usecase2', async () => {
    expect(createdInstanceId).toBeTruthy();

    const { res } = await api.deleteLearningInstance(createdInstanceId);
    expect([200, 202, 204]).toContain(res.status());

    // Confirm it is gone.
    const { res: getRes } = await api.getLearningInstance(createdInstanceId);
    expect(getRes.status()).toBe(404);

    createdInstanceId = null; // already cleaned up; afterAll has nothing to do
  });
});
