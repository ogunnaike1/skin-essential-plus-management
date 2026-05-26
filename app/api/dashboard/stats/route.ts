import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(today.getTime() + 86400000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Last 7 days for chart
  const weekStart = new Date(today.getTime() - 6 * 86400000);

  const [
    { count: todayBookings },
    { count: totalClients },
    { data: paidPayments },
    { count: pendingPayments },
    { data: weekPayments },
  ] = await Promise.all([
    supabase
      .from("mgmt_bookings")
      .select("*", { count: "exact", head: true })
      .gte("date", today.toISOString())
      .lt("date", todayEnd.toISOString()),
    supabase.from("mgmt_clients").select("*", { count: "exact", head: true }),
    supabase
      .from("mgmt_payments")
      .select("amount")
      .eq("status", "PAID")
      .gte("created_at", monthStart.toISOString()),
    supabase
      .from("mgmt_payments")
      .select("*", { count: "exact", head: true })
      .eq("status", "PENDING"),
    supabase
      .from("mgmt_payments")
      .select("amount, created_at")
      .eq("status", "PAID")
      .gte("created_at", weekStart.toISOString()),
  ]);

  const monthRevenue = (paidPayments ?? []).reduce((sum, p) => sum + p.amount, 0);

  // Build revenue-per-day array for the last 7 days
  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const revenueByDay: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart.getTime() + i * 86400000);
    const key = d.toISOString().slice(0, 10);
    revenueByDay[key] = 0;
  }
  for (const p of weekPayments ?? []) {
    const key = new Date(p.created_at).toISOString().slice(0, 10);
    if (key in revenueByDay) revenueByDay[key] += p.amount;
  }
  const weeklyRevenue = Object.entries(revenueByDay).map(([date, revenue]) => ({
    day: DAY_LABELS[new Date(date).getDay()],
    date,
    revenue,
  }));

  return NextResponse.json({
    todayBookings: todayBookings ?? 0,
    totalClients: totalClients ?? 0,
    monthRevenue,
    pendingPayments: pendingPayments ?? 0,
    weeklyRevenue,
  });
}
