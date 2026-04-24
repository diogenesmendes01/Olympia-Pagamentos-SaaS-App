import { Worker, type Job } from "bullmq";
import { redisConnection } from "./redis.js";
import { EMAIL_QUEUE_NAME } from "./email.queue.js";
import { emailJobSchema, type EmailJob } from "./email.types.js";
import { transport, FROM } from "../email/transport.js";
import { verifyEmail } from "../email/templates/verifyEmail.js";
import { resetPassword } from "../email/templates/resetPassword.js";
import { magicLink } from "../email/templates/magicLink.js";
import { orgInvite } from "../email/templates/orgInvite.js";
import { logger } from "../lib/logger.js";

function render(job: EmailJob) {
  switch (job.type) {
    case "verifyEmail":
      return { to: job.to, ...verifyEmail(job) };
    case "resetPassword":
      return { to: job.to, ...resetPassword(job) };
    case "magicLink":
      return { to: job.to, ...magicLink(job) };
    case "orgInvite":
      return { to: job.to, ...orgInvite(job) };
  }
}

async function processor(job: Job<EmailJob>) {
  const data = emailJobSchema.parse(job.data);
  const { to, subject, text, html } = render(data);
  await transport.sendMail({ from: FROM, to, subject, text, html });
  logger.info({ jobId: job.id, type: data.type, to }, "Email enviado");
}

export function createEmailWorker() {
  return new Worker<EmailJob>(EMAIL_QUEUE_NAME, processor, {
    connection: redisConnection,
    concurrency: 5,
  });
}
