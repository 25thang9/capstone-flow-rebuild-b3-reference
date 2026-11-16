import { type Page, expect } from "@playwright/test";

// Tài khoản mẫu do prisma/seed.ts tạo; mật khẩu chung lấy từ biến môi trường SEED_PASSWORD.
export const ACCOUNTS = {
  student: "sv.duc@example.com",
  otherStudent: "sv.lan@example.com",
  lecturer: "gv.bao@example.com",
  otherLecturer: "gv.khoa@example.com",
  admin: "admin@example.com",
} as const;

export async function signIn(page: Page, email: string) {
  const password = process.env.SEED_PASSWORD;
  if (!password) throw new Error("Thiếu SEED_PASSWORD để đăng nhập tài khoản mẫu.");

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page.getByRole("button", { name: /^Tài khoản/ })).toBeVisible();
}

export async function signOut(page: Page) {
  await page.getByRole("button", { name: /^Tài khoản/ }).click();
  await page.getByRole("menuitem", { name: "Đăng xuất" }).click();
  await expect(page.getByRole("banner").getByRole("link", { name: "Đăng nhập" })).toBeVisible();
}
