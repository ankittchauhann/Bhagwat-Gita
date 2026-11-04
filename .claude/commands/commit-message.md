Generate a commit message for the currently staged changes.

## Steps

1. Run these bash commands in parallel to gather context:
   - `git diff --staged` — full diff of staged changes
   - `git diff --staged --stat` — file change summary
   - `git log --oneline -5` — recent commits to match style

2. Analyze the staged diff and produce output in this exact format:

```
Type - <commit type>
Scope - <scope>
Short Description - <short description>

<longer description>
```

**Type rules:**

- One of: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `style`, `perf`, `content`

**Scope rules:**

- The area affected, e.g. `hero`, `work`, `layout`, `ui`, `seo`, `config`, or a case-study slug like `fms`

**Short description rules:**
- Under 75 characters, single line, no line break
- Imperative mood: "add", "fix", "update", "remove" — not "Added" or "Adds"
- All lowercase (commitlint subject-case rule)
- No trailing period
- No `type(scope):` prefix — just the plain description

**Longer description rules:**
- Single line, no line breaks, no character limit
- Separate distinct points with commas or periods
- Explain the *why* and *what* — what problem was solved, what behavior changed
- Skip if the short description is fully self-explanatory
- Cross-check every file listed in `git diff --staged --stat` against the description before finalizing. Account for all of them, including files staged incidentally. If a file's purpose is unclear, mention it or ask.

Output only the raw text — no code fences, no extra commentary. The user will copy it directly.
