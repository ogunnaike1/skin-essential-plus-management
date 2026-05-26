import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { bookingSchema } from "@/lib/validations";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const date = searchParams.get("date");

  let query = supabase
    .from("mgmt_bookings")
    .select("*, client:mgmt_clients(*), service:mgmt_services(*), staff:mgmt_users(id, name, role, avatar), payment:mgmt_payments(*)")
    .order("date", { ascending: true });

  if (status && status !== "ALL") query = query.eq("status", status);
  if (date) {
    const start = new Date(date);
    const end = new Date(start.getTime() + 86400000);
    query = query.gte("date", start.toISOString()).lt("date", end.toISOString());
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(
    (data ?? []).map(({ client_id, service_id, staff_id, created_at, ...rest }) => ({
      ...rest,
      clientId: client_id,
      serviceId: service_id,
      staffId: staff_id,
      createdAt: created_at,
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = bookingSchema.parse(body);

    const { data: booking, error } = await supabase
      .from("mgmt_bookings")
      .insert({
        client_id: data.clientId,
        service_id: data.serviceId,
        staff_id: data.staffId,
        date: new Date(data.date).toISOString(),
        notes: data.notes || null,
      })
      .select("*, client:mgmt_clients(*), service:mgmt_services(*), staff:mgmt_users(id, name, role, avatar)")
      .single();

    if (error) throw new Error(error.message);

    const { client_id, service_id, staff_id, created_at, ...rest } = booking;
    return NextResponse.json(
      { ...rest, clientId: client_id, serviceId: service_id, staffId: staff_id, createdAt: created_at },
      { status: 201 }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
