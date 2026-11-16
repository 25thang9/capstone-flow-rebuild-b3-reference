"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";

import { type ActionState, failure, validationFailure } from "@/lib/action-state";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { homePathFor, safeRedirectPath } from "@/lib/roles";

import { signInSchema, signUpSchema } from "./schema";

export async function signInAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signInSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return validationFailure(parsed.error, formData);

  try {
    await auth.api.signInEmail({ body: parsed.data, headers: await headers() });
  } catch (error) {
    // Không nói rõ sai email hay sai mật khẩu, để người lạ không dò được email nào đã đăng ký.
    if (error instanceof APIError) return failure("Email hoặc mật khẩu không đúng.", formData);
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { role: true },
  });
  // redirect() ném ra một tín hiệu đặc biệt nên phải gọi NGOÀI try/catch.
  redirect(safeRedirectPath(formData.get("next"), homePathFor(user?.role ?? "STUDENT")));
}

export async function signUpAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signUpSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });
  if (!parsed.success) return validationFailure(parsed.error, formData);
  const { name, email, password } = parsed.data;

  try {
    // Vai trò không nằm trong body: tài khoản mới luôn là sinh viên (xem src/lib/auth.ts).
    await auth.api.signUpEmail({ body: { name, email, password }, headers: await headers() });
  } catch (error) {
    if (error instanceof APIError) {
      const taken = error.status === "UNPROCESSABLE_ENTITY" || /exist/i.test(error.message);
      return taken
        ? {
            status: "error",
            message: "Email này đã được đăng ký.",
            fieldErrors: { email: ["Email này đã được đăng ký. Hãy đăng nhập."] },
            values: { name, email },
          }
        : failure("Không tạo được tài khoản. Vui lòng thử lại.", formData);
    }
    throw error;
  }

  redirect(safeRedirectPath(formData.get("next"), "/topics"));
}

export async function signOutAction(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
