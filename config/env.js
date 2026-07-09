/**
 * Central place for every environment-specific value.
 * Fill these in after you (a) register on AA Community Edition and
 * (b) inspect the app in your browser. Nothing else in the framework
 * needs to change once these are correct.
 *
 * Prefer environment variables (see .env.example) over hardcoding
 * real credentials in this file.
 */
require('dotenv').config();

const hasLiveCredentials = Boolean(process.env.AA_EMAIL && process.env.AA_PASSWORD);

const ENV = {
  // Defaults to deterministic local mocks so the suite is runnable without
  // personal AA credentials. Set AA_USE_MOCK=false with real .env values for
  // live tenant execution.
  USE_MOCK:
    process.env.AA_USE_MOCK === 'true' ||
    (process.env.AA_USE_MOCK !== 'false' && !hasLiveCredentials),

  // TODO: confirm exact login/app URL after registering.
  // Community Edition typically redirects to a tenant-specific control room URL
  // like https://<your-subdomain>.my.automationanywhere.digital/
  APP_BASE_URL: process.env.APP_BASE_URL || 'https://community.cloud.automationanywhere.digital',

  // TODO: fill from Network tab — base path for REST calls (often /v3/...).
  API_BASE_URL: process.env.API_BASE_URL || 'https://community.cloud.automationanywhere.digital/api',

  LOGIN_EMAIL: process.env.AA_EMAIL || '',
  LOGIN_PASSWORD: process.env.AA_PASSWORD || '',

  // TODO: confirm real auth endpoint + payload shape from Network tab
  // when you submit the login form. Common AAI pattern is POST /v1/authentication
  // with { username, password } returning { token }.
  AUTH_ENDPOINT: process.env.AUTH_ENDPOINT || '/v1/authentication',

  // TODO: confirm real Learning Instance endpoint (seen under AI > Learning Instance).
  LEARNING_INSTANCE_ENDPOINT:
    process.env.LEARNING_INSTANCE_ENDPOINT || '/v2/learninginstances',
};

module.exports = { ENV };
