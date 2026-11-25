# Agent Studio — design.md

Implementation guide for the Agent Studio desktop UI. Written for a coding agent working in this repo. Follow it literally; where it says "must", do not improvise.

- Stack: Electron (electron-vite) · React 19 · TypeScript · **Tailwind CSS v4** · **shadcn/ui** (already installed) · lucide-react · Bun sidecar (not covered here).
- Source of truth for visuals: the Agent Studio design system (tokens + component notes) and the screen mockups (15 artboards). This file restates everything needed so you never have to open them.
- Look: Codex-desktop-like. Dark first, grey on grey, colour only for meaning.

---

## 0. Rules for the implementing agent

1. **Use shadcn components wherever one exists** (§5). Restyle through the theme variables in §4, not by forking components, unless §5 lists an override.
2. **Never hardcode colours, radii or font sizes** in components. Use the Tailwind utilities generated from §4 (`bg-background`, `text-ink-faint`, `rounded-lg`, `text-small`…). The only literal colours allowed are the orb palettes in §9.15.
3. **Custom components** (DiffView, ContextHeatmap, AgentLanes, AgentOrbs, StageTracker, SkillMarker) live in `src/renderer/components/studio/` and use the CSS in §10 plus Tailwind utilities.
4. **One meaning per visual** (§11). Identity is an orb, status is a dot, time is lanes, structure is a tree, content is a card.
5. Every interactive element is a real `<button>`, `<a>`, `<input>` or a shadcn control. Icon-only buttons need `aria-label`.
6. Do not add gradients, shadows, emoji, or coloured left-border cards anywhere except where this file says so (orbs; one popover shadow).

---

## 1. Setup checklist

Assumes electron-vite with the renderer at `src/renderer/`.

1. **Alias**: `@` → `src/renderer/src` (or your renderer root) in `electron.vite.config.ts` (renderer section) **and** `tsconfig.web.json` / `tsconfig.json` `paths`. `components.json` must use the same aliases (`@/components`, `@/components/ui`, `@/lib/utils`, `@/hooks`).
2. **Tailwind v4**: `@tailwindcss/vite` plugin in the renderer config; one CSS entry (`src/renderer/src/styles/globals.css`) that starts with `@import "tailwindcss";`. No `tailwind.config.js`.
3. **shadcn base**: check `components.json` → `"style"` / base. If AI Elements patterns are used later, confirm on their pages that they support the base you're on (the older AI SDK Elements registry required Radix). Do not re-init to switch; it's immutable.
4. **Fonts (offline)**: `bun add @fontsource-variable/inter @fontsource/jetbrains-mono`. Import in `main.tsx`:
   ```ts
   import "@fontsource-variable/inter";
   import "@fontsource/jetbrains-mono/400.css";
   import "@fontsource/jetbrains-mono/500.css";
   import "./styles/globals.css";
   ```
   Never load fonts from Google at runtime: the app must work offline.
5. **Icons**: `bun add lucide-react`. Default size 16, `strokeWidth={1.5}` (§8).
6. **Theme**: dark is default. On boot set `document.documentElement.classList.toggle("dark", theme === "dark")` where `theme` comes from user setting (`"system" | "dark" | "light"`, default `"dark"`); for `"system"` follow Electron `nativeTheme.shouldUseDarkColors` via IPC and listen to `nativeTheme.on("updated")`.
7. **Window**: `BrowserWindow` with `backgroundColor: "#181818"` (dark) / `"#ffffff"` (light) to avoid a white flash; `titleBarStyle: "hiddenInset"` on macOS, with a 28px drag region (`-webkit-app-region: drag`) at the top of the rail and sidebar; buttons inside it get `no-drag`.
8. **CSP**: renderer CSP must allow `'self'` fonts and styles only. No remote fonts, no remote images.
9. Install the shadcn components listed in §5.1.

---

## 2. Principles (why things look the way they do)

1. **Set up as you go.** Nothing is required up front. Preferences appear inline the first time they matter (SetupNudge) and save in one click. Settings exist but nobody has to visit them.
2. **Status over chrome.** Colour is spent only on: diff green/red, status dots, the blue accent (links, focus, running). Everything else is grey.
3. **Show what the agent saw.** Context, skills, subagent reports and session files are always inspectable.
4. **Keyboard first.** Every action has a shortcut (§12).
5. **One weight of emphasis.** Hierarchy comes from size and ink level (`foreground` → `muted-foreground` → `ink-faint`), not borders or colour.

---

## 3. Tokens

All colours, both themes. Names in the left column are the design-system names; the shadcn variable they map to is in §4.

| Token | Dark | Light | Use |
|---|---|---|---|
| surface-base | `#181818` | `#ffffff` | Main canvas: thread, diff body, home |
| surface-sidebar | `#1f1f1f` | `#f7f7f6` | Rail, sidebar, panel headers, diff file headers, nudges, dialogs |
| surface-raised | `#262626` | `#f2f2f1` | Composer, user bubble, tool output, inputs, segmented controls |
| surface-hover | `#2e2e2e` | `#ebebea` | Hover on rows, chips, ghost buttons |
| surface-selected | `#333333` | `#e4e4e3` | Selected row/tab |
| border-subtle | `#2c2c2c` | `#e8e8e6` | Dividers, card outlines (decorative only) |
| border-strong | `#3d3d3d` | `#d4d4d2` | Secondary button outline, kbd, pills |
| border-control | `#757575` | `#8c8c88` | Boundaries that must be seen (3:1): inputs, selects, switch track |
| ink | `#ececec` | `#1a1a1a` | Primary text and icons |
| ink-muted | `#a3a3a3` | `#55554f` | Secondary text |
| ink-faint | `#8f8f8f` | `#6b6b66` | Placeholders, labels, meta. Only on base/sidebar/raised; use ink-muted on selected rows and diff rows |
| primary | `#f5f5f5` | `#1a1a1a` | The one filled button per view (Send, Apply, Approve) |
| on-primary | `#141414` | `#ffffff` | Text on primary |
| accent (blue) | `#6ea8fe` | `#1f6feb` | Links, focus ring, running state. Never decorative |
| add | `#4cc38a` | `#1a7f4b` | Added lines, +N, ready |
| add-bg | `#183823` | `#e6f4ea` | Added line background |
| remove | `#f2777a` | `#c4302b` | Removed lines, −N, destructive text, failed |
| remove-bg | `#3d1d1d` | `#fbeaea` | Removed line background |
| status-running | = accent | = accent | Dot: working |
| status-attention | `#f0b44c` | `#a86400` | Dot: needs you. Always with a label |
| status-ready | = add | = add | Dot: ready for review |
| status-failed | = remove | = remove | Dot: failed |

**Type** (Inter for UI, JetBrains Mono for code/paths/counts/hashes):

| Utility | Size / line | Weight | Use |
|---|---|---|---|
| `text-display` | 28 / 34, −0.01em | 500 | Empty-state headline only |
| `text-title` | 15 / 20 | 600 | Task title, section titles |
| `text-body` | 14 / 20 | 400 | Messages, rows, default |
| `text-small` | 13 / 18 | 400 (500 on buttons) | Descriptions, chips, tool steps, buttons |
| `text-caption` | 12 / 16 | 500 | Group labels, badges, pills |
| `text-code` (mono) | 13 / 20 | 400 | Inline code, commands |
| `text-code-sm` (mono) | 12 / 20 | 400 | Diff lines, tool output, counts |

