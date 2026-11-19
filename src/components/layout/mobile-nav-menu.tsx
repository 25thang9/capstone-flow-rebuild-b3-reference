"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { MenuIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type NavItem = { href: string; label: string };

export function MobileNavMenu({ links, children }: { links: NavItem[]; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <div className="relative lg:hidden">
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        size="icon"
        aria-label={open ? "Đóng menu điều hướng" : "Mở menu điều hướng"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <XIcon aria-hidden="true" /> : <MenuIcon aria-hidden="true" />}
      </Button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border bg-card p-2 shadow-card"
      >
        <nav aria-label="Điều hướng trên màn hình nhỏ" className="flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex h-11 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-2 border-t pt-2">{children}</div>
      </div>
    </div>
  );
}
