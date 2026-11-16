import { Suspense } from "react";
import Link from "next/link";
import { ArrowRightIcon, ArrowUpRightIcon, FileSearchIcon, SearchIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getPublicStats, listDepartmentsWithOpenTopics } from "@/features/stats/queries";
import { TopicList, TopicListSkeleton } from "@/features/topics/components/topic-list";
import { listLatestOpenTopics } from "@/features/topics/queries";

const STEPS = [
  {
    title: "Tìm đề tài",
    body: "Lọc theo bộ môn, thẻ công nghệ hoặc tên giảng viên. Mỗi đề tài ghi rõ mục tiêu, yêu cầu và số chỗ còn lại.",
  },
  {
    title: "Gửi đăng ký",
    body: "Đăng nhập bằng tài khoản sinh viên, điền MSSV và lời nhắn cho giảng viên. Bạn có thể rút lại khi chưa có phản hồi.",
  },
  {
    title: "Nhận phản hồi",
    body: "Giảng viên nhận hoặc từ chối kèm lời nhắn. Kết quả hiển thị trong mục “Đăng ký của tôi”.",
  },
];

/** Độ trễ tăng dần để các khối của hero lần lượt trồi lên thay vì hiện cùng lúc. */
const stagger = (index: number) => ({ animationDelay: `${index * 90}ms` });

// Trang chủ không await dữ liệu ở cấp trang: phần khung (tiêu đề, ô tìm kiếm, hướng dẫn)
// được dựng sẵn và hiện ngay, còn số liệu và danh sách stream vào sau qua <Suspense>.
export default function HomePage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-brand text-brand-foreground">
        {/* Nền trang trí: lưới kẻ mờ dần và một quầng sáng. Ẩn với trình đọc màn hình. */}
        <div
          aria-hidden="true"
          className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_80%_90%_at_85%_10%,black,transparent)]"
        />
        <div
          aria-hidden="true"
          className="absolute -top-40 -right-24 -z-10 size-[34rem] rounded-full bg-[oklch(0.55_0.17_255)] opacity-30 blur-3xl"
        />

        <div className="container-page grid gap-12 py-16 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-center lg:py-24">
          <div>
            <p className="animate-rise inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium">
              <span className="size-1.5 rounded-full bg-[oklch(0.82_0.15_155)]" aria-hidden="true" />
              Kho đề tài đồ án · Học kỳ 1, 2026–2027
            </p>
            <h1
              className="animate-rise mt-5 text-4xl leading-[1.12] font-semibold tracking-tight sm:text-5xl lg:text-[3.5rem]"
              style={stagger(1)}
            >
              Tìm đề tài phù hợp, đăng ký trực tiếp với giảng viên
            </h1>
            <p className="animate-rise mt-5 max-w-xl text-lg text-white/80" style={stagger(2)}>
              Tra cứu đề tài theo bộ môn và công nghệ, gửi đăng ký trực tuyến và theo dõi phản hồi của giảng
              viên ở cùng một nơi.
            </p>

            <form
              action="/topics"
              method="get"
              role="search"
              className="animate-rise mt-8 flex max-w-xl gap-2 rounded-xl bg-white/10 p-1.5 ring-1 ring-white/20 backdrop-blur-sm"
              style={stagger(3)}
            >
              <label htmlFor="home-search" className="sr-only">
                Tìm đề tài theo từ khoá
              </label>
              <Input
                id="home-search"
                name="q"
                type="search"
                maxLength={100}
                placeholder="Ví dụ: ESP32, Monte Carlo, xử lý ảnh…"
                className="h-11 border-transparent bg-white text-slate-900 placeholder:text-slate-500 dark:bg-white"
              />
              <Button type="submit" size="lg" className="h-11 bg-white text-slate-900 hover:bg-white/90">
                <SearchIcon aria-hidden="true" />
                Tìm đề tài
              </Button>
            </form>
            <p className="animate-rise mt-4 text-sm text-white/75" style={stagger(4)}>
              hoặc{" "}
              <Link href="/topics" className="font-medium text-white underline underline-offset-4 hover:no-underline">
                xem toàn bộ kho đề tài
              </Link>
            </p>
          </div>

          <div className="animate-rise" style={stagger(3)}>
            <Suspense fallback={<Skeleton className="h-56 w-full bg-white/10" />}>
              <StatsPanel />
            </Suspense>
          </div>
        </div>
      </section>

      <section className="container-page py-16" aria-labelledby="latest-heading">
        <div className="reveal mb-6 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-link">Mới cập nhật</p>
            <h2 id="latest-heading" className="mt-1 text-3xl font-semibold tracking-tight">
              Đề tài đang nhận sinh viên
            </h2>
          </div>
          <Link
            href="/topics"
            className="group inline-flex items-center gap-1 text-sm font-medium text-link hover:underline"
          >
            Xem tất cả
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
        <Suspense fallback={<TopicListSkeleton count={4} />}>
          <LatestTopics />
        </Suspense>
      </section>

      <section className="border-y bg-card" aria-labelledby="department-heading">
        <div className="container-page py-16">
          <div className="reveal">
            <p className="text-sm font-medium text-link">Duyệt nhanh</p>
            <h2 id="department-heading" className="mt-1 text-3xl font-semibold tracking-tight">
              Tìm theo bộ môn
            </h2>
          </div>
          <Suspense fallback={<Skeleton className="mt-8 h-40 w-full" />}>
            <DepartmentLinks />
          </Suspense>
        </div>
      </section>

      <section className="container-page py-16" aria-labelledby="steps-heading">
        <div className="reveal">
          <p className="text-sm font-medium text-link">Ba bước</p>
          <h2 id="steps-heading" className="mt-1 text-3xl font-semibold tracking-tight">
            Quy trình đăng ký
          </h2>
        </div>
        <ol className="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {STEPS.map((step, index) => (
            <li key={step.title} className="reveal relative">
              {/* Đường nối giữa các bước, chỉ hiện khi ba bước nằm trên một hàng. */}
              {index < STEPS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute top-6 left-16 hidden h-px w-[calc(100%-3rem)] bg-border sm:block"
                />
              ) : null}
              <p
                aria-hidden="true"
                className="flex size-12 items-center justify-center rounded-full bg-brand font-heading text-lg font-semibold text-brand-foreground"
              >
                {index + 1}
              </p>
              <h3 className="mt-4 font-sans text-lg font-semibold">{step.title}</h3>
              <p className="mt-1 text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-page" aria-labelledby="cta-heading">
        <div className="reveal flex flex-wrap items-center justify-between gap-6 rounded-xl bg-secondary px-6 py-8 sm:px-10">
          <div>
            <h2 id="cta-heading" className="text-2xl font-semibold tracking-tight">
              Sẵn sàng chọn đề tài?
            </h2>
            <p className="mt-1 max-w-xl text-muted-foreground">
              Gửi đăng ký chưa phải là được nhận. Đề tài tự đóng khi giảng viên đã nhận đủ sinh viên, nên đừng
              để tới phút cuối.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="lg">
              <Link href="/topics">Xem kho đề tài</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/register">Tạo tài khoản</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

