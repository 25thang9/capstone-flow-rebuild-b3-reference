import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

// Prisma 7 kết nối qua driver adapter. Trên Neon, DATABASE_URL là URL "pooled".
function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Thiếu biến môi trường DATABASE_URL. Xem .env.example.");
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

// Khi dev, hot reload nạp lại module nhiều lần; giữ một client duy nhất để không cạn kết nối.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
