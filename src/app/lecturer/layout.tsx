import { SectionTabs } from "@/components/layout/section-tabs";
import { countMyPendingRegistrations } from "@/features/registrations/queries";

// Layout KHÔNG phải lớp bảo vệ: Next.js không render lại layout khi chuyển giữa các trang con.
// Quyền giảng viên được kiểm tra trong từng hàm truy vấn và Server Action (requireRole trong src/lib/dal.ts).
export default function LecturerLayout({ children }: LayoutProps<"/lecturer">) {
  return (
    <>
      <SectionTabs
        label="Khu giảng viên"
        tabs={[
          { href: "/lecturer", label: "Tổng quan", exact: true },
          { href: "/lecturer/topics", label: "Đề tài của tôi" },
          { href: "/lecturer/registrations", label: "Sinh viên đăng ký", badge: <PendingCount /> },
        ]}
      />
      <div className="container-page py-8">{children}</div>
    </>
  );
}

async function PendingCount() {
  const count = await countMyPendingRegistrations();
  if (count === 0) return null;
  return (
    <span className="ml-2 rounded-full bg-warning-soft px-1.5 py-0.5 text-xs font-semibold text-warning tabular-nums">
      {count}
      <span className="sr-only"> đăng ký đang chờ phản hồi</span>
    </span>
  );
}
