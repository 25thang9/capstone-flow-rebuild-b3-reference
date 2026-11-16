import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";
import { SignUpForm } from "@/features/auth/components/auth-forms";
import { AuthShell, resolveAuthNext } from "@/features/auth/components/auth-shell";

export const metadata: Metadata = { title: "Đăng ký tài khoản" };

export default function RegisterPage({ searchParams }: PageProps<"/register">) {
  return (
    <AuthShell
      title="Tạo tài khoản"
      description="Tài khoản mới là tài khoản sinh viên. Giảng viên được quản trị viên của Khoa cấp quyền."
      footer={
        <>
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-medium text-link hover:underline">
            Đăng nhập
          </Link>
        </>
      }
    >
      <Suspense fallback={<Skeleton className="h-80 w-full" />}>
        <SignUp searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function SignUp({ searchParams }: Pick<PageProps<"/register">, "searchParams">) {
  const next = await resolveAuthNext(searchParams);
  return <SignUpForm next={next} />;
}
