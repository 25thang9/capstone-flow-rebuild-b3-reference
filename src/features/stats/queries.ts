import "server-only";

import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

/** Số liệu công khai ở trang chủ. */
export async function getPublicStats() {
  const [openTopics, lecturers, departments] = await Promise.all([
    prisma.topic.count({ where: { status: "OPEN" } }),
    prisma.user.count({ where: { role: "LECTURER" } }),
    prisma.department.count(),
  ]);
  return { openTopics, lecturers, departments };
}

/** Bộ môn kèm số đề tài đang nhận, để dẫn nhanh vào Kho đề tài. */
export async function listDepartmentsWithOpenTopics() {
  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
    select: {
      name: true,
      slug: true,
      _count: { select: { topics: { where: { status: "OPEN" } } } },
    },
  });
  return departments.map((item) => ({ name: item.name, slug: item.slug, openTopics: item._count.topics }));
}

/** Tổng quan của giảng viên đang đăng nhập. */
export async function getLecturerOverview() {
  const user = await requireRole("LECTURER");

  const [topics, recent] = await Promise.all([
    prisma.topic.findMany({
      where: { lecturerId: user.id },
      select: {
        id: true,
        title: true,
        status: true,
        registrations: { select: { status: true } },
      },
    }),
    prisma.registration.findMany({
      where: { topic: { lecturerId: user.id } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        createdAt: true,
        student: { select: { name: true } },
        topic: { select: { title: true } },
      },
    }),
  ]);

  const perTopic = topics.map((topic) => ({
    id: topic.id,
    title: topic.title,
    pending: topic.registrations.filter((item) => item.status === "PENDING").length,
    accepted: topic.registrations.filter((item) => item.status === "ACCEPTED").length,
    rejected: topic.registrations.filter((item) => item.status === "REJECTED").length,
  }));
  const sum = (key: "pending" | "accepted" | "rejected") =>
    perTopic.reduce((total, topic) => total + topic[key], 0);

  return {
    name: user.name,
    totals: {
      topics: topics.length,
      openTopics: topics.filter((topic) => topic.status === "OPEN").length,
      pending: sum("pending"),
      accepted: sum("accepted"),
      registrations: sum("pending") + sum("accepted") + sum("rejected"),
    },
    // Biểu đồ: 6 đề tài có nhiều đăng ký nhất.
    chart: perTopic
      .filter((topic) => topic.pending + topic.accepted + topic.rejected > 0)
      .sort((a, b) => b.pending + b.accepted + b.rejected - (a.pending + a.accepted + a.rejected))
      .slice(0, 6),
    recent,
  };
}

/** Tổng quan toàn hệ thống cho quản trị viên. */
export async function getAdminOverview() {
  await requireRole("ADMIN");

  const [usersByRole, topicsByStatus, registrationsByStatus, departments] = await Promise.all([
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.topic.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.registration.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.department.findMany({
      orderBy: { name: "asc" },
      select: { name: true, topics: { select: { status: true } } },
    }),
  ]);

  // groupBy chỉ trả về nhóm có dữ liệu, nên nhóm vắng mặt được coi là 0.
  const byRole = new Map(usersByRole.map((row) => [row.role, row._count._all]));
  const byTopicStatus = new Map(topicsByStatus.map((row) => [row.status, row._count._all]));
  const byRegistrationStatus = new Map(registrationsByStatus.map((row) => [row.status, row._count._all]));

  return {
    users: {
      students: byRole.get("STUDENT") ?? 0,
      lecturers: byRole.get("LECTURER") ?? 0,
      admins: byRole.get("ADMIN") ?? 0,
    },
    topics: {
      open: byTopicStatus.get("OPEN") ?? 0,
      closed: byTopicStatus.get("CLOSED") ?? 0,
    },
    registrations: {
      pending: byRegistrationStatus.get("PENDING") ?? 0,
      accepted: byRegistrationStatus.get("ACCEPTED") ?? 0,
      rejected: byRegistrationStatus.get("REJECTED") ?? 0,
    },
    topicsByDepartment: departments.map((department) => ({
      name: department.name,
      open: department.topics.filter((topic) => topic.status === "OPEN").length,
      closed: department.topics.filter((topic) => topic.status === "CLOSED").length,
    })),
  };
}
