export interface MindNode {
  id: string;
  text: string;
  parentId?: string;
  children: string[];
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface Mindmap {
  nodes: Record<string, MindNode>;
  rootId: string | null;
}

export interface MindkeeperMapOptions {
  /** 'mindmap' (default, branches left/right of the root) or 'orgchart' (top-down, manager above reports) */
  layout?: 'mindmap' | 'orgchart';
  levelWidth?: number;
  /** orgchart: distance between levels (default 110) */
  levelHeight?: number;
  /** orgchart: gap between sibling subtrees (default 24) */
  hSpacing?: number;
  /** orgchart: a manager with at least this many reports, all without reports of their own, lists them in a column (default 4, 0 = never) */
  stackLeaves?: number;
  vSpacing?: number;
  linkStroke?: number;
  nodeBorder?: number;
  fontFamily?: string;
}

export interface MindkeeperMapTreeNode {
  id?: string;
  topic: string;
  /** Optional: colours the card and adds a badge (initials or avatar for people) */
  kind?: MindkeeperNodeKind;
  /** Optional: meta.title shows as a second line on the card */
  meta?: MindkeeperNodeMeta;
  /** Children hidden behind a +N toggle; set by collapse()/expand()/toggle() */
  collapsed?: boolean;
  children?: MindkeeperMapTreeNode[];
}

export type MindkeeperNodeKind = 'person' | 'company' | 'team' | 'role' | 'project' | 'idea';

export interface MindkeeperNodeMeta {
  title?: string;
  email?: string;
  url?: string;
  avatar?: string;
  /** ISO date, e.g. 2026-01-15 */
  start?: string;
  /** ISO date */
  end?: string;
  /** 'inactive' | 'left' | 'ended' | 'closed' | 'archived' draw a dashed, faded card */
  status?: string;
  [key: string]: string | number | boolean | undefined;
}
