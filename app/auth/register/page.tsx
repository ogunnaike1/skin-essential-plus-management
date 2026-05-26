"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import logoSrc from "@/public/images/logo.png";
import { toast } from "@/components/ui/custom-toast";
import Link from "next/link";
import { registerSchema } from "@/lib/validations";
import type { z } from "zod";

type RegisterInput = z.input<typeof registerSchema>;
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "STAFF" },
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);
    if (!res.ok) {
      const { error } = await res.json();
      toast.error(error ?? "Registration failed");
      return;
    }

    toast.success("Account created! Please sign in.");
    router.push("/auth/login");
  };

  return (
    <div className="min-h-full flex items-center justify-center bg-gradient-to-br from-[#F5F7FA] via-[#EBF1FB] to-[#F5F7FA] dark:from-[#0F1923] dark:to-[#1A2535] p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-white border border-[#A0AEC0]/20 shadow-lg mb-3 p-2">
            <img src={logoSrc.src} alt="Skin Essential Plus" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A202C] dark:text-white">Create Account</h1>
          <p className="text-sm text-[#A0AEC0] mt-1">Join your team on Skin Essential</p>
        </motion.div>

        <div className="bg-white dark:bg-[#1A2535] rounded-2xl border border-[#A0AEC0]/20 shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Jane Doe" {...register("name")} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0AEC0]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select onValueChange={(v) => setValue("role", v as "ADMIN" | "STAFF")} defaultValue="STAFF">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-[#A0AEC0] mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#0346A0] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