Settings page H1 uses 20/26 600 (`text-xl font-semibold leading-[26px]` is acceptable here only).

**Spacing**: Tailwind default 4px scale (`1`=4, `2`=8, `3`=12, `4`=16, `6`=24, `8`=32). Use only these steps plus `5` (20) for panel paddings.

**Radius**: `rounded-sm` 6px (kbd, code, tags) · `rounded-md` 10px (rows, buttons, inputs) · `rounded-lg` 14px (cards, diff, nudges, dialogs) · `rounded-xl` 20px (composer, message bubbles) · `rounded-full` (chips, badges, switches, round icon buttons).

**Shadow**: one only, `shadow-popover` for menus, popovers, command palette, dialogs.

---

## 4. `globals.css` (replace the shadcn-generated one)

Keep shadcn's structure (`:root` = light, `.dark` = dark, `@theme inline`). Values below are final.

```css
@import "tailwindcss";
@import "tw-animate-css";            /* keep if shadcn installed it */
@import "./agent-studio.css";         /* §10 custom component CSS */

@custom-variant dark (&:is(.dark *));

/* ---------- LIGHT ---------- */
:root {
  --radius: 10px;

  /* shadcn semantic */
  --background: #ffffff;              /* surface-base */
  --foreground: #1a1a1a;              /* ink */
  --card: #f7f7f6;                    /* surface-sidebar */
  --card-foreground: #1a1a1a;
  --popover: #f7f7f6;
  --popover-foreground: #1a1a1a;
  --primary: #1a1a1a;
  --primary-foreground: #ffffff;
  --secondary: #f2f2f1;               /* surface-raised */
  --secondary-foreground: #1a1a1a;
  --muted: #f2f2f1;                   /* surface-raised */
  --muted-foreground: #55554f;        /* ink-muted */
  --accent: #ebebea;                  /* shadcn "accent" = HOVER background, not our blue */
  --accent-foreground: #1a1a1a;
  --destructive: #c4302b;             /* remove */
  --border: #e8e8e6;                  /* border-subtle */
  --input: #8c8c88;                   /* border-control (3:1) */
  --ring: #1f6feb;                    /* our blue accent */
  --chart-1: #1f6feb;
  --chart-2: #1a7f4b;
  --chart-3: #a86400;
  --chart-4: #55554f;
  --chart-5: #8b4fc9;
  --sidebar: #f7f7f6;
  --sidebar-foreground: #1a1a1a;
  --sidebar-primary: #1a1a1a;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #ebebea;          /* row hover */
  --sidebar-accent-foreground: #1a1a1a;
  --sidebar-border: #e8e8e6;
  --sidebar-ring: #1f6feb;

  /* Agent Studio extras */
  --surface-raised: #f2f2f1;
  --surface-hover: #ebebea;
  --surface-selected: #e4e4e3;
  --border-strong: #d4d4d2;
  --border-control: #8c8c88;
  --ink-faint: #6b6b66;
  --link: #1f6feb;
  --add: #1a7f4b;
  --add-bg: #e6f4ea;
  --remove: #c4302b;
  --remove-bg: #fbeaea;
  --status-running: #1f6feb;
  --status-attention: #a86400;
  --status-ready: #1a7f4b;
  --status-failed: #c4302b;
  --shadow-popover-value: 0 8px 24px #0000001f, 0 0 0 1px #e8e8e6;
}

/* ---------- DARK (default) ---------- */
.dark {
  --background: #181818;
  --foreground: #ececec;
  --card: #1f1f1f;
  --card-foreground: #ececec;
  --popover: #1f1f1f;
  --popover-foreground: #ececec;
  --primary: #f5f5f5;
  --primary-foreground: #141414;
  --secondary: #262626;
  --secondary-foreground: #ececec;
  --muted: #262626;
  --muted-foreground: #a3a3a3;
  --accent: #2e2e2e;
  --accent-foreground: #ececec;
  --destructive: #f2777a;
  --border: #2c2c2c;
  --input: #757575;
  --ring: #6ea8fe;
  --chart-1: #6ea8fe;
  --chart-2: #4cc38a;
  --chart-3: #f0b44c;
  --chart-4: #a3a3a3;
  --chart-5: #c58bd9;
  --sidebar: #1f1f1f;
  --sidebar-foreground: #ececec;
  --sidebar-primary: #f5f5f5;
  --sidebar-primary-foreground: #141414;
  --sidebar-accent: #2e2e2e;
  --sidebar-accent-foreground: #ececec;
  --sidebar-border: #2c2c2c;
  --sidebar-ring: #6ea8fe;

  --surface-raised: #262626;
  --surface-hover: #2e2e2e;
  --surface-selected: #333333;
  --border-strong: #3d3d3d;
  --border-control: #757575;
  --ink-faint: #8f8f8f;
  --link: #6ea8fe;
  --add: #4cc38a;
  --add-bg: #183823;
  --remove: #f2777a;
  --remove-bg: #3d1d1d;
  --status-running: #6ea8fe;
  --status-attention: #f0b44c;
  --status-ready: #4cc38a;
  --status-failed: #f2777a;
  --shadow-popover-value: 0 8px 24px #00000066, 0 0 0 1px #2c2c2c;
}

@theme inline {
  /* fonts */
  --font-sans: "Inter Variable", Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace;

  /* shadcn colours */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  /* Agent Studio colours → bg-surface-raised, text-ink-faint, text-add, bg-add-bg, … */
  --color-surface-raised: var(--surface-raised);
  --color-surface-hover: var(--surface-hover);
  --color-surface-selected: var(--surface-selected);
  --color-border-strong: var(--border-strong);
  --color-border-control: var(--border-control);
  --color-ink-faint: var(--ink-faint);
  --color-link: var(--link);
  --color-add: var(--add);
  --color-add-bg: var(--add-bg);
  --color-remove: var(--remove);
  --color-remove-bg: var(--remove-bg);
  --color-status-running: var(--status-running);
  --color-status-attention: var(--status-attention);
  --color-status-ready: var(--status-ready);
  --color-status-failed: var(--status-failed);

  /* radii: explicit, NOT derived from --radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;

  /* type scale → text-display, text-title, text-body, text-small, text-caption, text-code, text-code-sm */
  --text-display: 28px;   --text-display--line-height: 34px; --text-display--letter-spacing: -0.01em; --text-display--font-weight: 500;
  --text-title: 15px;     --text-title--line-height: 20px;   --text-title--font-weight: 600;
  --text-body: 14px;      --text-body--line-height: 20px;
  --text-small: 13px;     --text-small--line-height: 18px;
  --text-caption: 12px;   --text-caption--line-height: 16px; --text-caption--font-weight: 500;
  --text-code: 13px;      --text-code--line-height: 20px;
  --text-code-sm: 12px;   --text-code-sm--line-height: 20px;

  /* shadow */
  --shadow-popover: var(--shadow-popover-value);
}

@layer base {
  * { @apply border-border outline-ring/50; }
  html, body, #root { height: 100%; }
  body {
    @apply bg-background text-foreground font-sans text-body antialiased;
    font-feature-settings: "cv11", "ss01";        /* Inter: straight l, open digits */
  }
  code, kbd, pre, .font-mono { font-variant-ligatures: none; }
  a { @apply text-link hover:underline underline-offset-2; }
  :focus-visible { @apply outline-2 outline-offset-2 outline-ring; }
  ::selection { background: color-mix(in srgb, var(--ring) 35%, transparent); }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
  }
}
```

