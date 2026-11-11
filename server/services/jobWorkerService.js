/**
 * Purpose: job Worker Service business-logic service. Main declarations: isDatabaseReady, processOneJob, startJobWorker, schedule, tick.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import crypto from "crypto";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ./jobQueueService.js so this module can use its exported dependencies.
import { claimNextJob, completeJob, failJob } from "./jobQueueService.js";
// Load ./etimsService.js so this module can use its exported dependencies.
import { processEtimsInvoiceJob } from "./etimsService.js";
// Load ./etimsNoteService.js so this module can use its exported dependencies.
import { processEtimsNoteJob } from "./etimsNoteService.js";
// Load ./webhookDeliveryService.js so this module can use its exported dependencies.
import { deliverWebhookJob } from "./webhookDeliveryService.js";

// Declare WORKER_ID for use by the surrounding module or function.
const WORKER_ID = `${process.pid}-${crypto.randomBytes(6).toString("hex")}`;
// Declare handlers for use by the surrounding module or function.
const handlers = {
  "etims.invoice.submit": processEtimsInvoiceJob,
  "etims.credit_debit_note.submit": processEtimsNoteJob,
  "webhook.delivery": deliverWebhookJob,
};

// Declare DB_READY for use by the surrounding module or function.
const DB_READY = 1;
// Declare MIN_IDLE_DELAY_MS for use by the surrounding module or function.
const MIN_IDLE_DELAY_MS = 1500;
// Declare MAX_ERROR_BACKOFF_MS for use by the surrounding module or function.
const MAX_ERROR_BACKOFF_MS = 60 * 1000;

// Declare isDatabaseReady for use by the surrounding module or function.
const isDatabaseReady = () => mongoose.connection.readyState === DB_READY;

// Define processOneJob; its parameters and body implement this operation.
export async function processOneJob() {
  // Check the condition (!isDatabaseReady()) and run the matching branch.
  if (!isDatabaseReady()) return false;

  // Declare job for use by the surrounding module or function.
  const job = await claimNextJob(WORKER_ID, Object.keys(handlers));
  // Check the condition (!job) and run the matching branch.
  if (!job) return false;

  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare handler for use by the surrounding module or function.
    const handler = handlers[job.type];
    // Check the condition (!handler) and run the matching branch.
    if (!handler) throw new Error(`No handler registered for job type ${job.type}.`);
    // Perform the side effect or state update expressed on the following line.
    await handler(job.payload, job);
    // Perform the side effect or state update expressed on the following line.
    await completeJob(job);
  } catch (error) {
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Perform the side effect or state update expressed on the following line.
      await failJob(job, error);
    } catch (queueError) {
      // Perform the side effect or state update expressed on the following line.
      console.error("Background job state update failed:", queueError.message);
    }
    // Perform the side effect or state update expressed on the following line.
    console.error(`Background job ${job.type} failed:`, error.message);
  }

  // Return the expression shown below to the caller.
  return true;
}

// Define startJobWorker; its parameters and body implement this operation.
export function startJobWorker() {
  // Declare stopped for use by the surrounding module or function.
  let stopped = false;
  // Declare timer for use by the surrounding module or function.
  let timer = null;
  // Declare consecutiveErrors for use by the surrounding module or function.
  let consecutiveErrors = 0;

  // Declare schedule for use by the surrounding module or function.
  const schedule = (delay) => {
    // Check the condition (stopped) and run the matching branch.
    if (stopped) return;
    // Check the condition (timer) and run the matching branch.
    if (timer) clearTimeout(timer);
    // Perform the side effect or state update expressed on the following line.
    timer = setTimeout(tick, delay);
  };

  // Declare tick for use by the surrounding module or function.
  const tick = async () => {
    // Check the condition (stopped) and run the matching branch.
    if (stopped) return;

    // Check the condition (!isDatabaseReady()) and run the matching branch.
    if (!isDatabaseReady()) {
      // Perform the side effect or state update expressed on the following line.
      consecutiveErrors = Math.min(consecutiveErrors + 1, 8);
      // Declare delay for use by the surrounding module or function.
      const delay = Math.min(
        MAX_ERROR_BACKOFF_MS,
        MIN_IDLE_DELAY_MS * 2 ** Math.min(consecutiveErrors - 1, 6),
      );
      // Perform the side effect or state update expressed on the following line.
      schedule(delay);
      // Return the result to the caller.
      return;
    }

    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare processed for use by the surrounding module or function.
      const processed = await processOneJob();
      // Perform the side effect or state update expressed on the following line.
      consecutiveErrors = 0;
      // Perform the side effect or state update expressed on the following line.
      schedule(processed ? MIN_IDLE_DELAY_MS : MIN_IDLE_DELAY_MS * 2);
    } catch (error) {
      // Perform the side effect or state update expressed on the following line.
      consecutiveErrors = Math.min(consecutiveErrors + 1, 8);
      // Declare delay for use by the surrounding module or function.
      const delay = Math.min(
        MAX_ERROR_BACKOFF_MS,
        MIN_IDLE_DELAY_MS * 2 ** Math.min(consecutiveErrors - 1, 6),
      );
      // Perform the side effect or state update expressed on the following line.
      console.error(
        `Background worker error (retry in ${delay}ms):`,
        error.message,
      );
      // Perform the side effect or state update expressed on the following line.
      schedule(delay);
    }
  };

  // Perform the side effect or state update expressed on the following line.
  void tick();

  // Return the expression shown below to the caller.
  return () => {
    // Perform the side effect or state update expressed on the following line.
    stopped = true;
    // Check the condition (timer) and run the matching branch.
    if (timer) clearTimeout(timer);
    // Perform the side effect or state update expressed on the following line.
    timer = null;
  };
}
