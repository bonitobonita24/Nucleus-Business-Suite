// ─────────────────────────────────────────────────────────────────────────────
// BullMQ Worker Process — handles all 17 job queues (D019)
// ─────────────────────────────────────────────────────────────────────────────

import { Worker } from "bullmq";
import { QUEUE_NAMES } from "@nucleus/jobs";
import type { ConnectionOptions } from "bullmq";

const connection: ConnectionOptions = {
  host: process.env["REDIS_HOST"] ?? "localhost",
  port: Number(process.env["REDIS_PORT"] ?? 6379),
};

// ─── Register all workers ─────────────────────────────────────────────────────

const workers: Worker[] = [];

for (const queueName of Object.values(QUEUE_NAMES)) {
  const worker = new Worker(
    queueName,
    async (job) => {
      console.log(`[${queueName}] Processing job ${job.id}: ${job.name}`);
      // Dynamic handler loading per queue
      const handlerModule = await import(`./handlers/${queueName}.js`).catch(() => null);
      if (handlerModule?.default) {
        await handlerModule.default(job);
      } else {
        console.warn(`[${queueName}] No handler found for queue: ${queueName}`);
      }
    },
    {
      connection,
      concurrency: 5,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 1000 },
    },
  );

  worker.on("failed", (job, err) => {
    console.error(`[${queueName}] Job ${job?.id} failed: ${err.message}`);
  });

  worker.on("completed", (job) => {
    console.log(`[${queueName}] Job ${job.id} completed`);
  });

  workers.push(worker);
}

console.log(`🚀 Worker started — listening on ${Object.values(QUEUE_NAMES).length} queues`);

// Graceful shutdown
async function shutdown(): Promise<void> {
  console.log("⏹ Shutting down workers...");
  await Promise.all(workers.map((w) => w.close()));
  process.exit(0);
}

process.on("SIGTERM", () => { void shutdown(); });
process.on("SIGINT", () => { void shutdown(); });
