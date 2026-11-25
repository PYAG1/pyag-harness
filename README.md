# Agent Studio

Desktop UI for running and reviewing coding agents. Built with Electrobun, React 19, Tailwind CSS v4 and shadcn/ui.

The visual spec is [design.md](design.md). Follow it for every UI change.

## Getting started

```bash
hutch run install     # install dependencies
hutch run dev:hmr     # dev with hot reload (recommended)
hutch run dev         # dev with bundled assets
hutch run build       # production build
```

## Layout

```
src/
  bun/index.ts                 # main process: window (hiddenInset title bar)
  mainview/
    styles/globals.css         # tokens + theme (design.md §4)
    styles/agent-studio.css    # orbs, diff, heatmap, lanes (design.md §10)
    components/ui/             # shadcn, with design.md §5.2 overrides
    components/studio/         # Agent Studio components
    lib/                       # theme, orb palette, mock data
    screens/                   # one file per screen (design.md §12)
```

Adding shadcn components: Hutch has its own package resolver, so don't let the shadcn CLI install into this repo. Generate the components in a scratch project, copy the files into `components/ui/`, add any new dependencies to `package.json`, then run `hutch install`.
