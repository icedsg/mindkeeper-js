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
  levelWidth?: number;
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
