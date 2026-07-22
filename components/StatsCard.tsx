"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  iconBg?: string;
  iconColor?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  description,
  trend,
  iconBg = "bg-[#DBEAFE]",
  iconColor = "text-[#1E3A8A]",
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-xs font-medium text-[#64748B] truncate">{title}</p>
            <p className="text-lg font-bold text-[#0F172A] break-words">{value}</p>
            {description && (
              <p className="text-[11px] text-[#94A3B8] break-words leading-relaxed">{description}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    "text-[11px] font-medium",
                    trend.positive ? "text-[#16A34A]" : "text-[#DC2626]"
                  )}
                >
                  {trend.positive ? "↑" : "↓"} {trend.value}
                </span>
                <span className="text-[11px] text-[#94A3B8]">vs last month</span>
              </div>
            )}
          </div>
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              iconBg
            )}
          >
            <div className={cn("w-3.5 h-3.5", iconColor)}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

