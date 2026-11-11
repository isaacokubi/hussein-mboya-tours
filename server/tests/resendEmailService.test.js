/**
 * Purpose: resend Email Service.test automated test. Main declarations: restoreEnv, completeBusinessOperation.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:fs/promises so this module can use its exported dependencies.
import fs from "node:fs/promises";
// Load node:os so this module can use its exported dependencies.
import os from "node:os";
// Load node:path so this module can use its exported dependencies.
import path from "node:path";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load ../services/emailService.js so this module can use its exported dependencies.
import {
  RESEND_TEST_SENDER,
  createEmailAttachment,
  resetResendClientForTests,
  sendEmail,
  sendEmailBestEffort,
  setResendClientForTests,
} from "../services/emailService.js";

// Declare savedEnv for use by the surrounding module or function.
const savedEnv = {
  apiKey: process.env.RESEND_API_KEY,
  fromEmail: process.env.RESEND_FROM_EMAIL,
  fromName: process.env.RESEND_FROM_NAME,
};

// Declare restoreEnv for use by the surrounding module or function.
const restoreEnv = () => {
  // Repeat the enclosed work for each required iteration.
  for (const [key, value] of Object.entries({
    RESEND_API_KEY: savedEnv.apiKey,
    RESEND_FROM_EMAIL: savedEnv.fromEmail,
    RESEND_FROM_NAME: savedEnv.fromName,
  })) {
    // Check the condition (value === undefined) and run the matching branch.
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  // Perform the side effect or state update expressed on the following line.
  resetResendClientForTests();
};

// Perform the side effect or state update expressed on the following line.
test("sendEmail submits through Resend and defaults to the supported development sender", async () => {
  // Perform the side effect or state update expressed on the following line.
  process.env.RESEND_API_KEY = "test-only-key";
  // Perform the side effect or state update expressed on the following line.
  delete process.env.RESEND_FROM_EMAIL;
  // Perform the side effect or state update expressed on the following line.
  process.env.RESEND_FROM_NAME = "Tours Test";
  // Declare request for use by the surrounding module or function.
  let request;
  // Perform the side effect or state update expressed on the following line.
  setResendClientForTests({ emails: { send: async (payload) => { request = payload; return { data: { id: "email_test_1" }, error: null }; } } });

  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare result for use by the surrounding module or function.
    const result = await sendEmail({ to: "customer@example.com", subject: "Test", text: "Hello" });
    // Perform the side effect or state update expressed on the following line.
    assert.deepEqual(result, { id: "email_test_1" });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(request.from, `Tours Test <${RESEND_TEST_SENDER}>`);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(request.to, "customer@example.com");
  } finally { restoreEnv(); }
});

// Perform the side effect or state update expressed on the following line.
test("sendEmail surfaces Resend failure without exposing provider details", async () => {
  // Perform the side effect or state update expressed on the following line.
  process.env.RESEND_API_KEY = "test-only-key";
  // Perform the side effect or state update expressed on the following line.
  process.env.RESEND_FROM_EMAIL = RESEND_TEST_SENDER;
  // Perform the side effect or state update expressed on the following line.
  setResendClientForTests({ emails: { send: async () => ({ data: null, error: { message: "provider failure test-only-key", statusCode: 403 } }) } });

  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    await assert.rejects(sendEmail({ to: "customer@example.com", subject: "Test", text: "Hello" }), (error) => {
      // Perform the side effect or state update expressed on the following line.
      assert.equal(error.message, "Resend email delivery failed (HTTP 403).");
      // Perform the side effect or state update expressed on the following line.
      assert.doesNotMatch(error.message, /test-only-key/);
      // Return the expression shown below to the caller.
      return true;
    });
  } finally { restoreEnv(); }
});

// Perform the side effect or state update expressed on the following line.
test("sendEmail rejects a missing API key", async () => {
  // Perform the side effect or state update expressed on the following line.
  delete process.env.RESEND_API_KEY;
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    await assert.rejects(sendEmail({ to: "customer@example.com", subject: "Test", text: "Hello" }), /RESEND_API_KEY is not configured/);
  } finally { restoreEnv(); }
});

// Perform the side effect or state update expressed on the following line.
test("sendEmail rejects an invalid configured sender", async () => {
  // Perform the side effect or state update expressed on the following line.
  process.env.RESEND_API_KEY = "test-only-key";
  // Perform the side effect or state update expressed on the following line.
  process.env.RESEND_FROM_EMAIL = "not-an-email";
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    await assert.rejects(sendEmail({ to: "customer@example.com", subject: "Test", text: "Hello" }), /RESEND_FROM_EMAIL must be a valid email address/);
  } finally { restoreEnv(); }
});

// Perform the side effect or state update expressed on the following line.
test("best-effort delivery keeps completed booking and payment work successful", async () => {
  // Declare completeBusinessOperation for use by the surrounding module or function.
  const completeBusinessOperation = async (emailWork) => {
    // Declare result for use by the surrounding module or function.
    const result = await emailWork();
    // Return the object assembled below to the caller.
    return { status: "completed", emailResult: result };
  };
  // Declare result for use by the surrounding module or function.
  const result = await completeBusinessOperation(() => sendEmailBestEffort(async () => { throw new Error("Resend unavailable"); }, "Test notification"));
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(result, { status: "completed", emailResult: null });
});


// Perform the side effect or state update expressed on the following line.
test("createEmailAttachment converts a local invoice file to Resend base64 content", async () => {
  // Declare directory for use by the surrounding module or function.
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "resend-attachment-"));
  // Declare filePath for use by the surrounding module or function.
  const filePath = path.join(directory, "invoice.pdf");
  // Declare invoice for use by the surrounding module or function.
  const invoice = Buffer.from("%PDF-1.4 test invoice");
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    await fs.writeFile(filePath, invoice);
    // Declare attachment for use by the surrounding module or function.
    const attachment = await createEmailAttachment({ filename: "Invoice-TEST.pdf", path: filePath });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(attachment.filename, "Invoice-TEST.pdf");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(attachment.content, invoice.toString("base64"));
    // Perform the side effect or state update expressed on the following line.
    assert.equal(attachment.contentType, "application/pdf");
    // Perform the side effect or state update expressed on the following line.
    assert.equal("path" in attachment, false);
  } finally {
    // Perform the side effect or state update expressed on the following line.
    await fs.rm(directory, { recursive: true, force: true });
  }
});
