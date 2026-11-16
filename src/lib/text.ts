const DATE_FORMAT = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Ho_Chi_Minh",
});

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Ho_Chi_Minh",
});

// Luôn ghi rõ múi giờ: máy chủ Vercel chạy giờ UTC, nếu không ngày sẽ lệch so với Việt Nam.
export function formatDate(date: Date | string): string {
  return DATE_FORMAT.format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return DATE_TIME_FORMAT.format(new Date(date));
}

/** Chuyển tên tiếng Việt thành slug dùng trên URL: "Vật lý Tin học" → "vat-ly-tin-hoc". */
export function slugify(input: string): string {
  return input
    .replace(/\+/g, " plus ")
    .replace(/#/g, " sharp ")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Lấy tối đa hai chữ cái đầu của tên để làm ảnh đại diện: "Trần Minh Khoa" → "TK". */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}
