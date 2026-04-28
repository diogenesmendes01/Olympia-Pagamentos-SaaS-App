import { z } from "zod";
import { emailSchema } from "./auth.js";

export const slugSchema = z
  .string()
  .min(3, "Slug precisa ter ao menos 3 caracteres")
  .max(40, "Slug pode ter no máximo 40 caracteres")
  .regex(/^[a-z0-9-]+$/, "Slug: apenas letras minúsculas, números e hífen");

export const createOrgSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  slug: slugSchema,
  cnpj: z.string().optional(),
});

export const inviteMemberSchema = z.object({
  email: emailSchema,
  role: z.enum(["admin", "member"]),
});

export const updateMemberSchema = z.object({
  memberId: z.string().min(1, "ID de membro obrigatório"),
  role: z.enum(["admin", "member"]),
});

export type CreateOrgInput = z.infer<typeof createOrgSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