> Note: `text-caption` and `text-title` carry a default weight. When combining with `font-*`, the explicit utility wins.

---

## 5. shadcn components

### 5.1 Install

```bash
bunx --bun shadcn@latest add button badge input textarea select switch checkbox radio-group \
  tabs toggle toggle-group tooltip popover dropdown-menu command dialog alert-dialog sheet \
  sidebar resizable scroll-area separator collapsible accordion table skeleton sonner \
  hover-card kbd progress chart item field
```

If AI Elements patterns are available for your base, also add: **Prompt Input, Model Selector, Message, Chat, Tool, Terminal, Subagent, Confirmation, Context, File Tree, Test Results, Plan, Queue** (each pattern page lists its own `add` command). Treat them as starting points and restyle per §9.

### 5.2 Required overrides (edit the generated files in `components/ui/`)

**Button** (`button.tsx`) — set `cva` to exactly these variants/sizes:

| variant | classes |
|---|---|
| `default` (primary) | `bg-primary text-primary-foreground hover:bg-primary/90` |
| `secondary` | `bg-secondary text-secondary-foreground border border-border-strong hover:bg-surface-hover` |
| `ghost` | `text-muted-foreground hover:bg-surface-hover hover:text-foreground` |
| `destructive` | `text-remove hover:bg-remove-bg` (text only, no fill) |
| `outline` | `border border-border-strong bg-transparent hover:bg-surface-hover` |
| `link` | `text-link underline-offset-2 hover:underline h-auto p-0` |
| `chip` (new) | `rounded-full h-7 px-2.5 text-small font-medium text-muted-foreground hover:bg-surface-hover hover:text-foreground data-[active=true]:bg-surface-selected data-[active=true]:text-foreground` |

| size | classes |
|---|---|
| `default` | `h-8 px-3 gap-1.5 rounded-md text-small font-medium` |
| `sm` | `h-6 px-2 gap-1 rounded-md text-caption` |
| `icon` | `size-8 rounded-md` |
| `icon-round` (new) | `size-8 rounded-full` (Send button) |

Base classes: `inline-flex items-center justify-center whitespace-nowrap select-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0`.

**Badge** — add variant `status`: `h-[22px] gap-1.5 rounded-full bg-surface-raised px-2 text-caption text-muted-foreground border-0`. Usage: `<Badge variant="status"><StatusDot state="running"/>Running · 4m</Badge>`.

**Input / Textarea / Select trigger** — `h-8 rounded-md border border-border-control bg-surface-raised px-2.5 text-small placeholder:text-ink-faint`. Remove any `dark:bg-input/30` (our `--input` is a border colour).

**Select trigger** — min-width 140px, chevron `ChevronDown` 14px `text-muted-foreground`, border `border-border` at rest, `hover:border-border-strong hover:bg-surface-hover`. (Quiet field; the visible boundary is the fill + text.)

**Switch** — track 34×20, off: `bg-surface-raised border border-border-control`, thumb `bg-muted-foreground` 14px; on: `bg-foreground border-foreground`, thumb `bg-background`. Monochrome, never blue/green.

**Tabs (panel tabs: Changes · Context · Session · Checks)** — `TabsList` transparent, gap-1; `TabsTrigger` styled like `chip` (rounded-full h-7); active = `bg-surface-selected text-foreground`.

**ToggleGroup (segmented: List/Graph, filters)** — container `inline-flex gap-0.5 rounded-md bg-surface-raised p-0.5`; items `h-[26px] px-2.5 rounded-[8px] text-caption text-muted-foreground data-[state=on]:bg-surface-selected data-[state=on]:text-foreground`.

**Tooltip / Popover / DropdownMenu / Command / Dialog** — `bg-popover border border-border-strong rounded-lg shadow-popover`. Dialog overlay `bg-black/55`.

**Kbd** — `rounded-sm border border-border-strong px-1 font-mono text-[11px] leading-4 text-muted-foreground`.

**Sidebar** — width 280px (`--sidebar-width: 280px`), plus a separate 56px icon rail outside the shadcn Sidebar (§7). Menu buttons `h-9 rounded-md`; selected `bg-surface-selected`.

**Sonner** — dark theme, `bg-popover border-border-strong`, bottom-right, max 3 visible.

**Chart** — use `--chart-1..5`; no gradients; grid lines `border-border`.

---

## 6. Typography rules

- Body is `text-body`. Only the empty-state headline is above 15px (`text-display`).
- Mono for: file paths, commands, hashes, branch names, token counts, `+N −N`, timestamps in logs, agent tags (`CX`, `CC`).
- Sentence case everywhere. No exclamation marks, no emoji.
- Numbers over adjectives: "3 files, +46 −12", not "several changes".

---

## 7. App shell and layout

```
┌──────┬──────────────┬───────────────────────────────┬──────────────────────┐
│ Rail │ Sidebar      │ Main (thread / page)          │ Panel (optional)     │
│ 56px │ 280px        │ fluid, content max 760px      │ 480–680px, resizable │
│      │ resizable,   │                               │ collapsible          │
│      │ collapsible  │                               │                      │
└──────┴──────────────┴───────────────────────────────┴──────────────────────┘
```

- Root: `flex h-screen overflow-hidden bg-background text-foreground`.
- **Rail** (`nav aria-label="Main"`): `w-14 shrink-0 flex flex-col items-center gap-1 py-3 bg-sidebar border-r border-border`. Icon buttons (size `icon`): Home, Tasks, Agents, Vault, then spacer, Settings, avatar (28px circle initials). Active = `secondary` variant.
- **Sidebar** (shadcn `Sidebar`, collapsible="offcanvas"): header = project switcher (ghost button, `text-title`, ChevronDown) + search icon button; "New task" ghost row with `⌘N` kbd; then status groups (§9.4).
- **Main**: column; header (task title row + StageTracker), scroll body, pinned composer.
- **Panel**: shadcn `Resizable` (`ResizablePanelGroup direction="horizontal"`) between Main and Panel; default 40%, min 32%, max 50%. Header has Tabs (Changes · Context · Session · Checks) and a collapse button.
- Narrow window (< 1100px): panel becomes a `Sheet` from the right; < 800px: sidebar collapses to rail-only.
- Body paddings: main 20–24px horizontal; panel 16px.

---

## 8. Iconography (lucide-react, 16px, strokeWidth 1.5, `currentColor`)

Rest colour `text-muted-foreground`, hover `text-foreground`.

| Use | Icon |
|---|---|
| Home / Tasks / Agents / Vault / Settings | `House` / `ListTodo` / `Network` / `Zap` / `Settings` |
| New, attach | `Plus` |
| Send / run | `ArrowUp` |
| Approval mode | `Shield` |
| Runtime chip | `Zap` |
| Collapse / expand | `ChevronRight` (rotates 90° open) / `ChevronDown` |
| File / folder | `File` / `Folder` |
| Command run | `SquareTerminal` |
| Accept / reject | `Check` / `X` |
| Reorder | `GripVertical` |
| Warning / info | `CircleAlert` |
| Time / limit | `Clock` |
| Branch | `GitBranch` |
| Locked rule | `Lock` |
| Not started | `Ban` (text-remove) |
| Skill loaded | `Zap` |
| Subagent | `GitFork` |
| Checks ok | `CircleCheck` (text-add) |

