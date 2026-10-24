// Model + layout tests, no DOM: node test/run.js
'use strict';
var assert = require('assert');
var MindkeeperMap = require('../src/mindkeeper-map.js');

var legacyTree = require('./fixtures/legacy-tree.json');
var legacyLayout = require('./fixtures/legacy-layout.json');

var passed = 0;
function test(name, fn) {
  try { fn(); passed += 1; console.log('ok   ' + name); }
  catch (e) { console.log('FAIL ' + name + '\n     ' + e.message); process.exitCode = 1; }
}

// A map with a fake container: _layout only needs clientWidth/clientHeight
function load(data) {
  var map = new MindkeeperMap({ clientWidth: 1000, clientHeight: 700 });
  map._data = map._ensureIds(JSON.parse(JSON.stringify(data)));
  map._layout(map._data);
  return map;
}
function node(map, id) {
  return map._nodes.filter(function (n) { return n.id === id; })[0];
}

var org = {
  id: 'acme', topic: 'Acme Inc', kind: 'company', meta: { url: 'https://acme.example' },
  children: [
    { id: 'ceo', topic: 'Ada Lovelace', kind: 'person',
      meta: { title: 'Chief Executive Officer', email: 'ada@acme.example', start: '2024-01-15' },
      children: [
        { id: 'eng', topic: 'Engineering', kind: 'team', children: [
          { id: 'grace', topic: 'Grace Hopper', kind: 'person', meta: { title: 'VP Engineering', avatar: 'https://acme.example/g.png' } },
          { id: 'old', topic: 'Charles Babbage', kind: 'person', meta: { title: 'Architect', status: 'left', end: '2026-06-30' } }
        ] },
        { id: 'apollo', topic: 'Apollo', kind: 'project', meta: { status: 'active' } },
        { id: 'plain', topic: 'Untyped note' },
        { id: 'titled', topic: 'Advisor', meta: { title: 'Board' } },
        { id: 'odd', topic: 'Unknown kind', kind: 'robot' }
      ] }
  ]
};

test('legacy tree: toJSON round-trips unchanged', function () {
  assert.deepStrictEqual(load(legacyTree).toJSON(), legacyTree);
});

test('legacy tree: layout matches the pre-typed-nodes version', function () {
  var map = load(legacyTree);
  var now = map._nodes.map(function (n) {
    return { id: n.id, cx: n.cx, cy: n.cy, w: n.w, h: n.h, fill: n.style.fill };
  });
  assert.deepStrictEqual(now, legacyLayout);
  map._nodes.forEach(function (n) {
    assert.strictEqual(n.badge, undefined, n.id + ' has a badge');
    assert.strictEqual(n.sub, undefined, n.id + ' has a title line');
  });
});

test('typed tree: toJSON round-trips kind + meta', function () {
  assert.deepStrictEqual(load(org).toJSON(), org);
});

test('typed tree: serialize drops empty meta values', function () {
  var out = MindkeeperMap.serialize({ id: 'x', topic: 'X', kind: 'idea', meta: { title: '', url: null } });
  assert.deepStrictEqual(out, { id: 'x', topic: 'X', kind: 'idea' });
});

test('kind picks colours, badge and size', function () {
  var map = load(org);
  var K = MindkeeperMap.KINDS;
  assert.strictEqual(node(map, 'acme').style, K.company);
  assert.strictEqual(node(map, 'acme').badge, 'C');
  assert.strictEqual(node(map, 'eng').badge, 'T');
  assert.strictEqual(node(map, 'apollo').badge, 'P');
  assert.strictEqual(node(map, 'ceo').badge, 'AL');
  assert.strictEqual(node(map, 'ceo').style, K.person);
  assert.strictEqual(node(map, 'ceo').sub, 'Chief Executive Officer');
  assert.ok(node(map, 'ceo').h >= 44, 'titled card is two lines tall');
  assert.ok(node(map, 'ceo').w > 28 + 'Chief Executive Officer'.length * 11 * 0.55, 'card fits title + badge');
  assert.strictEqual(node(map, 'grace').avatar, 'https://acme.example/g.png');
});

test('status left/ended marks the card inactive', function () {
  var map = load(org);
  assert.strictEqual(node(map, 'old').inactive, true);
  assert.strictEqual(node(map, 'apollo').inactive, false);
});

test('untyped / unknown-kind nodes keep the palette', function () {
  var map = load(org);
  ['plain', 'odd'].forEach(function (id) {
    var n = node(map, id);
    assert.ok(n.badge === undefined && n.sub === undefined, id);
    assert.ok(Object.keys(MindkeeperMap.KINDS).every(function (k) { return MindkeeperMap.KINDS[k] !== n.style; }), id);
  });
  assert.strictEqual(node(map, 'odd').kind, 'robot');
  // A title alone adds the second line but keeps branch colours
  assert.strictEqual(node(map, 'titled').sub, 'Board');
  assert.strictEqual(node(map, 'titled').badge, null);
});

test('addNode / updateNode / insertBetween carry kind + meta', function () {
  var map = load(org);
  var added = [];
  map.on('nodeAdd', function (e) { added.push(e); });
  var id = map.addNode('eng', { topic: 'Linus T', kind: 'person', meta: { title: 'Engineer', email: '' } });
  assert.deepStrictEqual(map.getNode(id), { id: id, topic: 'Linus T', children: [], kind: 'person', meta: { title: 'Engineer' } });
  assert.strictEqual(added[0].node.kind, 'person');
  assert.strictEqual(node(map, id).badge, 'LT');

  map.updateNode(id, { meta: { title: 'Staff Engineer', start: '2026-10-01' } });
  assert.deepStrictEqual(map.getNode(id).meta, { title: 'Staff Engineer', start: '2026-10-01' });
  map.updateNode(id, { meta: { start: null } });
  assert.deepStrictEqual(map.getNode(id).meta, { title: 'Staff Engineer' });
  map.updateNode(id, { kind: null, meta: null });
  assert.deepStrictEqual(map.getNode(id), { id: id, topic: 'Linus T', children: [] });

  var mid = map.insertBetween('ceo', 'eng', { topic: 'Platform', kind: 'team' });
  assert.strictEqual(map.getNode(mid).kind, 'team');
  assert.deepStrictEqual(map.getNode(mid).children, ['eng']);
});

