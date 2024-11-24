export interface BranchingPoint {
  name: string;
  hash: string;
  author: string;
  date: string;
  message: string;
  isCurrent: boolean;
  isRemote: boolean;
  upstream?: string;
  ahead: number;
  behind: number;
}

export interface GitStatus {
  branch: string;
  staged: GitFile[];
  unstaged: GitFile[];
  untracked: GitFile[];
  ahead: number;
  behind: number;
  branches: BranchingPoint[];
}

export interface GitFile {
  path: string;
  status: GitFileStatus;
  staged: boolean;
}

export type GitFileStatus = 
  | 'modified'
  | 'added'
  | 'deleted'
  | 'renamed'
  | 'copied'
  | 'untracked'
  | 'unmerged';

export interface GitCommit {
  hash: string;
  author: string;
  date: string;
  message: string;
  files: GitFile[];
}

export interface GitDiff {
  path: string;
  hunks: GitHunk[];
}

export interface GitHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: string[];
}

export interface GitRemote {
  name: string;
  url: string;
}

export interface GitConfig {
  user: {
    name: string;
    email: string;
  };
  remote: {
    origin?: string;
  };
  core: {
    editor?: string;
    autocrlf?: boolean;
  };
}

export interface GitError {
  code: string;
  message: string;
  command?: string;
  stdout?: string;
  stderr?: string;
}
