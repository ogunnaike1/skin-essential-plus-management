"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Search, Plus, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { NotificationBell } from "@/components/layout/NotificationBell";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/clients": "Clients",
  "/bookings": "Bookings",
  "/calendar": "Calendar",
  "/services": "Services",
  "/shop": "Shop",
  "/payments": "Payments",
  "/staff": "Staff",
  "/settings": "Settings",
};

export function TopBar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const title =
    Object.entries(pageTitles).find(([key]) =>
      pathname === key || (key !== "/dashboard" && pathname.startsWith(key))
    )?.[1] ?? "Dashboard";

  return (
    <>
      <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-[#0F1923] border-b border-[#A0AEC0]/20 dark:border-[#2D3748] shrink-0">
        <h1 className="text-xl font-bold text-[#1A202C] dark:text-white">{title}</h1>

        <div className="flex items-center gap-2">
          {/* Search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-lg border border-[#A0AEC0]/40 text-sm text-[#A0AEC0] hover:border-[#0346A0] hover:text-[#1A202C] dark:hover:text-white transition-colors bg-[#F5F7FA] dark:bg-[#1A2535] dark:border-[#2D3748]"
          >
            <Search className="w-4 h-4" />
            <span>Search…</span>
            <kbd className="text-xs bg-white dark:bg-[#2D3748] border border-[#A0AEC0]/30 rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
          </button>

          {/* Mobile search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="sm:hidden p-2 rounded-lg hover:bg-[#F5F7FA] dark:hover:bg-[#1A2535] text-[#A0AEC0]"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg text-[#A0AEC0] hover:bg-[#F5F7FA] dark:hover:bg-[#1A2535] hover:text-[#1A202C] dark:hover:text-white transition-colors"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}

          {/* Notification bell */}
          <NotificationBell />

          {/* New Booking */}
          <Button size="sm" asChild>
            <Link href="/bookings?new=true">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Booking</span>
            </Link>
          </Button>
        </div>
      </header>

      {/* Global Search Modal */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-0">
            <DialogTitle className="sr-only">Global Search</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#A0AEC0]/20">
            <Search className="w-5 h-5 text-[#A0AEC0] shrink-0" />
            <Input
              placeholder="Search clients, bookings, services…"
              className="border-0 shadow-none focus-visible:ring-0 px-0 text-base"
              autoFocus
            />
          </div>
          <div className="p-4 text-sm text-[#A0AEC0] text-center py-8">
            Start typing to search across your data
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
