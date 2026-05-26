import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { clientSchema } from "@/lib/validations";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  let query = supabase
    .from("mgmt_clients")
    .select("*, mgmt_bookings(count)")
    .order("joined_at", { ascending: false });

  if (status && status !== "ALL") query = query.eq("status", status);
  if (search) query = query.ilike("name", `%${search}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const clients = (data ?? []).map(({ joined_at, date_of_birth, mgmt_bookings: bk, ...rest }) => ({
    ...rest,
    joinedAt: joined_at,
    dateOfBirth: date_of_birth,
    _count: { bookings: (bk as { count: number }[])?.[0]?.count ?? 0 },
  }));

  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = clientSchema.parse(body);

    const { data: client, error } = await supabase
      .from("mgmt_clients")
      .insert({
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        date_of_birth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : null,
        status: data.status,
        notes: data.notes || null,
        tags: data.tags ?? [],
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    const { joined_at, date_of_birth, ...rest } = client;
    return NextResponse.json(
      { ...rest, joinedAt: joined_at, dateOfBirth: date_of_birth, _count: { bookings: 0 } },
      { status: 201 }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
