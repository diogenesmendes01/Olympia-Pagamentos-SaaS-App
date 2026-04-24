import { Queue } from "bullmq";
import { redisConnection } from "./redis.js";
import type { EmailJob } from "./email.types.js";

export const EMAIL_QUEUE_NAME = "email";

export const emailQueue = new Queue<EmailJob>(EMAIL_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
});

export async function enqueueEmail(job: EmailJob) {
  return emailQueue.add(job.type, job);
}
