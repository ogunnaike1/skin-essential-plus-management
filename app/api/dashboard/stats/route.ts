import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today.getTime() + 86400000);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    { count: todayBookings },
    { count: totalClients },
    { data: paidPayments },
    { count: pendingPayments },
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
    supabase.from("mgmt_payments").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
  ]);

  const monthRevenue = (paidPayments ?? []).reduce((sum, p) => sum + p.amount, 0);

  return NextResponse.json({
    todayBookings: todayBookings ?? 0,
    totalClients: totalClients ?? 0,
    monthRevenue,
    pendingPayments: pendingPayments ?? 0,
  });
}
