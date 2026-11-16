import { expect, test } from "@playwright/test";

import { ACCOUNTS, signIn } from "./helpers";

test.describe("Phân quyền theo vai trò (kiểm tra phía server)", () => {
  test("khách bị chuyển về trang đăng nhập khi vào khu cần quyền", async ({ page, request }) => {
    await page.goto("/lecturer/topics");
    await expect(page).toHaveURL(/\/login\?next=%2Flecturer%2Ftopics/);

    await page.goto("/admin/users");
    await expect(page).toHaveURL(/\/login\?next=%2Fadmin%2Fusers/);

    const response = await request.get("/api/lecturer/registrations/export");
    expect(response.status()).toBe(401);
  });

  test("sinh viên không vào được khu giảng viên, khu quản trị và API của giảng viên", async ({ page }) => {
    await signIn(page, ACCOUNTS.student);

    // Sai vai trò thì bị đưa về trang chính của sinh viên. Chờ trang đó hiện xong rồi mới đi tiếp,
    // nếu không lần chuyển hướng đang dở sẽ huỷ lệnh goto kế tiếp.
    const studentHome = page.getByRole("heading", { level: 1, name: "Kho đề tài" });

    await page.goto("/lecturer/topics");
    await expect(page).toHaveURL(/\/topics$/);
    await expect(studentHome).toBeVisible();

    await page.goto("/admin/users");
    await expect(page).toHaveURL(/\/topics$/);
    await expect(studentHome).toBeVisible();

    // page.request dùng chung cookie phiên của sinh viên.
    const response = await page.request.get("/api/lecturer/registrations/export");
    expect(response.status()).toBe(403);
  });

  test("giảng viên không sửa được đề tài của giảng viên khác", async ({ page }) => {
    // Đề tài về Geant4 thuộc giảng viên khác với tài khoản đang đăng nhập.
    const topics = await page.request.get("/api/topics?q=Geant4");
    const { data } = (await topics.json()) as { data: { id: string; lecturer: { name: string } }[] };
    expect(data[0].lecturer.name).toBe("Lê Thị Thu Hà");

    await signIn(page, ACCOUNTS.otherLecturer);
    await page.goto(`/lecturer/topics/${data[0].id}/edit`);
    await expect(page.getByRole("heading", { name: "Không tìm thấy trang" })).toBeVisible();

    // Danh sách "Đề tài của tôi" cũng không chứa đề tài của người khác.
    await page.goto("/lecturer/topics");
    await expect(page.getByRole("link", { name: /Monte Carlo che chắn/ })).toHaveCount(0);
  });

  test("quản trị viên vào được khu quản trị và thấy danh sách người dùng", async ({ page }) => {
    await signIn(page, ACCOUNTS.admin);
    await expect(page).toHaveURL(/\/admin$/);

    await page.goto("/admin/users?role=LECTURER");
    await expect(page.getByText("gv.khoa@example.com")).toBeVisible();
    await expect(page.getByText("sv.an@example.com")).toHaveCount(0);
  });
});
