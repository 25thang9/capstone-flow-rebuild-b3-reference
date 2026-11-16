import { parsePage } from "@/lib/pagination";

/**
 * Bộ lọc của Kho đề tài nằm hoàn toàn trên URL (searchParams):
 * /topics?q=esp32&department=vat-ly-dien-tu&tag=iot&status=ALL&page=2
 * → chia sẻ link là chia sẻ luôn kết quả lọc, và nút Back của trình duyệt hoạt động đúng.
 */

export type SearchParams = Record<string, string | string[] | undefined>;

export type TopicStatusFilter = "OPEN" | "CLOSED" | "ALL";

export type TopicFilters = {
  q: string;
  department: string;
  tag: string;
  status: TopicStatusFilter;
  page: number;
};

const SLUG_PATTERN = /^[a-z0-9-]{1,60}$/;

function first(params: SearchParams, key: string): string {
  const value = params[key];
  return ((Array.isArray(value) ? value[0] : value) ?? "").trim();
}

/** Đọc và làm sạch searchParams. Giá trị lạ bị bỏ qua thay vì gây lỗi. */
export function parseTopicFilters(params: SearchParams): TopicFilters {
  const status = first(params, "status").toUpperCase();
  const department = first(params, "department");
  const tag = first(params, "tag");

  return {
    q: first(params, "q").slice(0, 100),
    department: SLUG_PATTERN.test(department) ? department : "",
    tag: SLUG_PATTERN.test(tag) ? tag : "",
    status: status === "CLOSED" || status === "ALL" ? status : "OPEN",
    page: parsePage(params.page),
  };
}

export function hasActiveFilters(filters: TopicFilters): boolean {
  return Boolean(filters.q || filters.department || filters.tag || filters.status !== "OPEN");
}

/** Tham số để dựng lại URL (dùng với buildHref). Giá trị mặc định được lược bỏ. */
export function topicFilterParams(filters: TopicFilters, page = filters.page) {
  return {
    q: filters.q,
    department: filters.department,
    tag: filters.tag,
    status: filters.status === "OPEN" ? "" : filters.status,
    page,
  };
}

// ───────────── Khu giảng viên: /lecturer/topics?q=&status=&page= ─────────────

export type LecturerTopicFilters = { q: string; status: TopicStatusFilter; page: number };

export function parseLecturerTopicFilters(params: SearchParams): LecturerTopicFilters {
  const status = first(params, "status").toUpperCase();
  return {
    q: first(params, "q").slice(0, 100),
    status: status === "OPEN" || status === "CLOSED" ? status : "ALL",
    page: parsePage(params.page),
  };
}

export function lecturerTopicFilterParams(filters: LecturerTopicFilters, page = filters.page) {
  return { q: filters.q, status: filters.status === "ALL" ? "" : filters.status, page };
}
