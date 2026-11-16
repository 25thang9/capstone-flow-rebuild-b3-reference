import { z } from "zod";

import { TopicStatus } from "@/generated/prisma/enums";

export const MAX_STUDENTS_PER_TOPIC = 10;
export const MAX_TAGS_PER_TOPIC = 6;

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} tối đa ${max} ký tự.`)
    .transform((value) => (value === "" ? null : value));

export const topicSchema = z.object({
  title: z
    .string()
    .trim()
    .min(10, "Tên đề tài cần ít nhất 10 ký tự.")
    .max(200, "Tên đề tài tối đa 200 ký tự."),
  description: z
    .string()
    .trim()
    .min(30, "Mô tả cần ít nhất 30 ký tự để sinh viên hiểu đề tài.")
    .max(5000, "Mô tả tối đa 5000 ký tự."),
  objectives: optionalText(3000, "Mục tiêu"),
  requirements: optionalText(3000, "Yêu cầu"),
  departmentId: z.string().min(1, "Hãy chọn bộ môn."),
  maxStudents: z.coerce
    .number({ error: "Số sinh viên phải là một số." })
    .int("Số sinh viên phải là số nguyên.")
    .min(1, "Cần ít nhất 1 sinh viên.")
    .max(MAX_STUDENTS_PER_TOPIC, `Tối đa ${MAX_STUDENTS_PER_TOPIC} sinh viên cho một đề tài.`),
  status: z.enum(TopicStatus, { error: "Trạng thái không hợp lệ." }),
  tagIds: z.array(z.string().min(1)).max(MAX_TAGS_PER_TOPIC, `Chọn tối đa ${MAX_TAGS_PER_TOPIC} thẻ.`),
});

export type TopicInput = z.infer<typeof topicSchema>;

/** Gom dữ liệu thô của form thành object cho Zod (ô nhiều giá trị dùng getAll). */
export function readTopicForm(formData: FormData) {
  const text = (name: string) => String(formData.get(name) ?? "");
  return {
    title: text("title"),
    description: text("description"),
    objectives: text("objectives"),
    requirements: text("requirements"),
    departmentId: text("departmentId"),
    maxStudents: text("maxStudents"),
    status: text("status"),
    tagIds: formData.getAll("tagIds").map(String),
  };
}
