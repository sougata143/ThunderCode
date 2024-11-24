interface GitStatus {
    staged: string[];
    modified: string[];
    untracked: string[];
    branch: string;
}

interface CommitInfo {
    hash: string;
    message: string;
    author: string;
    date: string;
    files: string[];
}

class GitService {
    private baseUrl = '/api/git';

    async initRepository(projectId: number, repoUrl: string): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/init`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    project_id: projectId,
                    repo_url: repoUrl,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to initialize repository');
            }
        } catch (error) {
            console.error('Error initializing repository:', error);
            throw error;
        }
    }

    async getStatus(projectId: number): Promise<GitStatus> {
        try {
            const response = await fetch(`${this.baseUrl}/status/${projectId}`);

            if (!response.ok) {
                throw new Error('Failed to get repository status');
            }

            return response.json();
        } catch (error) {
            console.error('Error getting repository status:', error);
            throw error;
        }
    }

    async stageFiles(projectId: number, files: string[]): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/stage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    project_id: projectId,
                    files,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to stage files');
            }
        } catch (error) {
            console.error('Error staging files:', error);
            throw error;
        }
    }

    async commit(projectId: number, message: string): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/commit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    project_id: projectId,
                    message,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to commit changes');
            }
        } catch (error) {
            console.error('Error committing changes:', error);
            throw error;
        }
    }

    async push(projectId: number): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/push/${projectId}`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to push changes');
            }
        } catch (error) {
            console.error('Error pushing changes:', error);
            throw error;
        }
    }

    async pull(projectId: number): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/pull/${projectId}`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to pull changes');
            }
        } catch (error) {
            console.error('Error pulling changes:', error);
            throw error;
        }
    }

    async getCommitHistory(projectId: number, limit: number = 10): Promise<CommitInfo[]> {
        try {
            const response = await fetch(
                `${this.baseUrl}/history/${projectId}?limit=${limit}`
            );

            if (!response.ok) {
                throw new Error('Failed to get commit history');
            }

            return response.json();
        } catch (error) {
            console.error('Error getting commit history:', error);
            throw error;
        }
    }

    async createBranch(projectId: number, branchName: string): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/branch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    project_id: projectId,
                    branch_name: branchName,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create branch');
            }
        } catch (error) {
            console.error('Error creating branch:', error);
            throw error;
        }
    }

    async switchBranch(projectId: number, branchName: string): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    project_id: projectId,
                    branch_name: branchName,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to switch branch');
            }
        } catch (error) {
            console.error('Error switching branch:', error);
            throw error;
        }
    }
}

export const gitService = new GitService();
