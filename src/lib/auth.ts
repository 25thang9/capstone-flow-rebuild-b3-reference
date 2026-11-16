import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { prisma } from "@/lib/prisma";

// Cấu hình Better Auth. BETTER_AUTH_SECRET và BETTER_AUTH_URL được đọc từ biến môi trường.
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 72,
  },
  user: {
    additionalFields: {
      // input: false → người dùng không thể tự gán vai trò khi đăng ký.
      // Chỉ quản trị viên đổi vai trò, qua Server Action có kiểm tra quyền.
      role: {
        type: "string",
        required: false,
        defaultValue: "STUDENT",
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  // nextCookies phải đứng cuối: giúp Server Action đặt được cookie phiên.
  plugins: [nextCookies()],
});
