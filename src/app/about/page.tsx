import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description: "CapstoneFlow là gì, dùng như thế nào và những gì hệ thống chưa làm.",
};

const ROLES = [
  {
    name: "Sinh viên",
    can: [
      "Xem, tìm kiếm và lọc đề tài mà không cần đăng nhập.",
      "Đăng ký đề tài đang nhận; mỗi đề tài chỉ đăng ký một lần.",
      "Theo dõi trạng thái và phản hồi của giảng viên; rút đăng ký khi chưa được phản hồi.",
    ],
  },
  {
    name: "Giảng viên",
    can: [
      "Đăng, sửa, đóng/mở và xoá đề tài của chính mình.",
      "Xem danh sách sinh viên đăng ký, nhận hoặc từ chối kèm lời nhắn.",
      "Xuất danh sách đăng ký ra tệp CSV.",
    ],
  },
  {
    name: "Quản trị viên",
    can: [
      "Cấp vai trò giảng viên hoặc quản trị cho tài khoản.",
      "Quản lý danh mục bộ môn và thẻ công nghệ.",
      "Xem số liệu tổng hợp của toàn hệ thống.",
    ],
  },
];

const LIMITS = [
  "Chưa xác minh email và chưa liên kết với tài khoản sinh viên của Trường.",
  "Chưa có thông báo qua email; kết quả xem trực tiếp trên website.",
  "Chưa quản lý tiến độ thực hiện, nộp báo cáo hay chấm điểm đồ án.",
];

export default function AboutPage() {
  return (
    <div className="container-page py-10">
      <PageHeader
        title="Giới thiệu CapstoneFlow"
        description="Một nơi chung để giảng viên công bố đề tài đồ án và sinh viên đăng ký, thay cho việc hỏi qua nhiều kênh rời rạc."
        crumbs={[{ label: "Trang chủ", href: "/" }, { label: "Giới thiệu" }]}
      />

      <div className="grid gap-12 border-t pt-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-10">
          <section aria-labelledby="roles-heading">
            <h2 id="roles-heading" className="text-2xl font-semibold tracking-tight">
              Ai dùng được gì
            </h2>
            <div className="mt-4 divide-y border-y">
              {ROLES.map((role) => (
                <div key={role.name} className="grid gap-2 py-5 sm:grid-cols-[10rem_minmax(0,1fr)]">
                  <h3 className="font-sans text-base font-semibold">{role.name}</h3>
                  <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                    {role.can.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="rules-heading">
            <h2 id="rules-heading" className="text-2xl font-semibold tracking-tight">
              Quy tắc đăng ký
            </h2>
            <ul className="mt-4 max-w-prose list-disc space-y-2 pl-5">
              <li>Gửi đăng ký chưa có nghĩa là được nhận. Giảng viên xem xét rồi phản hồi từng đăng ký.</li>
              <li>Mỗi đề tài có số sinh viên tối đa. Khi nhận đủ, đề tài tự đóng và không nhận đăng ký mới.</li>
              <li>Giảng viên chỉ thấy thông tin liên hệ của sinh viên đăng ký vào đề tài của chính mình.</li>
            </ul>
          </section>

          <section aria-labelledby="limits-heading">
            <h2 id="limits-heading" className="text-2xl font-semibold tracking-tight">
              Giới hạn hiện tại
            </h2>
            <ul className="mt-4 max-w-prose list-disc space-y-2 pl-5 text-muted-foreground">
              {LIMITS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-lg border bg-card p-5">
            <h2 className="text-lg font-semibold">Bắt đầu</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Xem đề tài không cần tài khoản. Khi muốn đăng ký, bạn tạo tài khoản sinh viên trong một phút.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Button asChild>
                <Link href="/topics">Xem kho đề tài</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/register">Tạo tài khoản sinh viên</Link>
              </Button>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Sản phẩm học tập của môn Phát triển ứng dụng web (PHY10615), không phải hệ thống chính thức của
            Trường hay Khoa.
          </p>
        </aside>
      </div>
    </div>
  );
}
