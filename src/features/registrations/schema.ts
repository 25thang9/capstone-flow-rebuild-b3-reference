import { z } from "zod";

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} tối đa ${max} ký tự.`)
    .transform((value) => (value === "" ? null : value));

export const registrationSchema = z.object({
  studentCode: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9]{6,12}$/, "MSSV gồm 6–12 chữ cái hoặc chữ số, viết liền."),
  className: optionalText(50, "Lớp"),
  phone: z
    .string()
    .trim()
    .refine((value) => value === "" || /^0\d{9}$/.test(value), "Số điện thoại gồm 10 chữ số, bắt đầu bằng 0.")
    .transform((value) => (value === "" ? null : value)),
  message: optionalText(1000, "Lời nhắn"),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

export const respondSchema = z.object({
  registrationId: z.string().min(1, "Thiếu mã đăng ký."),
  status: z.enum(["ACCEPTED", "REJECTED"], { error: "Hãy chọn Nhận hoặc Từ chối." }),
  lecturerNote: optionalText(1000, "Phản hồi"),
});

export type RespondInput = z.infer<typeof respondSchema>;
