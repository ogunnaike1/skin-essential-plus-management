"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, CalendarDays, CreditCard, X, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface Notification {
  id: string;
  type: "booking" | "payment";
  title: string;
  description: string;
  href: string;
  createdAt: string;
  read: boolean;
}

function buildNotifications(bookings: Record<string, unknown>[], payments: Record<string, unknown>[]): Notification[] {
  const notes: Notification[] = [];

  for (const b of bookings.slice(0, 8)) {
    notes.push({
      id: `b-${b.id}`,
      type: "booking",
      title: "Pending Booking",
      description: `${(b.client as { name?: string })?.name ?? "A client"} — ${(b.service as { name?: string })?.name ?? "service"}`,
      href: "/bookings",
      createdAt: String(b.createdAt ?? b.date ?? ""),
      read: false,
    });
  }

  for (const p of payments.filter((p) => p.status === "PENDING").slice(0, 8)) {
    notes.push({
      id: `p-${p.id}`,
      type: "payment",
      title: "Payment Pending",
      description: `${(p.client as { name?: string })?.name ?? "Client"} — ₦${Number(p.amount).toLocaleString()}`,
      href: "/payments",
      createdAt: String(p.createdAt ?? ""),
      read: false,
    });
  }

  return notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [read, setRead] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch on mount
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/bookings?status=PENDING").then((r) => r.json()).catch(() => []),
      fetch("/api/payments").then((r) => r.json()).catch(() => []),
    ]).then(([bookings, payments]) => {
      setNotifications(buildNotifications(
        Array.isArray(bookings) ? bookings : [],
        Array.isArray(payments) ? payments : [],
      ));
    }).finally(() => setLoading(false));
  }, []);

  const unread = notifications.filter((n) => !read.has(n.id)).length;

  const markAllRead = () => setRead(new Set(notifications.map((n) => n.id)));

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg text-[#A0AEC0] hover:bg-[#F5F7FA] dark:hover:bg-[#1A2535] hover:text-[#1A202C] dark:hover:text-white transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-12 w-80 rounded-2xl border border-[#A0AEC0]/20 bg-white dark:bg-[#0F1923] shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#A0AEC0]/15">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#1A202C] dark:text-white">Notifications</h3>
              {unread > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-semibold">
                  {unread} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-[#0346A0] hover:underline"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-[#F5F7FA] dark:hover:bg-[#1A2535] text-[#A0AEC0]">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#A0AEC0]/10">
            {loading ? (
              <div className="py-10 text-center text-sm text-[#A0AEC0]">Loading…</div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-[#A0AEC0]">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No notifications
              </div>
            ) : (
              notifications.map((n) => {
                const isRead = read.has(n.id);
                return (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => { setRead((r) => new Set([...r, n.id])); setOpen(false); }}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-[#F5F7FA] dark:hover:bg-[#1A2535] transition-colors ${isRead ? "opacity-50" : ""}`}
                  >
                    <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                      n.type === "booking"
                        ? "bg-blue-100 dark:bg-blue-900/30 text-[#0346A0]"
                        : "bg-orange-100 dark:bg-orange-900/30 text-orange-500"
                    }`}>
                      {n.type === "booking"
                        ? <CalendarDays className="w-3.5 h-3.5" />
                        : <CreditCard className="w-3.5 h-3.5" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-[#1A202C] dark:text-white">{n.title}</p>
                        {!isRead && <span className="w-1.5 h-1.5 rounded-full bg-[#0346A0] shrink-0" />}
                      </div>
                      <p className="text-xs text-[#718096] truncate mt-0.5">{n.description}</p>
                      {n.createdAt && (
                        <p className="text-[10px] text-[#A0AEC0] mt-0.5">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-[#A0AEC0]/15 text-center">
              <Link href="/bookings" onClick={() => setOpen(false)} className="text-xs text-[#0346A0] hover:underline font-medium">
                View all bookings →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
