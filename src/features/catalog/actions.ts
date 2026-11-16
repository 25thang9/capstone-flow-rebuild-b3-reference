"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@/generated/prisma/client";
import { type ActionState, failure, success, validationFailure } from "@/lib/action-state";
import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/text";

import { CATALOG_LABEL, type CatalogKind, catalogNameSchema } from "./schema";

function isPrismaError(error: unknown, code: string): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
}

function readName(formData: FormData) {
  return catalogNameSchema.safeParse({ name: String(formData.get("name") ?? "") });
}

/** Thêm bộ môn hoặc thẻ. Chỉ quản trị viên. */
export async function createCatalogItemAction(
  kind: CatalogKind,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("ADMIN");

  const parsed = readName(formData);
  if (!parsed.success) return validationFailure(parsed.error, formData);
  const data = { name: parsed.data.name, slug: slugify(parsed.data.name) };

  try {
    if (kind === "department") await prisma.department.create({ data });
    else await prisma.tag.create({ data });
  } catch (error) {
    if (isPrismaError(error, "P2002")) {
      return {
        status: "error",
        message: `Đã có ${CATALOG_LABEL[kind]} trùng tên.`,
        fieldErrors: { name: [`Đã có ${CATALOG_LABEL[kind]} trùng tên.`] },
        values: { name: parsed.data.name },
      };
    }
    throw error;
  }

  revalidatePath("/", "layout");
  return success(`Đã thêm ${CATALOG_LABEL[kind]} “${data.name}”.`);
}

export async function renameCatalogItemAction(
  kind: CatalogKind,
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("ADMIN");

  const parsed = readName(formData);
  if (!parsed.success) return validationFailure(parsed.error, formData);
  const data = { name: parsed.data.name, slug: slugify(parsed.data.name) };

  try {
    const { count } =
      kind === "department"
        ? await prisma.department.updateMany({ where: { id }, data })
        : await prisma.tag.updateMany({ where: { id }, data });
    if (count === 0) return failure(`Không tìm thấy ${CATALOG_LABEL[kind]}.`, formData);
  } catch (error) {
    if (isPrismaError(error, "P2002")) {
      return {
        status: "error",
        message: `Đã có ${CATALOG_LABEL[kind]} trùng tên.`,
        fieldErrors: { name: [`Đã có ${CATALOG_LABEL[kind]} trùng tên.`] },
        values: { name: parsed.data.name },
      };
    }
    throw error;
  }

  revalidatePath("/", "layout");
  return success("Đã đổi tên.");
}

export async function deleteCatalogItemAction(kind: CatalogKind, id: string): Promise<ActionState> {
  await requireRole("ADMIN");

  if (kind === "department") {
    // Bộ môn đang có đề tài thì không xoá (đề tài bắt buộc thuộc một bộ môn).
    const { count } = await prisma.department.deleteMany({ where: { id, topics: { none: {} } } });
    if (count === 0) {
      return failure("Bộ môn đang có đề tài nên không xoá được. Hãy chuyển các đề tài sang bộ môn khác trước.");
    }
  } else {
    // Xoá thẻ chỉ gỡ thẻ khỏi các đề tài, không xoá đề tài.
    const { count } = await prisma.tag.deleteMany({ where: { id } });
    if (count === 0) return failure("Không tìm thấy thẻ.");
  }

  revalidatePath("/", "layout");
  return success(`Đã xoá ${CATALOG_LABEL[kind]}.`);
}
