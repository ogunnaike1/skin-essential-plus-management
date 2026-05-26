import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import ws from "ws";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { realtime: { transport: ws } }
);

type ServiceSeed = { name: string; category: string; duration: number; price: number };

const SERVICES: ServiceSeed[] = [
  // Advanced Facial
  { name: "Advanced Acne Treatment",   category: "Advanced Facial",          duration: 90,  price: 25000 },
  { name: "Anti Wrinkles Treatment",   category: "Advanced Facial",          duration: 90,  price: 28000 },
  { name: "Chemical Peel (Pro)",        category: "Advanced Facial",          duration: 60,  price: 22000 },
  { name: "Chemical Peel",              category: "Advanced Facial",          duration: 60,  price: 18000 },
  { name: "Meso Therapy Facials",       category: "Advanced Facial",          duration: 75,  price: 25000 },
  { name: "PRP Vampire Facials",        category: "Advanced Facial",          duration: 90,  price: 35000 },
  { name: "PRP Body Therapy",           category: "Advanced Facial",          duration: 90,  price: 40000 },
  // Bikini & Brazilian Waxing
  { name: "Brazilian Waxing",           category: "Bikini & Brazilian Waxing",duration: 45,  price: 12000 },
  { name: "Bikini Full Waxing",         category: "Bikini & Brazilian Waxing",duration: 45,  price: 15000 },
  { name: "Bikini Line Waxing",         category: "Bikini & Brazilian Waxing",duration: 30,  price: 8000  },
  // Body Enhancement
  { name: "Back Folds",                 category: "Body Enhancement",         duration: 60,  price: 20000 },
  { name: "Tummy Reduction",            category: "Body Enhancement",         duration: 60,  price: 25000 },
  { name: "Butt Vacuum Therapy",        category: "Body Enhancement",         duration: 60,  price: 25000 },
  { name: "Slim Waistline",             category: "Body Enhancement",         duration: 60,  price: 20000 },
  { name: "Breast Vacuum Therapy",      category: "Body Enhancement",         duration: 60,  price: 25000 },
  { name: "Hip Vacuum Therapy",         category: "Body Enhancement",         duration: 60,  price: 25000 },
  // Body Waxing
  { name: "Full Body Waxing",           category: "Body Waxing",              duration: 120, price: 35000 },
  { name: "Back Waxing (Half)",         category: "Body Waxing",              duration: 30,  price: 8000  },
  { name: "Back Waxing (Full)",         category: "Body Waxing",              duration: 45,  price: 12000 },
  { name: "Chest Waxing",               category: "Body Waxing",              duration: 30,  price: 8000  },
  { name: "Leg Waxing (Half)",          category: "Body Waxing",              duration: 30,  price: 8000  },
  { name: "Leg Waxing (Full)",          category: "Body Waxing",              duration: 45,  price: 12000 },
  { name: "Arms Waxing (Half)",         category: "Body Waxing",              duration: 30,  price: 7000  },
  { name: "Arms Waxing (Full)",         category: "Body Waxing",              duration: 45,  price: 10000 },
  { name: "Stomach Waxing",             category: "Body Waxing",              duration: 30,  price: 8000  },
  { name: "Underarms Waxing",           category: "Body Waxing",              duration: 20,  price: 5000  },
  // Face Waxing
  { name: "Chin Waxing",                category: "Face Waxing",              duration: 15,  price: 3000  },
  { name: "Full Face Waxing",           category: "Face Waxing",              duration: 30,  price: 8000  },
  { name: "Sideburns Waxing",           category: "Face Waxing",              duration: 15,  price: 3500  },
  { name: "Upper Lip Waxing",           category: "Face Waxing",              duration: 15,  price: 3000  },
  { name: "Eyebrows Waxing",            category: "Face Waxing",              duration: 15,  price: 3500  },
  // Facial Treatment
  { name: "Dermabrasion",               category: "Facial Treatment",         duration: 60,  price: 15000 },
  { name: "Anti Aging",                 category: "Facial Treatment",         duration: 60,  price: 18000 },
  { name: "Acne Control Facials",       category: "Facial Treatment",         duration: 60,  price: 15000 },
  { name: "Basic Facials",              category: "Facial Treatment",         duration: 45,  price: 10000 },
  { name: "Derma Planning Deluxe",      category: "Facial Treatment",         duration: 75,  price: 20000 },
  { name: "Instant Glow Facials",       category: "Facial Treatment",         duration: 60,  price: 15000 },
  { name: "LED Therapy Facials",        category: "Facial Treatment",         duration: 60,  price: 18000 },
  { name: "Special Hydra Facials",      category: "Facial Treatment",         duration: 75,  price: 22000 },
  // Laser Hair Removal
  { name: "Neck",                       category: "Laser Hair Removal",       duration: 30,  price: 15000 },
  { name: "Underarms",                  category: "Laser Hair Removal",       duration: 30,  price: 12000 },
  { name: "Hands",                      category: "Laser Hair Removal",       duration: 30,  price: 15000 },
  { name: "Legs (Half)",                category: "Laser Hair Removal",       duration: 45,  price: 20000 },
  { name: "Legs (Full)",                category: "Laser Hair Removal",       duration: 60,  price: 30000 },
  { name: "Bikini Line",                category: "Laser Hair Removal",       duration: 30,  price: 15000 },
  { name: "Bikini",                     category: "Laser Hair Removal",       duration: 45,  price: 20000 },
  { name: "Brazilian (Men)",            category: "Laser Hair Removal",       duration: 45,  price: 25000 },
  { name: "Brazilian (Women)",          category: "Laser Hair Removal",       duration: 45,  price: 20000 },
  { name: "Chin (Women)",               category: "Laser Hair Removal",       duration: 20,  price: 8000  },
  { name: "Chin (Men)",                 category: "Laser Hair Removal",       duration: 20,  price: 10000 },
  { name: "Upper Lip",                  category: "Laser Hair Removal",       duration: 20,  price: 8000  },
  { name: "Half Face",                  category: "Laser Hair Removal",       duration: 30,  price: 15000 },
  { name: "Full Face",                  category: "Laser Hair Removal",       duration: 45,  price: 20000 },
  { name: "Chest",                      category: "Laser Hair Removal",       duration: 30,  price: 18000 },
  { name: "Stomach",                    category: "Laser Hair Removal",       duration: 30,  price: 15000 },
  { name: "Back",                       category: "Laser Hair Removal",       duration: 45,  price: 22000 },
  { name: "Tummy Line",                 category: "Laser Hair Removal",       duration: 20,  price: 10000 },
  { name: "Full Body",                  category: "Laser Hair Removal",       duration: 120, price: 80000 },
  // Lash Extension
  { name: "Volume Lashes",              category: "Lash Extension",           duration: 120, price: 25000 },
  { name: "Classic Lashes",             category: "Lash Extension",           duration: 90,  price: 18000 },
  { name: "Color Effects",              category: "Lash Extension",           duration: 120, price: 28000 },
  { name: "Hybrid Lashes",              category: "Lash Extension",           duration: 120, price: 22000 },
  { name: "Mega Volume Lashes",         category: "Lash Extension",           duration: 150, price: 35000 },
  { name: "Undereye Lash",              category: "Lash Extension",           duration: 60,  price: 15000 },
  { name: "Lash Removal",               category: "Lash Extension",           duration: 30,  price: 5000  },
  // Lipolysis
  { name: "Lipolysis Treatment",        category: "Lipolysis",                duration: 90,  price: 50000 },
  // Massage
  { name: "Deep Tissue Massage",        category: "Massage",                  duration: 60,  price: 18000 },
  { name: "Full Body Massage",          category: "Massage",                  duration: 90,  price: 20000 },
  { name: "Hot Stone Massage",          category: "Massage",                  duration: 90,  price: 25000 },
  { name: "Swedish Massage",            category: "Massage",                  duration: 60,  price: 15000 },
  // Pedicure Treatment
  { name: "Boom Pedicure",              category: "Pedicure Treatment",       duration: 60,  price: 12000 },
  { name: "Foot Detox",                 category: "Pedicure Treatment",       duration: 45,  price: 10000 },
  { name: "Jelly Pedicure",             category: "Pedicure Treatment",       duration: 60,  price: 15000 },
  { name: "Pedicure & Manicure",        category: "Pedicure Treatment",       duration: 90,  price: 18000 },
  // PRP Stretch Mark
  { name: "PRP - Arm, Thigh, Chest & Butt", category: "PRP Stretch Mark",    duration: 90,  price: 60000 },
  { name: "PRP - Arm & Thigh",          category: "PRP Stretch Mark",         duration: 75,  price: 45000 },
  { name: "PRP - Arm",                  category: "PRP Stretch Mark",         duration: 60,  price: 30000 },
  // Semi Permanent Brows
  { name: "Nano Combo Brows",           category: "Semi Permanent Brows",     duration: 120, price: 30000 },
  { name: "Micro Shading",              category: "Semi Permanent Brows",     duration: 120, price: 28000 },
  { name: "Signature Ombre Brows",      category: "Semi Permanent Brows",     duration: 120, price: 35000 },
  // Skin IV Drips
  { name: "Luminous Radiance",          category: "Skin IV Drips",            duration: 45,  price: 30000 },
  { name: "Weight Loss IV",             category: "Skin IV Drips",            duration: 45,  price: 35000 },
  { name: "Radiant Glow Infusion",      category: "Skin IV Drips",            duration: 45,  price: 30000 },
  { name: "Vitamin B12 Boost",          category: "Skin IV Drips",            duration: 30,  price: 20000 },
  { name: "Immune Booster",             category: "Skin IV Drips",            duration: 45,  price: 28000 },
  { name: "Detox IV Therapy",           category: "Skin IV Drips",            duration: 45,  price: 32000 },
  { name: "Billionaire Skin",           category: "Skin IV Drips",            duration: 60,  price: 50000 },
  { name: "Diamond White Infusion",     category: "Skin IV Drips",            duration: 60,  price: 55000 },
  { name: "Snow White IV",              category: "Skin IV Drips",            duration: 60,  price: 45000 },
  // Skin Treatment
  { name: "Deluxe Body Polish",         category: "Skin Treatment",           duration: 60,  price: 20000 },
  { name: "Exfoliate Bath",             category: "Skin Treatment",           duration: 45,  price: 15000 },
  { name: "Full Body Glow Bath",        category: "Skin Treatment",           duration: 60,  price: 22000 },
  { name: "Golden Glow Sauna",          category: "Skin Treatment",           duration: 90,  price: 30000 },
  { name: "Morroccan Bath",             category: "Skin Treatment",           duration: 90,  price: 35000 },
  // Tattoo Removal
  { name: "Multiple Tattoo Removal",    category: "Tattoo Removal",           duration: 90,  price: 50000 },
  { name: "Body Tattoo Removal",        category: "Tattoo Removal",           duration: 60,  price: 35000 },
  { name: "Eyebrow Tattoo Removal",     category: "Tattoo Removal",           duration: 45,  price: 25000 },
  // Teeth Whitening
  { name: "Teeth Whitening and Scaling",category: "Teeth Whitening",          duration: 90,  price: 25000 },
  { name: "Scaling",                    category: "Teeth Whitening",          duration: 45,  price: 15000 },
  { name: "Teeth Whitening",            category: "Teeth Whitening",          duration: 60,  price: 20000 },
  // Others (placeholder for custom/free-text bookings)
  { name: "Others",                     category: "Others",                   duration: 60,  price: 0     },
];

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.local");

  const hashed = await bcrypt.hash(password, 12);
  const { data: existing } = await supabase.from("mgmt_users").select("id").eq("email", email).single();

  if (existing) {
    const { error } = await supabase.from("mgmt_users").update({ password: hashed, role: "ADMIN" }).eq("email", email);
    if (error) throw new Error(error.message);
    console.log(`✓ Updated admin: ${email}`);
  } else {
    const { error } = await supabase.from("mgmt_users").insert({ name: "Admin", email, password: hashed, role: "ADMIN" });
    if (error) throw new Error(error.message);
    console.log(`✓ Created admin: ${email}`);
  }
}

async function seedServices() {
  let created = 0;
  let skipped = 0;

  for (const svc of SERVICES) {
    const { data: existing } = await supabase
      .from("mgmt_services")
      .select("id")
      .eq("name", svc.name)
      .eq("category", svc.category)
      .maybeSingle();

    if (existing) { skipped++; continue; }

    const { error } = await supabase.from("mgmt_services").insert(svc);
    if (error) console.error(`✗ "${svc.name}": ${error.message}`);
    else created++;
  }

  console.log(`✓ Services: ${created} created, ${skipped} already existed`);
}

async function main() {
  await seedAdmin();
  await seedServices();
}

main().catch((e) => { console.error(e); process.exit(1); });
