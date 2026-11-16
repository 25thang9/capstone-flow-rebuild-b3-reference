import type { Role } from "@/generated/prisma/enums";

export type RoleChangeBlock = "SELF" | "SAME_ROLE" | "HAS_TOPICS";

export const ROLE_CHANGE_BLOCK_MESSAGE: Record<RoleChangeBlock, string> = {
  SELF: "Bạn không thể tự đổi vai trò của chính mình.",
  SAME_ROLE: "Người dùng đã có vai trò này.",
  HAS_TOPICS: "Giảng viên đang có đề tài. Hãy xoá hoặc chuyển đề tài trước khi đổi vai trò.",
};

/**
 * Luật đổi vai trò (chỉ quản trị viên gọi được):
 * - Không tự đổi vai trò của mình → hệ thống luôn còn ít nhất một quản trị viên.
 * - Không hạ vai trò giảng viên còn đề tài → không để lại đề tài "mồ côi" không ai quản lý.
 */
export function checkCanChangeRole(input: {
  actorId: string;
  target: { id: string; role: Role; topicCount: number };
  nextRole: Role;
}): RoleChangeBlock | null {
  if (input.actorId === input.target.id) return "SELF";
  if (input.target.role === input.nextRole) return "SAME_ROLE";
  if (input.target.role === "LECTURER" && input.target.topicCount > 0) return "HAS_TOPICS";
  return null;
}