No other icon set. No emoji.

---

## 9. Component specs

Each spec: what it's for, what to build it from, anatomy, states, classes, a11y.

### 9.1 StatusDot
- 8px circle, `rounded-full`. States: `idle` (`bg-ink-faint`), `running` (`bg-status-running` + `animate-[pulse_1.4s_ease-in-out_infinite]` opacity 1→.35), `attention` (`bg-status-attention`), `ready` (`bg-status-ready`), `failed` (`bg-status-failed`).
- Always next to text or with `role="img" aria-label="Running"`. Never colour-coded per agent.

### 9.2 Chip
- `Button variant="chip"` with icon + label; value emphasised with `<b className="font-medium text-foreground">`.
- `outline` chips (`border border-border-strong`) open inspectors (Context chip).
- Pickers open a `Popover` with `Command` list.

### 9.3 Composer (Prompt Input)
- Wrapper `max-w-[760px] w-full`.
- **Scope bar** (only on Home): attached above the box: `mx-4 flex gap-1 rounded-t-lg border border-b-0 border-border bg-sidebar px-2 py-1`; chips: project (`Laptop` icon, active), base branch (`Folder`), workflow (`standard`).
- **Box**: `rounded-xl border border-border bg-surface-raised px-3 pt-3 pb-2`. Textarea borderless, transparent, `text-[15px] leading-[22px]`, min 44px, autosize to 8 lines; placeholder "Describe a task. @ to add files, / for workflows" (`text-ink-faint`).
- **Bar**: `mt-2 flex items-center gap-0.5`: attach (icon ghost) · approval chip (`Shield`, "Allow edits") · Context chip (outline, "Context · 3 skills · 2.1k") · spacer · runtime chip (`Zap`, "**Claude Code** Opus · High") · Send (`default` + `icon-round`, `ArrowUp`, `aria-label="Run task"`).
- In a running task the bar shows: attach · Context chip ("Context · 81%") · spacer · `Stop` (secondary) · Send. Placeholder "Steer Claude Code, or @ an agent".
- Keys: `⌘↵` run, `⇧⌘↵` best-of-N (later), `@` file picker, `/` workflow picker.

### 9.4 Sidebar task list (TaskRow + AgentTree)
- Group header: `flex justify-between px-2 pt-3 pb-1 text-caption text-ink-faint` ("Needs you · 1"). Fixed order: Needs you → Running → Ready for review → Done (collapsed) → Failed.
- **TaskRow** (`SidebarMenuButton`): `h-9 gap-2 px-2 rounded-md`; StatusDot · title (`truncate`) · meta (`font-mono text-caption text-ink-faint`; on hover/selected `text-muted-foreground`). Meta shows ONE fact: elapsed (running), pending action (needs you, e.g. "Plan · approve"), `+31 −4` (ready, green/red), reason (failed). Runtime + subagent count for multi-agent tasks: "CC · 3 sub".
- **AgentTree** (`SidebarMenuSub`): child rows `h-[30px] pl-[30px] text-small text-muted-foreground` with tree line `::before` (1px `border-border-strong`, bottom-left radius 6px); dot · `<span class="font-mono text-foreground">Explore</span> brief` · duration. Auto-expanded only for the selected task while any child runs; > 5 children → "+N more". Top-level agents never appear as children.
- Keys: `j/k` move, `↵` open, `⌫` archive.

### 9.5 Task header + StageTracker
- Header: `flex flex-col gap-2.5 px-5 pt-3.5 pb-3 border-b border-border`. Row 1: `h1.text-title` · status Badge · branch (`font-mono text-caption text-ink-faint`) · spacer · Agent switcher (§9.15, only multi-agent) · more (icon ghost, `Ellipsis`).
- **StageTracker** (`nav aria-label="Workflow stages"`): stages from the workflow template (`standard`: Define, Plan, Build, Verify, Review, Ship; `quick`: Plan, Build, Verify). Each stage is a pill button `h-7 px-2.5 rounded-full text-small font-medium`, separated by `w-3.5 h-px bg-border-strong` lines (line after a done stage `bg-ink-faint`).
  - upcoming: `text-ink-faint`
  - done: `text-muted-foreground` + `Check` icon
  - current: `bg-surface-raised text-foreground` + running StatusDot + progress ("Build · 3 of 7"), `aria-current="step"`
  - gate: `border border-status-attention text-status-attention` + "· needs you"; the matching primary action ("Approve plan") sits in the footer/header right. Gates are the only place amber asks for a click.
- Click a stage → opens its file in the Session tab.

### 9.6 Thread
- Body: `flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-5`; content `max-w-[760px]`.
- **User message**: right-aligned bubble `self-end max-w-[520px] rounded-xl bg-surface-raised px-3.5 py-2.5 text-body`.
- **Agent message**: header row `flex items-center gap-2 text-small` = orb avatar 20px (§9.15) · `<b className="font-medium">Claude Code</b>` · role ("builder") · time (`text-caption text-ink-faint`). Body `ml-7 text-body max-w-[560px]`, markdown rendered (code via `font-mono text-code`, inline code `rounded-sm bg-surface-raised px-1`).
- **ToolStep** (shadcn `Collapsible`, or AI Tool pattern restyled): summary row `flex items-center gap-2 px-2 py-1.5 rounded-md text-small text-muted-foreground hover:bg-surface-hover hover:text-foreground`: `ChevronRight` (rotates) · tool icon · "Verb object · result" (past tense: "Ran `bun test payments` · 2 failed"). Consecutive same-kind steps collapse ("Read 4 files"). Body `ml-8 mt-0.5 rounded-md bg-surface-raised px-3 py-2 font-mono text-code-sm text-muted-foreground whitespace-pre-wrap`, max 12 lines + "Show more". Failed steps: reason in `text-remove`, start expanded.
- **SubagentCard** (§9.7), **SkillMarker** (§9.8), **SetupNudge** (§9.13) are also thread items.

### 9.7 SubagentCard
- `details`/`Collapsible` card: `rounded-lg border border-border bg-background`. Summary `flex items-center gap-2 px-3 py-2 text-small`: chevron · orb 20px (parent family, lighter, §9.15) · type (`font-mono text-caption text-foreground`: Explore, general-purpose) · brief (`flex-1 truncate text-muted-foreground`) · status Badge or Verify pill · meta (`font-mono text-caption text-ink-faint`: "41s · 12 tools · 3.1k").
- Open: summary gets `border-b`; body `px-3 pt-2 pb-3`: steps on a tree line (`ml-[7px] border-l border-border-strong pl-3 text-caption leading-[22px] text-muted-foreground`), then **Report** box `rounded-md bg-surface-raised px-3 py-2 text-small` with header "Report" + Verify pill + "Open full report".
- **Verify pill**: `rounded-full border px-1.5 text-[11px] font-medium`; Unverified = `border-status-attention text-status-attention`; Verified = `border-add text-add`. Unverified until the parent agent reads the files the report cites.
- **States**: running (Badge "Running"; editor variant "Running · editor"), returned, **queued** (`opacity-70`, neutral dot, "Queued · 3 running", meta "starts when a slot frees"), **not started** (`border-dashed`, `Ban` icon in `text-remove`, Badge "Not started" in `text-remove`, meta names the rule "1 editor at a time", body quotes the reason sent back to the parent + link to the rule), **steps hidden** (steps area: "Steps not reported by runtime." in `text-ink-faint`).
- Parallel spawns stack in spawn order; > 3 collapse into "+N more subagents".

