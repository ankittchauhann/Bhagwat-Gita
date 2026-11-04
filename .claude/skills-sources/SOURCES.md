# Vendored skills

Skills in `.claude/skills/` copied from upstream on 2026-10-30. To update, re-clone and copy over, then re-apply the local changes listed here.

| Skill(s) | Upstream | Commit | License |
|---|---|---|---|
| `design-taste-frontend` (taste-skill v2) | https://github.com/Leonxlnx/taste-skill — `skills/taste-skill` | `12af471` | MIT (`licenses/taste-skill.LICENSE`) |
| `brainstorming`, `diagnosing-superpowers`, `dispatching-parallel-agents`, `executing-plans`, `finishing-a-development-branch`, `receiving-code-review`, `requesting-code-review`, `subagent-driven-development`, `systematic-debugging`, `test-driven-development`, `using-git-worktrees`, `using-superpowers`, `verification-before-completion`, `writing-plans`, `writing-skills` | https://github.com/obra/superpowers — `skills/` | `2ce8aa1` | MIT (`licenses/superpowers.LICENSE`) |
| `web-design-guidelines` | https://github.com/vercel-labs/agent-skills — `skills/web-design-guidelines` | `1a2c79d` | no license file upstream |
| `design-md/references/*.md` | https://github.com/VoltAgent/awesome-design-md — `design-md/<site>/DESIGN.md` | `fcc7028` | MIT (`licenses/awesome-design-md.LICENSE`) |

## Local changes

- **superpowers:** `superpowers:<skill>` cross-references rewritten to `<skill>`, since these are project skills, not a namespaced plugin. The plugin's SessionStart hook (which injects `using-superpowers` into every session) is not installed.
- **design-md:** `SKILL.md` is local; only each site's `DESIGN.md` was copied (upstream READMEs are just links), renamed to `<site>.md`.
- **design-taste-frontend:** unchanged (upstream folder `skills/taste-skill`). Its scripts need Node 22+ and a local Chrome; working files go to `.taste-skill/` (gitignored).
