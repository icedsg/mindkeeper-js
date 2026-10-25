# mindkeeper-map.js

A standalone interactive mind map and org chart library for the web. Zero dependencies, no build step — drop in a single JS file and start building.

[![npm](https://img.shields.io/npm/v/mindkeeper-map?style=flat-square&color=58a6ff)](https://www.npmjs.com/package/mindkeeper-map)
[![license](https://img.shields.io/badge/license-MIT-green?style=flat-square)](./LICENSE)
[![no dependencies](https://img.shields.io/badge/dependencies-0-brightgreen?style=flat-square)](./package.json)
[![bundle size](https://img.shields.io/bundlephobia/minzip/mindkeeper-map?style=flat-square&label=minzipped)](https://bundlephobia.com/package/mindkeeper-map)

**[Live Demo & Docs →](https://icedsg.github.io/mindkeeper-js)** · samples: [org chart](https://icedsg.github.io/mindkeeper-js/orgchart.html) · [reorg diff](https://icedsg.github.io/mindkeeper-js/reorg.html) · [portfolio](https://icedsg.github.io/mindkeeper-js/portfolio.html)

---

## Features

- **SVG rendering** — crisp at any resolution, colour-coded branches, bezier links, drop-shadow
- **Drag & drop** — drag any node to reposition it independently
- **Pan & zoom** — scroll-wheel zoom, drag-to-pan, pinch-to-zoom on touch
- **Full CRUD API** — add, update, delete nodes programmatically
- **Insert between** — insert a node between any two connected nodes
- **JSON import/export** — `fromJSON()` / `toJSON()` for persistence
- **PNG & SVG export** — high-DPI PNG and vector SVG, no extra dependencies
- **Org-chart layout** — `layout: 'orgchart'` draws a top-down tree (manager above reports), switchable at runtime with `setLayout()`
- **Typed nodes** — optional `kind` (person, company, team, role, project, idea) and `meta` (title, email, avatar, status...) give each card a colour, badge and subtitle
- **Collapse / expand** — fold any branch; the state is kept in `toJSON()`
- **Cross-links** — dashed, labelled links between any two nodes (person → project, advisor → company)
- **Diff highlight** — `MindkeeperMap.diff(before, after)` + `highlightDiff()` show who joined, left, moved or changed
- **Event system** — `nodeClick`, `nodeAdd`, `nodeUpdate`, `nodeDelete`, `nodeToggle`, `linkAdd`, `linkRemove`
- **Zero dependencies** — one file, pure web platform APIs, works everywhere

---

## Install

### CDN (no build step)

```html
<script src="https://cdn.jsdelivr.net/npm/mindkeeper-map/src/mindkeeper-map.js"></script>
```

### npm

```bash
npm install mindkeeper-map
```

---

## Quick Start

```html
<div id="map" style="width:100%; height:500px;"></div>
<script src="mindkeeper-map.js"></script>
<script>
const map = new MindkeeperMap('#map');
map.init({
  topic: 'My Mind',
  children: [
    { id: 'work', topic: 'Work', children: [
      { topic: 'Q3 launch' },
      { topic: 'Team retro' }
    ]},
    { id: 'personal', topic: 'Personal', children: [
      { topic: 'Morning run' },
      { topic: 'Reading list' }
    ]}
  ]
});
</script>
```

---

## API

### Constructor

```js
const map = new MindkeeperMap(selector, options?)
```

| Option | Default | Description |
|--------|---------|-------------|
| `layout` | `'mindmap'` | `'mindmap'` (branches left/right of the root) or `'orgchart'` (top-down) |
| `levelWidth` | `240` | Horizontal spacing between depth levels (px) |
| `levelHeight` | `110` | Org chart: vertical distance between levels (px) |
| `hSpacing` | `24` | Org chart: gap between sibling subtrees (px) |
| `stackLeaves` | `4` | Org chart: a manager with this many reports, all without reports of their own, lists them in a column (`0` = never) |
| `vSpacing` | `54` | Vertical spacing between siblings (px) |
| `linkStroke` | `3` | Link line width (px) |
| `nodeBorder` | `2.5` | Node border width (px) |
| `fontFamily` | `system-ui` | Node label font |

### Methods

#### `.init(data)` → `this`
Render the map from a tree object. Calls `_setup()` and re-fits the view.

#### `.fromJSON(data)` → `this`
Alias for `.init()`. Useful for re-loading saved state.

#### `.toJSON()` → `object`
Export the current tree as a plain JS object (same format as the input).

#### `.getNode(id)` → `{ id, topic, children: string[] } | null`
Return lightweight metadata for a node.

#### `.addNode(parentId, { topic, id?, kind?, meta? })` → `string`
Add a child to the given parent. Returns the new node's id.

#### `.updateNode(id, { topic?, kind?, meta? })` → `this`
Update a node's label, kind or meta. The map re-renders automatically.

#### `.deleteNode(id)` → `this`
Delete a node and all its descendants. Throws if called on the root.

#### `.insertBetween(parentId, childId, { topic, id? })` → `string`
Insert a new node between `parentId` and `childId`. The existing child becomes a child of the new node. Returns the new node's id.

```
Before: Root → Work
After:  Root → Category → Work
```

#### `.setLayout('mindmap' | 'orgchart')` → `this`
Switch layout and refit.

#### `.collapse(id)` / `.expand(id)` / `.toggle(id)` / `.collapseAll()` / `.expandAll()` → `this`
Fold or open branches. Managers show a +/− toggle under the card; collapsed nodes are saved as `collapsed: true`.

#### `.addLink(from, to, type?, label?)` / `.removeLink(from, to, type?)` / `.getLinks()`
Cross-links between any two nodes, drawn as dashed curves with a label (the label defaults to the type). A link whose end sits inside a collapsed branch is drawn to the nearest visible ancestor.

#### `MindkeeperMap.diff(before, after)` → `diff`
Static. Compares two trees by node id and returns `{ added, removed, moved, changed, links: { added, removed }, info }` (`info[id]` gives the topic, old/new parent and changed fields).

#### `.highlightDiff(diff)` / `.clearDiff()` → `this`
Ring the cards from a diff: green added, red removed, amber changed, dashed amber moved, with a legend listing removed names.

#### `.fit()` → `this`
Fit the entire map into the container view.

#### `.exportPNG(filename?)` / `.exportSVG(filename?)`
Download the full mindmap as a high-DPI PNG or vector SVG.

#### `.on(event, handler)` / `.off(event, handler)` → `this`
Subscribe / unsubscribe from events.

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `nodeClick` | `{ id, topic }` | A node was clicked |
| `nodeAdd` | `{ node: { id, topic }, parentId }` | A node was added |
| `nodeUpdate` | `{ id, data }` | A node was updated |
| `nodeDelete` | `{ id }` | A node was deleted |
| `nodeDeselect` | `{}` | Background was clicked (selection cleared) |
| `nodeToggle` | `{ id, collapsed }` | A branch was collapsed or expanded |
| `linkAdd` | `{ link }` | A cross-link was added |
| `linkRemove` | `{ from, to, type }` | A cross-link was removed |

---

## Examples

### CRUD

```js
const map = new MindkeeperMap('#container');
map.init({ id: 'root', topic: 'Root', children: [{ id: 'a', topic: 'Alpha' }] });

// Add a child
const newId = map.addNode('a', { topic: 'Beta' });

// Insert between Root and Alpha
const midId = map.insertBetween('root', 'a', { topic: 'Middle' });

// Rename
map.updateNode(newId, { topic: 'Beta (v2)' });

// Delete
map.deleteNode(newId);
```

### Events

```js
map
  .on('nodeClick', ({ id, topic }) => {
    console.log('Selected:', topic);
  })
  .on('nodeAdd', () => {
    localStorage.setItem('map', JSON.stringify(map.toJSON()));
  });
```

### Export

```js
map.exportPNG('my-mindmap.png');
map.exportSVG('my-mindmap.svg');

// Save the tree
const json = map.toJSON();
localStorage.setItem('map', JSON.stringify(json));

// Reload
map.fromJSON(JSON.parse(localStorage.getItem('map')));
```

### Org chart

```js
const org = new MindkeeperMap('#org', { layout: 'orgchart' });
org.init({
  id: 'ceo', topic: 'Ada Park', kind: 'person', meta: { title: 'CEO' },
  children: [
    { id: 'cto', topic: 'Lin Chen', kind: 'person', meta: { title: 'CTO' }, children: [
      { id: 'platform', topic: 'Platform', kind: 'team', children: [
        { topic: 'Sam Ortiz', kind: 'person', meta: { title: 'Engineer' } }
      ]}
    ]},
    { id: 'apollo', topic: 'Apollo', kind: 'project' }
  ],
  links: [{ from: 'cto', to: 'apollo', type: 'leads' }]
});

// Who changed between two versions of the chart?
const diff = MindkeeperMap.diff(januaryData, julyData);
org.init(julyData).highlightDiff(diff);
```

### JSON Format

```json
{
  "id": "root",
  "topic": "Root Node",
  "children": [
    {
      "id": "branch-1",
      "topic": "Branch A",
      "children": [
        { "topic": "Leaf 1" },
        { "topic": "Leaf 2" }
      ]
    },
    {
      "id": "branch-2",
      "topic": "Branch B"
    }
  ]
}
```

`id` fields are optional on input — stable ids are generated for any node that omits them.

Optional fields (all backwards compatible — maps without them render exactly as before):

| Field | Where | Meaning |
|-------|-------|---------|
| `kind` | node | `person`, `company`, `team`, `role`, `project` or `idea` |
| `meta` | node | `{ title, email, url, avatar, start, end, status }`; `status: 'left'` (or ended/closed/archived/inactive) draws a faded dashed card |
| `collapsed` | node | `true` hides the node's children |
| `links` | root | `[{ from, to, type?, label? }]` cross-links by node id |

---

## GitHub Pages Setup

The docs site is served from the `docs/` folder. To enable GitHub Pages:

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set **Source** to `Deploy from a branch`, branch `master`, folder `/docs`
4. Your site will be live at `https://<username>.github.io/mindkeeper-js/`

---

## Related

- **[mindkeeper-mcp](https://www.npmjs.com/package/mindkeeper-mcp)** — CLI / MCP server for managing mind maps and org charts from AI assistants (entities, links, change history, CSV import). Its `export_orgchart` tool emits this library's JSON format directly.

---

## License

MIT © [icedsg](https://github.com/icedsg)
