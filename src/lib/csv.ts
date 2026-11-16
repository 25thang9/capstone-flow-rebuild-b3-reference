type Cell = string | number | null | undefined;

/**
 * Chuẩn hoá một ô CSV:
 * - Bọc trong dấu nháy kép khi có dấu phẩy, nháy kép hoặc xuống dòng.
 * - Ô bắt đầu bằng = + - @ được thêm dấu ' phía trước để Excel không coi là công thức
 *   (chống CSV injection, vì nội dung do sinh viên tự nhập).
 */
export function escapeCsvCell(value: Cell): string {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  if (/[",\r\n]/.test(text)) text = `"${text.replace(/"/g, '""')}"`;
  return text;
}

/** Ghép bảng thành chuỗi CSV. BOM ở đầu giúp Excel đọc đúng tiếng Việt (UTF-8). */
export function toCsv(header: string[], rows: Cell[][]): string {
  const lines = [header, ...rows].map((row) => row.map(escapeCsvCell).join(","));
  return `﻿${lines.join("\r\n")}\r\n`;
}
