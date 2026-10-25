# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [1.2.0] - 2026-10-25

### Added
- Org-chart layout: `layout: 'orgchart'` draws a top-down tree with the manager centred over its reports and elbow links; options `levelHeight`, `hSpacing` and `stackLeaves` (4+ leaf reports listed in a column); `setLayout()` switches at runtime
- Typed nodes: optional `kind` (person, company, team, role, project, idea) and `meta` (title, email, url, avatar, start, end, status); cards show a badge (initials or avatar for people) and the title; inactive statuses draw a faded dashed card
- Collapse / expand: `collapse`, `expand`, `toggle`, `collapseAll`, `expandAll`, a +/− toggle under managers, `nodeToggle` event; `collapsed: true` kept in `toJSON()`
- Cross-links: root `links: [{ from, to, type?, label? }]` drawn as dashed labelled curves; `addLink`, `removeLink`, `getLinks`; `linkAdd` / `linkRemove` events
- `MindkeeperMap.diff(a, b)` (added, removed, moved, changed, links) and `highlightDiff()` / `clearDiff()` with a legend
- `src/types.ts` types for kinds, meta, links and diffs; `npm test` (DOM-free layout and model tests)
- Samples: 40-person org chart, January vs July reorg diff, people x companies x projects portfolio (`examples/` and the docs site)

### Unchanged
- Maps without the new fields lay out and render exactly as in 1.1; still zero dependencies

## [1.1.0] - 2026-05-10

### Added
- First release in this repo (npm still had 1.0.0): SVG mind map with drag, pan and zoom, CRUD API, `insertBetween`, JSON import/export, PNG/SVG export, events
