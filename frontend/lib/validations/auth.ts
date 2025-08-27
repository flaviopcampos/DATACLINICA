import { z } from "zod"

// Schema para login
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Nome de usuário é obrigatório")
    .min(3, "Nome de usuário deve ter pelo menos 3 caracteres")
    .max(50, "Nome de usuário deve ter no máximo 50 caracteres")
    .regex(/^[a-zA-Z0-9._-]+$/, "Nome de usuário deve conter apenas letras, números, pontos, hífens e underscores"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter pelo menos 6 caracteres"),
})

// Schema para registro
export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email inválido"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial"
    ),
  confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
  crm: z
    .string()
    .min(1, "CRM é obrigatório")
    .regex(/^\d{4,6}$/, "CRM deve conter entre 4 e 6 dígitos"),
  specialty: z
    .string()
    .min(1, "Especialidade é obrigatória")
    .min(2, "Especialidade deve ter pelo menos 2 caracteres"),
  phone: z
    .string()
    .min(1, "Telefone é obrigatório")
    .regex(
      /^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/,
      "Formato de telefone inválido. Use: (11) 99999-9999"
    ),
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, "Você deve aceitar os termos de uso"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
})

// Schema para recuperação de senha
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email inválido"),
})

// Schema para redefinir senha
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial"
    ),
  confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
})

// Tipos TypeScript derivados dos schemas
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>