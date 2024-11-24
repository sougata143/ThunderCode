export interface ElectronAPI {
  openDirectory: () => Promise<{ canceled: boolean; filePaths: string[] }>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
