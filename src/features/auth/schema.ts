import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Email không hợp lệ." }));

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Hãy nhập mật khẩu."),
});

export const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Họ tên cần ít nhất 2 ký tự.").max(80, "Họ tên tối đa 80 ký tự."),
    email,
    password: z
      .string()
      .min(8, "Mật khẩu cần ít nhất 8 ký tự.")
      .max(72, "Mật khẩu tối đa 72 ký tự."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    error: "Mật khẩu nhập lại không khớp.",
  });
