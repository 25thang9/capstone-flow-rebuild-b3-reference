"use client";

import { useTransition } from "react";
import Link from "next/link";
import { ChevronDownIcon, LogOutIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/features/auth/actions";
import { initials } from "@/lib/text";

type UserMenuProps = {
  name: string;
  email: string;
  roleLabel: string;
  workspace: { href: string; label: string };
  mobile?: boolean;
};

export function UserMenu({ name, email, roleLabel, workspace, mobile = false }: UserMenuProps) {
  const [signingOut, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={mobile ? "w-full justify-start gap-2 px-3" : "gap-2 px-1.5"}
          aria-label={`Tài khoản: ${name}`}
        >
          <span
            aria-hidden="true"
            className="flex size-7 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground"
          >
            {initials(name)}
          </span>
          <span className={mobile ? "max-w-40 truncate" : "hidden max-w-36 truncate lg:inline"}>{name}</span>
          <ChevronDownIcon className="text-muted-foreground" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <span className="block truncate font-medium text-foreground">{name}</span>
          <span className="block truncate text-xs text-muted-foreground">{email}</span>
          <span className="mt-1 block text-xs text-muted-foreground">Vai trò: {roleLabel}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={workspace.href}>{workspace.label}</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={signingOut}
          onSelect={(event) => {
            event.preventDefault();
            startTransition(() => signOutAction());
          }}
        >
          <LogOutIcon aria-hidden="true" />
          {signingOut ? "Đang đăng xuất…" : "Đăng xuất"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
