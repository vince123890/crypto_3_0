"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Stats } from "@/types";
import { cn } from "@/lib/utils";

interface StatsBarProps {
  stats: Stats | null;
}

interface StatItemProps {
  label: string;
  value: string;
  valueClass?: string;
}

function StatItem({ label, value, valueClass }: StatItemProps) {
  return (
    <div className="text-center">
      <div className={cn("text-xl font-bold", valueClass ?? "text-white")}>{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

export function StatsBar({ stats }: StatsBarProps) {
  if (!stats) return null;

  const wr7dColor = stats.winRate7d >= 80 ? "text-green-400" : stats.winRate7d >= 60 ? "text-yellow-400" : "text-red-400";
  const wr30dColor = stats.winRate30d >= 80 ? "text-green-400" : stats.winRate30d >= 60 ? "text-yellow-400" : "text-red-400";

  return (
    <Card>
      <CardContent className="py-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-x divide-gray-800">
          <StatItem
            label="Win Rate 7D"
            value={`${stats.winRate7d.toFixed(1)}%`}
            valueClass={wr7dColor}
          />
          <StatItem
            label="Win Rate 30D"
            value={`${stats.winRate30d.toFixed(1)}%`}
            valueClass={wr30dColor}
          />
          <StatItem
            label="Avg R:R"
            value={`1:${stats.avgRR.toFixed(1)}`}
            valueClass="text-blue-400"
          />
          <StatItem
            label="Total Sinyal"
            value={`${stats.winCount}/${stats.totalSignals}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
