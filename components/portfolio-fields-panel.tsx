"use client"

import * as React from "react"

import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { StoredPortfolio } from "@/lib/portfolio-store"

export function PortfolioFieldsPanel({
  draft,
  onChange,
}: {
  draft: StoredPortfolio
  onChange: (patch: Partial<StoredPortfolio>) => void
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-sidebar-border pb-6">
      <p className="text-xsm text-(--sidebar-muted)">Portfolio</p>
      <Field>
        <FieldLabel htmlFor="pf-name">Name</FieldLabel>
        <Input
          id="pf-name"
          value={draft.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="pf-title">Title</FieldLabel>
        <Input
          id="pf-title"
          value={draft.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="pf-school">School badge</FieldLabel>
        <Input
          id="pf-school"
          value={draft.school}
          onChange={(e) => onChange({ school: e.target.value })}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="pf-bio">Bio</FieldLabel>
        <Textarea
          id="pf-bio"
          rows={3}
          value={draft.bio}
          onChange={(e) => onChange({ bio: e.target.value })}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="pf-project">Project name</FieldLabel>
        <Input
          id="pf-project"
          value={draft.project.name}
          onChange={(e) =>
            onChange({ project: { ...draft.project, name: e.target.value } })
          }
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="pf-copy">Project copy</FieldLabel>
        <Textarea
          id="pf-copy"
          rows={3}
          value={draft.project.copy}
          onChange={(e) =>
            onChange({ project: { ...draft.project, copy: e.target.value } })
          }
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="pf-skills">Skills (comma-separated)</FieldLabel>
        <Input
          id="pf-skills"
          value={draft.skills.join(", ")}
          onChange={(e) =>
            onChange({
              skills: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
        />
      </Field>
    </div>
  )
}
