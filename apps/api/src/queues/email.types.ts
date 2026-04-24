import { z } from "zod";

const httpUrl = z
  .string()
  .url()
  .refine((u) => /^https?:$/.test(new URL(u).protocol), {
    message: "URL must use http(s) scheme",
  });

export const verifyEmailJob = z.object({
  type: z.literal("verifyEmail"),
  to: z.string().email(),
  name: z.string().min(1),
  verifyUrl: httpUrl,
});

export const resetPasswordJob = z.object({
  type: z.literal("resetPassword"),
  to: z.string().email(),
  name: z.string().min(1),
  resetUrl: httpUrl,
});

export const magicLinkJob = z.object({
  type: z.literal("magicLink"),
  to: z.string().email(),
  linkUrl: httpUrl,
});

export const orgInviteJob = z.object({
  type: z.literal("orgInvite"),
  to: z.string().email(),
  inviterName: z.string().min(1),
  organizationName: z.string().min(1),
  inviteUrl: httpUrl,
});

export const emailJobSchema = z.discriminatedUnion("type", [
  verifyEmailJob,
  resetPasswordJob,
  magicLinkJob,
  orgInviteJob,
]);

export type EmailJob = z.infer<typeof emailJobSchema>;
