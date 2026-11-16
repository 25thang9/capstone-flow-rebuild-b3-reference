import "server-only";

import { prisma } from "@/lib/prisma";

const withTopicCount = {
  id: true,
  name: true,
  slug: true,
  _count: { select: { topics: true } },
} as const;

export type CatalogItem = { id: string; name: string; slug: string; _count: { topics: number } };

export async function listDepartments(): Promise<CatalogItem[]> {
  return prisma.department.findMany({ orderBy: { name: "asc" }, select: withTopicCount });
}

export async function listTags(): Promise<CatalogItem[]> {
  return prisma.tag.findMany({ orderBy: { name: "asc" }, select: withTopicCount });
}
