import { z } from "zod";

import { slugify } from "@/lib/text";

// Bộ môn và thẻ có cùng cấu trúc: một tên duy nhất, slug sinh từ tên.
export const catalogNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tên cần ít nhất 2 ký tự.")
    .max(60, "Tên tối đa 60 ký tự.")
    .refine((value) => slugify(value).length > 0, "Tên cần có ít nhất một chữ cái hoặc chữ số."),
});

export type CatalogKind = "department" | "tag";

export const CATALOG_LABEL: Record<CatalogKind, string> = {
  department: "bộ môn",
  tag: "thẻ",
};
