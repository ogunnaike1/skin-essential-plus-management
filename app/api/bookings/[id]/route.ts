import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { auth } from "@/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();

    const { data: booking, error } = await supabase
      .from("mgmt_bookings")
      .update(body)
      .eq("id", id)
      .select("*, client:mgmt_clients(*), service:mgmt_services(*), staff:mgmt_users(id, name, role, avatar)")
      .single();

    if (error) throw new Error(error.message);

    const { client_id, service_id, staff_id, created_at, ...rest } = booking;
    return NextResponse.json({ ...rest, clientId: client_id, serviceId: service_id, staffId: staff_id, createdAt: created_at });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Not found or invalid";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { error } = await supabase.from("mgmt_bookings").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