// ── Org-chart layout ─────────────────────────────────────────────────────────

function loadOrg(data, opts) {
  var map = new MindkeeperMap({ clientWidth: 1000, clientHeight: 700 }, Object.assign({ layout: 'orgchart' }, opts));
  map._data = map._ensureIds(JSON.parse(JSON.stringify(data)));
  map._layout(map._data);
  return map;
}
function person(id, kids) {
  return { id: id, topic: 'Person ' + id, kind: 'person', meta: { title: 'Title of ' + id }, children: kids || [] };
}
var company = {
  id: 'co', topic: 'Sample Co', kind: 'company', children: [
    person('ceo', [
      person('cto', [person('e1'), person('e2'), person('e3'), person('e4'), person('e5')]),
      person('cfo', [person('a1'), person('a2')]),
      person('coo', [person('m1', [person('w1'), person('w2')]), person('m2')])
    ])
  ]
};

function overlaps(a, b) {
  return Math.abs(a.cx - b.cx) * 2 < a.w + b.w && Math.abs(a.cy - b.cy) * 2 < a.h + b.h;
}

test('orgchart: managers sit above their reports, no cards overlap', function () {
  var map = loadOrg(company);
  assert.strictEqual(map._nodes.length, 16);
  map._nodes.forEach(function (n) {
    if (n.parent) assert.ok(n.cy > n.parent.cy, n.id + ' is not below ' + n.parent.id);
  });
  for (var i = 0; i < map._nodes.length; i++)
    for (var j = i + 1; j < map._nodes.length; j++)
      assert.ok(!overlaps(map._nodes[i], map._nodes[j]), map._nodes[i].id + ' overlaps ' + map._nodes[j].id);
});

test('orgchart: a manager is centred over a row of reports', function () {
  var map = loadOrg(company);
  var ceo = node(map, 'ceo'), cto = node(map, 'cto'), coo = node(map, 'coo');
  assert.ok(Math.abs(ceo.cx - (cto.cx + coo.cx) / 2) < 0.001);
  assert.strictEqual(node(map, 'cfo').cy, cto.cy, 'siblings share a row');
  assert.ok(cto.cx < node(map, 'cfo').cx && node(map, 'cfo').cx < coo.cx, 'sibling order kept');
  assert.ok(map._links.every(function (l) { return l.kind === 'elbow' || l.kind === 'stack'; }));
});

test('orgchart: 4+ leaf reports stack in a column, fewer stay in a row', function () {
  var map = loadOrg(company);
  var es = ['e1', 'e2', 'e3', 'e4', 'e5'].map(function (id) { return node(map, id); });
  es.forEach(function (e, i) {
    assert.strictEqual(e.cx - e.w / 2, es[0].cx - es[0].w / 2, 'column left edge');
    if (i) assert.ok(e.cy > es[i - 1].cy);
  });
  assert.strictEqual(node(map, 'a1').cy, node(map, 'a2').cy);
  // m1 has reports of its own, so coo's reports stay in a row
  assert.strictEqual(node(map, 'm1').cy, node(map, 'm2').cy);
  // stackLeaves: 0 turns stacking off
  var flat = loadOrg(company, { stackLeaves: 0 });
  assert.strictEqual(node(flat, 'e1').cy, node(flat, 'e5').cy);
});

test('collapse hides descendants, keeps toJSON round-trip, expand restores', function () {
  var map = loadOrg(company);
  var toggles = [];
  map.on('nodeToggle', function (e) { toggles.push(e); });
  map.collapse('cto');
  assert.strictEqual(node(map, 'e1'), undefined);
  assert.strictEqual(node(map, 'cto').collapsed, true);
  assert.strictEqual(node(map, 'cto').hidden, 5);
  assert.strictEqual(map._nodes.length, 11);
  assert.strictEqual(map.toJSON().children[0].children[0].collapsed, true);
  assert.deepStrictEqual(toggles, [{ id: 'cto', collapsed: true }]);
  assert.strictEqual(loadOrg(map.toJSON())._nodes.length, 11, 'collapsed state survives reload');

  map.toggle('cto');
  assert.strictEqual(map._nodes.length, 16);
  assert.strictEqual(map.toJSON().children[0].children[0].collapsed, undefined);

  map.collapseAll();
  assert.deepStrictEqual(map._nodes.map(function (n) { return n.id; }), ['co', 'ceo']);
  map.expandAll();
  assert.strictEqual(map._nodes.length, 16);
});

test('collapse works in the mind-map layout too; setLayout switches', function () {
  var map = load(company);
  map.collapse('coo');
  assert.strictEqual(node(map, 'w1'), undefined);
  assert.ok(node(map, 'coo').hasToggle && node(map, 'coo').collapsed);
  map.expand('coo');
  assert.strictEqual(map._nodes.length, 16);
  assert.ok(node(map, 'ceo').cx > node(map, 'co').cx, 'mind map grows sideways');
  map.setLayout('orgchart');
  assert.ok(node(map, 'ceo').cy > node(map, 'co').cy, 'org chart grows down');
  assert.throws(function () { map.setLayout('radial'); });
});

console.log('\n' + passed + ' passed' + (process.exitCode ? ', some FAILED' : ''));
