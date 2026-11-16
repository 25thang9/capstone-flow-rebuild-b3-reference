import { NextResponse, type NextRequest } from "next/server";

import { parseRegistrationFilters } from "@/features/registrations/filters";
import { listRegistrationsForExport } from "@/features/registrations/queries";
import { toCsv } from "@/lib/csv";
import { getCurrentUser } from "@/lib/dal";
import { REGISTRATION_STATUS_LABEL } from "@/lib/labels";
import { formatDateTime } from "@/lib/text";

/**
 * GET /api/lecturer/registrations/export?status=&topic=&q=
 * Xuất danh sách đăng ký thuộc đề tài của giảng viên đang đăng nhập ra tệp CSV.
 * Route Handler trả mã lỗi HTTP (401/403) thay vì chuyển hướng như trang.
 */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Bạn chưa đăng nhập." }, { status: 401 });
  if (user.role !== "LECTURER") {
    return NextResponse.json({ message: "Chỉ giảng viên mới xuất được danh sách." }, { status: 403 });
  }

  const filters = parseRegistrationFilters(Object.fromEntries(request.nextUrl.searchParams));
  const registrations = await listRegistrationsForExport(user.id, filters);

  const csv = toCsv(
    ["Đề tài", "Họ tên", "MSSV", "Lớp", "Email", "Điện thoại", "Trạng thái", "Lời nhắn", "Phản hồi", "Ngày gửi"],
    registrations.map((item) => [
      item.topic.title,
      item.student.name,
      item.studentCode,
      item.className,
      item.student.email,
      item.phone,
      REGISTRATION_STATUS_LABEL[item.status],
      item.message,
      item.lecturerNote,
      formatDateTime(item.createdAt),
    ]),
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="dang-ky-de-tai.csv"',
      // Dữ liệu cá nhân của sinh viên: không cho bộ nhớ đệm trung gian lưu lại.
      "Cache-Control": "private, no-store",
    },
  });
}
