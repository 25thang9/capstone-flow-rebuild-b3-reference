export const PAGE_SIZE = 8;

export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  /** Số dòng bỏ qua khi truy vấn (Prisma `skip`). */
  skip: number;
  /** Vị trí dòng đầu / cuối đang hiển thị, tính từ 1. Bằng 0 khi không có kết quả. */
  from: number;
  to: number;
  hasPrev: boolean;
  hasNext: boolean;
};

type ParamValue = string | string[] | undefined;

/** Đọc ?page= từ URL. Giá trị rác (chữ, số âm, số thập phân) đều quy về trang 1. */
export function parsePage(value: ParamValue): number {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !/^\d{1,6}$/.test(raw)) return 1;
  return Math.max(1, Number(raw));
}

/** Tính thông tin phân trang; trang vượt quá tổng số trang được kéo về trang cuối. */
export function paginate(total: number, requestedPage: number, pageSize = PAGE_SIZE): Pagination {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, requestedPage), totalPages);
  const skip = (page - 1) * pageSize;
  return {
    page,
    pageSize,
    total,
    totalPages,
    skip,
    from: total === 0 ? 0 : skip + 1,
    to: Math.min(skip + pageSize, total),
    hasPrev: page > 1,
    hasNext: page < totalPages,
  };
}

/** Dãy số trang để hiển thị, ví dụ 1 … 4 5 6 … 12. */
export function pageWindow(current: number, totalPages: number, siblings = 1): (number | "ellipsis")[] {
  const pages = new Set<number>([1, totalPages]);
  for (let page = current - siblings; page <= current + siblings; page++) {
    if (page >= 1 && page <= totalPages) pages.add(page);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];
  sorted.forEach((page, index) => {
    const previous = sorted[index - 1];
    if (previous !== undefined && page - previous === 2) result.push(previous + 1);
    else if (previous !== undefined && page - previous > 2) result.push("ellipsis");
    result.push(page);
  });
  return result;
}

/**
 * Tạo đường dẫn giữ nguyên bộ lọc hiện tại. Tham số rỗng và page=1 được bỏ đi
 * để URL gọn và mỗi trạng thái lọc chỉ có một URL duy nhất.
 */
export function buildHref(
  pathname: string,
  params: Record<string, string | number | null | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === "") continue;
    if (key === "page" && Number(value) <= 1) continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `${pathname}?${query}` : pathname;
}
