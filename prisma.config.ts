import { existsSync } from "node:fs";
import { defineConfig } from "prisma/config";

// Prisma 7 không tự đọc file .env. Node 24 có sẵn process.loadEnvFile nên không cần cài thêm dotenv.
// Biến đã có sẵn trong môi trường (CI, Vercel) được giữ nguyên, không bị ghi đè.
if (existsSync(".env")) process.loadEnvFile(".env");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrate cần kết nối trực tiếp (Neon: host KHÔNG có "-pooler").
    // Ứng dụng khi chạy thì dùng DATABASE_URL (pooled) trong src/lib/prisma.ts.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
  },
});
