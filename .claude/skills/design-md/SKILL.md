---
name: design-md
description: Library of 84 DESIGN.md design-system analyses of real sites (Linear, Vercel, Stripe, Raycast, Supabase, Sentry, Resend, Warp, Apple and more) — colour tokens, type scales, spacing, components and do/don't rules. Use when choosing a visual direction, defining design tokens in global.css, or when asked to make the portfolio feel like a specific site.
---

# DESIGN.md reference library

`references/<site>.md` holds one DESIGN.md per site: YAML tokens (colours, typography, radius, spacing) followed by prose on layout, components, imagery and rules. Source: VoltAgent/awesome-design-md.

## How to use

1. **Pick 1–3 references** that fit the brief. For this portfolio (developer, real-time robotics platforms, dark-first technical feel) start with: `linear.app`, `vercel`, `raycast`, `warp`, `resend`, `sentry`, `supabase`, `posthog`, `cursor`, `mintlify`. List `references/` for the rest.
2. **Read only what you need.** Read the YAML block for tokens; read the prose sections for layout and component rules. Don't load many files whole.
3. **Synthesize, don't clone.** Take principles — contrast model, type scale ratio, surface layering, accent discipline, density — and express them as this project's own tokens in `src/styles/global.css` (light and dark). Never copy a brand's signature accent colour, custom typeface, logo or distinctive layout one-to-one; the portfolio must not read as a knock-off of another company's site.
4. **Record the decision.** When a direction is chosen, write the resulting system to `DESIGN.md` at the project root (same structure as the references) so later work stays consistent.

## Pairing

- `design-taste-frontend` (taste-skill) deals an art direction and checks the result in a browser; use design-md references to inform its palette and type choices.
- `web-design-guidelines` reviews the built UI against interface rules after implementation.
