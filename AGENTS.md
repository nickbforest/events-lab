<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project skills

**All skills for this repo live in `.agents/skills/<name>/SKILL.md`.** That directory is the single source of truth. `.claude/skills` is a symlink to it so Claude Code registers the same files as slash commands — never add a skill directly under `.claude/`.

Before acting on a request that matches a skill below, read that skill's `SKILL.md` in full and follow it as written. Do not improvise a shortcut version of it.

| Skill | Invoke | Use it when |
| --- | --- | --- |
| [architect](.agents/skills/architect/SKILL.md) | `/architect` | Any non-trivial feature or change, **before** writing code. Produces a confirmed implementation blueprint. Do not write production code until the developer confirms it. |
| [imprint](.agents/skills/imprint/SKILL.md) | `/imprint` | Immediately after building any UI component. Extracts its visual patterns into `context/ui-registry.md` so later components match. |
| [recover](.agents/skills/recover/SKILL.md) | `/recover` | Something broke. Diagnose the failure type first, then apply the prescribed response — targeted fix, hard reset, or rethink. Never loop on blind re-prompting. |
| [remember](.agents/skills/remember/SKILL.md) | `/remember save` / `/remember restore` | End of a session (save state to `memory.md`) or start of one (restore it). Never persist secrets into `memory.md`. |

## Canonical context

Skills read and write these files. Treat them as authoritative and keep them current:

```text
context/Architecture.md      context/progress-tracker.md
context/build-plan.md        context/ui-registry.md
context/code-standard.md     context/ui-rules.md
memory.md                    (project root, latest session handoff)
```

## Standing directives

- Read `context/ui-registry.md` before writing any UI component, and match the patterns already registered there.
- Run `/imprint` after UI work so the registry never drifts from the code.
- Skills are additive to the Next.js rules above, not a replacement — the version notice in the managed block still applies.
- Editing a skill means editing the file under `.agents/skills/`; the symlink picks the change up with no further action.
