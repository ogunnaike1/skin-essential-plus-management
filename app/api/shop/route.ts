import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { auth } from "@/auth";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  price: z.number().min(0, "Price must be positive"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  sku: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal("")),
  is_active: z.boolean().default(true),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("mgmt_products")
    .select("*")
    .order("category", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(
    (data ?? []).map(({ created_at, image_url, is_active, ...rest }) => ({
      ...rest,
      imageUrl: image_url,
      isActive: is_active,
      createdAt: created_at,
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = productSchema.parse(body);

    const { data: product, error } = await supabase
      .from("mgmt_products")
      .insert({
        name: data.name,
        description: data.description,
        category: data.category,
        price: data.price,
        stock: data.stock,
        sku: data.sku || null,
        image_url: data.image_url || null,
        is_active: data.is_active,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    const { created_at, image_url, is_active, ...rest } = product;
    return NextResponse.json(
      { ...rest, imageUrl: image_url, isActive: is_active, createdAt: created_at },
      { status: 201 }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
