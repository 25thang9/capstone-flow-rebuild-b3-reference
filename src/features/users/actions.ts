"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Role } from "@/generated/prisma/enums";
import { type ActionState, failure, success } from "@/lib/action-state";
import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { ROLE_LABEL } from "@/lib/roles";

import { ROLE_CHANGE_BLOCK_MESSAGE, checkCanChangeRole } from "./rules";

const roleSchema = z.enum(Role, { error: "Vai trò không hợp lệ." });

/** Quản trị viên đổi vai trò của một người dùng. */
export async function changeRoleAction(
  userId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireRole("ADMIN");

  const parsed = roleSchema.safeParse(String(formData.get("role") ?? ""));
  if (!parsed.success) return failure("Vai trò không hợp lệ.");
  const nextRole = parsed.data;

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true, _count: { select: { topics: true } } },
  });
  if (!target) return failure("Không tìm thấy người dùng.");

  const block = checkCanChangeRole({
    actorId: admin.id,
    target: { id: target.id, role: target.role, topicCount: target._count.topics },
    nextRole,
  });
  if (block) return failure(ROLE_CHANGE_BLOCK_MESSAGE[block]);

  await prisma.user.update({ where: { id: userId }, data: { role: nextRole } });

  revalidatePath("/", "layout");
  return success(`${target.name} hiện là ${ROLE_LABEL[nextRole].toLowerCase()}.`);
}
