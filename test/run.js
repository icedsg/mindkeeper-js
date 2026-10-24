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

console.log('\n' + passed + ' passed' + (process.exitCode ? ', some FAILED' : ''));
