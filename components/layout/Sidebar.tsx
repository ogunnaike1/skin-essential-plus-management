"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, CalendarDays, Calendar, Scissors,
  CreditCard, UserCog, Settings, LogOut, ChevronLeft, ChevronRight, ShoppingBag,
} from "lucide-react";
import { signOut } from "next-auth/react";
import logoSrc from "@/public/images/logo.png";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getInitials } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/clients", icon: Users, label: "Clients" },
  { href: "/bookings", icon: CalendarDays, label: "Bookings" },
  { href: "/calendar", icon: Calendar, label: "Calendar" },
  { href: "/services", icon: Scissors, label: "Services" },
  { href: "/shop", icon: ShoppingBag, label: "Shop" },
  { href: "/payments", icon: CreditCard, label: "Payments" },
];

const adminItems = [
  { href: "/staff", icon: UserCog, label: "Staff" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  user: { name?: string | null; email?: string | null; image?: string | null; role?: string };
}

export function Sidebar({ collapsed, onToggle, user }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative flex flex-col h-full bg-white dark:bg-[#0F1923] border-r border-[#A0AEC0]/20 dark:border-[#2D3748] overflow-hidden shrink-0 z-20"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 gap-3 shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-[#A0AEC0]/20 shrink-0 p-1">
          <img src={logoSrc.src} alt="Skin Essential Plus" className="w-full h-full object-contain" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <p className="text-sm font-bold text-[#0346A0] leading-tight whitespace-nowrap">Skin Essential</p>
              <p className="text-xs text-[#A0AEC0] whitespace-nowrap">Management</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3">
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} active={isActive(item.href)} />
          ))}

          <div className="mt-3 mb-1 px-2">
            {!collapsed && <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A0AEC0]">Admin</p>}
            {collapsed && <Separator className="my-1" />}
          </div>

          {adminItems.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} active={isActive(item.href)} />
          ))}
        </nav>
      </ScrollArea>

      <Separator />

      {/* User + Logout */}
      <div className="p-3 flex items-center gap-3">
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarImage src={user?.image ?? ""} />
          <AvatarFallback className="text-xs">{getInitials(user?.name ?? "U")}</AvatarFallback>
        </Avatar>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 min-w-0"
            >
              <p className="text-sm font-medium text-[#1A202C] dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-[#A0AEC0] truncate">{user?.role}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {!collapsed && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="p-1.5 rounded-lg text-[#A0AEC0] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-[#1A2535] border border-[#A0AEC0]/30 shadow-sm text-[#A0AEC0] hover:text-[#0346A0] transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  );
}

function NavLink({
  item,
  collapsed,
  active,
}: {
  item: { href: string; icon: React.ElementType; label: string };
  collapsed: boolean;
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors group",
        active
          ? "bg-[#0346A0]/10 text-[#0346A0] dark:bg-[#0346A0]/20 dark:text-blue-400"
          : "text-[#718096] hover:bg-[#F5F7FA] hover:text-[#1A202C] dark:hover:bg-[#1A2535] dark:hover:text-white"
      )}
      title={collapsed ? item.label : undefined}
    >
      {active && (
        <motion.div
          layoutId="activeNav"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-[#0346A0]"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <Icon className={cn("w-5 h-5 shrink-0", active ? "text-[#0346A0]" : "")} />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            className="whitespace-nowrap"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
