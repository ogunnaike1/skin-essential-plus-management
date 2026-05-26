"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import logoSrc from "@/public/images/logo.png";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSent(true);
    toast.success("Reset link sent to your email");
  };

  return (
    <div className="min-h-full flex items-center justify-center bg-gradient-to-br from-[#F5F7FA] via-[#EBF1FB] to-[#F5F7FA] dark:from-[#0F1923] dark:to-[#1A2535] p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-white border border-[#A0AEC0]/20 shadow-lg mb-3 p-2">
            <img src={logoSrc.src} alt="Skin Essential Plus" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A202C] dark:text-white">Reset Password</h1>
          <p className="text-sm text-[#A0AEC0] mt-1">We&apos;ll send you a reset link</p>
        </div>

        <div className="bg-white dark:bg-[#1A2535] rounded-2xl border border-[#A0AEC0]/20 shadow-xl p-8">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !email}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm text-[#718096]">
                Check your inbox — we&apos;ve sent a reset link to <strong>{email}</strong>
              </p>
            </div>
          )}

          <Link href="/auth/login" className="flex items-center justify-center gap-2 text-sm text-[#A0AEC0] hover:text-[#0346A0] mt-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
