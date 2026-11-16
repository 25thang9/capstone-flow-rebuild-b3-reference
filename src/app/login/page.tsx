import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";
import { SignInForm } from "@/features/auth/components/auth-forms";
import { AuthShell, resolveAuthNext } from "@/features/auth/components/auth-shell";

export const metadata: Metadata = { title: "Đăng nhập" };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <AuthShell
      title="Đăng nhập"
      description="Dùng chung cho sinh viên, giảng viên và quản trị viên."
      footer={
        <>
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-medium text-link hover:underline">
            Đăng ký tài khoản sinh viên
          </Link>
        </>
      }
    >
      <Suspense fallback={<Skeleton className="h-56 w-full" />}>
        <SignIn searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function SignIn({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const next = await resolveAuthNext(searchParams);
  return <SignInForm next={next} />;
}
