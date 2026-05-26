import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { serviceSchema } from "@/lib/validations";
import { auth } from "@/auth";

export async function GET() {
  const { data, error } = await supabase
    .from("mgmt_services")
    .select("*")
    .order("category", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = serviceSchema.parse(body);

    const { data: service, error } = await supabase
      .from("mgmt_services")
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json(service, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
