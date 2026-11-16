import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Không tìm thấy trang" };

export default function NotFound() {
  return (
    <div className="container-page py-20">
      <p className="font-heading text-6xl font-semibold text-primary">404</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Không tìm thấy trang</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        Đường dẫn không tồn tại, hoặc đề tài bạn tìm đã bị xoá.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/topics">Xem kho đề tài</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Về trang chủ</Link>
        </Button>
      </div>
    </div>
  );
}
