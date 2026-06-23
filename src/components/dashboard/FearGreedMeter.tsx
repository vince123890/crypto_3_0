"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FearGreedData } from "@/types";
import { getFearGreedColor } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface FearGreedMeterProps {
  data: FearGreedData | null;
}

function getBarColor(value: number): string {
  if (value <= 25) return "bg-red-500";
  if (value <= 45) return "bg-orange-500";
  if (value <= 55) return "bg-yellow-500";
  if (value <= 75) return "bg-green-500";
  return "bg-emerald-500";
}

export function FearGreedMeter({ data }: FearGreedMeterProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader><CardTitle>Market Sentiment</CardTitle></CardHeader>
        <CardContent>
          <div className="h-12 bg-gray-800 animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Sentiment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-500">Fear & Greed Index</span>
          <span className={cn("text-xl font-bold", getFearGreedColor(data.value))}>
            {data.value}/100
          </span>
        </div>
        <Progress value={data.value} barClassName={getBarColor(data.value)} />
        <div className="flex justify-between mt-2">
          <span className="text-xs text-red-400">Extreme Fear</span>
          <span className={cn("text-xs font-semibold", getFearGreedColor(data.value))}>
            {data.label}
          </span>
          <span className="text-xs text-emerald-400">Extreme Greed</span>
        </div>
      </CardContent>
    </Card>
  );
}
