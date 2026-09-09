import crypto from "crypto";
import mongoose from "mongoose";
import { claimNextJob, completeJob, failJob } from "./jobQueueService.js";
import { processEtimsInvoiceJob } from "./etimsService.js";
import { processEtimsNoteJob } from "./etimsNoteService.js";
import { deliverWebhookJob } from "./webhookDeliveryService.js";

const WORKER_ID = `${process.pid}-${crypto.randomBytes(6).toString("hex")}`;
const handlers = {
  "etims.invoice.submit": processEtimsInvoiceJob,
  "etims.credit_debit_note.submit": processEtimsNoteJob,
  "webhook.delivery": deliverWebhookJob,
};

const DB_READY = 1;
const MIN_IDLE_DELAY_MS = 1500;
const MAX_ERROR_BACKOFF_MS = 60 * 1000;

const isDatabaseReady = () => mongoose.connection.readyState === DB_READY;

export async function processOneJob() {
  if (!isDatabaseReady()) return false;

  const job = await claimNextJob(WORKER_ID, Object.keys(handlers));
  if (!job) return false;

  try {
    const handler = handlers[job.type];
    if (!handler) throw new Error(`No handler registered for job type ${job.type}.`);
    await handler(job.payload, job);
    await completeJob(job);
  } catch (error) {
    try {
      await failJob(job, error);
    } catch (queueError) {
      console.error("Background job state update failed:", queueError.message);
    }
    console.error(`Background job ${job.type} failed:`, error.message);
  }

  return true;
}

export function startJobWorker() {
  let stopped = false;
  let timer = null;
  let consecutiveErrors = 0;

  const schedule = (delay) => {
    if (stopped) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(tick, delay);
  };

  const tick = async () => {
    if (stopped) return;

    if (!isDatabaseReady()) {
      consecutiveErrors = Math.min(consecutiveErrors + 1, 8);
      const delay = Math.min(
        MAX_ERROR_BACKOFF_MS,
        MIN_IDLE_DELAY_MS * 2 ** Math.min(consecutiveErrors - 1, 6),
      );
      schedule(delay);
      return;
    }

    try {
      const processed = await processOneJob();
      consecutiveErrors = 0;
      schedule(processed ? MIN_IDLE_DELAY_MS : MIN_IDLE_DELAY_MS * 2);
    } catch (error) {
      consecutiveErrors = Math.min(consecutiveErrors + 1, 8);
      const delay = Math.min(
        MAX_ERROR_BACKOFF_MS,
        MIN_IDLE_DELAY_MS * 2 ** Math.min(consecutiveErrors - 1, 6),
      );
      console.error(
        `Background worker error (retry in ${delay}ms):`,
        error.message,
      );
      schedule(delay);
    }
  };

  void tick();

  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
    timer = null;
  };
}
