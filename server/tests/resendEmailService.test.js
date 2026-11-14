import test from "node:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import {
  RESEND_TEST_SENDER,
  createEmailAttachment,
  resetResendClientForTests,
  sendEmail,
  sendEmailBestEffort,
  setResendClientForTests,
} from "../services/emailService.js";

const savedEnv = {
  apiKey: process.env.RESEND_API_KEY,
  fromEmail: process.env.RESEND_FROM_EMAIL,
  fromName: process.env.RESEND_FROM_NAME,
  nodeEnv: process.env.NODE_ENV,
};

const restoreEnv = () => {
  for (const [key, value] of Object.entries({
    RESEND_API_KEY: savedEnv.apiKey,
    RESEND_FROM_EMAIL: savedEnv.fromEmail,
    RESEND_FROM_NAME: savedEnv.fromName,
    NODE_ENV: savedEnv.nodeEnv,
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

test("production sendEmail requires an explicitly configured verified sender", async () => {
  process.env.NODE_ENV = "production";
  process.env.RESEND_API_KEY = "test-only-key";
  delete process.env.RESEND_FROM_EMAIL;
  try {
    await assert.rejects(
      sendEmail({ to: "customer@example.com", subject: "Test", text: "Hello" }),
      /RESEND_FROM_EMAIL must be configured with a verified production sender address/,
    );
  } finally { restoreEnv(); }
});

test("production sendEmail rejects the Resend development test sender", async () => {
  process.env.NODE_ENV = "production";
  process.env.RESEND_API_KEY = "test-only-key";
  process.env.RESEND_FROM_EMAIL = RESEND_TEST_SENDER;
  try {
    await assert.rejects(
      sendEmail({ to: "customer@example.com", subject: "Test", text: "Hello" }),
      /development test sender cannot be used in production/,
    );
  } finally { restoreEnv(); }
});

test("sendEmail surfaces Resend failure without exposing provider details", async () => {
  process.env.RESEND_API_KEY = "test-only-key";
  process.env.RESEND_FROM_EMAIL = RESEND_TEST_SENDER;
  setResendClientForTests({ emails: { send: async () => ({ data: null, error: { message: "provider failure test-only-key", statusCode: 403 } }) } });

  try {
    await assert.rejects(sendEmail({ to: "customer@example.com", subject: "Test", text: "Hello" }), (error) => {
      assert.equal(error.message, "Resend email delivery failed (HTTP 403).");
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


test("createEmailAttachment converts a local invoice file to Resend base64 content", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "resend-attachment-"));
  const filePath = path.join(directory, "invoice.pdf");
  const invoice = Buffer.from("%PDF-1.4 test invoice");
  try {
    await fs.writeFile(filePath, invoice);
    const attachment = await createEmailAttachment({ filename: "Invoice-TEST.pdf", path: filePath });
    assert.equal(attachment.filename, "Invoice-TEST.pdf");
    assert.equal(attachment.content, invoice.toString("base64"));
    assert.equal(attachment.contentType, "application/pdf");
    assert.equal("path" in attachment, false);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});