### 9.8 SkillMarker
- `role="note"` divider: `flex items-center gap-2 text-caption text-muted-foreground` with `::before/::after` `flex-1 border-t border-border`. Content: `Zap` · `<b className="font-mono text-foreground">debugging-and-error-recovery</b> loaded · bun test failed` · ghost `sm` buttons "View", "Mute here". Agent-picked variant: skill name in `text-muted-foreground`, text "picked by agent", no Mute.

### 9.9 Changes panel + DiffView (custom)
- Panel summary row: "3 files" · `+46 −12` (mono, green/red) · branch "studio/t-31 → main" · authorship line "2 by Claude Code · 1 by general-purpose" (`text-caption text-ink-faint`) · spacer · `Request changes` (secondary) · `Apply` (default).
- **DiffView** — use a diff library for parsing/virtualisation (e.g. `@pierre/diffs` or `react-diff-view` + `gitdiff-parser`); render with §10 classes. Never page one file at a time: continuous virtualised scroll of all files (`@tanstack/react-virtual`).
  - File card: `rounded-lg border border-border overflow-hidden bg-background`.
  - Head: `flex items-center gap-2 px-3 py-1.5 bg-sidebar border-b border-border text-small`: collapse chevron · path (`font-mono text-code-sm flex-1`) · editor orb 20px (who changed it) · `+N −N` · "new" badge if added · `Comment` ghost.
  - Lines: grid `44px 20px 1fr`, `font-mono text-code-sm whitespace-pre`; add rows `bg-add-bg` with `+` in `text-add`; del rows `bg-remove-bg` with `−` in `text-remove`; line numbers `text-ink-faint` (on coloured rows `text-muted-foreground`). Sign is mandatory: colour is never the only signal.
  - Fold: `px-3 py-1 bg-sidebar text-caption text-ink-faint` "42 unchanged lines" (click expands).
  - Hunk footer: `flex justify-end gap-1 px-2 py-1 border-t border-border`: `Reject [x]` (ghost) · `Accept [a]` (secondary). Accepted hunk/file → `opacity-60` + check in gutter/head + "Accepted".
  - Line comments: click line number (shift-click for range) → inline thread card `ml-16 my-2 rounded-md border border-border-strong p-3` with your comment, replies (agent orb avatar), reply input, Resolve. Comments are sent with **Request changes**.
  - Unified by default; split view when panel > 960px.
- File tree (right column on Review screen, 240–300px): rows `h-[30px] font-mono text-code-sm` + `+N −N`; selected `bg-surface-selected`. Header "3 files · 1 of 3 accepted".
- Keys: `n/p` next/prev file, `a` accept hunk, `x` reject, `c` comment.

### 9.10 Checks strip (Review)
- Row under header: `flex items-center gap-2 px-6 py-3 border-b border-border`: label "Checks" (caption) · one status Badge per check ("Tests · 48 passed", ready dot; "Lint · 2 warnings", attention dot, `text-status-attention`) · spacer · ghost "Ask agent to fix warnings". Click a badge → Checks tab with logs (Terminal/Test Results pattern).

### 9.11 ContextList (Context tab)
- Head: `text-title` "Context" · spacer · ToggleGroup agent filter (All · Codex · Claude Code) · ToggleGroup view (List · Graph).
- **Meters**: grid `96px 1fr 40px`, one per agent: label · bar `h-[3px] rounded-sm bg-surface-raised` with fill `bg-foreground` (`bg-status-attention` above 75%) · `%` mono (attention colour above 75%).
- Groups (caption, `text-ink-faint`), fixed order: **Shared** (instructions, skills, task prompt) · **Passed on** (handoff packets) · **Loaded on the fly** (situational skills + trigger) · **Picked up while working** (files, subagent reports, tool output) · last row **Runtime's own prompt** (`text-ink-faint`, count "—").
- Row grid `16px 1fr auto 52px`, `px-1 py-[7px] rounded-sm text-small`, hover `bg-surface-hover`: icon · name + note (`text-ink-faint`) · agent tags · tokens (mono caption, right-aligned).
- **Agent tags**: `rounded border px-1 font-mono text-[11px]`; has it: `border-border-control text-foreground`; doesn't: `border-border-strong text-ink-faint`. Tags, never orbs (rows are dense).
- Pre-launch hover action: Remove; post-launch: View. List is frozen after launch.

### 9.12 ContextHeatmap (custom, Graph view)
- Same rows and order as ContextList (switching keeps scroll position).
- Grid `16px 200px 1fr`; axis row with agent names over their columns.
- Cells: `14×14 rounded-[3px] bg-surface-raised`, gap 3px; intensity = inner `bg-foreground` at opacity `.16 / .40 / .65 / .92` (levels 1–4). Hover `outline outline-1 outline-ring outline-offset-1` + tooltip "Claude Code · step 7 · 1.2k tokens"; click → jump to that step in the thread.
- 10px gap between agents (handoff). Compaction: dashed 1.5px vertical `border-status-attention` line before the step after compaction.
- Opaque items: hatched cells `repeating-linear-gradient(45deg, var(--surface-hover) 0 2px, var(--background) 2px 4px)`.
- Legend: Less ▢▢▢▢ More · Compacted · Not visible.

### 9.13 SetupNudge
- shadcn `Item`/`Alert` restyled: `flex gap-3 rounded-lg border border-border bg-sidebar px-4 py-3 max-w-[560px]`: icon (muted) · title (`font-medium`, a question) · description (`text-small text-muted-foreground`, one sentence of evidence) · actions (scoped yes as `secondary`: "Turn on for brixport"; `ghost` "Not now").
- "Not now" mutes that nudge for the project. Max one visible at a time. Saving writes the setting at the named scope.

### 9.14 SettingRow
- `flex items-center gap-4 py-3 border-b border-border`: text column (label `font-medium` + scope pill `rounded-full border border-border-strong px-1.5 text-[11px] text-muted-foreground` "Global/Project/Task"; description `text-small text-muted-foreground`) · control (Switch / Select / Input).
- Overridden values show "Overrides Global" in the description. Changes save immediately; no Save button.

