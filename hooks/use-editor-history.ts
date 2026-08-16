"use client"

import * as React from "react"

import type { StoredPortfolio } from "@/lib/portfolio-store"

const MAX_HISTORY = 50

export function useEditorHistory(initial: StoredPortfolio) {
  const past = React.useRef<StoredPortfolio[]>([])
  const future = React.useRef<StoredPortfolio[]>([])
  const [draft, setDraftState] = React.useState(initial)
  const [counts, setCounts] = React.useState({ past: 0, future: 0 })
  const skipHistory = React.useRef(false)

  const bump = React.useCallback(() => {
    setCounts({ past: past.current.length, future: future.current.length })
  }, [])

  const setDraft = React.useCallback(
    (updater: StoredPortfolio | ((prev: StoredPortfolio) => StoredPortfolio)) => {
      setDraftState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater
        if (!skipHistory.current) {
          past.current = [...past.current, prev].slice(-MAX_HISTORY)
          future.current = []
        }
        queueMicrotask(bump)
        return next
      })
    },
    [bump],
  )

  const undo = React.useCallback(() => {
    const stack = past.current
    if (!stack.length) return false
    const last = stack[stack.length - 1]
    past.current = stack.slice(0, -1)
    skipHistory.current = true
    setDraftState((current) => {
      future.current = [current, ...future.current].slice(0, MAX_HISTORY)
      return last
    })
    skipHistory.current = false
    bump()
    return true
  }, [bump])

  const redo = React.useCallback(() => {
    const stack = future.current
    if (!stack.length) return false
    const [first, ...rest] = stack
    future.current = rest
    skipHistory.current = true
    setDraftState((current) => {
      past.current = [...past.current, current].slice(-MAX_HISTORY)
      return first
    })
    skipHistory.current = false
    bump()
    return true
  }, [bump])

  return {
    draft,
    setDraft,
    undo,
    redo,
    canUndo: counts.past > 0,
    canRedo: counts.future > 0,
    resetDraft: (next: StoredPortfolio) => {
      past.current = []
      future.current = []
      setDraftState(next)
      bump()
    },
  }
}
