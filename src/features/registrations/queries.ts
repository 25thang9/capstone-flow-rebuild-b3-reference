import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { requireRole } from "@/lib/dal";
import { paginate } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

import type { RegistrationFilters } from "./filters";

// ───────────── Sinh viên ─────────────

/** Các đăng ký của chính sinh viên đang đăng nhập. */
export async function listMyRegistrations() {
  const user = await requireRole("STUDENT");

  return prisma.registration.findMany({
    where: { studentId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      message: true,
      lecturerNote: true,
      respondedAt: true,
      createdAt: true,
      topic: {
        select: { id: true, title: true, lecturer: { select: { name: true } } },
      },
    },
  });
}

/** Đăng ký (nếu có) của một sinh viên cho một đề tài – để trang chi tiết biết hiển thị gì. */
export async function getStudentRegistration(studentId: string, topicId: string) {
  return prisma.registration.findUnique({
    where: { topicId_studentId: { topicId, studentId } },
    select: { id: true, status: true, lecturerNote: true, createdAt: true },
  });
}

/** Thông tin sinh viên đã khai lần gần nhất, dùng để điền sẵn form lần sau. */
export async function getLastStudentInfo(studentId: string) {
  return prisma.registration.findFirst({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    select: { studentCode: true, className: true, phone: true },
  });
}

// ───────────── Giảng viên ─────────────

const lecturerRegistrationSelect = {
  id: true,
  studentCode: true,
  className: true,
  phone: true,
  message: true,
  status: true,
  lecturerNote: true,
  respondedAt: true,
  createdAt: true,
  student: { select: { name: true, email: true } },
  topic: { select: { id: true, title: true, maxStudents: true } },
} satisfies Prisma.RegistrationSelect;

export type LecturerRegistration = Prisma.RegistrationGetPayload<{
  select: typeof lecturerRegistrationSelect;
}>;

function myRegistrationWhere(lecturerId: string, filters: Omit<RegistrationFilters, "page">) {
  const contains = { contains: filters.q, mode: "insensitive" } as const;
  return {
    // Điều kiện sở hữu: chỉ đăng ký thuộc đề tài của giảng viên đang đăng nhập.
    topic: { lecturerId },
    ...(filters.status !== "ALL" ? { status: filters.status } : {}),
    ...(filters.topicId ? { topicId: filters.topicId } : {}),
    ...(filters.q ? { OR: [{ student: { name: contains } }, { studentCode: contains }] } : {}),
  } satisfies Prisma.RegistrationWhereInput;
}

export async function listRegistrationsForMyTopics(filters: RegistrationFilters, pageSize = 10) {
  const user = await requireRole("LECTURER");
  const where = myRegistrationWhere(user.id, filters);

  const total = await prisma.registration.count({ where });
  const pagination = paginate(total, filters.page, pageSize);

  const registrations = await prisma.registration.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: pagination.skip,
    take: pagination.pageSize,
    select: lecturerRegistrationSelect,
  });

  return { registrations, pagination };
}

/** Toàn bộ kết quả theo bộ lọc (không phân trang) để xuất CSV. Giới hạn 2000 dòng. */
export async function listRegistrationsForExport(lecturerId: string, filters: Omit<RegistrationFilters, "page">) {
  return prisma.registration.findMany({
    where: myRegistrationWhere(lecturerId, filters),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 2000,
    select: lecturerRegistrationSelect,
  });
}

/** Số đăng ký đang chờ phản hồi – hiển thị trên thanh điều hướng của giảng viên. */
export async function countMyPendingRegistrations() {
  const user = await requireRole("LECTURER");
  return prisma.registration.count({
    where: { status: "PENDING", topic: { lecturerId: user.id } },
  });
}
