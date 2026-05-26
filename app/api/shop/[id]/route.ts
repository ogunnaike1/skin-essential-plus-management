import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { auth } from "@/auth";
import { z } from "zod";

const productPatchSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  category: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  sku: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal("")),
  is_active: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const data = productPatchSchema.parse(body);

    const { data: product, error } = await supabase
      .from("mgmt_products")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    const { created_at, image_url, is_active, ...rest } = product;
    return NextResponse.json({ ...rest, imageUrl: image_url, isActive: is_active, createdAt: created_at });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { error } = await supabase.from("mgmt_products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
