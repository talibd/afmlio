"use client"

import * as React from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string } = {}) {
  const { theme, setTheme } = useTheme()
  // `theme` is undefined until next-themes reads localStorage on the client, so
  // the icon can only be resolved after hydration without a mismatch. The
  // server snapshot is false, the client snapshot true, and the value never
  // changes, so this needs no subscription and no effect.
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ] as const
  const Active =
    (mounted ? options.find((o) => o.value === theme)?.icon : undefined) ??
    Monitor

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("size-6 text-muted-foreground", className)}
            aria-label="Theme"
          />
        }
      >
        <Active />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="afm-dashboard w-36">
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          {options.map(({ value, label, icon: Icon }) => (
            <DropdownMenuRadioItem
              key={value}
              value={value}
              className="font-normal text-muted-foreground data-checked:font-medium data-checked:text-foreground"
            >
              <Icon className="size-4" />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
