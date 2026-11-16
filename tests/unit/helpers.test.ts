import { describe, expect, it } from "vitest";
import { z } from "zod";

import { checkCanChangeRole } from "@/features/users/rules";
import { formValues, validationFailure } from "@/lib/action-state";
import { escapeCsvCell, toCsv } from "@/lib/csv";
import { homePathFor, isRole, safeRedirectPath } from "@/lib/roles";
import { formatDate, initials, slugify } from "@/lib/text";

describe("slugify / initials / formatDate", () => {
  it("bỏ dấu tiếng Việt và chữ đ", () => {
    expect(slugify("Vật lý Điện tử")).toBe("vat-ly-dien-tu");
    expect(slugify("  Xử lý   tín hiệu  ")).toBe("xu-ly-tin-hieu");
  });

  it("C++ và C# không bị trùng slug với C", () => {
    expect(slugify("C/C++")).toBe("c-c-plus-plus");
    expect(slugify("C#")).toBe("c-sharp");
  });

  it("lấy chữ cái đầu của họ và tên", () => {
    expect(initials("Trần Minh Khoa")).toBe("TK");
    expect(initials("  An ")).toBe("A");
    expect(initials("")).toBe("?");
  });

  it("định dạng ngày theo giờ Việt Nam, không phụ thuộc múi giờ máy chủ", () => {
    // 18:30 UTC ngày 31/12 là 01:30 ngày 01/01 ở Việt Nam.
    expect(formatDate("2026-12-31T18:30:00.000Z")).toBe("01/01/2027");
  });
});

describe("CSV", () => {
  it("bọc nháy kép ô có dấu phẩy, nháy kép hoặc xuống dòng", () => {
    expect(escapeCsvCell('Lớp "A", nhóm 1')).toBe('"Lớp ""A"", nhóm 1"');
    expect(escapeCsvCell("dòng 1\ndòng 2")).toBe('"dòng 1\ndòng 2"');
  });

  it("vô hiệu hoá ô bắt đầu bằng ký tự công thức (CSV injection)", () => {
    expect(escapeCsvCell("=HYPERLINK(\"http://evil\")")).toBe("\"'=HYPERLINK(\"\"http://evil\"\")\"");
    expect(escapeCsvCell("+84901234567")).toBe("'+84901234567");
    expect(escapeCsvCell("@cmd")).toBe("'@cmd");
  });

  it("ô rỗng, null và số được ghi đúng; có BOM để Excel đọc tiếng Việt", () => {
    const csv = toCsv(["Tên", "Điểm"], [["An", 9], [null, undefined]]);
    expect(csv).toBe("﻿Tên,Điểm\r\nAn,9\r\n,\r\n");
  });
});

describe("vai trò và chuyển hướng", () => {
  it("mỗi vai trò có trang chính riêng", () => {
    expect(homePathFor("STUDENT")).toBe("/topics");
    expect(homePathFor("LECTURER")).toBe("/lecturer");
    expect(homePathFor("ADMIN")).toBe("/admin");
  });

  it("isRole chỉ nhận đúng ba vai trò", () => {
    expect(isRole("ADMIN")).toBe(true);
    expect(isRole("admin")).toBe(false);
    expect(isRole(undefined)).toBe(false);
  });

  it("chỉ chuyển hướng tới đường dẫn nội bộ (chặn open redirect)", () => {
    expect(safeRedirectPath("/topics/abc?x=1", "/")).toBe("/topics/abc?x=1");
    for (const evil of ["https://evil.com", "//evil.com", "/\\evil.com", "javascript:alert(1)", "", null, 42]) {
      expect(safeRedirectPath(evil, "/fallback")).toBe("/fallback");
    }
  });
});

describe("checkCanChangeRole", () => {
  const lecturer = { id: "u2", role: "LECTURER", topicCount: 0 } as const;

  it("quản trị viên không tự đổi vai trò của mình", () => {
    expect(checkCanChangeRole({ actorId: "u1", target: { id: "u1", role: "ADMIN", topicCount: 0 }, nextRole: "STUDENT" })).toBe("SELF");
  });

  it("không hạ vai trò giảng viên còn đề tài", () => {
    expect(checkCanChangeRole({ actorId: "u1", target: { ...lecturer, topicCount: 2 }, nextRole: "STUDENT" })).toBe("HAS_TOPICS");
  });

  it("đổi sang đúng vai trò hiện tại là thao tác thừa", () => {
    expect(checkCanChangeRole({ actorId: "u1", target: lecturer, nextRole: "LECTURER" })).toBe("SAME_ROLE");
  });

  it("các trường hợp còn lại được phép", () => {
    expect(checkCanChangeRole({ actorId: "u1", target: lecturer, nextRole: "ADMIN" })).toBeNull();
    expect(checkCanChangeRole({ actorId: "u1", target: { id: "u3", role: "STUDENT", topicCount: 0 }, nextRole: "LECTURER" })).toBeNull();
  });
});

describe("ActionState", () => {
  it("không bao giờ trả mật khẩu về trình duyệt", () => {
    const formData = new FormData();
    formData.set("email", "a@example.com");
    formData.set("password", "bi-mat");
    formData.set("confirmPassword", "bi-mat");
    expect(formValues(formData)).toEqual({ email: "a@example.com" });
  });

  it("ô nhiều giá trị được nối bằng dấu phẩy, lỗi Zod được gom theo từng ô", () => {
    const formData = new FormData();
    formData.append("tagIds", "a");
    formData.append("tagIds", "b");
    formData.set("title", "");

    const parsed = z.object({ title: z.string().min(1, "Bắt buộc.") }).safeParse({ title: "" });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;

    expect(validationFailure(parsed.error, formData)).toEqual({
      status: "error",
      message: "Vui lòng kiểm tra lại các ô được đánh dấu.",
      fieldErrors: { title: ["Bắt buộc."] },
      values: { tagIds: "a,b", title: "" },
    });
  });
});
