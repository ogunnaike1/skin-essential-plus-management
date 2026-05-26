import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { clientSchema } from "@/lib/validations";
import { auth } from "@/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const { data: client, error } = await supabase
    .from("mgmt_clients")
    .select(`
      *,
      mgmt_bookings(*, service:mgmt_services(*), staff:mgmt_users(id, name, role)),
      mgmt_payments(*)
    `)
    .eq("id", id)
    .single();

  if (error || !client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { joined_at, date_of_birth, mgmt_bookings, mgmt_payments, ...rest } = client as any;
  return NextResponse.json({
    ...rest,
    joinedAt: joined_at,
    dateOfBirth: date_of_birth,
    bookings: (mgmt_bookings ?? []).map((b: any) => ({
      ...b,
      service: b.mgmt_services ?? null,
      staff: b.mgmt_users ?? null,
    })),
    payments: (mgmt_payments ?? []).map((p: any) => ({
      ...p,
      createdAt: p.created_at,
    })),
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const data = clientSchema.partial().parse(body);

    const { data: client, error } = await supabase
      .from("mgmt_clients")
      .update({
        ...(data.name && { name: data.name }),
        ...(data.phone && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.dateOfBirth !== undefined && {
          date_of_birth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : null,
        }),
        ...(data.status && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
        ...(data.tags && { tags: data.tags }),
        ...(data.skin_type !== undefined && { skin_type: data.skin_type || null }),
        ...(data.allergies !== undefined && { allergies: data.allergies || null }),
        ...(data.recommendations !== undefined && { recommendations: data.recommendations || null }),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    const { joined_at, date_of_birth, ...rest } = client;
    return NextResponse.json({ ...rest, joinedAt: joined_at, dateOfBirth: date_of_birth });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { error } = await supabase.from("mgmt_clients").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
