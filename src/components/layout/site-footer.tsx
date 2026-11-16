import Link from "next/link";

const linkClass = "text-white/75 underline-offset-4 transition-colors hover:text-white hover:underline";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-brand text-brand-foreground">
      <div className="container-page grid gap-10 py-12 text-sm sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-heading text-xl font-semibold">CapstoneFlow</p>
          <p className="mt-3 max-w-sm text-white/75">
            Kho đề tài đồ án và kênh đăng ký giữa sinh viên với giảng viên, do nhóm sinh viên xây dựng trong
            môn Phát triển ứng dụng web (PHY10615).
          </p>
        </div>

        <nav aria-label="Liên kết cuối trang">
          <p className="font-medium">Điều hướng</p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/topics" className={linkClass}>
                Kho đề tài
              </Link>
            </li>
            <li>
              <Link href="/about" className={linkClass}>
                Giới thiệu và hướng dẫn
              </Link>
            </li>
            <li>
              <Link href="/login" className={linkClass}>
                Đăng nhập
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <p className="font-medium">Lưu ý</p>
          <p className="mt-3 text-white/75">
            Đây là sản phẩm học tập, không phải hệ thống chính thức của Trường hay Khoa.
          </p>
          <a href="https://phys.hcmus.edu.vn/vi" target="_blank" rel="noreferrer" className={`mt-3 inline-block ${linkClass}`}>
            Website Khoa Vật lý – Vật lý Kỹ thuật
            <span className="sr-only"> (mở trong thẻ mới)</span>
          </a>
        </div>
      </div>
      <div className="border-t border-white/15">
        <p className="container-page py-4 text-xs text-white/60">
          Khoa Vật lý – Vật lý Kỹ thuật · Trường ĐH Khoa học Tự nhiên, ĐHQG-HCM
        </p>
      </div>
    </footer>
  );
}
