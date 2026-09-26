import test from "node:test";
import assert from "node:assert/strict";
import {
  RESEND_TEST_SENDER,
  resetResendClientForTests,
  sendEmail,
  sendEmailBestEffort,
  setResendClientForTests,
} from "../services/emailService.js";

const savedEnv = {
  apiKey: process.env.RESEND_API_KEY,
  fromEmail: process.env.RESEND_FROM_EMAIL,
  fromName: process.env.RESEND_FROM_NAME,
};

const restoreEnv = () => {
  for (const [key, value] of Object.entries({
    RESEND_API_KEY: savedEnv.apiKey,
    RESEND_FROM_EMAIL: savedEnv.fromEmail,
    RESEND_FROM_NAME: savedEnv.fromName,
  })) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  resetResendClientForTests();
};

test("sendEmail submits through Resend and defaults to the supported development sender", async () => {
  process.env.RESEND_API_KEY = "test-only-key";
  delete process.env.RESEND_FROM_EMAIL;
  process.env.RESEND_FROM_NAME = "Tours Test";
  let request;
  setResendClientForTests({ emails: { send: async (payload) => { request = payload; return { data: { id: "email_test_1" }, error: null }; } } });

  try {
    const result = await sendEmail({ to: "customer@example.com", subject: "Test", text: "Hello" });
    assert.deepEqual(result, { id: "email_test_1" });
    assert.equal(request.from, `Tours Test <${RESEND_TEST_SENDER}>`);
    assert.equal(request.to, "customer@example.com");
  } finally { restoreEnv(); }
});

test("sendEmail surfaces Resend failure without exposing provider details", async () => {
  process.env.RESEND_API_KEY = "test-only-key";
  process.env.RESEND_FROM_EMAIL = RESEND_TEST_SENDER;
  setResendClientForTests({ emails: { send: async () => ({ data: null, error: { message: "provider failure test-only-key" } }) } });

  try {
    await assert.rejects(sendEmail({ to: "customer@example.com", subject: "Test", text: "Hello" }), (error) => {
      assert.equal(error.message, "Resend email delivery failed.");
      assert.doesNotMatch(error.message, /test-only-key/);
      return true;
    });
  } finally { restoreEnv(); }
});

test("sendEmail rejects a missing API key", async () => {
  delete process.env.RESEND_API_KEY;
  try {
    await assert.rejects(sendEmail({ to: "customer@example.com", subject: "Test", text: "Hello" }), /RESEND_API_KEY is not configured/);
  } finally { restoreEnv(); }
});

test("sendEmail rejects an invalid configured sender", async () => {
  process.env.RESEND_API_KEY = "test-only-key";
  process.env.RESEND_FROM_EMAIL = "not-an-email";
  try {
    await assert.rejects(sendEmail({ to: "customer@example.com", subject: "Test", text: "Hello" }), /RESEND_FROM_EMAIL must be a valid email address/);
  } finally { restoreEnv(); }
});

test("best-effort delivery keeps completed booking and payment work successful", async () => {
  const completeBusinessOperation = async (emailWork) => {
    const result = await emailWork();
    return { status: "completed", emailResult: result };
  };
  const result = await completeBusinessOperation(() => sendEmailBestEffort(async () => { throw new Error("Resend unavailable"); }, "Test notification"));
  assert.deepEqual(result, { status: "completed", emailResult: null });
});
