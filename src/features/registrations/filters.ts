import { RegistrationStatus } from "@/generated/prisma/enums";
import { parsePage } from "@/lib/pagination";

type SearchParams = Record<string, string | string[] | undefined>;

export type RegistrationFilters = {
  q: string;
  status: RegistrationStatus | "ALL";
  topicId: string;
  page: number;
};

function first(params: SearchParams, key: string): string {
  const value = params[key];
  return ((Array.isArray(value) ? value[0] : value) ?? "").trim();
}

/** Bộ lọc trang Đăng ký của giảng viên: ?status=PENDING&topic=<id>&q=<tên hoặc MSSV>&page=2 */
export function parseRegistrationFilters(params: SearchParams): RegistrationFilters {
  const status = first(params, "status").toUpperCase();
  const topicId = first(params, "topic");

  return {
    q: first(params, "q").slice(0, 100),
    status: status in RegistrationStatus ? (status as RegistrationStatus) : "ALL",
    topicId: /^[a-z0-9]{1,40}$/.test(topicId) ? topicId : "",
    page: parsePage(params.page),
  };
}

export function registrationFilterParams(filters: RegistrationFilters, page = filters.page) {
  return {
    q: filters.q,
    status: filters.status === "ALL" ? "" : filters.status,
    topic: filters.topicId,
    page,
  };
}
