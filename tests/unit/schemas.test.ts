import { describe, expect, it } from "vitest";
import { z } from "zod";

import { signInSchema, signUpSchema } from "@/features/auth/schema";
import { catalogNameSchema } from "@/features/catalog/schema";
import { registrationSchema, respondSchema } from "@/features/registrations/schema";
import { readTopicForm, topicSchema } from "@/features/topics/schema";

const validTopic = {
  title: "Hệ đo nhiệt độ dùng ESP32",
  description: "Thu thập nhiệt độ, độ ẩm trong phòng thí nghiệm và hiển thị trên web.",
  objectives: "",
  requirements: "",
  departmentId: "dep_1",
  maxStudents: "3",
  status: "OPEN",
  tagIds: ["tag_1"],
};

function fieldErrors(error: z.ZodError) {
  return z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
}

describe("topicSchema", () => {
  it("chấp nhận dữ liệu hợp lệ, ép số và chuyển ô trống thành null", () => {
    const result = topicSchema.parse(validTopic);
    expect(result.maxStudents).toBe(3);
    expect(result.objectives).toBeNull();
  });

  it("báo lỗi tiếng Việt theo từng ô", () => {
    const result = topicSchema.safeParse({ ...validTopic, title: "Ngắn", departmentId: "", maxStudents: "0" });
    expect(result.success).toBe(false);
    if (result.success) return;
    const errors = fieldErrors(result.error);
    expect(errors.title).toEqual(["Tên đề tài cần ít nhất 10 ký tự."]);
    expect(errors.departmentId).toEqual(["Hãy chọn bộ môn."]);
    expect(errors.maxStudents).toEqual(["Cần ít nhất 1 sinh viên."]);
  });

  it("từ chối số lượng không phải số nguyên và trạng thái lạ", () => {
    expect(topicSchema.safeParse({ ...validTopic, maxStudents: "2.5" }).success).toBe(false);
    expect(topicSchema.safeParse({ ...validTopic, maxStudents: "abc" }).success).toBe(false);
    expect(topicSchema.safeParse({ ...validTopic, status: "ARCHIVED" }).success).toBe(false);
  });

  it("giới hạn số thẻ của một đề tài", () => {
    const tooMany = Array.from({ length: 7 }, (_, index) => `tag_${index}`);
    expect(topicSchema.safeParse({ ...validTopic, tagIds: tooMany }).success).toBe(false);
  });

  it("readTopicForm gom checkbox nhiều giá trị thành mảng", () => {
    const formData = new FormData();
    formData.set("title", "Tên đề tài");
    formData.append("tagIds", "a");
    formData.append("tagIds", "b");
    expect(readTopicForm(formData)).toMatchObject({ title: "Tên đề tài", description: "", tagIds: ["a", "b"] });
  });
});

describe("registrationSchema", () => {
  it("chỉ MSSV là bắt buộc; ô không bắt buộc bỏ trống thành null", () => {
    expect(registrationSchema.parse({ studentCode: " 22130101 ", className: "", phone: "", message: "" })).toEqual({
      studentCode: "22130101",
      className: null,
      phone: null,
      message: null,
    });
  });

  it("từ chối MSSV và số điện thoại sai định dạng", () => {
    const result = registrationSchema.safeParse({ studentCode: "22-13", className: "", phone: "12345", message: "" });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(Object.keys(fieldErrors(result.error)).sort()).toEqual(["phone", "studentCode"]);
  });
});

describe("respondSchema", () => {
  it("giảng viên chỉ chọn được Nhận hoặc Từ chối, không đưa về Chờ phản hồi", () => {
    expect(respondSchema.safeParse({ registrationId: "r1", status: "ACCEPTED", lecturerNote: "" }).success).toBe(true);
    expect(respondSchema.safeParse({ registrationId: "r1", status: "PENDING", lecturerNote: "" }).success).toBe(false);
  });
});

describe("signInSchema / signUpSchema", () => {
  it("chuẩn hoá email về chữ thường và bỏ khoảng trắng", () => {
    expect(signInSchema.parse({ email: "  SV.An@Example.com ", password: "x" }).email).toBe("sv.an@example.com");
  });

  it("mật khẩu nhập lại phải khớp", () => {
    const result = signUpSchema.safeParse({
      name: "Nguyễn Văn An",
      email: "sv.an@example.com",
      password: "matkhau-dai-1",
      confirmPassword: "matkhau-dai-2",
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(fieldErrors(result.error).confirmPassword).toEqual(["Mật khẩu nhập lại không khớp."]);
  });

  it("từ chối mật khẩu ngắn hơn 8 ký tự", () => {
    const result = signUpSchema.safeParse({
      name: "Nguyễn Văn An",
      email: "sv.an@example.com",
      password: "1234567",
      confirmPassword: "1234567",
    });
    expect(result.success).toBe(false);
  });
});

describe("catalogNameSchema", () => {
  it("từ chối tên chỉ gồm ký tự đặc biệt vì không sinh được slug", () => {
    expect(catalogNameSchema.safeParse({ name: "!!!" }).success).toBe(false);
    expect(catalogNameSchema.safeParse({ name: "Vật lý Tin học" }).success).toBe(true);
  });
});