async function StatsPanel() {
  const stats = await getPublicStats();
  const rows = [
    { label: "Đề tài đang nhận sinh viên", value: stats.openTopics },
    { label: "Giảng viên hướng dẫn", value: stats.lecturers },
    { label: "Bộ môn tham gia", value: stats.departments },
  ];

  return (
    <dl className="divide-y divide-white/15 rounded-xl bg-white/[0.07] ring-1 ring-white/20 backdrop-blur-sm">
      {rows.map((row) => (
        <div key={row.label} className="flex items-baseline justify-between gap-4 px-6 py-5">
          <dt className="text-white/80">{row.label}</dt>
          <dd className="font-heading text-4xl font-semibold tabular-nums">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

async function LatestTopics() {
  const topics = await listLatestOpenTopics(5);
  if (topics.length === 0) {
    return (
      <EmptyState
        icon={FileSearchIcon}
        title="Chưa có đề tài nào đang nhận sinh viên"
        description="Giảng viên sẽ công bố đề tài khi vào đợt đăng ký. Bạn quay lại sau nhé."
      />
    );
  }
  return <TopicList topics={topics} />;
}

async function DepartmentLinks() {
  const departments = await listDepartmentsWithOpenTopics();
  return (
    <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {departments.map((department) => (
        <li key={department.slug} className="reveal">
          <Link
            href={`/topics?department=${department.slug}`}
            className="group flex items-center justify-between gap-4 rounded-lg border bg-background px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
          >
            <span>
              <span className="block font-medium">{department.name}</span>
              <span className="block text-sm text-muted-foreground tabular-nums">
                {department.openTopics} đề tài đang nhận
              </span>
            </span>
            <ArrowUpRightIcon
              className="size-5 text-muted-foreground transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
              aria-hidden="true"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
