const { ENV } = require('../config/env');

/**
 * Wrapper around the real Automation Anywhere Community Edition REST API.
 *
 * Every endpoint and payload below was identified live from the browser
 * Network tab (and verified by driving the calls) against the
 * community.cloud.automationanywhere.digital tenant:
 *
 *   Auth      POST   /v2/authentication
 *                    { username, password } -> 200 { token, user }
 *                    (v1/authentication returns 404 on Community Edition)
 *             header X-Authorization: <token>
 *
 *   Domains   GET    /cognitive/v3/domains
 *                    -> [{ id, name:"Invoices", languageProviders:[{ languageId, providers:[{id}] }] }]
 *             GET    /cognitive/v3/domains/{id}?language={languageId}&provider={providerId}
 *                    -> { domainLanguageProviderId, domainObjects:[ ... ] }
 *
 *   Create    POST   /cognitive/v3/learninginstances
 *                    { name, domainId, domainLanguageProviderId, fields[] } -> 200 { id, name, domain, status, fields, ... }
 *   Get       GET    /cognitive/v3/learninginstances/{id}     -> 200
 *   List      POST   /cognitive/v3/learninginstances/list     -> 200 { page, list }
 *   Delete    DELETE /cognitive/v3/learninginstances/{id}     -> 204
 */
class ApiClient {
  /** @param {import('@playwright/test').APIRequestContext} request */
  constructor(request) {
    this.request = request;
    this.token = null;
    this.user = null;
  }

  /** POST /v2/authentication — caches the token; returns { res, body, elapsedMs }. */
  async authenticate(username = ENV.LOGIN_EMAIL, password = ENV.LOGIN_PASSWORD) {
    if (!username || !password) {
      throw new Error('Missing AA_EMAIL / AA_PASSWORD (see .env.example).');
    }
    const start = Date.now();
    const res = await this.request.post(ENV.AUTH_ENDPOINT, { data: { username, password } });
    const elapsedMs = Date.now() - start;
    const body = await res.json().catch(() => ({}));
    if (body.token) {
      this.token = body.token;
      this.user = body.user;
    }
    return { res, body, elapsedMs };
  }

  authHeaders() {
    if (!this.token) throw new Error('Call authenticate() before authenticated calls.');
    return { 'X-Authorization': this.token, 'Content-Type': 'application/json' };
  }

  /** GET /cognitive/v3/domains — full domain catalog. */
  async getDomains() {
    const start = Date.now();
    const res = await this.request.get(ENV.DOMAINS_ENDPOINT, { headers: this.authHeaders() });
    const elapsedMs = Date.now() - start;
    const body = await res.json().catch(() => null);
    return { res, body, elapsedMs };
  }

  /**
   * Resolves everything the create endpoint needs for an Invoice learning
   * instance: the Invoices domain id, the domain-language-provider id (only
   * exposed by the parameterized domain-detail endpoint), and the enabled
   * KEY_VALUE extraction fields.
   *
   * Table (TABLE_HEADER) domain objects are intentionally excluded — they are
   * table columns, not standalone fields, and the API rejects them at the top
   * level of `fields`.
   */
  async resolveInvoiceDomain() {
    const { body: domains } = await this.getDomains();
    const domain = (domains || []).find((d) => /invoice/i.test(d.name));
    if (!domain) throw new Error('Invoices domain not found in /cognitive/v3/domains');

    const lp =
      (domain.languageProviders || []).find((l) => /english/i.test(l.name)) ||
      (domain.languageProviders || [])[0];
    // Prefer the built-in (non-external) provider.
    const provider = (lp.providers || []).find((p) => !p.isExternal) || (lp.providers || [])[0];

    const detailRes = await this.request.get(
      `${ENV.DOMAINS_ENDPOINT}/${domain.id}?language=${lp.languageId}&provider=${provider.id}`,
      { headers: this.authHeaders() }
    );
    const detail = await detailRes.json();

    const fields = (detail.domainObjects || [])
      .filter((o) => o.isEnabled && o.featureType === 'KEY_VALUE')
      .map((o) => ({
        domainObjectId: o.id,
        isCustom: false,
        name: o.name,
        displayName: o.displayName,
        dataType: o.dataType,
        featureType: o.featureType,
        confidenceThreshold: o.confidenceThreshold,
        providerFieldName: o.providerFieldName,
        sortOrder: o.sortOrder,
        isEnabled: true,
      }));

    return {
      domainId: domain.id,
      domainName: domain.name,
      languageId: lp.languageId,
      domainLanguageProviderId: detail.domainLanguageProviderId,
      providerName: provider.name,
      fields,
    };
  }

  /**
   * POST /cognitive/v3/learninginstances — creates a learning instance.
   * @param {{name:string, domainId:string, domainLanguageProviderId:string, fields:object[]}} spec
   */
  async createLearningInstance({ name, domainId, domainLanguageProviderId, fields }) {
    const start = Date.now();
    const res = await this.request.post(ENV.LEARNING_INSTANCES_ENDPOINT, {
      headers: this.authHeaders(),
      data: { name, domainId, domainLanguageProviderId, fields },
    });
    const elapsedMs = Date.now() - start;
    const body = await res.json().catch(() => null);
    return { res, body, elapsedMs };
  }

  /** GET /cognitive/v3/learninginstances/{id}. */
  async getLearningInstance(id) {
    const start = Date.now();
    const res = await this.request.get(`${ENV.LEARNING_INSTANCES_ENDPOINT}/${id}`, {
      headers: this.authHeaders(),
    });
    const elapsedMs = Date.now() - start;
    const body = await res.json().catch(() => null);
    return { res, body, elapsedMs };
  }

  /** POST /cognitive/v3/learninginstances/list — paged list. */
  async listLearningInstances() {
    const start = Date.now();
    const res = await this.request.post(`${ENV.LEARNING_INSTANCES_ENDPOINT}/list`, {
      headers: this.authHeaders(),
      data: { filter: { operator: 'and', operands: [] }, sort: [], page: { offset: 0, length: 100 } },
    });
    const elapsedMs = Date.now() - start;
    const body = await res.json().catch(() => null);
    return { res, body, elapsedMs };
  }

  /** DELETE /cognitive/v3/learninginstances/{id} — returns 204 on success. */
  async deleteLearningInstance(id) {
    const res = await this.request.delete(`${ENV.LEARNING_INSTANCES_ENDPOINT}/${id}`, {
      headers: this.authHeaders(),
    });
    return { res };
  }
}

module.exports = { ApiClient };
