"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@/generated/prisma/client";
import { checkTopicCapacity } from "@/features/registrations/rules";
import { type ActionState, failure, formValues, success, validationFailure } from "@/lib/action-state";
import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

import { readTopicForm, topicSchema } from "./schema";

const CAPACITY_MESSAGE = {
  BELOW_ACCEPTED: "Số sinh viên không được nhỏ hơn số đã nhận.",
  OPEN_WHILE_FULL: "Đề tài đã nhận đủ sinh viên. Hãy tăng số lượng trước khi mở lại.",
} as const;

function isMissingRelation(error: unknown): boolean {
  // P2003: khoá ngoại không tồn tại · P2025: bản ghi cần connect không tồn tại.
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2003" || error.code === "P2025")
  );
}

export async function createTopicAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole("LECTURER");

  const parsed = topicSchema.safeParse(readTopicForm(formData));
  if (!parsed.success) return validationFailure(parsed.error, formData);
  const { tagIds, ...data } = parsed.data;

  try {
    await prisma.topic.create({
      data: {
        ...data,
        lecturerId: user.id,
        tags: { connect: tagIds.map((id) => ({ id })) },
      },
    });
  } catch (error) {
    if (isMissingRelation(error)) {
      return failure("Bộ môn hoặc thẻ vừa chọn không còn tồn tại. Hãy tải lại trang.", formData);
    }
    throw error;
  }

  revalidatePath("/", "layout");
  return success("Đã đăng đề tài.");
}

export async function updateTopicAction(
  topicId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("LECTURER");

  const parsed = topicSchema.safeParse(readTopicForm(formData));
  if (!parsed.success) return validationFailure(parsed.error, formData);
  const { tagIds, ...data } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const acceptedCount = await tx.registration.count({
        where: { topicId, status: "ACCEPTED", topic: { lecturerId: user.id } },
      });
      const block = checkTopicCapacity({ ...data, acceptedCount });
      if (block) return { kind: "blocked", block } as const;

      // updateMany + where { id, lecturerId }: nếu đề tài không phải của mình thì count = 0.
      const { count } = await tx.topic.updateMany({
        where: { id: topicId, lecturerId: user.id },
        data,
      });
      if (count === 0) return { kind: "notFound" } as const;

      // Quan hệ n–n không cập nhật được bằng updateMany nên set lại ở bước riêng.
      await tx.topic.update({
        where: { id: topicId },
        data: { tags: { set: tagIds.map((id) => ({ id })) } },
      });
      return { kind: "done" } as const;
    });

    if (result.kind === "notFound") return failure("Không tìm thấy đề tài thuộc quyền của bạn.", formData);
    if (result.kind === "blocked") {
      return {
        status: "error",
        message: CAPACITY_MESSAGE[result.block],
        fieldErrors: {
          [result.block === "BELOW_ACCEPTED" ? "maxStudents" : "status"]: [CAPACITY_MESSAGE[result.block]],
        },
        values: formValues(formData),
      };
    }
  } catch (error) {
    if (isMissingRelation(error)) {
      return failure("Bộ môn hoặc thẻ vừa chọn không còn tồn tại. Hãy tải lại trang.", formData);
    }
    throw error;
  }

  revalidatePath("/", "layout");
  return success("Đã lưu thay đổi.");
}

/** Mở / đóng nhận đăng ký. */
export async function setTopicStatusAction(topicId: string, status: "OPEN" | "CLOSED"): Promise<ActionState> {
  const user = await requireRole("LECTURER");

  const topic = await prisma.topic.findFirst({
    where: { id: topicId, lecturerId: user.id },
    select: {
      maxStudents: true,
      _count: { select: { registrations: { where: { status: "ACCEPTED" } } } },
    },
  });
  if (!topic) return failure("Không tìm thấy đề tài thuộc quyền của bạn.");

  const block = checkTopicCapacity({
    status,
    maxStudents: topic.maxStudents,
    acceptedCount: topic._count.registrations,
  });
  if (block) return failure(CAPACITY_MESSAGE[block]);

  await prisma.topic.updateMany({ where: { id: topicId, lecturerId: user.id }, data: { status } });

  revalidatePath("/", "layout");
  return success(status === "OPEN" ? "Đã mở nhận đăng ký." : "Đã đóng nhận đăng ký.");
}

export async function deleteTopicAction(topicId: string): Promise<ActionState> {
  const user = await requireRole("LECTURER");

  // Không cho xoá đề tài đã nhận sinh viên: xoá sẽ kéo theo toàn bộ đăng ký (onDelete: Cascade).
  const { count } = await prisma.topic.deleteMany({
    where: {
      id: topicId,
      lecturerId: user.id,
      registrations: { none: { status: "ACCEPTED" } },
    },
  });

  if (count === 0) {
    const stillThere = await prisma.topic.count({ where: { id: topicId, lecturerId: user.id } });
    return failure(
      stillThere
        ? "Đề tài đã nhận sinh viên nên không xoá được. Bạn có thể đóng đề tài thay vì xoá."
        : "Không tìm thấy đề tài thuộc quyền của bạn.",
    );
  }

  revalidatePath("/", "layout");
  return success("Đã xoá đề tài.");
}
