"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
  children?: React.ReactNode;
}

export function NavLink({ href, className, activeClassName, children, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className={cn(className, isActive && activeClassName)} {...props}>
      {children}
    </Link>
  );
}
