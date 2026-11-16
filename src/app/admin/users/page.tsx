import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchIcon, UsersIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { FilterForm } from "@/components/shared/filter-form";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationNav } from "@/components/shared/pagination-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Role } from "@/generated/prisma/enums";
import { changeRoleAction } from "@/features/users/actions";
import { RoleForm } from "@/features/users/components/role-form";
import { parseUserFilters, userFilterParams } from "@/features/users/filters";
import { listUsers } from "@/features/users/queries";
import { requireRole } from "@/lib/dal";
import { ROLE_LABEL } from "@/lib/roles";
import { formatDate } from "@/lib/text";

export const metadata: Metadata = { title: "Người dùng" };

export default function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  return (
    <>
      <PageHeader
        title="Người dùng"
        description="Tài khoản mới mặc định là sinh viên. Cấp vai trò giảng viên cho tài khoản của thầy cô tại đây."
      />
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <Users searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Users({ searchParams }: Pick<PageProps<"/admin/users">, "searchParams">) {
  const admin = await requireRole("ADMIN");
  const filters = parseUserFilters(await searchParams);
  const { users, pagination } = await listUsers(filters);

  return (
    <>
      <FilterForm pathname="/admin/users" defaults={{ role: "ALL" }} className="flex flex-wrap items-end gap-3">
        <div className="grid min-w-56 flex-1 gap-1.5 sm:max-w-sm">
          <Label htmlFor="user-q">Họ tên hoặc email</Label>
          <Input id="user-q" name="q" type="search" defaultValue={filters.q} maxLength={100} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="user-role">Vai trò</Label>
          <NativeSelect id="user-role" name="role" defaultValue={filters.role}>
            <NativeSelectOption value="ALL">Tất cả</NativeSelectOption>
            {Object.values(Role).map((role) => (
              <NativeSelectOption key={role} value={role}>
                {ROLE_LABEL[role]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <Button type="submit" variant="outline">
          <SearchIcon aria-hidden="true" />
          Lọc
        </Button>
      </FilterForm>

      {users.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={UsersIcon} title="Không có người dùng khớp bộ lọc" />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border bg-card">
          <Table className="min-w-[44rem]">
            <TableHeader>
              <TableRow>
                <TableHead>Người dùng</TableHead>
                <TableHead className="text-right">Đề tài</TableHead>
                <TableHead className="text-right">Đăng ký</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Vai trò</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{user._count.topics}</TableCell>
                  <TableCell className="text-right tabular-nums">{user._count.registrations}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    {user.id === admin.id ? (
                      <span className="text-sm text-muted-foreground">{ROLE_LABEL[user.role]} (bạn)</span>
                    ) : (
                      <RoleForm
                        // key đổi theo vai trò để ô chọn nhận giá trị mới sau khi lưu.
                        key={user.role}
                        action={changeRoleAction.bind(null, user.id)}
                        userName={user.name}
                        currentRole={user.role}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <PaginationNav pagination={pagination} pathname="/admin/users" params={userFilterParams(filters)} />
    </>
  );
}