### 9.15 AgentOrbs (custom identity tiles)
Only two sizes are used: **20px avatar** and **28px header switcher**. There is no large orb row.
- Markup: `<span class="orb orb--xxs [orb--running]" style="--o1;--o2;--o3;--o4"><span class="orb__fill"><i/><i/><i/></span></span>` (§10).
- **Palettes** (literal colours allowed only here). Pick deterministically: `family[hash(agentId) % family.length]`.
  - Claude Code (magenta–violet): `["#e2559a","#7a4ff0","#d258e3","#b54fe0"]`
  - Claude subagents (lighter): `["#f3a6cc","#b9a3f7","#eaa6f0","#d8a8ee"]`, `["#f7b8d6","#c9b8fa","#f0bdf3","#e2bdf2"]`, `["#eeb3d4","#c2b0f8","#efb2f2","#ddb2ef"]`, `["#f0c2dc","#d3c6fb","#f4cdf6","#e9cff5"]`
  - Codex (blue): `["#55b3f0","#6fa8ea","#e0703f","#7d9fd8"]`, `["#6ec3f2","#58a0e8","#f0a060","#8fb3e0"]`
  - Codex subagents (lighter): `["#9fd0f6","#a9c4f2","#f2b99a","#b5cbea"]`
  - OpenCode (green): `["#e3d84b","#a8ef4a","#d9e86a","#9ce84a"]`
- States: running (blobs drift 9s, halo breathes 3.6s), done (`opacity .45`, `saturate(.6)`), queued (`opacity .25`), needs-you/failed (corner dot 8px with 2px `background` border), selected (switcher only: `outline 2px ring, offset 3px`).
- **Switcher** (task header, only when ≥ 2 agents or any subagents): `inline-flex items-center gap-1 rounded-full bg-surface-raised py-1 pl-1.5 pr-2.5`, 28px orbs as `role="option"`, selected name after them (`text-small font-medium`). Click filters thread/context to that agent; done agents collapse into "+N done".
- Every orb needs `aria-label` (or `aria-hidden` when a name is beside it). Reduced motion stops drift and halo.

### 9.16 AgentLanes (custom timeline)
- Rows `grid 170px 1fr h-7 text-caption`: label (top-level "Claude Code · builder"; children `pl-4 text-muted-foreground` "└ `Explore` adapters") · track (`relative h-7 border-b border-border`).
- Bars `absolute top-[9px] h-2.5 rounded-[3px]`: done `bg-muted-foreground`, running `bg-status-running`, failed `bg-status-failed`, waiting at gate `border border-status-attention bg-transparent`. Spawn tick: dashed 1px `border-border-control` full-height at spawn time. Now line: 1.5px `bg-ring`.
- Axis row: minutes, mono 11px `text-ink-faint`. Legend under. Hover a bar → tooltip (brief, duration, tools, report tokens); click → SubagentCard.
- Used on: Agents screen, Limit handoff (2-lane mini + stopped subagent row), Insights drill-in. Never inside the thread.

### 9.17 Needs-you item (Confirmation pattern)
- List grouped: Approvals · Gates · Failures · Questions (caption headers, `pl-3`).
- Row grid `20px 1fr auto`, `px-3 py-3.5 border-b border-border`: orb avatar of who asks · meta line (`text-caption text-ink-faint`: **Claude Code › general-purpose** · task · kind) + content (`text-body`, commands in `font-mono text-code bg-surface-raised rounded-sm px-1.5`) + note (`text-caption text-ink-faint`) · actions.
- Approvals: `Deny [n]` (destructive) · `Allow once [y]` (secondary) · `Always in brixport` (ghost). Gates: primary `Review`. Failures: `Discard` ghost + `Open task` secondary. Questions: inline Input + `Send`.
- Footer hint: `j k move · y allow · n deny · ↵ open` with Kbd.
- Each also fires an OS notification (Electron `Notification`) when the window is not focused.

### 9.18 Limit handoff card
- Thread item after a SkillMarker-style divider "**Claude Code** stopped · Max usage limit reached".
- Card `rounded-lg border border-border-strong p-5 flex flex-col gap-4`: title ("Claude Code hit its usage limit") + reset time · mini AgentLanes (Claude bar ending in failed tick, stopped subagent child row, Codex dashed continuation) · RadioGroup of options as bordered cards (`rounded-md border px-3.5 py-3`; selected `border-border-control bg-surface-raised`; first option tagged "recommended") · "Codex will receive" file list (session files with meta) · warning line for stopped subagents (`CircleAlert` in attention colour) · footer: `Edit handoff` ghost · spacer · `Not now` secondary · `Continue in Codex` default.

### 9.19 Ship dialog
- shadcn `Dialog`, `max-w-[560px] bg-sidebar rounded-lg shadow-popover p-5 gap-4`.
- Sections: **How** (RadioGroup cards: Push branch and open PR · Squash into main · Keep branch only) · **Commit message** (Textarea, mono 12/18, generated, editable) · **Keep for next time** (Checkbox list; each row tag "learning"/"decision" + text; saved to vault for the project) · Switch "Remove worktree after shipping" · footer `Cancel` secondary + primary label matching method ("Open PR").

### 9.20 SessionFiles (Session tab)
- Fixed order: `task.md`, `plan.md`, `execution.md`, `learnings.md`, `interface.md`, then `ref-*.md`; missing files hidden.
- Row grid `16px 1fr auto 64px`: icon · name (mono 12) + meta ("· 10 of 10 sections") · last-writer tag (`CC`, `CX`) · time (mono, right).
- `task.md` section bar: one 14×3px segment per section: filled `bg-muted-foreground`, "none" `bg-border-control`, missing `bg-surface-hover`.
- Opening `execution.md`: newest first; rows grid `44px auto 1fr`: time · writer tag (`CC`, `CC › Explore`, `CX`) · entry. ToggleGroup filter All · CC · Subagents · CX.

### 9.21 Plan review list
- `ol` of tasks; row grid `20px 24px 1fr auto`: grip (drag handle, `cursor-grab`, use `@dnd-kit/sortable`) · index (mono) · title (`font-medium`) + "`path` · acceptance check" (caption) · optional tag (`TDD`, `Explore`) + edit icon.
- Side panel "Who runs each stage": SettingRow per stage with runtime Select; "Skills likely to load" tags + one-line reason.
- Footer: estimate + worktree name · `Request changes` · `Approve and build` (default).

### 9.22 Define review
- `article` of task.md sections; each section grid `28px 1fr`: number (mono, faint) · `h3` 14/600 + body. Unknowns render as rows with an action tag (`Ask you` highlighted, `Assume no · flagged`, `Read more`) and an inline answer Input.
- Side panel: section bar, "Before planning" checks (CircleCheck green / CircleAlert amber), "Plan next with" runtime chip.
- Footer: note · `Request changes` · `Approve and plan`.

---

## 10. `agent-studio.css` (custom components)

Put next to `globals.css`. Uses the CSS variables from §4.

