"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: "blue" | "green" | "orange" | "purple";
  delay?: number;
}

const colorMap = {
  blue: { bg: "bg-[#0346A0]/10", icon: "text-[#0346A0]", trend: "text-[#0346A0]" },
  green: { bg: "bg-green-50 dark:bg-green-900/20", icon: "text-green-600", trend: "text-green-600" },
  orange: { bg: "bg-orange-50 dark:bg-orange-900/20", icon: "text-orange-500", trend: "text-orange-500" },
  purple: { bg: "bg-purple-50 dark:bg-purple-900/20", icon: "text-purple-600", trend: "text-purple-600" },
};

function useCountUp(end: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    let start: number | null = null;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [end, duration]);

  return count;
}

export function StatCard({ title, value, prefix = "", suffix = "", icon: Icon, trend, color = "blue", delay = 0 }: StatCardProps) {
  const count = useCountUp(value);
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-[#718096] mb-1">{title}</p>
              <p className="text-3xl font-bold text-[#1A202C] dark:text-white">
                {prefix}
                {value >= 1000
                  ? (count >= 1000 ? (count / 1000).toFixed(count >= 10000 ? 0 : 1) + "k" : count)
                  : count}
                {suffix}
              </p>
              {trend && (
                <p className={cn("text-xs mt-1", trend.value >= 0 ? "text-green-600" : "text-red-500")}>
                  {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
                </p>
              )}
            </div>
            <div className={cn("p-3 rounded-xl", colors.bg)}>
              <Icon className={cn("w-6 h-6", colors.icon)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
