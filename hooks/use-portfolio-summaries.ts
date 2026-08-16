"use client"

import * as React from "react"

import {
  DEMO_PORTFOLIO_SUMMARIES,
  getPortfolioSummaries,
  subscribePortfolioSummaries,
} from "@/lib/portfolio-store"

export function usePortfolioSummaries() {
  return React.useSyncExternalStore(
    subscribePortfolioSummaries,
    getPortfolioSummaries,
    () => DEMO_PORTFOLIO_SUMMARIES
  )
}
