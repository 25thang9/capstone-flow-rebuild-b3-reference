import { expect, test } from "@playwright/test";

import { ACCOUNTS, signIn, signOut } from "./helpers";

const TOPIC = "Website quản lý lịch đặt thiết bị phòng thí nghiệm Vật lý";
const NOTE = "Nhận em. Thứ Hai gặp thầy tại phòng máy.";

test("sinh viên đăng ký đề tài → giảng viên nhận → sinh viên thấy kết quả", async ({ page }) => {
  // 1. Sinh viên gửi đăng ký.
  await signIn(page, ACCOUNTS.student);
  await page.goto(`/topics?q=${encodeURIComponent("lịch đặt thiết bị")}`);
  await page.getByRole("link", { name: TOPIC }).click();

  // Gửi thiếu MSSV: lỗi hiện ngay dưới ô và chưa có đăng ký nào được tạo.
  await page.getByLabel("Mã số sinh viên").fill("");
  await page.getByRole("button", { name: "Gửi đăng ký" }).click();
  await expect(page.getByText("MSSV gồm 6–12 chữ cái hoặc chữ số, viết liền.")).toBeVisible();

  await page.getByLabel("Mã số sinh viên").fill("22130999");
  await page.getByLabel("Lời nhắn cho giảng viên").fill("Em đã làm đồ án web với Next.js.");
  await page.getByRole("button", { name: "Gửi đăng ký" }).click();

  const panel = page.getByRole("region", { name: "Đăng ký của bạn" });
  await expect(panel.getByText("Chờ phản hồi")).toBeVisible();
  await signOut(page);

  // 2. Giảng viên sở hữu đề tài nhận sinh viên.
  await signIn(page, ACCOUNTS.lecturer);
  await page.goto("/lecturer/registrations?status=PENDING");
  const pending = page.getByRole("listitem").filter({ hasText: "22130999" });
  await expect(pending).toContainText(TOPIC);

  await pending.getByRole("button", { name: "Phản hồi" }).click();
  const dialog = page.getByRole("dialog", { name: "Phản hồi đăng ký" });
  await dialog.getByLabel(/Nhận sinh viên/).check();
  await dialog.getByLabel("Lời nhắn cho sinh viên").fill(NOTE);
  await dialog.getByRole("button", { name: "Gửi phản hồi" }).click();
  await expect(dialog).toBeHidden();

  await page.goto("/lecturer/registrations?status=ACCEPTED");
  await expect(page.getByRole("listitem").filter({ hasText: "22130999" })).toContainText("Đã nhận");
  await signOut(page);

  // 3. Sinh viên thấy trạng thái mới và lời nhắn của giảng viên.
  await signIn(page, ACCOUNTS.student);
  await page.goto("/my-registrations");
  const mine = page.getByRole("listitem").filter({ hasText: TOPIC });
  await expect(mine.getByText("Đã nhận")).toBeVisible();
  await expect(mine.getByText(NOTE)).toBeVisible();
  // Đã được nhận thì không còn nút rút đăng ký.
  await expect(mine.getByRole("button", { name: "Rút đăng ký" })).toHaveCount(0);
});

test("sinh viên rút đăng ký khi giảng viên chưa phản hồi", async ({ page }) => {
  await signIn(page, ACCOUNTS.otherStudent);
  await page.goto("/my-registrations");

  const pending = page.getByRole("listitem").filter({ hasText: "Chờ phản hồi" }).first();
  const title = await pending.getByRole("heading").innerText();
  await pending.getByRole("button", { name: "Rút đăng ký" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Rút đăng ký" }).click();

  await expect(page.getByText("Đã rút đăng ký.")).toBeVisible();
  await expect(page.getByRole("heading", { name: title })).toHaveCount(0);
});
