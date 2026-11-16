import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import type { Role } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth";
import { homePathFor, isRole } from "@/lib/roles";

/**
 * Data Access Layer: nơi DUY NHẤT đọc phiên đăng nhập.
 * Mọi page, Server Action và Route Handler cần quyền đều đi qua các hàm ở đây,
 * không tin bất kỳ userId / role nào gửi lên từ trình duyệt.
 */

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

// cache() của React: một request chỉ truy vấn phiên một lần dù gọi ở nhiều component.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const { id, name, email, role } = session.user;
  return { id, name, email, role: isRole(role) ? role : "STUDENT" };
});

/** Bắt buộc đã đăng nhập; chưa thì chuyển về trang đăng nhập. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Bắt buộc đúng vai trò; sai vai trò thì đưa về trang chính của vai trò hiện tại. */
export async function requireRole(...allowed: Role[]): Promise<CurrentUser> {
  const user = await requireUser();
  if (!allowed.includes(user.role)) redirect(homePathFor(user.role));
  return user;
}
