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
  children?: MindkeeperMapTreeNode[];
}
