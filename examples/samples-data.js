/* Sample data for the org chart, reorg and portfolio pages (mindkeeper-map 1.2).
 * Plain objects in the shape MindkeeperMap#init takes: { id, topic, kind, meta, children, links }.
 * Everything here is made up. */
(function (global) {
  'use strict';

  function p(id, name, title, children, extra) {
    var node = { id: id, topic: name, kind: 'person', meta: { title: title } };
    if (extra) Object.keys(extra).forEach(function (k) { node.meta[k] = extra[k]; });
    if (children && children.length) node.children = children;
    return node;
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  // ── Northwind Labs, January: 40 people, manager = parent ─────────────────────
  var JAN = p('maya', 'Maya Chen', 'CEO', [
    p('daniel', 'Daniel Okafor', 'CTO', [
      p('priya', 'Priya Nair', 'Platform Lead', [
        p('liam', 'Liam Walsh', 'Senior Engineer'),
        p('ana', 'Ana Souza', 'Engineer'),
        p('omar', 'Omar Haddad', 'Engineer'),
        p('yuki', 'Yuki Tanaka', 'SRE'),
        p('kai', 'Kai Andersen', 'Engineer')
      ]),
      p('tom', 'Tom Becker', 'Product Eng Lead', [
        p('chloe', 'Chloe Martin', 'Frontend Engineer'),
        p('ravi', 'Ravi Menon', 'Backend Engineer'),
        p('ines', 'Ines Duarte', 'Mobile Engineer'),
        p('ben', 'Ben Carter', 'QA Engineer')
      ]),
      p('sofia', 'Sofia Rossi', 'Data Lead', [
        p('arjun', 'Arjun Rao', 'Data Engineer'),
        p('mei', 'Mei Lin', 'Data Scientist'),
        p('lucas', 'Lucas Petit', 'Analyst')
      ])
    ]),
    p('laura', 'Laura Kim', 'COO', [
      p('ahmed', 'Ahmed Hassan', 'Ops Manager', [
        p('zoe', 'Zoe Clarke', 'Ops Specialist'),
        p('diego', 'Diego Morales', 'Logistics'),
        p('hana', 'Hana Novak', 'IT Admin')
      ]),
      p('grace', 'Grace Liu', 'Finance Manager', [
        p('peter', 'Peter Brandt', 'Accountant'),
        p('aisha', 'Aisha Bello', 'FP&A Analyst')
      ]),
      p('noah', 'Noah Williams', 'People Lead', [
        p('emma', 'Emma Johansson', 'Recruiter')
      ])
    ]),
    p('james', 'James Patel', 'CRO', [
      p('elena', 'Elena Garcia', 'Sales Director', [
        p('marco', 'Marco Bianchi', 'Account Executive'),
        p('sara', 'Sara Levi', 'Account Executive'),
        p('rosa', 'Rosa Jimenez', 'Account Executive'),
        p('kwame', 'Kwame Mensah', 'Sales Engineer')
      ]),
      p('kenji', 'Kenji Sato', 'Marketing Lead', [
        p('olivia', 'Olivia Brown', 'Content Marketer'),
        p('felix', 'Felix Weber', 'Designer'),
        p('nina', 'Nina Popescu', 'Growth Marketer')
      ]),
      p('fatima', 'Fatima Ali', 'Support Lead', [
        p('jack', 'Jack Murphy', 'Support Engineer'),
        p('lea', 'Lea Fischer', 'Support Engineer')
      ])
    ])
  ]);

  function find(node, id, parent) {
    if (node.id === id) return { node: node, parent: parent };
    var kids = node.children || [];
    for (var i = 0; i < kids.length; i++) {
      var hit = find(kids[i], id, node);
      if (hit) return hit;
    }
    return null;
  }

  function detach(tree, id) {
    var hit = find(tree, id);
    hit.parent.children = hit.parent.children.filter(function (c) { return c.id !== id; });
    if (!hit.parent.children.length) delete hit.parent.children;
    return hit.node;
  }

  function attach(tree, parentId, node) {
    var parent = find(tree, parentId).node;
    (parent.children || (parent.children = [])).push(node);
  }

  // ── July: the same company after a reorg ─────────────────────────────────────
  // Data moves out of engineering and reports to the CEO, Support moves to the COO,
  // two people leave, three join, two titles change.
  var JUL = clone(JAN);
  var sofia = detach(JUL, 'sofia');
  sofia.meta.title = 'VP Data';
  attach(JUL, 'maya', sofia);
  attach(JUL, 'laura', detach(JUL, 'fatima'));
  detach(JUL, 'ben');
  detach(JUL, 'nina');
  attach(JUL, 'sofia', p('tariq', 'Tariq Aziz', 'ML Engineer', null, { start: '2026-03-02' }));
  attach(JUL, 'tom', p('julia', 'Julia Costa', 'Frontend Engineer', null, { start: '2026-04-13' }));
  attach(JUL, 'noah', p('sam', 'Sam Okoro', 'People Partner', null, { start: '2026-05-04' }));
  find(JUL, 'liam').node.meta.title = 'Staff Engineer';
  find(JUL, 'elena').node.meta.title = 'VP Sales';

  // ── Portfolio: people x companies x projects ─────────────────────────────────
  function c(id, name, url, children) {
    return { id: id, topic: name, kind: 'company', meta: { url: url }, children: children };
  }
  function proj(id, name, status) {
    return { id: id, topic: name, kind: 'project', meta: status ? { status: status } : undefined };
  }

  var PORTFOLIO = {
    id: 'group', topic: 'Harbor Group', kind: 'company', meta: { title: 'holding company' },
    children: [
      c('northwind', 'Northwind Labs', 'https://example.com/northwind', [
        p('pf-maya', 'Maya Chen', 'CEO'),
        p('pf-daniel', 'Daniel Okafor', 'CTO'),
        proj('atlas', 'Atlas API'),
        proj('beacon', 'Beacon mobile app')
      ]),
      c('bluefin', 'Bluefin Health', 'https://example.com/bluefin', [
        p('pf-rhea', 'Rhea Kapoor', 'CEO'),
        p('pf-owen', 'Owen Lewis', 'Head of Product'),
        proj('clinic', 'Clinic scheduler'),
        proj('records', 'Records export', 'ended')
      ]),
      c('copper', 'Copper Freight', 'https://example.com/copper', [
        p('pf-ivan', 'Ivan Petrov', 'Founder'),
        p('pf-amara', 'Amara Obi', 'COO'),
        proj('routes', 'Route planner')
      ]),
      { id: 'advisors', topic: 'Advisors', kind: 'team', children: [
        p('pf-helen', 'Helen Park', 'Board advisor'),
        p('pf-victor', 'Victor Hugo Silva', 'Security advisor')
      ] }
    ],
    links: [
      { from: 'pf-daniel', to: 'routes', type: 'advises' },
      { from: 'pf-owen', to: 'beacon', type: 'works on' },
      { from: 'pf-amara', to: 'clinic', type: 'pilot customer' },
      { from: 'pf-helen', to: 'northwind', type: 'board' },
      { from: 'pf-helen', to: 'bluefin', type: 'board' },
      { from: 'pf-victor', to: 'atlas', type: 'reviews' },
      { from: 'atlas', to: 'routes', type: 'powers' }
    ]
  };

  global.MK_SAMPLES = {
    orgJan: JAN,
    orgJul: JUL,
    portfolio: PORTFOLIO,
    count: function (node) {
      var n = node.kind === 'person' ? 1 : 0;
      (node.children || []).forEach(function (ch) { n += global.MK_SAMPLES.count(ch); });
      return n;
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
