"use client";

import { useEffect, useRef } from "react";
import { useSignalStore } from "@/store/useSignalStore";

export function useAutoRefresh() {
  const { preferences, setLivePrices, setFearGreed, setLoadingPrices, loadFromStorage } =
    useSignalStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  async function fetchMarketData() {
    setLoadingPrices(true);
    try {
      const res = await fetch("/api/market");
      if (!res.ok) return;
      const { prices, fearGreed } = await res.json();
      if (prices) setLivePrices(prices);
      if (fearGreed) setFearGreed(fearGreed);
    } catch {
      // silently fail
    } finally {
      setLoadingPrices(false);
    }
  }

  useEffect(() => {
    loadFromStorage();
    fetchMarketData();

    // Auto refresh prices every 30 seconds
    const priceInterval = setInterval(fetchMarketData, 30_000);

    return () => clearInterval(priceInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    // Auto-refresh signal generation removed — too expensive to auto-call Gemini
    // Only manual trigger via SignalGenerator component
  }, [preferences.autoRefreshMinutes]);

  return { fetchMarketData };
}
