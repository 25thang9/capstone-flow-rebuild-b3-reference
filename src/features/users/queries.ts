import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { requireRole } from "@/lib/dal";
import { paginate } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

import type { UserFilters } from "./filters";

/** Danh sách người dùng cho trang quản trị. */
export async function listUsers(filters: UserFilters, pageSize = 10) {
  await requireRole("ADMIN");

  const contains = { contains: filters.q, mode: "insensitive" } as const;
  const where: Prisma.UserWhereInput = {
    ...(filters.role !== "ALL" ? { role: filters.role } : {}),
    ...(filters.q ? { OR: [{ name: contains }, { email: contains }, { institutionCode: contains }] } : {}),
  };

  const total = await prisma.user.count({ where });
  const pagination = paginate(total, filters.page, pageSize);

  const users = await prisma.user.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: pagination.skip,
    take: pagination.pageSize,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      institutionCode: true,
      _count: { select: { topics: true, registrations: true } },
    },
  });

  return { users, pagination };
}
