import { Role } from "@/generated/prisma/enums";

export const ROLE_LABEL: Record<Role, string> = {
  STUDENT: "Sinh viên",
  LECTURER: "Giảng viên",
  ADMIN: "Quản trị viên",
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && value in Role;
}

/** Trang chính sau khi đăng nhập, theo vai trò. */
export function homePathFor(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "LECTURER":
      return "/lecturer";
    default:
      return "/topics";
  }
}

/**
 * Chỉ cho phép chuyển hướng tới đường dẫn nội bộ sau khi đăng nhập.
 * Chặn "//evil.com", "/\evil.com" và URL tuyệt đối để tránh lỗi open redirect.
 */
export function safeRedirectPath(next: unknown, fallback: string): string {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  return next;
}
