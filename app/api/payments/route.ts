import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { paymentSchema } from "@/lib/validations";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ── mgmt_payments (internal records) ──────────────────────────────────────
  const { data: mgmtData, error: mgmtError } = await supabase
    .from("mgmt_payments")
    .select("*, client:mgmt_clients(*), booking:mgmt_bookings(*, service:mgmt_services(*))")
    .order("created_at", { ascending: false });

  if (mgmtError) return NextResponse.json({ error: mgmtError.message }, { status: 500 });

  const mgmtPayments = (mgmtData ?? []).map(
    ({ booking_id, client_id, paid_at, created_at, ...rest }) => ({
      ...rest,
      source: "mgmt",
      bookingId: booking_id,
      clientId: client_id,
      paidAt: paid_at,
      createdAt: created_at,
    })
  );

  // ── appointments table (external bookings with payment data) ───────────────
  const { data: apptData } = await supabase
    .from("appointments")
    .select("*")
    .order("created_at", { ascending: false });

  const apptPayments = (apptData ?? []).map((row: Record<string, unknown>) => {
    const clientName = String(row.customer_name ?? row.client_name ?? row.name ?? "") || null;

    return {
      id:        `appt-${row.id}`,
      source:    "appointments",
      amount:    Number(row.service_price ?? row.amount ?? row.price ?? row.total ?? 0),
      method:    String(row.payment_method ?? row.method ?? ""),
      status:    normalisePaymentStatus(String(row.payment_status ?? row.status ?? "")),
      bookingId: String(row.id),
      clientId:  String(row.client_id ?? ""),
      paidAt:    (row.paid_at ?? row.payment_date ?? null) as string | null,
      createdAt: String(row.created_at ?? ""),
      client:    clientName ? { id: String(row.client_id ?? ""), name: clientName } : null,
      booking: {
        id:      String(row.id),
        date:    String(row.appointment_date ?? row.date ?? row.created_at ?? ""),
        service: row.service_name ? { name: String(row.service_name) } : undefined,
      },
    };
  });

  // Merge and sort newest first
  const all = [...mgmtPayments, ...apptPayments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json(all);
}

function normalisePaymentStatus(raw: string): string {
  const s = raw.toLowerCase();
  if (s === "paid" || s === "completed") return "PAID";
  if (s === "partial")                   return "PARTIAL";
  if (s === "refunded")                  return "REFUNDED";
  return "PENDING";
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = paymentSchema.parse(body);

    const { data: payment, error } = await supabase
      .from("mgmt_payments")
      .insert({
        booking_id: data.bookingId,
        client_id: data.clientId,
        amount: data.amount,
        method: data.method,
        status: data.status,
        paid_at: data.status === "PAID" ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    if (data.status === "PAID") {
      await supabase.from("mgmt_bookings").update({ status: "COMPLETED" }).eq("id", data.bookingId);
    }

    const { booking_id, client_id, paid_at, created_at, ...rest } = payment;
    return NextResponse.json(
      { ...rest, bookingId: booking_id, clientId: client_id, paidAt: paid_at, createdAt: created_at },
      { status: 201 }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
