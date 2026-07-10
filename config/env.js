/**
 * Central configuration for Automation Anywhere Community Edition.
 * Values sourced from .env or sensible defaults for the real AA tenant.
 */
require("dotenv").config();

const ENV = {
  // Real AA Community Edition tenant URL
  APP_BASE_URL:
    process.env.APP_BASE_URL ||
    "https://community.cloud.automationanywhere.digital",

  // API base path — real REST calls go through /v2/, /v3/, etc.
  API_BASE_URL:
    process.env.API_BASE_URL ||
    "https://community.cloud.automationanywhere.digital",

  // Credentials from .env
  LOGIN_EMAIL: process.env.AA_EMAIL || "",
  LOGIN_PASSWORD: process.env.AA_PASSWORD || "",

  // Auth endpoint — captured from Network tab on login
  AUTH_ENDPOINT: process.env.AUTH_ENDPOINT || "/v1/authentication",

  // Learning Instance (Document Automation) endpoint
  LEARNING_INSTANCE_ENDPOINT:
    process.env.LEARNING_INSTANCE_ENDPOINT || "/v2/learninginstances",

  // Paths
  LOGIN_PATH: "/#/login",
  AUTOMATION_PATH: "/#/bots/repository/private/folders/32982643",
  DOCUMENT_AUTOMATION_PATH:
    "/#/modules/cognitive/iqbot/pages/learning-instances",
};

module.exports = { ENV };
