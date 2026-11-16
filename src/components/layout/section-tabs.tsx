import { Suspense } from "react";

import { NavLink } from "./nav-link";

export type SectionTab = {
  href: string;
  label: string;
  exact?: boolean;
  /** Phần phụ sau nhãn, ví dụ số đăng ký đang chờ (thường là một component async). */
  badge?: React.ReactNode;
};

/** Thanh tab của khu giảng viên / quản trị, nằm ngay dưới header chung. */
export function SectionTabs({ label, tabs }: { label: string; tabs: SectionTab[] }) {
  const render = (staticOnly: boolean) =>
    tabs.map((tab) => (
      <NavLink
        key={tab.href}
        href={tab.href}
        label={tab.label}
        exact={tab.exact}
        staticOnly={staticOnly}
        className="h-11 sm:h-11"
      >
        {tab.badge ? <Suspense fallback={null}>{tab.badge}</Suspense> : null}
      </NavLink>
    ));

  return (
    <div className="border-b bg-card">
      <nav aria-label={label} className="container-page flex gap-1 overflow-x-auto">
        <Suspense fallback={render(true)}>{render(false)}</Suspense>
      </nav>
    </div>
  );
}
