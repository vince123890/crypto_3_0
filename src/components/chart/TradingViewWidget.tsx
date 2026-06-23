"use client";

import { useEffect, useRef } from "react";
import { Pair } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface TradingViewWidgetProps {
  pair: Pair;
  interval?: string;
}

declare global {
  interface Window {
    TradingView: {
      widget: new (config: Record<string, unknown>) => void;
    };
  }
}

export function TradingViewWidget({ pair, interval = "240" }: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<unknown>(null);

  const symbol = pair === "BTCUSDT" ? "BINANCE:BTCUSDT" : "BINANCE:ETHUSDT";

  useEffect(() => {
    if (!containerRef.current) return;

    // Remove previous widget
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (typeof window.TradingView !== "undefined" && containerRef.current) {
        widgetRef.current = new window.TradingView.widget({
          autosize: true,
          symbol,
          interval,
          timezone: "Asia/Jakarta",
          theme: "dark",
          style: "1",
          locale: "id",
          toolbar_bg: "#1a1a2e",
          enable_publishing: false,
          allow_symbol_change: false,
          container_id: containerRef.current.id,
          hide_top_toolbar: false,
          save_image: false,
          studies: ["RSI@tv-basicstudies", "MACD@tv-basicstudies", "BB@tv-basicstudies"],
          show_popup_button: false,
          popup_width: "1000",
          popup_height: "650",
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [symbol, interval]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Chart — {pair === "BTCUSDT" ? "BTC/USDT" : "ETH/USDT"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div
          id={`tv-chart-${pair}`}
          ref={containerRef}
          className="w-full"
          style={{ height: "500px" }}
        />
      </CardContent>
    </Card>
  );
}
