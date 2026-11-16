import { NextResponse, type NextRequest } from "next/server";

import { parseTopicFilters } from "@/features/topics/filters";
import { listPublicTopics } from "@/features/topics/queries";

/**
 * GET /api/topics?q=&department=&tag=&status=&page=
 * API công khai, chỉ đọc: cùng bộ lọc và cùng dữ liệu với trang Kho đề tài.
 */
export async function GET(request: NextRequest) {
  const filters = parseTopicFilters(Object.fromEntries(request.nextUrl.searchParams));
  const { topics, pagination } = await listPublicTopics(filters);

  return NextResponse.json({
    data: topics.map(({ _count, ...topic }) => ({ ...topic, acceptedCount: _count.registrations })),
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: pagination.total,
      totalPages: pagination.totalPages,
    },
  });
}