```css
/* ---------- Orbs ---------- */
.orb{--s:20px;position:relative;display:inline-block;flex:none;width:var(--s);height:var(--s);border-radius:calc(var(--s)*.32);transition:transform .3s cubic-bezier(.2,.8,.2,1),opacity .3s,filter .3s}
.orb__fill{position:absolute;inset:0;overflow:hidden;border-radius:inherit;background:var(--o4);box-shadow:inset 0 0 0 1px #ffffff14,inset 0 calc(var(--s)*.05) calc(var(--s)*.14) #ffffff2e}
.orb__fill>i{position:absolute;width:78%;height:78%;border-radius:50%;filter:blur(calc(var(--s)*.17))}
.orb__fill>i:nth-child(1){background:var(--o1);left:-14%;top:-6%}
.orb__fill>i:nth-child(2){background:var(--o2);right:-20%;top:-22%}
.orb__fill>i:nth-child(3){background:var(--o3);left:18%;bottom:-32%}
@supports (corner-shape:squircle){.orb,.orb__fill{corner-shape:squircle;border-radius:calc(var(--s)*.5)}}
.orb--xxs{--s:20px}.orb--2xs{--s:28px}
button.orb{cursor:pointer;padding:0;border:0;background:none}
button.orb:hover{transform:translateY(-1px) scale(1.04)}
.orb--done{opacity:.45;filter:saturate(.6)}
.orb--queued{opacity:.25}
.orb--running .orb__fill>i{animation:orb-blob 9s ease-in-out infinite}
.orb--running .orb__fill>i:nth-child(2){animation-delay:-3s}
.orb--running .orb__fill>i:nth-child(3){animation-delay:-6s}
.orb--running::before{content:"";position:absolute;inset:-30%;z-index:-1;border-radius:50%;background:radial-gradient(circle,var(--o2) 0%,var(--o1) 32%,transparent 70%);opacity:.45;filter:blur(calc(var(--s)*.2));animation:orb-breathe 3.6s ease-in-out infinite}
.orb--selected{outline:2px solid var(--ring);outline-offset:3px}
.orb__dot{position:absolute;right:-2px;bottom:-2px;width:8px;height:8px;border-radius:50%;border:2px solid var(--background)}
.orb__dot--attention{background:var(--status-attention)}.orb__dot--failed{background:var(--status-failed)}
@keyframes orb-blob{33%{transform:translate(14%,10%) scale(1.12)}66%{transform:translate(-12%,6%) scale(.9)}}
@keyframes orb-breathe{50%{opacity:.25;transform:scale(.9)}}
/* the parent of a running orb needs `isolation:isolate` so the halo sits behind it */

/* ---------- Diff ---------- */
.diff-line{display:grid;grid-template-columns:44px 20px minmax(0,1fr);font:400 12px/20px var(--font-mono);white-space:pre}
.diff-line__ln{text-align:right;padding-right:8px;color:var(--ink-faint);user-select:none;cursor:pointer}
.diff-line__sign{text-align:center;color:var(--ink-faint);user-select:none}
.diff-line--add{background:var(--add-bg)}.diff-line--add .diff-line__sign{color:var(--add)}
.diff-line--del{background:var(--remove-bg)}.diff-line--del .diff-line__sign{color:var(--remove)}
.diff-line--add .diff-line__ln,.diff-line--del .diff-line__ln{color:var(--muted-foreground)}

/* ---------- Heatmap ---------- */
.hm-cell{position:relative;width:14px;height:14px;flex:none;border-radius:3px;background:var(--surface-raised)}
.hm-cell>i{position:absolute;inset:0;border-radius:3px;background:var(--foreground)}
.hm-cell[data-l="1"]>i{opacity:.16}.hm-cell[data-l="2"]>i{opacity:.4}.hm-cell[data-l="3"]>i{opacity:.65}.hm-cell[data-l="4"]>i{opacity:.92}
.hm-cell:hover{outline:1px solid var(--ring);outline-offset:1px}
.hm-cell--opaque{background:repeating-linear-gradient(45deg,var(--surface-hover) 0 2px,var(--background) 2px 4px)}
.hm-compact{align-self:stretch;width:0;margin:4px 2px;border-left:1.5px dashed var(--status-attention)}

/* ---------- Lanes ---------- */
.lane-track{position:relative;height:28px;border-bottom:1px solid var(--border)}
.lane-bar{position:absolute;top:9px;height:10px;border-radius:3px;background:var(--muted-foreground)}
.lane-bar--running{background:var(--status-running)}.lane-bar--failed{background:var(--status-failed)}
.lane-bar--waiting{background:transparent;border:1px solid var(--status-attention)}
.lane-spawn{position:absolute;top:0;height:28px;border-left:1px dashed var(--border-control)}
.lane-now{position:absolute;top:0;bottom:0;border-left:1.5px solid var(--ring)}

/* ---------- Tree line (AgentTree, subagent steps) ---------- */
.tree-child{position:relative;padding-left:30px}
.tree-child::before{content:"";position:absolute;left:12px;top:-6px;bottom:50%;width:10px;border-left:1px solid var(--border-strong);border-bottom:1px solid var(--border-strong);border-bottom-left-radius:6px}

/* ---------- Marker (SkillMarker, stop dividers) ---------- */
.marker{display:flex;align-items:center;gap:8px;font-size:12px;line-height:16px;color:var(--muted-foreground)}
.marker::before,.marker::after{content:"";flex:1;border-top:1px solid var(--border)}

@media (prefers-reduced-motion:reduce){.orb--running .orb__fill>i,.orb--running::before{animation:none}}
```

---

## 11. Agent views: when to use which

| Question | View | Where | Never |
|---|---|---|---|
| Who said or did this? | Orb avatar 20px | Thread messages, SubagentCard header, handoff card, Needs-you rows, diff file head (editor), comment replies | Sidebar rows, tables, metrics |
| Show me only one agent's work | Orb switcher 28px | Task header, only with 2+ agents or any subagents | Single-agent tasks, Home |
| Is it running? Does it need me? | StatusDot / status Badge | Everywhere | As identity; never per-agent colours |
| What's running inside this task? | AgentTree | Sidebar, under selected task, open while subagents run | Top-level agents |
| What did a subagent do; can I trust it? | SubagentCard | Thread at spawn point; Agents screen list | Top-level agents; sidebar |
| When did things happen; what ran in parallel? | AgentLanes | Agents screen, Limit handoff, Insights | Inside the thread; single-agent tasks |
| What does each agent know? | ContextList / Heatmap with `CX` `CC` tags | Context tab | Orbs |

**Single-agent rule:** one agent and no subagents → no switcher, no tree, no Agents tab; only a status Badge.

---

## 12. Screens

Routes assume a hash or memory router in the renderer. "Shell" = Rail + Sidebar.

