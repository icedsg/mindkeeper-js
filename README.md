# mindkeeper-map.js

A standalone interactive mind map library for the web. Zero dependencies, no build step — drop in a single JS file and start building.

[![npm](https://img.shields.io/npm/v/mindkeeper-map?style=flat-square&color=58a6ff)](https://www.npmjs.com/package/mindkeeper-map)
[![license](https://img.shields.io/badge/license-MIT-green?style=flat-square)](./LICENSE)
[![no dependencies](https://img.shields.io/badge/dependencies-0-brightgreen?style=flat-square)](./package.json)
[![bundle size](https://img.shields.io/bundlephobia/minzip/mindkeeper-map?style=flat-square&label=minzipped)](https://bundlephobia.com/package/mindkeeper-map)

**[Live Demo & Docs →](https://icedsg.github.io/mindkeeper-js)**

---

## Features

- **SVG rendering** — crisp at any resolution, colour-coded branches, bezier links, drop-shadow
- **Drag & drop** — drag any node to reposition it independently
- **Pan & zoom** — scroll-wheel zoom, drag-to-pan, pinch-to-zoom on touch
- **Full CRUD API** — add, update, delete nodes programmatically
- **Insert between** — insert a node between any two connected nodes
- **JSON import/export** — `fromJSON()` / `toJSON()` for persistence
- **PNG & SVG export** — high-DPI PNG and vector SVG, no extra dependencies
- **Event system** — `nodeClick`, `nodeAdd`, `nodeUpdate`, `nodeDelete`
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
| `levelWidth` | `240` | Horizontal spacing between depth levels (px) |
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

#### `.addNode(parentId, { topic, id? })` → `string`
Add a child to the given parent. Returns the new node's id.

#### `.updateNode(id, { topic })` → `this`
Update a node's label. The map re-renders automatically.

#### `.deleteNode(id)` → `this`
Delete a node and all its descendants. Throws if called on the root.

#### `.insertBetween(parentId, childId, { topic, id? })` → `string`
Insert a new node between `parentId` and `childId`. The existing child becomes a child of the new node. Returns the new node's id.

```
Before: Root → Work
After:  Root → Category → Work
```

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

---

## GitHub Pages Setup

The docs site is served from the `docs/` folder. To enable GitHub Pages:

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set **Source** to `Deploy from a branch`, branch `main`, folder `/docs`
4. Your site will be live at `https://<username>.github.io/mindkeeper-js/`

---

## Related

- **[mindkeeper-mcp](https://www.npmjs.com/package/mindkeeper-mcp)** — CLI / MCP server for managing mind maps from the terminal and AI assistants. The JSON format is compatible — export from mindkeeper-mcp and visualise with mindkeeper-map.js.

---

## License

MIT © [icedsg](https://github.com/icedsg)
