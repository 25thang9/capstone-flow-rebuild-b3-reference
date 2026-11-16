import { expect, test } from "@playwright/test";

test.describe("Khách xem Kho đề tài", () => {
  test("tìm kiếm từ trang chủ đưa từ khoá lên URL", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Tìm đề tài theo từ khoá").fill("ESP32");
    await page.getByRole("button", { name: "Tìm đề tài" }).click();

    await expect(page).toHaveURL(/\/topics\?q=ESP32/);
    await expect(page.getByLabel("Từ khoá")).toHaveValue("ESP32");
    await expect(page.getByRole("link", { name: /Hệ đo nhiệt độ – độ ẩm/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Monte Carlo che chắn/ })).toHaveCount(0);
  });

  test("lọc theo bộ môn và trạng thái, trạng thái lọc nằm trên URL", async ({ page }) => {
    await page.goto("/topics");

    await page.getByLabel("Bộ môn").selectOption({ label: "Vật lý Hạt nhân" });
    await expect(page).toHaveURL(/department=vat-ly-hat-nhan/);
    await expect(page.getByRole("link", { name: /Monte Carlo che chắn/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Hệ đo nhiệt độ – độ ẩm/ })).toHaveCount(0);
    // Đề tài đã đóng chưa xuất hiện vì mặc định chỉ hiện đề tài đang nhận.
    await expect(page.getByRole("link", { name: /detector nhấp nháy/ })).toHaveCount(0);

    await page.getByLabel("Trạng thái").selectOption("ALL");
    await expect(page).toHaveURL(/status=ALL/);
    await expect(page.getByRole("link", { name: /detector nhấp nháy/ })).toBeVisible();

    // Mở lại đúng URL này (ví dụ khi chia sẻ link) vẫn ra cùng kết quả.
    await page.reload();
    await expect(page.getByLabel("Bộ môn")).toHaveValue("vat-ly-hat-nhan");
    await expect(page.getByRole("link", { name: /detector nhấp nháy/ })).toBeVisible();

    await page.getByRole("link", { name: "Xoá lọc" }).click();
    await expect(page).toHaveURL(/\/topics$/);
  });

  test("phân trang bằng tham số page và giữ nguyên bộ lọc", async ({ page }) => {
    await page.goto("/topics?status=ALL");
    await expect(page.getByText("Tìm thấy 22 đề tài · Trang 1/3")).toBeVisible();

    await page.getByRole("navigation", { name: "Phân trang" }).getByRole("link", { name: "Sau" }).click();
    await expect(page).toHaveURL(/status=ALL&page=2/);
    await expect(page.getByText("Tìm thấy 22 đề tài · Trang 2/3")).toBeVisible();
    await expect(page.getByText("Hiển thị 9–16 trong 22 kết quả")).toBeVisible();
  });

  test("trang chi tiết mời khách đăng nhập rồi quay lại đúng đề tài", async ({ page }) => {
    await page.goto("/topics?q=Geant4");
    await page.getByRole("link", { name: /Monte Carlo che chắn/ }).click();

    await expect(page.getByRole("heading", { level: 1, name: /Monte Carlo che chắn/ })).toBeVisible();
    await expect(page.getByText("Bạn cần đăng nhập bằng tài khoản sinh viên để đăng ký.")).toBeVisible();

    await page.getByRole("main").getByRole("link", { name: "Đăng nhập" }).click();
    await expect(page).toHaveURL(/\/login\?next=%2Ftopics%2F|\/login\?next=\/topics\//);
  });
});
