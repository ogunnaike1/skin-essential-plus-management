import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const { data: existing } = await supabase
      .from("mgmt_users")
      .select("id")
      .eq("email", data.email)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const { data: user, error } = await supabase
      .from("mgmt_users")
      .insert({ name: data.name, email: data.email, password: hashedPassword, role: data.role })
      .select("id, name, email")
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json(user, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
