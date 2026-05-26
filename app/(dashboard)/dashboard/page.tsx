"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays, Users, DollarSign, Clock,
  TrendingUp, Plus, UserPlus, CreditCard,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatTime, getInitials } from "@/lib/utils";
import Link from "next/link";

const revenueData = [
  { day: "Mon", revenue: 45000 }, { day: "Tue", revenue: 72000 },
  { day: "Wed", revenue: 38000 }, { day: "Thu", revenue: 91000 },
  { day: "Fri", revenue: 124000 }, { day: "Sat", revenue: 156000 },
  { day: "Sun", revenue: 87000 },
];

const todayBookings = [
  { id: "1", client: "Amara Okafor", service: "Hair Treatment", time: new Date("2026-05-18T09:00"), status: "CONFIRMED" },
  { id: "2", client: "Ngozi Williams", service: "Facial + Massage", time: new Date("2026-05-18T10:30"), status: "PENDING" },
  { id: "3", client: "Blessing Eze", service: "Manicure", time: new Date("2026-05-18T12:00"), status: "COMPLETED" },
  { id: "4", client: "Chioma Adeyemi", service: "Pedicure", time: new Date("2026-05-18T14:00"), status: "CONFIRMED" },
  { id: "5", client: "Funmilayo Bello", service: "Eyebrow Threading", time: new Date("2026-05-18T15:30"), status: "PENDING" },
];

const recentClients = [
  { id: "1", name: "Amara Okafor", joinedAt: "2 hours ago", service: "Hair Treatment" },
  { id: "2", name: "Seun Adesanya", joinedAt: "5 hours ago", service: "Facial" },
  { id: "3", name: "Kemi Lawson", joinedAt: "Yesterday", service: "Massage" },
  { id: "4", name: "Adaeze Nwankwo", joinedAt: "2 days ago", service: "Manicure" },
  { id: "5", name: "Yetunde Oduya", joinedAt: "3 days ago", service: "Full Package" },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Bookings" value={12} icon={CalendarDays} color="blue" delay={0} />
        <StatCard title="Monthly Revenue" value={1240000} prefix="₦" icon={DollarSign} color="green" delay={0.05} trend={{ value: 12, label: "vs last month" }} />
        <StatCard title="Total Clients" value={284} icon={Users} color="orange" delay={0.1} />
        <StatCard title="Pending Payments" value={8} icon={Clock} color="purple" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#0346A0]" />
              Revenue This Week
            </CardTitle>
            <span className="text-sm font-semibold text-green-600">+18% vs last week</span>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0346A0" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0346A0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#A0AEC0" opacity={0.2} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#A0AEC0" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#A0AEC0" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v) => [formatCurrency(Number(v)), "Revenue"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #A0AEC030", fontSize: 13 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0346A0" strokeWidth={2.5} fill="url(#revenueGradient)" dot={false} activeDot={{ r: 5, fill: "#0346A0" }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Add Client", icon: UserPlus, href: "/clients?new=true", color: "text-[#0346A0] bg-[#0346A0]/10" },
              { label: "New Booking", icon: CalendarDays, href: "/bookings?new=true", color: "text-green-600 bg-green-50 dark:bg-green-900/20" },
              { label: "Record Payment", icon: CreditCard, href: "/payments?new=true", color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20" },
            ].map((action) => (
              <Link key={action.label} href={action.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-[#A0AEC0]/20 hover:border-[#0346A0]/30 hover:bg-[#F5F7FA] dark:hover:bg-[#2D3748] cursor-pointer transition-colors"
                >
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-[#1A202C] dark:text-white">{action.label}</span>
                  <Plus className="w-4 h-4 text-[#A0AEC0] ml-auto" />
                </motion.div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Today&apos;s Schedule</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/bookings">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {todayBookings.map((booking, i) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F5F7FA] dark:hover:bg-[#2D3748] transition-colors"
                  >
                    <div className="text-xs font-medium text-[#A0AEC0] w-16 shrink-0">
                      {formatTime(booking.time)}
                    </div>
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className="text-xs">{getInitials(booking.client)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A202C] dark:text-white truncate">{booking.client}</p>
                      <p className="text-xs text-[#A0AEC0] truncate">{booking.service}</p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Clients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Clients</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/clients">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentClients.map((client, i) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 + 0.2 }}
                  className="flex items-center gap-3"
                >
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarFallback className="text-xs">{getInitials(client.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A202C] dark:text-white truncate">{client.name}</p>
                    <p className="text-xs text-[#A0AEC0] truncate">{client.service}</p>
                  </div>
                  <span className="text-xs text-[#A0AEC0] whitespace-nowrap">{client.joinedAt}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
