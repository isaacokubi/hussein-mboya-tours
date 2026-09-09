import crypto from "crypto";
import { claimNextJob, completeJob, failJob } from "./jobQueueService.js";
import { processEtimsInvoiceJob } from "./etimsService.js";

const WORKER_ID = `${process.pid}-${crypto.randomBytes(6).toString("hex")}`;

const handlers = {
  "etims.invoice.submit": processEtimsInvoiceJob,
};

export async function processOneJob() {
  const job = await claimNextJob(WORKER_ID, Object.keys(handlers));
  if (!job) return false;
  try {
    const handler = handlers[job.type];
    if (!handler) throw new Error(`No handler registered for job type ${job.type}.`);
    await handler(job.payload, job);
    await completeJob(job);
  } catch (error) {
    await failJob(job, error);
    console.error(`Background job ${job.type} failed:`, error.message);
  }
  return true;
}

export function startJobWorker() {
  let stopped = false;
  const tick = async () => {
    if (stopped) return;
    try {
      let processed = true;
      while (processed && !stopped) processed = await processOneJob();
    } catch (error) {
      console.error("Background worker error:", error.message);
    } finally {
      if (!stopped) setTimeout(tick, 1500);
    }
  };
  void tick();
  return () => { stopped = true; };
}
