"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CalendarDays, CreditCard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/clients", icon: Users, label: "Clients" },
  { href: "/bookings", icon: CalendarDays, label: "Bookings" },
  { href: "/payments", icon: CreditCard, label: "Payments" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-16 bg-white dark:bg-[#0F1923] border-t border-[#A0AEC0]/20 dark:border-[#2D3748] lg:hidden">
      {mobileNav.map(({ href, icon: Icon, label }) => {
        const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors",
              active ? "text-[#0346A0]" : "text-[#A0AEC0]"
            )}
          >
            <Icon className={cn("w-5 h-5", active && "text-[#0346A0]")} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
