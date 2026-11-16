import { Role } from "@/generated/prisma/enums";
import { parsePage } from "@/lib/pagination";

type SearchParams = Record<string, string | string[] | undefined>;

export type UserFilters = { q: string; role: Role | "ALL"; page: number };

function first(params: SearchParams, key: string): string {
  const value = params[key];
  return ((Array.isArray(value) ? value[0] : value) ?? "").trim();
}

/** Bộ lọc trang Người dùng: /admin/users?q=&role=LECTURER&page=2 */
export function parseUserFilters(params: SearchParams): UserFilters {
  const role = first(params, "role").toUpperCase();
  return {
    q: first(params, "q").slice(0, 100),
    role: role in Role ? (role as Role) : "ALL",
    page: parsePage(params.page),
  };
}

export function userFilterParams(filters: UserFilters, page = filters.page) {
  return { q: filters.q, role: filters.role === "ALL" ? "" : filters.role, page };
}
