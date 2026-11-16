import { SectionTabs } from "@/components/layout/section-tabs";

// Quyền quản trị được kiểm tra trong từng hàm truy vấn và Server Action (requireRole("ADMIN")),
// không dựa vào layout.
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <SectionTabs
        label="Khu quản trị"
        tabs={[
          { href: "/admin", label: "Tổng quan", exact: true },
          { href: "/admin/users", label: "Người dùng" },
          { href: "/admin/catalog", label: "Danh mục" },
        ]}
      />
      <div className="container-page py-8">{children}</div>
    </>
  );
}
