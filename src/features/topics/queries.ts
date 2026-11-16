import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { requireRole } from "@/lib/dal";
import { PAGE_SIZE, paginate } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

import type { LecturerTopicFilters, TopicFilters } from "./filters";

// Chỉ select đúng cột cần hiển thị: không bao giờ trả email giảng viên hay dữ liệu sinh viên ra trang công khai.
const topicCardSelect = {
  id: true,
  title: true,
  description: true,
  maxStudents: true,
  status: true,
  updatedAt: true,
  lecturer: { select: { name: true } },
  department: { select: { name: true, slug: true } },
  tags: { select: { name: true, slug: true }, orderBy: { name: "asc" } },
  _count: { select: { registrations: { where: { status: "ACCEPTED" } } } },
} satisfies Prisma.TopicSelect;

export type TopicCardData = Prisma.TopicGetPayload<{ select: typeof topicCardSelect }>;

function publicTopicWhere(filters: TopicFilters): Prisma.TopicWhereInput {
  const contains = { contains: filters.q, mode: "insensitive" } as const;
  return {
    ...(filters.status !== "ALL" ? { status: filters.status } : {}),
    ...(filters.department ? { department: { slug: filters.department } } : {}),
    ...(filters.tag ? { tags: { some: { slug: filters.tag } } } : {}),
    ...(filters.q
      ? {
          OR: [
            { title: contains },
            { description: contains },
            { lecturer: { name: contains } },
            { tags: { some: { name: contains } } },
          ],
        }
      : {}),
  };
}

/** Kho đề tài công khai: lọc + phân trang phía server. */
export async function listPublicTopics(filters: TopicFilters, pageSize = PAGE_SIZE) {
  const where = publicTopicWhere(filters);
  const total = await prisma.topic.count({ where });
  const pagination = paginate(total, filters.page, pageSize);

  const topics = await prisma.topic.findMany({
    where,
    // Thêm id để thứ tự ổn định khi nhiều đề tài cập nhật cùng lúc (tránh lặp/sót khi sang trang).
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    skip: pagination.skip,
    take: pagination.pageSize,
    select: topicCardSelect,
  });

  return { topics, pagination };
}

export async function listLatestOpenTopics(take: number) {
  return prisma.topic.findMany({
    where: { status: "OPEN" },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take,
    select: topicCardSelect,
  });
}

export async function getPublicTopic(id: string) {
  return prisma.topic.findUnique({
    where: { id },
    select: { ...topicCardSelect, objectives: true, requirements: true, createdAt: true, lecturerId: true },
  });
}

// ───────────── Khu giảng viên ─────────────

/** Đề tài của chính giảng viên đang đăng nhập (lọc theo lecturerId lấy từ phiên). */
export async function listMyTopics(filters: LecturerTopicFilters, pageSize = 10) {
  const user = await requireRole("LECTURER");

  const where: Prisma.TopicWhereInput = {
    lecturerId: user.id,
    ...(filters.status !== "ALL" ? { status: filters.status } : {}),
    ...(filters.q ? { title: { contains: filters.q, mode: "insensitive" } } : {}),
  };

  const total = await prisma.topic.count({ where });
  const pagination = paginate(total, filters.page, pageSize);

  const rows = await prisma.topic.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    skip: pagination.skip,
    take: pagination.pageSize,
    select: {
      id: true,
      title: true,
      status: true,
      maxStudents: true,
      updatedAt: true,
      department: { select: { name: true } },
      registrations: { select: { status: true } },
    },
  });

  const topics = rows.map(({ registrations, ...topic }) => ({
    ...topic,
    acceptedCount: registrations.filter((item) => item.status === "ACCEPTED").length,
    pendingCount: registrations.filter((item) => item.status === "PENDING").length,
    registrationCount: registrations.length,
  }));

  return { topics, pagination };
}

/** Một đề tài của chính mình để sửa. Trả null nếu không tồn tại HOẶC không phải của mình. */
export async function getMyTopic(id: string) {
  const user = await requireRole("LECTURER");

  return prisma.topic.findFirst({
    where: { id, lecturerId: user.id },
    select: {
      id: true,
      title: true,
      description: true,
      objectives: true,
      requirements: true,
      maxStudents: true,
      status: true,
      departmentId: true,
      tags: { select: { id: true } },
      _count: { select: { registrations: { where: { status: "ACCEPTED" } } } },
    },
  });
}

/** Danh sách rút gọn để đổ vào ô chọn đề tài ở trang Đăng ký. */
export async function listMyTopicOptions() {
  const user = await requireRole("LECTURER");
  return prisma.topic.findMany({
    where: { lecturerId: user.id },
    orderBy: { title: "asc" },
    select: { id: true, title: true },
  });
}
