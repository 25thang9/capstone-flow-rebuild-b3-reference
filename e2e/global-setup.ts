import { execSync } from "node:child_process";

/** Đưa database E2E về trạng thái ban đầu: áp migration rồi xoá và seed lại dữ liệu mẫu. */
export default function globalSetup() {
  const e2eUrl = process.env.E2E_DATABASE_URL!;

  // Chốt an toàn: máy cá nhân không được reset nhầm database đang phát triển.
  if (!process.env.CI && e2eUrl === process.env.DATABASE_URL) {
    throw new Error("E2E_DATABASE_URL đang trùng DATABASE_URL. Hãy tạo một database riêng cho E2E.");
  }

  const env = { ...process.env, DATABASE_URL: e2eUrl, DIRECT_URL: e2eUrl, SEED_RESET: "1" };
  execSync("npx prisma migrate deploy", { stdio: "inherit", env });
  execSync("npx prisma db seed", { stdio: "inherit", env });
}
