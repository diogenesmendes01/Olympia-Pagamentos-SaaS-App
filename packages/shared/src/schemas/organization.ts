import { z } from "zod";

export const slugSchema = z
  .string()
  .min(3)
  .max(40)
  .regex(/^[a-z0-9-]+$/, "Slug: apenas letras minúsculas, números e hífen");

export const createOrgSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  slug: slugSchema,
  cnpj: z.string().optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member"]),
});

export const updateMemberSchema = z.object({
  memberId: z.string(),
  role: z.enum(["admin", "member"]),
});

export type CreateOrgInput = z.infer<typeof createOrgSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
