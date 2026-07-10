/**
 * Central configuration for Automation Anywhere Community Edition.
 * Values come from .env (see .env.example); endpoints were identified live
 * from the browser Network tab against the real AA CE tenant.
 */
require("dotenv").config();

const ENV = {
  APP_BASE_URL:
    process.env.APP_BASE_URL ||
    "https://community.cloud.automationanywhere.digital",

  API_BASE_URL:
    process.env.API_BASE_URL ||
    "https://community.cloud.automationanywhere.digital",

  LOGIN_EMAIL: process.env.AA_EMAIL || "",
  LOGIN_PASSWORD: process.env.AA_PASSWORD || "",

  // Captured from Network tab: the login page calls POST /v2/authentication.
  // (/v1/authentication returns 404 on Community Edition.)
  AUTH_ENDPOINT: "/v2/authentication",

  // Learning Instance (Document Automation / IQ Bot) endpoints live under
  // /cognitive/v3/. Exact paths are in utils/apiClient.js.
  DOMAINS_ENDPOINT: "/cognitive/v3/domains",
  LEARNING_INSTANCES_ENDPOINT: "/cognitive/v3/learninginstances",

  // SPA routes
  LOGIN_PATH: "/#/login",
  REPOSITORY_PATH: "/#/bots/repository/private",
  LEARNING_INSTANCES_PATH: "/#/modules/cognitive/iqbot/pages/learning-instances",
};

module.exports = { ENV };