| # | Screen | Route | Layout | Key components | Stories |
|---|---|---|---|---|---|
| 1 | Onboarding | `/welcome` | No shell; centred column 640px | 3 numbered sections (Repository card + matched skill tags; Runtimes as SettingRows with "Signed in / Not installed" badges and Install; Vault card + "Import skill pack"); footer "Start building" | A2, A3 |
| 2 | Home | `/` | Shell + centred main | Running badges row (links: "3 agents running · 2 tasks", "1 plan needs you" in attention colour) · `text-display` "What should we build?" · Composer with scope bar · one SetupNudge | A1, B1, B4 |
| 3 | Define review | `/task/:id/define` | Shell + main (article + 260–320px side) | StageTracker (Define gate) · task.md sections · unknowns with answer input · side checks · footer Approve and plan | B2 |
| 4 | Plan review | `/task/:id/plan` | Shell + main (list + side) | Sortable plan list · "Who runs each stage" selects · likely skills · footer Approve and build | B3 |
| 5 | Task · Build | `/task/:id` | Shell + main + panel (Changes) | Header + switcher + StageTracker · thread (messages, SubagentCards incl. queued/not-started, ToolSteps, SkillMarker) · composer (Stop) · Changes panel with per-file editor orb | C3, C4, C5 |
| 6 | Task · Context | `/task/:id?panel=context` | same | ContextList ⇄ ContextHeatmap (working toggle) · meters · context nudge in thread | C6 |
| 7 | Task · Agents | `/task/:id/agents` | Shell + main (Thread/Agents toggle) | Agents summary grid (orb, runtime·model, status, time·tools, context meter) · AgentLanes · subagent list (cards collapsed, verify pills) with policy note | C4 |
| 8 | Needs you | `/inbox` | Shell + main (max 880px) | Grouped Confirmation rows · filter ToggleGroup · key hints | C1, C2 |
| 9 | Limit handoff | `/task/:id` (state) | Shell + main | Stop divider · handoff card (§9.18) | C7 |
| 10 | Task · Session | `/task/:id?panel=session` | Shell + main + panel (Session) | SessionFiles · execution.md log with writer filter · thread shows "steps not reported" card | C4, B2 |
| 11 | Review | `/task/:id/review` | Shell + main (diff + file tree) | StageTracker (Review gate) · Checks strip · DiffView with line comment thread · file tree · footer Discard / Request changes · N / Ship | D1, D2, D3, D6 |
| 12 | Ship | `/task/:id/review` + dialog | same, dimmed | Ship dialog (§9.19) | D4, D5 |
| 13 | Insights | `/insights` | Shell + main (max 1000px) | 4 metric tiles (`bg-surface-raised rounded-md p-4`; label caption, value 24/30 500) · runtime-by-task-type Table (winner tag column) · adherence meters · slowest-task AgentLanes | E1 |
| 14 | Vault | `/vault` | Shell + main (table + 360–460px detail) | ToggleGroup sections (Instructions · Skills · Workflows · Triggers · Learnings) · skills Table (Loaded as: `core · Stage` filled tag / `on trigger · …` outline tag; loads 30d) · detail: switches, SKILL.md preview (`pre` raised mono) | A3, E2 |
| 15 | Settings · Routing | `/settings/routing` | Shell + main (220px settings nav + content max 860px) | Usage window meters · ordered rules (locked rows with `Lock`, draggable project rules with runtime Select, source tag "project"/"from Insights") · Insights suggestion nudge · Limits and balancing SettingRows | E3 |

**Every screen also needs**: loading (Skeleton rows matching final layout), empty (one line + one action, e.g. Needs you: "Nothing needs you. Agents will ask here."), and error (inline `CircleAlert` + message + Retry) states. Dark and light both.

---

## 13. Interaction, motion, keyboard

**Keyboard (global)**: `⌘K` command palette · `⌘N` new task · `⌘1–4` rail sections · `⌘,` settings · `⌘\` toggle sidebar · `⌘J` toggle panel · `g i` inbox.
**Sidebar**: `j/k`, `↵`, `⌫` archive. **Review**: `n/p` file, `a` accept, `x` reject, `c` comment, `⌘↵` request changes. **Inbox**: `j/k`, `y` allow, `n` deny, `↵` open. **Composer**: `⌘↵` run, `@` files, `/` workflows, `Esc` blur.
Show shortcuts in tooltips and with `Kbd` on primary buttons.

**Motion**: 120–150ms ease-out for hover/press; 200–300ms for panel and dialog enter/exit (`tw-animate-css` defaults ok); chevrons rotate 150ms. Only continuous animations: running dot pulse (1.4s) and running orb (9s drift, 3.6s halo). All stop under `prefers-reduced-motion`.

**Notifications**: Electron `Notification` for gates, approvals, failures, limit hits when unfocused; clicking focuses the window and opens the item. In-app: Sonner for confirmations ("Plan approved", "PR opened") only.

---

## 14. Accessibility checklist

- Text ≥ 4.5:1 in both themes (tokens are tuned for this; `ink-faint` only on base/sidebar/raised). Control boundaries ≥ 3:1 (`border-control`).
- Colour is never the only signal: diff signs, status labels, verify text, dot + label.
- Focus visible on everything (`outline-ring`, 2px, offset 2px). Dialogs trap focus and restore it.
- Landmarks: rail `nav`, sidebar `nav`, `main`, panel `aside` with `aria-label`; stage tracker `nav`.
- Lists are `ul/ol`; tables are `table` with `thead`.
- Icon-only buttons have `aria-label`; orbs have `aria-label` or `aria-hidden`.
- Live regions: thread streaming in `aria-live="polite"` (throttled); inbox count changes announced.

---

## 15. Voice

- Short, plain. Past tense for results ("Fixed and pushed ed194f9"), imperative for actions ("Apply", "Request changes", "Discard").
- Buttons: verb first, 1–3 words. Errors: what happened + what to do ("Claude Code is signed out. Sign in and retry.").
- Never "successfully", "please", "simply", "!".
- Empty states invite: "Nothing needs you. Agents will ask here."

---

## 16. File structure

```
src/renderer/src/
  styles/globals.css            # §4
  styles/agent-studio.css       # §10
  components/ui/                # shadcn (with §5.2 overrides)
  components/studio/
    status-dot.tsx  chip.tsx  composer.tsx  stage-tracker.tsx
    sidebar-tasks.tsx (TaskRow, AgentTree)
    thread/ message.tsx tool-step.tsx subagent-card.tsx skill-marker.tsx limit-handoff.tsx
    diff/ diff-view.tsx diff-file.tsx line-comment.tsx file-tree.tsx
    context/ context-list.tsx context-heatmap.tsx meters.tsx
    agents/ agent-orb.tsx agent-switcher.tsx agent-lanes.tsx
    setup-nudge.tsx  setting-row.tsx  session-files.tsx  needs-you-item.tsx  ship-dialog.tsx
  lib/orb-palette.ts            # families + hash pick (§9.15)
  screens/ Onboarding Home DefineReview PlanReview TaskBuild TaskContext TaskAgents NeedsYou TaskSession Review Insights Vault SettingsRouting
```

Build order: globals/theme → Button/Badge/inputs overrides → shell (rail, sidebar, resizable) → Composer + Home → thread items → Changes/DiffView → Review/Ship → Context → Agents/orbs/lanes → Needs you → Session → Settings/Vault/Insights → Onboarding.

---

## 17. Do / don't

| Do | Don't |
|---|---|
| One `default` (primary) button per view | Two filled buttons side by side |
| Grey surfaces stacked base → sidebar → raised → hover → selected | Shadows for elevation (except popovers/dialogs) |
| Blue only for links, focus, running | Blue for decoration or selection fills |
| Amber only for "needs you" and warnings | Amber for brand or highlights |
| Mono for paths, counts, tags | Mono for prose |
| Tags `CX`/`CC` in dense rows | Orbs in tables or sidebar rows |
| Real diff library + virtualisation | Hand-parsed diffs or one-file paging |
| Inline nudges to set preferences | Onboarding wizards or required settings |

---

## 18. References

- Design system (tokens, component notes, previews): https://claude.ai/artifact/149FjSW7UN6fEpK4G7Wjby
- Screen mockups (15 artboards, 4 journey rows): https://claude.ai/artifact/NEV6pjFBreUuff3CH8RpdT
- Product spec (stories, workflows, routing, subagent lifecycle): https://claude.ai/artifact/K4EPWNNr9Z2Nm5Ex8SUd2w
- shadcn AI Elements patterns: https://ui.shadcn.com/docs/ai-elements