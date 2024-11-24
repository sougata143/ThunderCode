interface SearchResult {
    filePath: string;
    lineNumber?: number;
    matchedText?: string;
    language?: string;
}

interface SearchOptions {
    caseSensitive?: boolean;
    regex?: boolean;
    fileTypes?: string[];
    excludePatterns?: string[];
}

class FileSearchService {
    private baseUrl = '/api/filesystem/search';

    async searchInFiles(
        query: string,
        projectId: number,
        options: SearchOptions = {}
    ): Promise<SearchResult[]> {
        try {
            const response = await fetch(`${this.baseUrl}/content`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    project_id: projectId,
                    ...options,
                }),
            });

            if (!response.ok) {
                throw new Error('Search failed');
            }

            return response.json();
        } catch (error) {
            console.error('Error searching files:', error);
            throw error;
        }
    }

    async searchByFileName(
        pattern: string,
        projectId: number,
        options: SearchOptions = {}
    ): Promise<SearchResult[]> {
        try {
            const response = await fetch(`${this.baseUrl}/filename`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pattern,
                    project_id: projectId,
                    ...options,
                }),
            });

            if (!response.ok) {
                throw new Error('Search failed');
            }

            return response.json();
        } catch (error) {
            console.error('Error searching files:', error);
            throw error;
        }
    }

    async searchBySymbol(
        symbol: string,
        projectId: number,
        options: SearchOptions = {}
    ): Promise<SearchResult[]> {
        try {
            const response = await fetch(`${this.baseUrl}/symbol`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    symbol,
                    project_id: projectId,
                    ...options,
                }),
            });

            if (!response.ok) {
                throw new Error('Search failed');
            }

            return response.json();
        } catch (error) {
            console.error('Error searching symbols:', error);
            throw error;
        }
    }
}

export const fileSearchService = new FileSearchService();
