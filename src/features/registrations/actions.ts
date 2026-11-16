"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@/generated/prisma/client";
import { type ActionState, failure, success, validationFailure } from "@/lib/action-state";
import { requireRole } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

import {
  REGISTER_BLOCK_MESSAGE,
  RESPOND_BLOCK_MESSAGE,
  checkCanRegister,
  checkCanRespond,
  willFillTopic,
} from "./rules";
import { registrationSchema, respondSchema } from "./schema";

function isPrismaError(error: unknown, code: string): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
}

/** Sinh viên gửi đăng ký một đề tài. */
export async function registerAction(
  topicId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("STUDENT");

  const parsed = registrationSchema.safeParse({
    studentCode: String(formData.get("studentCode") ?? ""),
    className: String(formData.get("className") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    message: String(formData.get("message") ?? ""),
  });
  if (!parsed.success) return validationFailure(parsed.error, formData);

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    select: {
      status: true,
      maxStudents: true,
      _count: { select: { registrations: { where: { status: "ACCEPTED" } } } },
      registrations: { where: { studentId: user.id }, select: { id: true } },
    },
  });
  if (!topic) return failure("Đề tài không còn tồn tại.", formData);

  const block = checkCanRegister({
    role: user.role,
    topic: { status: topic.status, maxStudents: topic.maxStudents, acceptedCount: topic._count.registrations },
    alreadyRegistered: topic.registrations.length > 0,
  });
  if (block) return failure(REGISTER_BLOCK_MESSAGE[block], formData);

  try {
    // studentId luôn lấy từ phiên, không nhận từ form.
    await prisma.registration.create({
      data: { ...parsed.data, topicId, studentId: user.id },
    });
  } catch (error) {
    // Hai lần bấm gần như đồng thời: ràng buộc unique (topicId, studentId) chặn bản ghi thứ hai.
    if (isPrismaError(error, "P2002")) return failure(REGISTER_BLOCK_MESSAGE.ALREADY_REGISTERED, formData);
    throw error;
  }

  revalidatePath("/", "layout");
  return success("Đã gửi đăng ký. Giảng viên sẽ phản hồi trong mục “Đăng ký của tôi”.");
}

/** Sinh viên rút đăng ký khi giảng viên chưa phản hồi. */
export async function withdrawAction(registrationId: string): Promise<ActionState> {
  const user = await requireRole("STUDENT");

  const { count } = await prisma.registration.deleteMany({
    where: { id: registrationId, studentId: user.id, status: "PENDING" },
  });
  if (count === 0) {
    return failure("Không rút được: đăng ký không tồn tại hoặc giảng viên đã phản hồi.");
  }

  revalidatePath("/", "layout");
  return success("Đã rút đăng ký.");
}

/** Giảng viên nhận hoặc từ chối một đăng ký thuộc đề tài của mình. */
export async function respondAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole("LECTURER");

  const parsed = respondSchema.safeParse({
    registrationId: String(formData.get("registrationId") ?? ""),
    status: String(formData.get("status") ?? ""),
    lecturerNote: String(formData.get("lecturerNote") ?? ""),
  });
  if (!parsed.success) return validationFailure(parsed.error, formData);
  const { registrationId, status, lecturerNote } = parsed.data;

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const registration = await tx.registration.findFirst({
          where: { id: registrationId, topic: { lecturerId: user.id } },
          select: { status: true, topicId: true, topic: { select: { maxStudents: true } } },
        });
        if (!registration) return { kind: "notFound" } as const;

        const acceptedCount = await tx.registration.count({
          where: { topicId: registration.topicId, status: "ACCEPTED", id: { not: registrationId } },
        });
        const capacity = { maxStudents: registration.topic.maxStudents, acceptedCount };

        const block = checkCanRespond({ current: registration.status, next: status, topic: capacity });
        if (block) return { kind: "blocked", block } as const;

        await tx.registration.update({
          where: { id: registrationId },
          data: { status, lecturerNote, respondedAt: new Date() },
        });

        // Nhận đủ số lượng thì đề tài tự đóng, không nhận thêm đăng ký mới.
        const filled = willFillTopic({ next: status, topic: capacity });
        if (filled) {
          await tx.topic.update({ where: { id: registration.topicId }, data: { status: "CLOSED" } });
        }
        return { kind: "done", filled } as const;
      },
      // Serializable: hai lần "Nhận" đồng thời không thể vượt quá số lượng tối đa.
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    if (result.kind === "notFound") return failure("Không tìm thấy đăng ký thuộc đề tài của bạn.", formData);
    if (result.kind === "blocked") return failure(RESPOND_BLOCK_MESSAGE[result.block], formData);

    revalidatePath("/", "layout");
    if (status === "REJECTED") return success("Đã từ chối đăng ký.");
    return success(
      result.filled ? "Đã nhận sinh viên. Đề tài đủ số lượng nên đã tự đóng." : "Đã nhận sinh viên.",
    );
  } catch (error) {
    // P2034: giao dịch bị huỷ do xung đột ghi đồng thời.
    if (isPrismaError(error, "P2034")) {
      return failure("Có thao tác khác vừa thay đổi dữ liệu. Vui lòng thử lại.", formData);
    }
    throw error;
  }
}
