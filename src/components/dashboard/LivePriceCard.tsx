"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LivePrice } from "@/types";
import { formatPrice, formatPercent } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LivePriceCardProps {
  price: LivePrice;
}

export function LivePriceCard({ price }: LivePriceCardProps) {
  const isPositive = price.changePercent24h >= 0;
  const pairLabel = price.symbol === "BTCUSDT" ? "BTC" : "ETH";

  return (
    <Card className="hover:border-gray-700 transition-colors">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">{pairLabel}</span>
              <span className="text-xs text-gray-500">/ USDT</span>
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {formatPrice(price.price, price.symbol)}
            </div>
          </div>
          <div className={cn("flex flex-col items-end gap-1", isPositive ? "text-green-400" : "text-red-400")}>
            {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            <span className="text-sm font-semibold">
              {formatPercent(price.changePercent24h)}
            </span>
            <span className="text-xs text-gray-500">24h</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
