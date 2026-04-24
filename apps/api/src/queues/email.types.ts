import { z } from "zod";

export const verifyEmailJob = z.object({
  type: z.literal("verifyEmail"),
  to: z.string().email(),
  name: z.string(),
  verifyUrl: z.string().url(),
});

export const resetPasswordJob = z.object({
  type: z.literal("resetPassword"),
  to: z.string().email(),
  name: z.string(),
  resetUrl: z.string().url(),
});

export const magicLinkJob = z.object({
  type: z.literal("magicLink"),
  to: z.string().email(),
  linkUrl: z.string().url(),
});

export const orgInviteJob = z.object({
  type: z.literal("orgInvite"),
  to: z.string().email(),
  inviterName: z.string(),
  organizationName: z.string(),
  inviteUrl: z.string().url(),
});

export const emailJobSchema = z.discriminatedUnion("type", [
  verifyEmailJob,
  resetPasswordJob,
  magicLinkJob,
  orgInviteJob,
]);

export type EmailJob = z.infer<typeof emailJobSchema>;
