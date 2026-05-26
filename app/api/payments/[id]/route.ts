import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { auth } from "@/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();

    const updateData: Record<string, unknown> = { status: body.status };
    if (body.status === "PAID") {
      updateData.paid_at = new Date().toISOString();
    }

    const { data: payment, error } = await supabase
      .from("mgmt_payments")
      .update(updateData)
      .eq("id", id)
      .select("*, client:mgmt_clients(*), booking:mgmt_bookings(*, service:mgmt_services(*))")
      .single();

    if (error) throw new Error(error.message);

    if (body.status === "PAID" && payment.booking_id) {
      await supabase.from("mgmt_bookings").update({ status: "COMPLETED" }).eq("id", payment.booking_id);
    }

    const { booking_id, client_id, paid_at, created_at, ...rest } = payment;
    return NextResponse.json({ ...rest, bookingId: booking_id, clientId: client_id, paidAt: paid_at, createdAt: created_at });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
